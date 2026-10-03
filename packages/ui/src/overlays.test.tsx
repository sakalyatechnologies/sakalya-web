import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { createTheme, hex } from "@sakalya/tokens";

import { Button, Dialog, Drawer, Field, Menu, TextInput, ThemeScope, ToastProvider, useToast } from "./index.js";

afterEach(cleanup);

const theme = createTheme({ brand: hex("#db2777"), mode: "dark" });

function DialogHarness() {
  const [open, setOpen] = useState(false);
  return (
    <ThemeScope theme={theme}>
      <button
        type="button"
        onClick={() => {
          setOpen(true);
        }}
      >
        Edit
      </button>
      <button type="button">Elsewhere</button>
      <Dialog
        open={open}
        onOpenChange={setOpen}
        title="Edit member"
        description="Changes are saved when you press Save."
        footer={<Button>Save</Button>}
      >
        <Field label="Name">
          <TextInput defaultValue="Asha" />
        </Field>
      </Dialog>
    </ThemeScope>
  );
}

function focusedInside(element: HTMLElement): boolean {
  return document.activeElement !== null && element.contains(document.activeElement);
}

describe("Dialog", () => {
  it("is named and described by its title and description", async () => {
    const user = userEvent.setup();
    render(<DialogHarness />);
    await user.click(screen.getByRole("button", { name: "Edit" }));
    expect(
      await screen.findByRole("dialog", { name: "Edit member", description: "Changes are saved when you press Save." }),
    ).toBeTruthy();
  });

  it("moves focus to the first field and keeps it inside while tabbing either way", async () => {
    const user = userEvent.setup();
    render(<DialogHarness />);
    await user.click(screen.getByRole("button", { name: "Edit" }));
    const dialog = await screen.findByRole("dialog", { name: "Edit member" });
    const field = screen.getByRole("textbox", { name: "Name" });
    await waitFor(() => {
      expect(document.activeElement).toBe(field);
    });

    // A focus trap may bounce focus off a guard element; a person cannot tab faster than that.
    const tabAndSettle = async (shift: boolean) => {
      await user.tab({ shift });
      await waitFor(() => {
        expect(focusedInside(dialog)).toBe(true);
      });
      return document.activeElement;
    };
    const forward = [];
    for (let step = 0; step < 4; step += 1) {
      forward.push(await tabAndSettle(false));
    }
    expect(forward).toEqual([
      screen.getByRole("button", { name: "Save" }),
      screen.getByRole("button", { name: "Close" }),
      field,
      screen.getByRole("button", { name: "Save" }),
    ]);
    const backward = [];
    for (let step = 0; step < 3; step += 1) {
      backward.push(await tabAndSettle(true));
    }
    expect(backward).toEqual([field, screen.getByRole("button", { name: "Close" }), screen.getByRole("button", { name: "Save" })]);
  });

  it("closes on Escape and returns focus to the button that opened it", async () => {
    const user = userEvent.setup();
    render(<DialogHarness />);
    const opener = screen.getByRole("button", { name: "Edit" });
    await user.click(opener);
    await screen.findByRole("dialog", { name: "Edit member" });
    await user.keyboard("{Escape}");
    await waitFor(() => {
      expect(screen.queryByRole("dialog")).toBeNull();
    });
    expect(document.activeElement).toBe(opener);
  });

  it("closes from its labelled close button", async () => {
    const user = userEvent.setup();
    render(<DialogHarness />);
    await user.click(screen.getByRole("button", { name: "Edit" }));
    await user.click(await screen.findByRole("button", { name: "Close" }));
    await waitFor(() => {
      expect(screen.queryByRole("dialog")).toBeNull();
    });
  });

  it("carries the surrounding theme into its portal", async () => {
    const user = userEvent.setup();
    const { container } = render(<DialogHarness />);
    await user.click(screen.getByRole("button", { name: "Edit" }));
    const dialog = await screen.findByRole("dialog", { name: "Edit member" });
    expect(container.contains(dialog)).toBe(false);
    const portal = dialog.closest<HTMLElement>("[data-theme-mode]");
    expect(portal?.dataset["themeMode"]).toBe("dark");
    expect(portal?.style.getPropertyValue("--sk-surface")).toBe(theme.colors.surface);
    expect(portal?.style.getPropertyValue("--sk-primary")).toBe(theme.colors.primary);
  });
});

describe("Drawer", () => {
  function DrawerHarness() {
    const [open, setOpen] = useState(false);
    return (
      <ThemeScope theme={theme}>
        <button
          type="button"
          onClick={() => {
            setOpen(true);
          }}
        >
          Filters
        </button>
        <Drawer open={open} onOpenChange={setOpen} title="Filter members" side="right">
          <button type="button">Apply</button>
        </Drawer>
      </ThemeScope>
    );
  }

  it("opens as a named modal with the theme, and closes on Escape", async () => {
    const user = userEvent.setup();
    render(<DrawerHarness />);
    await user.click(screen.getByRole("button", { name: "Filters" }));
    const drawer = await screen.findByRole("dialog", { name: "Filter members" });
    await waitFor(() => {
      expect(focusedInside(drawer)).toBe(true);
    });
    expect(drawer.closest<HTMLElement>("[data-theme-mode]")?.style.getPropertyValue("--sk-surface")).toBe(
      theme.colors.surface,
    );
    await user.keyboard("{Escape}");
    await waitFor(() => {
      expect(screen.queryByRole("dialog")).toBeNull();
    });
  });
});

describe("Menu", () => {
  it("lists actions in a themed popup and reports the chosen id", async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn<(id: "edit" | "archive" | "delete") => void>();
    render(
      <ThemeScope theme={theme}>
        <Menu
          label="Actions for Asha"
          icon={<span>⋯</span>}
          onSelect={onSelect}
          items={[
            { id: "edit", label: "Edit" },
            { id: "archive", label: "Archive", disabled: true },
            { id: "delete", label: "Delete", danger: true, separatorBefore: true },
          ]}
        />
      </ThemeScope>,
    );
    const trigger = screen.getByRole("button", { name: "Actions for Asha" });
    await user.click(trigger);
    const menu = await screen.findByRole("menu");
    expect(menu.closest<HTMLElement>("[data-theme-mode]")?.style.getPropertyValue("--sk-surface")).toBe(
      theme.colors.surface,
    );
    expect(screen.getAllByRole("menuitem").map((item) => item.textContent)).toEqual(["Edit", "Archive", "Delete"]);
    expect(screen.getByRole("menuitem", { name: "Archive" }).getAttribute("aria-disabled")).toBe("true");
    await user.click(screen.getByRole("menuitem", { name: "Delete" }));
    expect(onSelect).toHaveBeenCalledWith("delete");
    await waitFor(() => {
      expect(screen.queryByRole("menu")).toBeNull();
    });
  });

  it("opens from the keyboard and closes on Escape, returning focus", async () => {
    const user = userEvent.setup();
    render(<Menu label="Sort" items={[{ id: "name", label: "Name" }]} onSelect={() => undefined} />);
    const trigger = screen.getByRole("button", { name: "Sort" });
    trigger.focus();
    await user.keyboard("{Enter}");
    await screen.findByRole("menu");
    await user.keyboard("{Escape}");
    await waitFor(() => {
      expect(screen.queryByRole("menu")).toBeNull();
    });
    expect(document.activeElement).toBe(trigger);
  });
});

describe("Toast", () => {
  function SaveButton() {
    const toast = useToast();
    return (
      <button
        type="button"
        onClick={() => {
          toast.show({ title: "Member added", description: "Asha can now sign in.", tone: "success" });
        }}
      >
        Save
      </button>
    );
  }

  it("shows a themed toast that can be dismissed", async () => {
    const user = userEvent.setup();
    render(
      <ThemeScope theme={theme}>
        <ToastProvider>
          <SaveButton />
        </ToastProvider>
      </ThemeScope>,
    );
    await user.click(screen.getByRole("button", { name: "Save" }));
    const title = await screen.findByText("Member added");
    expect(screen.getByText("Asha can now sign in.")).toBeTruthy();
    expect(title.closest<HTMLElement>("[data-theme-mode]")?.style.getPropertyValue("--sk-surface")).toBe(
      theme.colors.surface,
    );
    // The dismiss button joins the accessibility tree once the toasts are hovered or focused.
    await user.hover(title);
    await user.click(await screen.findByRole("button", { name: "Dismiss" }));
    await waitFor(() => {
      expect(screen.queryByText("Member added")).toBeNull();
    });
  });

  it("explains the mistake when used outside a provider", () => {
    vi.spyOn(console, "error").mockImplementation(() => undefined);
    expect(() => render(<SaveButton />)).toThrow("useToast must be called inside a ToastProvider");
    vi.restoreAllMocks();
  });
});
