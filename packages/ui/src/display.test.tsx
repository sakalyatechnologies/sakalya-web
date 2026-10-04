import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { Badge, ErrorState, SearchInput, Tabs } from "./index.js";

afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

describe("Badge", () => {
  it("uses the checked text tokens for each variant", () => {
    render(
      <>
        <Badge tone="danger">Overdue</Badge>
        <Badge tone="danger" variant="solid">
          Blocked
        </Badge>
        <Badge tone="success" variant="outline">
          Paid
        </Badge>
      </>,
    );
    expect(screen.getByText("Overdue").className).toContain("text-danger-text");
    expect(screen.getByText("Blocked").className).toContain("text-on-danger");
    expect(screen.getByText("Paid").className).toContain("border-success");
  });
});

describe("ErrorState", () => {
  it("announces the failure, shows the request id and offers a retry", () => {
    const onRetry = vi.fn();
    render(<ErrorState description="The list could not be loaded." requestId="req_8f2c" onRetry={onRetry} />);
    const alert = screen.getByRole("alert");
    expect(alert.textContent).toContain("Something went wrong");
    expect(alert.textContent).toContain("Request ID: req_8f2c");
    fireEvent.click(screen.getByRole("button", { name: "Try again" }));
    expect(onRetry).toHaveBeenCalledOnce();
  });
});

describe("Tabs", () => {
  it("switches panels with the arrow keys and reports typed values", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn<(value: "open" | "closed") => void>();
    render(
      <Tabs
        label="Status"
        onValueChange={onValueChange}
        items={[
          { value: "open", label: "Open", content: <p>Open items</p> },
          { value: "closed", label: "Closed", content: <p>Closed items</p> },
        ]}
      />,
    );
    expect(screen.getByRole("tablist", { name: "Status" })).toBeTruthy();
    expect(screen.getByRole("tab", { name: "Open" }).getAttribute("aria-selected")).toBe("true");
    expect(screen.getByRole("tabpanel").textContent).toBe("Open items");
    await user.click(screen.getByRole("tab", { name: "Open" }));
    await user.keyboard("{ArrowRight}{Enter}");
    expect(screen.getByRole("tab", { name: "Closed" }).getAttribute("aria-selected")).toBe("true");
    expect(screen.getByRole("tabpanel").textContent).toBe("Closed items");
    expect(onValueChange).toHaveBeenLastCalledWith("closed");
  });
});

describe("SearchInput", () => {
  function Harness({ onSearch }: { onSearch: (value: string) => void }) {
    const [value, setValue] = useState("");
    return (
      <>
        <SearchInput
          label="Search members"
          value={value}
          onValueChange={(next) => {
            setValue(next);
            onSearch(next);
          }}
        />
        <button
          type="button"
          onClick={() => {
            setValue("");
          }}
        >
          Reset
        </button>
      </>
    );
  }

  it("reports the search once typing pauses", () => {
    vi.useFakeTimers();
    const onSearch = vi.fn();
    render(<Harness onSearch={onSearch} />);
    const box = screen.getByRole("searchbox", { name: "Search members" });
    fireEvent.change(box, { target: { value: "a" } });
    fireEvent.change(box, { target: { value: "as" } });
    act(() => {
      vi.advanceTimersByTime(299);
    });
    expect(onSearch).not.toHaveBeenCalled();
    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(onSearch).toHaveBeenCalledExactlyOnceWith("as");
  });

  it("searches at once on Enter, clears from its button and follows the product's value", async () => {
    const user = userEvent.setup();
    const onSearch = vi.fn();
    render(<Harness onSearch={onSearch} />);
    const box = screen.getByRole("searchbox", { name: "Search members" });
    await user.type(box, "asha{Enter}");
    expect(onSearch).toHaveBeenLastCalledWith("asha");
    await user.click(screen.getByRole("button", { name: "Clear search" }));
    expect(onSearch).toHaveBeenLastCalledWith("");
    expect(box).toHaveProperty("value", "");
    expect(document.activeElement).toBe(box);
    await user.type(box, "ravi{Enter}");
    await user.click(screen.getByRole("button", { name: "Reset" }));
    expect(box).toHaveProperty("value", "");
  });
});
