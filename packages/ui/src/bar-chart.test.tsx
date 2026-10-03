import { cleanup, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { BarChart, cleanBarData, type BarDatum } from "./index.js";

afterEach(cleanup);

const HOURS: readonly BarDatum[] = [
  { label: "9 AM", total: 3, part: 2 },
  { label: "10 AM", total: 5, part: 5 },
  { label: "11 AM", total: 4, part: 0 },
];

function renderChart(data: readonly BarDatum[]) {
  return render(
    <BarChart data={data} totalLabel="Booked" partLabel="Done" categoryLabel="Hour" summary="Bookings by hour" />,
  );
}

function fills(root: Element | null, series: "total" | "part"): string[] {
  return Array.from(root?.querySelectorAll(`[data-series="${series}"]`) ?? []).map((mark) => mark.getAttribute("fill") ?? "");
}

describe("BarChart", () => {
  it("colours each series the same in the legend and on the bars", () => {
    const { container } = renderChart(HOURS);
    const legend = container.querySelector("figure > div");
    const plot = container.querySelector("figure > svg");
    const [legendTotal, ...extraTotals] = fills(legend, "total");
    const [legendPart, ...extraParts] = fills(legend, "part");
    expect(extraTotals).toEqual([]);
    expect(extraParts).toEqual([]);
    expect(legendTotal).toBeDefined();
    expect(legendTotal).not.toBe(legendPart);
    // 9 AM and 11 AM have a remainder above the part; 9 AM and 10 AM have a part.
    expect(fills(plot, "total")).toEqual([legendTotal, legendTotal]);
    expect(fills(plot, "part")).toEqual([legendPart, legendPart]);
  });

  it("gives screen readers the numbers in a table named by the summary", () => {
    renderChart(HOURS);
    const table = screen.getByRole("table", { name: "Bookings by hour" });
    expect(within(table).getAllByRole("columnheader").map((cell) => cell.textContent)).toEqual(["Hour", "Booked", "Done"]);
    const rows = within(table).getAllByRole("row").slice(1);
    expect(rows.map((row) => row.textContent)).toEqual(["9 AM32", "10 AM55", "11 AM40"]);
  });

  it("draws invalid values safely and says so", () => {
    const { container } = renderChart([
      { label: "9 AM", total: Number.NaN, part: 1 },
      { label: "10 AM", total: -4, part: Number.POSITIVE_INFINITY },
      { label: "11 AM", total: 2, part: 6 },
    ]);
    expect(container.innerHTML).not.toMatch(/NaN|Infinity/);
    const rows = within(screen.getByRole("table")).getAllByRole("row").slice(1);
    expect(rows.map((row) => row.textContent)).toEqual(["9 AM00", "10 AM00", "11 AM22"]);
    expect(screen.getByText(/missing or out of range/)).toBeTruthy();
  });

  it("allows repeated labels", () => {
    const errors = vi.spyOn(console, "error").mockImplementation(() => undefined);
    renderChart([
      { label: "Mon", total: 2, part: 1 },
      { label: "Mon", total: 3, part: 3 },
    ]);
    expect(within(screen.getByRole("table")).getAllByRole("rowheader")).toHaveLength(2);
    expect(errors).not.toHaveBeenCalled();
    errors.mockRestore();
  });
});

describe("cleanBarData", () => {
  it("reports each correction with its position", () => {
    const { data, issues } = cleanBarData([
      { label: "a", total: 5, part: 2 },
      { label: "b", total: Number.NaN, part: -1 },
      { label: "c", total: 1, part: 3 },
    ]);
    expect(data).toEqual([
      { label: "a", total: 5, part: 2 },
      { label: "b", total: 0, part: 0 },
      { label: "c", total: 1, part: 1 },
    ]);
    expect(issues).toEqual([
      { index: 1, label: "b", problem: "invalid-total" },
      { index: 1, label: "b", problem: "invalid-part" },
      { index: 2, label: "c", problem: "part-exceeds-total" },
    ]);
  });
});
