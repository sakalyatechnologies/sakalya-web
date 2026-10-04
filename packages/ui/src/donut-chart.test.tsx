import { cleanup, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { DonutChart, cleanDonutData, type DonutDatum } from "./index.js";

afterEach(cleanup);

const MIX: readonly DonutDatum[] = [
  { label: "Restorative", value: 30 },
  { label: "Ortho", value: 20 },
  { label: "Surgical", value: 50 },
];

describe("DonutChart", () => {
  it("colours each slice distinctly and matches the legend", () => {
    const { container } = render(<DonutChart data={MIX} summary="Revenue mix this week" />);
    const slices = Array.from(container.querySelectorAll("[data-slice]"));
    expect(slices).toHaveLength(3);
    const colors = slices.map((slice) => slice.getAttribute("stroke"));
    expect(new Set(colors).size).toBe(3);
  });

  it("gives screen readers the numbers in a table named by the summary", () => {
    render(<DonutChart data={MIX} summary="Revenue mix this week" categoryLabel="Module" valueLabel="Amount" />);
    const table = screen.getByRole("table", { name: "Revenue mix this week" });
    expect(within(table).getAllByRole("columnheader").map((cell) => cell.textContent)).toEqual(["Module", "Amount"]);
    const rows = within(table).getAllByRole("row").slice(1);
    expect(rows.map((row) => row.textContent)).toEqual(["Restorative30", "Ortho20", "Surgical50"]);
  });

  it("shows the legend's share as a percentage of the total", () => {
    render(<DonutChart data={MIX} summary="Revenue mix" />);
    expect(screen.getByText("30%")).toBeTruthy();
    expect(screen.getByText("20%")).toBeTruthy();
    expect(screen.getByText("50%")).toBeTruthy();
  });

  it("shows a centre value and label when given", () => {
    render(<DonutChart data={MIX} summary="Revenue mix" centerValue="₹1.2L" centerLabel="total" />);
    expect(screen.getByText("₹1.2L")).toBeTruthy();
    expect(screen.getByText("total")).toBeTruthy();
  });

  it("draws invalid values safely and says so", () => {
    const { container } = render(
      <DonutChart data={[{ label: "A", value: Number.NaN }, { label: "B", value: -4 }]} summary="Mix" />,
    );
    expect(container.innerHTML).not.toMatch(/NaN|Infinity/);
    expect(screen.getByText(/missing or negative/)).toBeTruthy();
  });
});

describe("cleanDonutData", () => {
  it("reports each correction with its position", () => {
    const { data, issues } = cleanDonutData([
      { label: "a", value: 5 },
      { label: "b", value: Number.NaN },
      { label: "c", value: -1 },
    ]);
    expect(data).toEqual([
      { label: "a", value: 5 },
      { label: "b", value: 0 },
      { label: "c", value: 0 },
    ]);
    expect(issues).toEqual([
      { index: 1, label: "b", problem: "invalid-value" },
      { index: 2, label: "c", problem: "invalid-value" },
    ]);
  });
});
