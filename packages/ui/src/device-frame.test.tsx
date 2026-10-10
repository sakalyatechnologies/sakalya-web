import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { DeviceFrame } from "./index.js";

afterEach(cleanup);

describe("DeviceFrame", () => {
  it("shows its content in a labelled, focusable scroll region", () => {
    render(
      <DeviceFrame device="phone" label="Website preview">
        <p>Hello</p>
      </DeviceFrame>,
    );
    const region = screen.getByRole("region", { name: "Website preview" });
    expect(region.getAttribute("tabindex")).toBe("0");
    expect(region.textContent).toBe("Hello");
  });

  it("limits the screen height so tall content scrolls inside it", () => {
    render(
      <DeviceFrame device="phone" label="Preview" maxHeight={400}>
        x
      </DeviceFrame>,
    );
    expect(screen.getByRole("region").style.maxHeight).toBe("400px");
  });

  it("is a narrow phone body or a wide window with an address bar", () => {
    const { container, rerender } = render(
      <DeviceFrame device="phone" label="Preview">
        x
      </DeviceFrame>,
    );
    expect(container.querySelector('[data-device="phone"]')?.className).toContain("max-w-[320px]");
    rerender(
      <DeviceFrame device="desktop" label="Preview" address="example.test">
        x
      </DeviceFrame>,
    );
    expect(container.querySelector('[data-device="desktop"]')).toBeTruthy();
    expect(screen.getByText("example.test").closest("[aria-hidden]")).toBeTruthy();
  });

  it("hides its decoration from assistive technology", () => {
    const { container } = render(
      <DeviceFrame device="desktop" label="Preview" address="example.test">
        x
      </DeviceFrame>,
    );
    expect(container.querySelectorAll('[aria-hidden="true"]').length).toBeGreaterThan(0);
    expect(screen.getAllByRole("region")).toHaveLength(1);
  });
});
