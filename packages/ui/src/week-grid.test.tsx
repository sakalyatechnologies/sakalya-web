import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { WeekGrid, type WeekGridBlock, type WeekGridDay } from "./index.js";

afterEach(cleanup);

const DAYS: readonly WeekGridDay[] = [
  { id: "mon", label: "Mon", dateLabel: "12" },
  { id: "tue", label: "Tue", dateLabel: "13", current: true },
];

const BLOCKS: readonly WeekGridBlock[] = [
  { id: "a1", dayId: "mon", start: 9.5, duration: 1, label: "Root canal", subtitle: "Room 1", tone: "primary" },
  { id: "a2", dayId: "tue", start: 10, duration: 0.5, label: "Cleaning", tone: "success" },
];

function renderGrid(blocks: readonly WeekGridBlock[] = BLOCKS) {
  return render(
    <WeekGrid days={DAYS} startHour={9} endHour={12} blocks={blocks} summary="This week's appointments" onBlockSelect={vi.fn()} />,
  );
}

describe("WeekGrid", () => {
  it("renders a day column per day and a button per block", () => {
    renderGrid();
    expect(screen.getAllByText("Mon").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Tue").length).toBeGreaterThan(0);
    expect(screen.getByRole("button", { name: /Root canal/ })).toBeTruthy();
    expect(screen.getByRole("button", { name: /Cleaning/ })).toBeTruthy();
  });

  it("positions a block by its start time and duration within the hour rail", () => {
    renderGrid();
    const block = screen.getByRole("button", { name: /Root canal/ });
    // start 9.5 within a grid starting at 9, 56px default hour height: (9.5-9)*56 = 28.
    expect(block.style.top).toBe("28px");
    expect(block.style.height).toBe("56px");
  });

  it("is operable by keyboard as a real, focusable button", () => {
    const onBlockSelect = vi.fn();
    render(
      <WeekGrid days={DAYS} startHour={9} endHour={12} blocks={BLOCKS} summary="Week" onBlockSelect={onBlockSelect} />,
    );
    const block = screen.getByRole("button", { name: /Root canal/ });
    block.focus();
    expect(document.activeElement).toBe(block);
    fireEvent.click(block);
    expect(onBlockSelect).toHaveBeenCalledWith("a1");
  });

  it("gives screen readers the same blocks in a table named by the summary", () => {
    renderGrid();
    const table = screen.getByRole("table", { name: "This week's appointments" });
    const rows = within(table).getAllByRole("row").slice(1);
    expect(rows.map((row) => row.textContent)).toEqual(["9:30 AM–10:30 AMMonRoot canal, Room 1", "10 AM–10:30 AMTueCleaning"]);
  });

  it("clamps a block that starts before or runs past the grid instead of breaking", () => {
    renderGrid([{ id: "a3", dayId: "mon", start: 6, duration: 10, label: "All day", tone: "warning" }]);
    const block = screen.getByRole("button", { name: "All day" });
    expect(block.style.top).toBe("0px");
    expect(block.style.height).toBe("168px"); // clamped to the full 3-hour (9-12) body height.
  });
});
