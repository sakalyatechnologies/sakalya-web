import { cleanup, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { contrastRatio, createTheme, hex, mix, studioTheme, type Theme } from "@sakalya/tokens";

import { HEAT_STEPS, Heatmap, heatStep } from "./index.js";

afterEach(cleanup);

const rows = [
  { id: "a", label: "Chair 1", values: [70, 95, null, 10] },
  { id: "b", label: "Chair 2", values: [0, 50, 100, 30] },
];
const columns = ["9a", "10a", "11a", "12p"];
const describeCell = (value: number, row: { label: string }, column: string) => `${row.label}, ${column}: ${String(value)}% booked`;

describe("heatStep", () => {
  it.each([
    [0, 0],
    [19, 0],
    [20, 1],
    [44, 1],
    [45, 2],
    [69, 2],
    [70, 3],
    [100, 3],
    [250, 3],
    [-5, 0],
  ])("puts %s of 100 in step %s", (value, step) => {
    expect(heatStep(value, 100)).toBe(step);
  });

  it("treats invalid input as the lowest step", () => {
    expect(heatStep(Number.NaN, 100)).toBe(0);
    expect(heatStep(5, 0)).toBe(0);
  });
});

describe("Heatmap", () => {
  it("is a table with row and column headers and each value described", () => {
    render(<Heatmap columns={columns} rows={rows} describe={describeCell} summary="Occupancy by hour" legend={{ low: "Low", high: "High" }} />);
    const table = screen.getByRole("table", { name: "Occupancy by hour" });
    expect(within(table).getAllByRole("columnheader").map((header) => header.textContent)).toEqual(columns);
    const row = within(table).getByRole("row", { name: /Chair 1/ });
    expect(within(row).getByRole("rowheader").textContent).toBe("Chair 1");
    expect(within(row).getByText("Chair 1, 10a: 95% booked")).toBeTruthy();
    expect(screen.getByText("Low")).toBeTruthy();
  });

  it("draws the value in each cell, and a dash where there is no data", () => {
    render(<Heatmap columns={columns} rows={rows} describe={describeCell} summary="s" />);
    expect(screen.getByText("95", { selector: "[aria-hidden]" })).toBeTruthy();
    expect(screen.getAllByText("–")).toHaveLength(1);
  });

  it("can hide the numbers while keeping them for screen readers", () => {
    render(<Heatmap columns={columns} rows={rows} describe={describeCell} summary="s" showValues={false} />);
    expect(screen.queryByText("95", { selector: "[aria-hidden]" })).toBeNull();
    expect(screen.getByText("Chair 1, 10a: 95% booked")).toBeTruthy();
  });

  it("shades by step using theme tokens", () => {
    render(<Heatmap columns={columns} rows={rows} describe={describeCell} summary="s" />);
    const cell = screen.getByText("Chair 1, 10a: 95% booked").closest("td");
    expect(cell?.getAttribute("style")).toContain("var(--sk-chart-1)");
    expect(cell?.getAttribute("style")).toContain("100%");
    expect(cell?.getAttribute("style")).toContain("var(--sk-on-primary)");
  });
});

describe("heatmap colours", () => {
  const themes: readonly [string, Theme][] = [
    ["Studio light", studioTheme("light")],
    ["Studio dark", studioTheme("dark")],
    ["Mint light", createTheme({ brand: hex("#14a89a"), mode: "light" })],
    ["Mint dark", createTheme({ brand: hex("#14a89a"), mode: "dark" })],
    ["Indigo light", createTheme({ brand: hex("#4f46e5"), mode: "light" })],
    ["Indigo dark", createTheme({ brand: hex("#4f46e5"), mode: "dark" })],
  ];

  it.each(themes)("%s: every step's text is readable on its shade", (_name, theme) => {
    const { colors } = theme;
    for (const step of HEAT_STEPS) {
      const fill = mix(colors.chart1, colors.surfaceMuted, step.share / 100);
      const text = step.onFill === "text" ? colors.text : colors.onPrimary;
      expect(contrastRatio(text, fill), `${String(step.share)}% shade`).toBeGreaterThanOrEqual(4.5);
    }
  });
});
