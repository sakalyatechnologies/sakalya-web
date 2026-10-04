import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { Meter } from "./index.js";

afterEach(cleanup);

describe("Meter", () => {
  it("reports the value as a progressbar sized to its share of max", () => {
    render(<Meter label="Composite A2 stock" value={4} max={40} />);
    const bar = screen.getByRole("progressbar", { name: "Composite A2 stock" });
    expect(bar.getAttribute("aria-valuenow")).toBe("4");
    expect(bar.getAttribute("aria-valuemax")).toBe("40");
    expect(screen.getByText("4 of 40")).toBeTruthy();
    const fill = bar.firstElementChild;
    expect(fill?.getAttribute("style")).toContain("width: 10%");
    expect(fill?.getAttribute("class")).toContain("bg-primary");
  });

  it("switches to the low tone at or below the threshold", () => {
    const { rerender } = render(<Meter label="Stock" value={10} max={40} lowAt={8} />);
    expect(screen.getByRole("progressbar").firstElementChild?.getAttribute("class")).toContain("bg-primary");
    rerender(<Meter label="Stock" value={8} max={40} lowAt={8} />);
    expect(screen.getByRole("progressbar").firstElementChild?.getAttribute("class")).toContain("bg-danger");
  });

  it("clamps invalid or out-of-range values instead of breaking", () => {
    render(<Meter label="Stock" value={Number.NaN} max={-5} />);
    const bar = screen.getByRole("progressbar");
    expect(bar.getAttribute("aria-valuenow")).toBe("0");
    expect(bar.getAttribute("aria-valuemax")).toBe("0");
  });

  it("accepts a custom value label", () => {
    render(<Meter label="Stock" value={4} max={40} valueLabel="4 units left" />);
    expect(screen.getByText("4 units left")).toBeTruthy();
  });
});
