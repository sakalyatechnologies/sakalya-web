import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { QrCode } from "./index.js";

afterEach(cleanup);

/** Reads the drawn modules back from the path: a set of "col,row" for each dark module. */
function darkModules(path: string): Set<string> {
  const dark = new Set<string>();
  for (const [, x, y, run] of path.matchAll(/M(\d+),(\d+)h(\d+)v1h-\d+z/g)) {
    for (let offset = 0; offset < Number(run); offset += 1) {
      dark.add(`${String(Number(x) + offset)},${String(y)}`);
    }
  }
  return dark;
}

function drawn(value: string, quietZone = 0) {
  const { container } = render(<QrCode value={value} label="Code" quietZone={quietZone} />);
  const svg = container.querySelector("svg");
  const path = container.querySelector("path");
  const [, , width] = (svg?.getAttribute("viewBox") ?? "").split(" ").map(Number);
  return { modules: darkModules(path?.getAttribute("d") ?? ""), width: width ?? 0 };
}

describe("QrCode", () => {
  it("is an image named by its label", () => {
    render(<QrCode value="https://example.com" label="Scan to pay" size={150} />);
    const image = screen.getByRole("img", { name: "Scan to pay" });
    expect(image.getAttribute("width")).toBe("150");
  });

  it("encodes a short value as a 21-module version 1 code with the three finder patterns", () => {
    const { modules, width } = drawn("HELLO");
    expect(width).toBe(21);
    const finder = (x0: number, y0: number) => {
      for (let y = 0; y < 7; y += 1) {
        for (let x = 0; x < 7; x += 1) {
          const ring = x === 0 || x === 6 || y === 0 || y === 6;
          const core = x >= 2 && x <= 4 && y >= 2 && y <= 4;
          expect(modules.has(`${String(x0 + x)},${String(y0 + y)}`), `finder at ${String(x0)},${String(y0)} cell ${String(x)},${String(y)}`).toBe(ring || core);
        }
      }
    };
    finder(0, 0);
    finder(14, 0);
    finder(0, 14);
  });

  it("alternates the timing pattern between the finders", () => {
    const { modules } = drawn("HELLO");
    for (let i = 8; i <= 12; i += 1) {
      expect(modules.has(`${String(i)},6`)).toBe(i % 2 === 0);
      expect(modules.has(`6,${String(i)}`)).toBe(i % 2 === 0);
    }
  });

  it("gives different values different codes, and grows with longer values", () => {
    expect(drawn("A").modules).not.toEqual(drawn("B").modules);
    cleanup();
    const long = drawn("https://example.com/".repeat(5));
    expect(long.width).toBeGreaterThan(21);
  });

  it("adds a quiet zone around the code by default", () => {
    const { container } = render(<QrCode value="HELLO" label="Code" />);
    expect(container.querySelector("svg")?.getAttribute("viewBox")).toBe("-4 -4 29 29");
  });

  it("draws dark modules on white whatever the theme", () => {
    const { container } = render(<QrCode value="HELLO" label="Code" />);
    expect(container.querySelector("rect")?.getAttribute("class")).toContain("fill-white");
    expect(container.querySelector("path")?.getAttribute("class")).toContain("fill-black");
  });

  it("says so, instead of throwing, when the value is too long to encode", () => {
    render(<QrCode value={"x".repeat(5000)} label="Code" tooLongText="Value too long" />);
    expect(screen.getByRole("alert").textContent).toBe("Value too long");
    expect(screen.queryByRole("img")).toBeNull();
  });
});
