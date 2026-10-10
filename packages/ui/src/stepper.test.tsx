import { cleanup, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import { Stepper } from "./index.js";

afterEach(cleanup);

const steps = [
  { id: "details", label: "Details" },
  { id: "health", label: "Health" },
  { id: "consent", label: "Consent" },
];

describe("Stepper", () => {
  it("is a named list marking the current step and spelling out each state", () => {
    render(<Stepper steps={steps} current={1} label="Registration progress" />);
    const list = screen.getByRole("list", { name: "Registration progress" });
    const items = within(list).getAllByRole("listitem");
    expect(items).toHaveLength(3);
    expect(items[0]?.textContent).toContain("completed");
    expect(items[1]?.getAttribute("aria-current")).toBe("step");
    expect(items[1]?.textContent).toContain("current step");
    expect(items[2]?.getAttribute("aria-current")).toBeNull();
    expect(items[2]?.textContent).toContain("not started");
  });

  it("shows a check for finished steps and the number for the rest", () => {
    const { container } = render(<Stepper steps={steps} current={2} label="Progress" />);
    expect(container.querySelectorAll("svg")).toHaveLength(2);
    expect(screen.getByText("3")).toBeTruthy();
  });

  it("lets a finished step be revisited when asked, but not the current or later ones", async () => {
    const user = userEvent.setup();
    const onStepSelect = vi.fn();
    render(<Stepper steps={steps} current={2} label="Progress" onStepSelect={onStepSelect} />);
    expect(screen.getAllByRole("button")).toHaveLength(2);
    await user.click(screen.getByRole("button", { name: /Health/ }));
    expect(onStepSelect).toHaveBeenCalledWith(1);
  });

  it("has no buttons without onStepSelect", () => {
    render(<Stepper steps={steps} current={2} label="Progress" />);
    expect(screen.queryByRole("button")).toBeNull();
  });

  it("takes translated state words", () => {
    render(<Stepper steps={steps} current={0} label="Progress" labels={{ current: "actuel" }} />);
    expect(screen.getByText(/actuel/)).toBeTruthy();
  });
});
