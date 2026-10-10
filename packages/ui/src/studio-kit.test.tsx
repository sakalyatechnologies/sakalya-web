import { act, cleanup, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import { Avatar, BentoCard, CountUp, KpiRibbon, PageHeader, Pills, Tag } from "./index.js";

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe("BentoCard", () => {
  it("is a region named by its title, at the chosen heading level", () => {
    render(
      <BentoCard title="Revenue" subtitle="This week" headingLevel={3} action={<button type="button">Open</button>}>
        body
      </BentoCard>,
    );
    const region = screen.getByRole("region", { name: "Revenue" });
    expect(within(region).getByRole("heading", { level: 3, name: "Revenue" })).toBeTruthy();
    expect(within(region).getByText("This week")).toBeTruthy();
    expect(within(region).getByRole("button", { name: "Open" })).toBeTruthy();
  });

  it("is a plain section without a title", () => {
    render(<BentoCard>just content</BentoCard>);
    expect(screen.queryByRole("region")).toBeNull();
    expect(screen.queryByRole("heading")).toBeNull();
  });

  it("uses theme-token classes for each tone", () => {
    const { rerender } = render(<BentoCard title="T" tone="default">x</BentoCard>);
    expect(screen.getByRole("region").className).toContain("bg-surface");
    rerender(<BentoCard title="T" tone="inverse">x</BentoCard>);
    expect(screen.getByRole("region").className).toContain("bg-sidebar");
    rerender(<BentoCard title="T" tone="hero">x</BentoCard>);
    expect(screen.getByRole("region").className).toContain("text-on-primary");
  });

  it("staggers its entrance by the delay", () => {
    render(<BentoCard enterDelay={120}>x</BentoCard>);
    expect(document.querySelector("section")?.style.animationDelay).toBe("120ms");
  });
});

describe("Tag", () => {
  it("renders its text in the tone's classes, including the inverse tag", () => {
    const { rerender } = render(<Tag tone="success">Paid</Tag>);
    expect(screen.getByText("Paid").className).toContain("bg-success-soft");
    rerender(<Tag tone="inverse">Staff</Tag>);
    expect(screen.getByText("Staff").className).toContain("bg-sidebar");
  });
});

describe("Pills", () => {
  const options = [
    { value: "day", label: "Day" },
    { value: "week", label: "Week" },
    { value: "month", label: "Month" },
  ] as const;

  it("marks the chosen option and reports a new choice", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(<Pills label="Range" options={options} value="week" onValueChange={onValueChange} />);
    expect(screen.getByRole("group", { name: "Range" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Week" }).getAttribute("aria-pressed")).toBe("true");
    expect(screen.getByRole("button", { name: "Day" }).getAttribute("aria-pressed")).toBe("false");
    await user.click(screen.getByRole("button", { name: "Month" }));
    expect(onValueChange).toHaveBeenCalledWith("month");
  });

  it("keeps one option chosen when the chosen one is pressed again", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(<Pills label="Range" options={options} value="week" onValueChange={onValueChange} />);
    await user.click(screen.getByRole("button", { name: "Week" }));
    expect(onValueChange).not.toHaveBeenCalled();
  });

  it("moves between options with the arrow keys", async () => {
    const user = userEvent.setup();
    render(<Pills label="Range" options={options} value="day" onValueChange={() => undefined} />);
    await user.tab();
    expect(document.activeElement).toBe(screen.getByRole("button", { name: "Day" }));
    await user.keyboard("{ArrowRight}");
    expect(document.activeElement).toBe(screen.getByRole("button", { name: "Week" }));
  });
});

describe("KpiRibbon", () => {
  const items = [
    { id: "a", label: "Appointments", value: 42, icon: <span>#</span>, trend: 12, hint: "vs last week" },
    { id: "b", label: "Revenue", value: 1234.5, prefix: "$", decimals: 1, icon: <span>$</span>, trend: -4 },
  ];

  it("lists each figure with its final value for screen readers", () => {
    render(<KpiRibbon items={items} locale="en-US" />);
    const list = screen.getByRole("list", { name: "Key figures" });
    expect(within(list).getAllByRole("listitem")).toHaveLength(2);
    expect(within(list).getByText("$1,234.5", { selector: ".sr-only" })).toBeTruthy();
    expect(within(list).getByText("vs last week")).toBeTruthy();
  });

  it("spells out the trend direction and colours it by sign", () => {
    render(<KpiRibbon items={items} />);
    expect(screen.getByText(/^up/).parentElement?.className).toContain("bg-success-soft");
    expect(screen.getByText(/^down/).parentElement?.className).toContain("bg-danger-soft");
  });

  it("counts up from zero to the value and then stops", () => {
    vi.useFakeTimers();
    const frames: FrameRequestCallback[] = [];
    vi.stubGlobal("requestAnimationFrame", (callback: FrameRequestCallback) => frames.push(callback));
    vi.stubGlobal("cancelAnimationFrame", () => undefined);
    vi.spyOn(performance, "now").mockReturnValue(0);
    const { container } = render(<CountUp value={100} locale="en-US" />);
    const animated = () => container.querySelector("[aria-hidden]")?.textContent;
    expect(animated()).toBe("0");
    act(() => {
      frames.shift()?.(450);
    });
    const midway = Number(animated());
    expect(midway).toBeGreaterThan(50);
    expect(midway).toBeLessThan(100);
    act(() => {
      frames.shift()?.(900);
    });
    expect(animated()).toBe("100");
    expect(frames).toHaveLength(0);
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it("shows the value at once when the viewer prefers reduced motion", () => {
    vi.stubGlobal("matchMedia", () => ({ matches: true }));
    const { container } = render(<CountUp value={100} />);
    expect(container.querySelector("[aria-hidden]")?.textContent).toBe("100");
  });
});

describe("PageHeader display variant", () => {
  it("uses the display face for the title", () => {
    render(<PageHeader title="Today" subtitle="Friday" variant="display" end={<button type="button">New</button>} />);
    expect(screen.getByRole("heading", { level: 1, name: "Today" }).className).toContain("font-display");
    expect(screen.getByRole("button", { name: "New" })).toBeTruthy();
  });

  it("keeps the bold sans title by default", () => {
    render(<PageHeader title="Today" />);
    expect(screen.getByRole("heading", { name: "Today" }).className).not.toContain("font-display");
  });
});

describe("Avatar large size", () => {
  it("renders initials at the large size", () => {
    render(<Avatar name="Asha Rao" size="lg" />);
    const avatar = screen.getByRole("img", { name: "Asha Rao" });
    expect(avatar.textContent).toBe("AR");
    expect(avatar.className).toContain("size-16");
  });
});
