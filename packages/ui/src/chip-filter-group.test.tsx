import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { ChipFilterGroup } from "./index.js";

afterEach(cleanup);

const OPTIONS = [
  { value: "all", label: "All" },
  { value: "balance", label: "With balance" },
  { value: "recalls", label: "Recalls due" },
] as const;

describe("ChipFilterGroup", () => {
  it("is a labelled group of toggle buttons", () => {
    render(<ChipFilterGroup label="Filter patients" options={OPTIONS} value={["all"]} onValueChange={vi.fn()} />);
    const group = screen.getByRole("group", { name: "Filter patients" });
    expect(within(group).getAllByRole("button")).toHaveLength(3);
    expect(within(group).getByRole("button", { name: "All" }).getAttribute("aria-pressed")).toBe("true");
    expect(within(group).getByRole("button", { name: "With balance" }).getAttribute("aria-pressed")).toBe("false");
  });

  it("replaces the selection in single-select mode", () => {
    const onValueChange = vi.fn();
    render(<ChipFilterGroup label="Filter" options={OPTIONS} value={["all"]} onValueChange={onValueChange} />);
    fireEvent.click(screen.getByRole("button", { name: "Recalls due" }));
    expect(onValueChange).toHaveBeenCalledExactlyOnceWith(["recalls"]);
  });

  it("does not let the single selection clear to nothing", () => {
    const onValueChange = vi.fn();
    render(<ChipFilterGroup label="Filter" options={OPTIONS} value={["all"]} onValueChange={onValueChange} />);
    fireEvent.click(screen.getByRole("button", { name: "All" }));
    expect(onValueChange).not.toHaveBeenCalled();
  });

  it("toggles membership in multi-select mode", () => {
    const onValueChange = vi.fn();
    render(
      <ChipFilterGroup label="Channels" multiple options={OPTIONS} value={["all", "balance"]} onValueChange={onValueChange} />,
    );
    fireEvent.click(screen.getByRole("button", { name: "With balance" }));
    expect(onValueChange).toHaveBeenCalledExactlyOnceWith(["all"]);
    fireEvent.click(screen.getByRole("button", { name: "Recalls due" }));
    expect(onValueChange).toHaveBeenLastCalledWith(["all", "balance", "recalls"]);
  });
});
