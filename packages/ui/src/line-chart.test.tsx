import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { LineChart, niceScale, tickIndexes, type LineChartProps } from "./index.js";

afterEach(cleanup);

const TIMES = [0, 60_000, 120_000, 180_000];

function chart(props: Partial<LineChartProps> = {}) {
  return render(
    <LineChart
      times={TIMES}
      series={[
        { id: "a", label: "Requests", values: [1, 4, 2, 8] },
        { id: "b", label: "Errors", values: [0, null, 1, 2] },
      ]}
      summary="Traffic over four minutes."
      xLabel="Time"
      yLabel="Requests per minute"
      formatX={(t) => `${String(t / 60_000)} min`}
      reference={{ value: 6, label: "Limit 6" }}
      {...props}
    />,
  );
}

describe("LineChart", () => {
  it("draws one line per series with distinct colour and dash, and a legend entry each", () => {
    const { container } = chart();
    const lines = Array.from(container.querySelectorAll("path[stroke]"));
    expect(lines).toHaveLength(2);
    expect(new Set(lines.map((l) => l.getAttribute("stroke"))).size).toBe(2);
    expect(lines[0]?.getAttribute("stroke-dasharray")).not.toBe(lines[1]?.getAttribute("stroke-dasharray"));
    const legend = screen.getByRole("list", { name: "Legend" });
    expect(within(legend).getAllByRole("listitem").map((i) => i.textContent)).toEqual(["Requests", "Errors", "Limit 6"]);
  });

  it("breaks the line at a missing value and labels both axes with units", () => {
    const { container } = chart();
    expect(container.querySelector('[data-series="b"] path')?.getAttribute("d")).toMatch(/M.*M/);
    expect(screen.getByText("Requests per minute")).toBeTruthy();
    expect(screen.getAllByText("Time").length).toBeGreaterThan(0);
    expect(container.querySelector("[data-reference]")).toBeTruthy();
  });

  it("shows a tooltip for the point under the arrow keys", () => {
    chart();
    const group = screen.getByRole("group");
    fireEvent.keyDown(group, { key: "End" });
    const tip = screen.getAllByRole("status")[0];
    expect(tip?.textContent).toContain("3 min");
    expect(tip?.textContent).toContain("8");
    fireEvent.keyDown(group, { key: "ArrowLeft" });
    expect(tip?.textContent).toContain("2 min");
    fireEvent.blur(group);
    expect(tip?.textContent).toBe("");
  });

  it("gives screen readers a table named by the summary", () => {
    chart();
    const table = screen.getByRole("table", { name: "Traffic over four minutes." });
    expect(within(table).getAllByRole("columnheader").map((c) => c.textContent)).toEqual(["Time", "Requests", "Errors"]);
    expect(within(table).getAllByRole("row")).toHaveLength(5);
  });

  it("has loading and empty states", () => {
    chart({ loading: true });
    expect(screen.getByRole("status", { name: "Loading Requests per minute" })).toBeTruthy();
    cleanup();
    chart({ times: [], series: [], emptyMessage: "Nothing yet." });
    expect(screen.getByText("Nothing yet.")).toBeTruthy();
  });
});

describe("scales", () => {
  it("rounds the axis up to a tidy tick step", () => {
    expect(niceScale(0)).toEqual({ top: 1, step: 0.25 });
    expect(niceScale(87)).toEqual({ top: 100, step: 25 });
    expect(niceScale(8)).toEqual({ top: 8, step: 2 });
  });
  it("picks evenly spaced labels including both ends", () => {
    expect(tickIndexes(3, 6)).toEqual([0, 1, 2]);
    expect(tickIndexes(11, 3)).toEqual([0, 5, 10]);
  });
});
