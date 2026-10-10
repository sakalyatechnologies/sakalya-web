import { cleanup, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import { ActionBar, Button } from "./index.js";

afterEach(cleanup);

describe("ActionBar", () => {
  it("is a named group holding its actions, with a polite status line", () => {
    render(
      <ActionBar label="Visit actions" status="3 selected">
        <Button variant="secondary">Cancel</Button>
        <Button>Save</Button>
      </ActionBar>,
    );
    const group = screen.getByRole("group", { name: "Visit actions" });
    expect(within(group).getByRole("status").textContent).toBe("3 selected");
    expect(within(group).getAllByRole("button").map((button) => button.textContent)).toEqual(["Cancel", "Save"]);
  });

  it("omits the status region when there is no status", () => {
    render(
      <ActionBar label="Actions">
        <Button>Save</Button>
      </ActionBar>,
    );
    expect(screen.queryByRole("status")).toBeNull();
  });

  it("keeps actions operable", async () => {
    const user = userEvent.setup();
    const onSave = vi.fn();
    render(
      <ActionBar label="Actions">
        <Button onClick={onSave}>Save</Button>
      </ActionBar>,
    );
    await user.click(screen.getByRole("button", { name: "Save" }));
    expect(onSave).toHaveBeenCalledOnce();
  });

  it("sticks to the foot of its scroll area, or the viewport when fixed", () => {
    const { rerender } = render(<ActionBar label="Actions">x</ActionBar>);
    expect(screen.getByRole("group").className).toContain("sticky");
    rerender(<ActionBar label="Actions" position="fixed">x</ActionBar>);
    expect(screen.getByRole("group").className).toContain("fixed");
  });
});
