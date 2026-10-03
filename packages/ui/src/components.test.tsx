import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { fireEvent } from "@testing-library/dom";

import { createTheme, hex } from "@sakalya/tokens";

import { AppShell, IconButton, Pill, StatCard, ThemeScope, Timeline } from "./index.js";

afterEach(cleanup);

describe("ThemeScope", () => {
  it("writes the theme as CSS variables on its wrapper", () => {
    const theme = createTheme({ brand: hex("#14a89a"), mode: "light", radius: 12 });
    render(
      <ThemeScope theme={theme}>
        <p>inside</p>
      </ThemeScope>,
    );
    const wrapper = screen.getByText("inside").parentElement;
    expect(wrapper?.style.getPropertyValue("--sk-primary")).toBe(theme.colors.primary);
    expect(wrapper?.style.getPropertyValue("--sk-radius")).toBe("12px");
    expect(wrapper?.dataset["themeMode"]).toBe("light");
  });
});

describe("StatCard", () => {
  it("shows the label, value and trend, and links when given an href", () => {
    render(
      <StatCard
        label="Today's Collection"
        value="₹28,500"
        icon={<span>₹</span>}
        trend={{ label: "18% vs yesterday", direction: "up", good: true }}
        href="/billing"
      />,
    );
    const link = screen.getByRole("link");
    expect(link.getAttribute("href")).toBe("/billing");
    expect(screen.getByText("₹28,500")).toBeTruthy();
    expect(screen.getByText("18% vs yesterday").className).toContain("text-success");
  });
});

describe("IconButton", () => {
  it("includes the badge count in its accessible name", () => {
    render(
      <IconButton label="Notifications" badge={3}>
        <span>bell</span>
      </IconButton>,
    );
    expect(screen.getByRole("button", { name: "Notifications, 3 new" })).toBeTruthy();
  });
});

describe("Pill", () => {
  it("uses the tone's colours", () => {
    render(<Pill tone="warning">Waiting (12 min)</Pill>);
    expect(screen.getByText("Waiting (12 min)").className).toContain("bg-warning-soft");
  });
});

describe("Timeline", () => {
  it("lists items and reports which item's menu was pressed", () => {
    const onMenu = vi.fn();
    render(
      <Timeline
        onMenu={onMenu}
        items={[
          { id: "a1", time: "09:00", title: "Rahul Patil", subtitle: "32 Y", detail: "Root Canal", detailSub: "Room 1", status: { label: "Completed", tone: "success" } },
        ]}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "More actions for Rahul Patil" }));
    expect(onMenu).toHaveBeenCalledWith("a1");
  });
});

describe("AppShell", () => {
  it("marks the active navigation entry as the current page", () => {
    render(
      <AppShell
        brand={<span>Brand</span>}
        activeId="patients"
        nav={[
          { id: "dashboard", label: "Dashboard", icon: <span />, href: "/" },
          { id: "patients", label: "Patients", icon: <span />, href: "/patients" },
        ]}
      >
        <p>content</p>
      </AppShell>,
    );
    expect(screen.getByRole("link", { name: "Patients" }).getAttribute("aria-current")).toBe("page");
    expect(screen.getByRole("link", { name: "Dashboard" }).getAttribute("aria-current")).toBeNull();
  });
});
