import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import { MiniMonth, parseIsoDate } from "./index.js";

afterEach(cleanup);

const dayButton = (name: RegExp) => screen.getByRole("button", { name });

describe("parseIsoDate", () => {
  it("reads real dates and rejects impossible ones", () => {
    expect(parseIsoDate("2026-10-09")).toEqual({ year: 2026, month: 10, day: 9 });
    expect(parseIsoDate("2026-02-30")).toBeNull();
    expect(parseIsoDate("2026-13-01")).toBeNull();
    expect(parseIsoDate("10/09/2026")).toBeNull();
  });
});

describe("MiniMonth", () => {
  it("shows the month of the selected day as a grid of day buttons", () => {
    render(<MiniMonth value="2026-10-09" today="2026-10-09" locale="en-US" />);
    expect(screen.getByRole("grid", { name: "October 2026" })).toBeTruthy();
    expect(screen.getAllByRole("button", { name: /October \d+, 2026/ })).toHaveLength(31);
    // Oct 1, 2026 is a Thursday: with weeks starting Monday there are three blank cells first.
    expect(screen.getAllByRole("row")[1]?.querySelectorAll('[role="gridcell"][aria-hidden="true"]')).toHaveLength(3);
  });

  it("starts weeks on Sunday when asked", () => {
    render(<MiniMonth value="2026-10-09" locale="en-US" weekStartsOn={0} />);
    const headers = screen.getAllByRole("columnheader").map((header) => header.getAttribute("aria-label"));
    expect(headers[0]).toBe("Sunday");
    expect(screen.getAllByRole("row")[1]?.querySelectorAll('[role="gridcell"][aria-hidden="true"]')).toHaveLength(4);
  });

  it("marks today, the selected day and days with items for assistive technology", () => {
    render(<MiniMonth value="2026-10-12" today="2026-10-09" busy={["2026-10-12", "2026-10-13"]} locale="en-US" />);
    expect(dayButton(/October 9, 2026, today/).getAttribute("aria-current")).toBe("date");
    expect(dayButton(/October 12, 2026, has items/).closest('[role="gridcell"]')?.getAttribute("aria-selected")).toBe("true");
    expect(dayButton(/October 13, 2026, has items/).closest('[role="gridcell"]')?.getAttribute("aria-selected")).toBe("false");
    expect(dayButton(/October 14, 2026$/)).toBeTruthy();
  });

  it("selects a day on click, and remembers it when the product does not control the value", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(<MiniMonth today="2026-10-09" onValueChange={onValueChange} locale="en-US" />);
    await user.click(dayButton(/October 20, 2026/));
    expect(onValueChange).toHaveBeenCalledWith("2026-10-20");
    expect(dayButton(/October 20, 2026/).closest('[role="gridcell"]')?.getAttribute("aria-selected")).toBe("true");
  });

  it("has a single tab stop, on the selected day", async () => {
    const user = userEvent.setup();
    render(
      <>
        <button type="button">before</button>
        <MiniMonth value="2026-10-09" locale="en-US" />
        <button type="button">after</button>
      </>,
    );
    const stops = screen.getAllByRole("button").filter((button) => button.getAttribute("tabindex") === "0" || button.getAttribute("tabindex") === null);
    // before, after, the two month buttons, and exactly one day.
    expect(stops.filter((button) => /2026/.test(button.getAttribute("aria-label") ?? ""))).toHaveLength(1);
    await user.click(screen.getByRole("button", { name: "before" }));
    await user.tab();
    await user.tab();
    await user.tab();
    expect(document.activeElement).toBe(dayButton(/October 9, 2026/));
  });

  it("moves focus with the arrow, Home, End and page keys", async () => {
    const user = userEvent.setup();
    render(<MiniMonth value="2026-10-09" locale="en-US" />);
    dayButton(/October 9, 2026/).focus();
    await user.keyboard("{ArrowRight}");
    expect(document.activeElement).toBe(dayButton(/October 10, 2026/));
    await user.keyboard("{ArrowDown}");
    expect(document.activeElement).toBe(dayButton(/October 17, 2026/));
    await user.keyboard("{ArrowUp}{ArrowLeft}");
    expect(document.activeElement).toBe(dayButton(/October 9, 2026/));
    // Oct 9, 2026 is a Friday: Monday-first week runs Oct 5 to Oct 11.
    await user.keyboard("{Home}");
    expect(document.activeElement).toBe(dayButton(/October 5, 2026/));
    await user.keyboard("{End}");
    expect(document.activeElement).toBe(dayButton(/October 11, 2026/));
  });

  it("crosses month and year boundaries with the keyboard", async () => {
    const user = userEvent.setup();
    render(<MiniMonth value="2026-10-31" locale="en-US" />);
    dayButton(/October 31, 2026/).focus();
    await user.keyboard("{ArrowRight}");
    expect(screen.getByRole("grid", { name: "November 2026" })).toBeTruthy();
    expect(document.activeElement).toBe(dayButton(/November 1, 2026/));
    await user.keyboard("{PageUp}{PageUp}");
    expect(document.activeElement).toBe(dayButton(/September 1, 2026/));
    await user.keyboard("{Shift>}{PageDown}{/Shift}");
    expect(document.activeElement).toBe(dayButton(/September 1, 2027/));
  });

  it("keeps the day of month, clamped, when paging to a shorter month", async () => {
    const user = userEvent.setup();
    render(<MiniMonth value="2026-01-31" locale="en-US" />);
    dayButton(/January 31, 2026/).focus();
    await user.keyboard("{PageDown}");
    expect(document.activeElement).toBe(dayButton(/February 28, 2026/));
  });

  it("changes month with the buttons and chooses a day with Enter", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(<MiniMonth value="2026-10-09" onValueChange={onValueChange} locale="en-US" />);
    await user.click(screen.getByRole("button", { name: "Next month" }));
    expect(screen.getByRole("grid", { name: "November 2026" })).toBeTruthy();
    await user.click(screen.getByRole("button", { name: "Previous month" }));
    await user.click(screen.getByRole("button", { name: "Previous month" }));
    expect(screen.getByRole("grid", { name: "September 2026" })).toBeTruthy();
    dayButton(/September 9, 2026/).focus();
    await user.keyboard("{Enter}");
    expect(onValueChange).toHaveBeenCalledWith("2026-09-09");
  });

  it("falls back to a valid month when given nothing usable", () => {
    render(<MiniMonth value="not a date" locale="en-US" />);
    expect(screen.getByRole("grid", { name: "January 1970" })).toBeTruthy();
  });
});
