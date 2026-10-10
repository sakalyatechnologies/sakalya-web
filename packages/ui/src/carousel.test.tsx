import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import { Carousel } from "./index.js";

afterEach(cleanup);

const slides = [
  { id: "a", label: "Asha", content: <p>Slide A</p> },
  { id: "b", label: "Ben", content: <p>Slide B</p> },
  { id: "c", label: "Chen", content: <p>Slide C</p> },
];

describe("Carousel", () => {
  it("is a named carousel showing one slide, with its position", () => {
    render(<Carousel label="Upcoming" slides={slides} />);
    expect(screen.getByRole("region", { name: "Upcoming" }).getAttribute("aria-roledescription")).toBe("carousel");
    expect(screen.getByText("Slide A")).toBeTruthy();
    expect(screen.queryByText("Slide B")).toBeNull();
    expect(screen.getByRole("group", { name: "Asha, 1 of 3" }).getAttribute("aria-roledescription")).toBe("slide");
  });

  it("moves with the arrows, wrapping at both ends", async () => {
    const user = userEvent.setup();
    render(<Carousel label="Upcoming" slides={slides} />);
    await user.click(screen.getByRole("button", { name: "Next" }));
    expect(screen.getByText("Slide B")).toBeTruthy();
    await user.click(screen.getByRole("button", { name: "Previous" }));
    await user.click(screen.getByRole("button", { name: "Previous" }));
    expect(screen.getByText("Slide C")).toBeTruthy();
    await user.click(screen.getByRole("button", { name: "Next" }));
    expect(screen.getByText("Slide A")).toBeTruthy();
  });

  it("jumps with the dots and marks the current one", async () => {
    const user = userEvent.setup();
    const onIndexChange = vi.fn();
    render(<Carousel label="Upcoming" slides={slides} onIndexChange={onIndexChange} />);
    expect(screen.getByRole("button", { name: "Show Asha" }).getAttribute("aria-current")).toBe("true");
    await user.click(screen.getByRole("button", { name: "Show Chen" }));
    expect(onIndexChange).toHaveBeenCalledWith(2);
    expect(screen.getByRole("button", { name: "Show Chen" }).getAttribute("aria-current")).toBe("true");
    expect(screen.getByRole("button", { name: "Show Asha" }).getAttribute("aria-current")).toBeNull();
  });

  it("moves with Left and Right arrow keys while focused inside", async () => {
    const user = userEvent.setup();
    render(<Carousel label="Upcoming" slides={slides} />);
    screen.getByRole("button", { name: "Next" }).focus();
    await user.keyboard("{ArrowRight}");
    expect(screen.getByText("Slide B")).toBeTruthy();
    await user.keyboard("{ArrowLeft}{ArrowLeft}");
    expect(screen.getByText("Slide C")).toBeTruthy();
  });

  it("moves on a swipe, but not on a short drag", () => {
    render(<Carousel label="Upcoming" slides={slides} />);
    const region = screen.getByRole("region", { name: "Upcoming" });
    fireEvent.pointerDown(region, { clientX: 200 });
    fireEvent.pointerUp(region, { clientX: 190 });
    expect(screen.getByText("Slide A")).toBeTruthy();
    fireEvent.pointerDown(region, { clientX: 200 });
    fireEvent.pointerUp(region, { clientX: 100 });
    expect(screen.getByText("Slide B")).toBeTruthy();
    fireEvent.pointerDown(region, { clientX: 100 });
    fireEvent.pointerUp(region, { clientX: 220 });
    expect(screen.getByText("Slide A")).toBeTruthy();
  });

  it("can be controlled by the product", () => {
    const { rerender } = render(<Carousel label="Upcoming" slides={slides} index={2} />);
    expect(screen.getByText("Slide C")).toBeTruthy();
    rerender(<Carousel label="Upcoming" slides={slides} index={1} />);
    expect(screen.getByText("Slide B")).toBeTruthy();
  });

  it("announces the change in a polite live region", () => {
    render(<Carousel label="Upcoming" slides={slides} />);
    const live = document.querySelector('[aria-live="polite"]');
    expect(live?.textContent).toBe("Asha, 1 of 3");
  });

  it("has no dots for a single slide and renders nothing without slides", () => {
    const { rerender } = render(<Carousel label="Upcoming" slides={slides.slice(0, 1)} />);
    expect(screen.queryByRole("button", { name: /Show/ })).toBeNull();
    rerender(<Carousel label="Upcoming" slides={[]} />);
    expect(screen.queryByRole("region")).toBeNull();
  });

  it("takes translated labels", () => {
    render(<Carousel label="À venir" slides={slides} labels={{ next: "Suivant", position: "{n} sur {total}" }} />);
    expect(screen.getByRole("button", { name: "Suivant" })).toBeTruthy();
    expect(screen.getByRole("group", { name: "Asha, 1 sur 3" })).toBeTruthy();
  });
});
