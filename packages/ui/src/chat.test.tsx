import { cleanup, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { fireEvent } from "@testing-library/dom";
import { afterEach, describe, expect, it, vi } from "vitest";

import { ChatThread, Composer, type ChatMessage } from "./index.js";

afterEach(cleanup);

const messages: ChatMessage[] = [
  { id: "1", author: "Asha Rao", text: "Closed on Monday.", time: "9:02", flagged: true },
  { id: "2", author: "Ben Ito", text: "Noted, calling them now.", time: "9:05" },
  { id: "3", author: "Me Myself", text: "Thanks!", time: "9:06", mine: true },
];

function textarea(element: HTMLElement): HTMLTextAreaElement {
  if (!(element instanceof HTMLTextAreaElement)) throw new Error("Expected a textarea");
  return element;
}

function button(element: HTMLElement): HTMLButtonElement {
  if (!(element instanceof HTMLButtonElement)) throw new Error("Expected a button");
  return element;
}

function checkbox(element: HTMLElement): HTMLInputElement {
  if (!(element instanceof HTMLInputElement)) throw new Error("Expected an input");
  return element;
}

describe("ChatThread", () => {
  it("is a log of messages with author and time on each", () => {
    render(<ChatThread label="Messages in general" messages={messages} />);
    const log = screen.getByRole("log", { name: "Messages in general" });
    const items = within(log).getAllByRole("listitem");
    expect(items).toHaveLength(3);
    expect(items[0]?.textContent).toContain("Asha Rao · 9:02 · Notice");
    expect(items[1]?.textContent).toContain("Ben Ito · 9:05");
    expect(items[1]?.textContent).toContain("Noted, calling them now.");
  });

  it("labels the viewer's own messages and aligns them apart", () => {
    render(<ChatThread label="Messages" messages={messages} />);
    const own = screen.getByText("Thanks!").closest("li");
    expect(own?.textContent).toContain("You · 9:06");
    expect(own?.className).toContain("flex-row-reverse");
    expect(screen.getByText("Thanks!").parentElement?.className).toContain("bg-primary");
  });

  it("styles flagged messages as announcements", () => {
    render(<ChatThread label="Messages" messages={messages} />);
    expect(screen.getByText("Closed on Monday.").parentElement?.className).toContain("bg-warning-soft");
  });

  it("hides avatars from assistive technology, since the author is in the text", () => {
    render(<ChatThread label="Messages" messages={messages} />);
    expect(screen.queryByRole("img")).toBeNull();
  });

  it("shows an empty message when there is nothing yet", () => {
    render(<ChatThread label="Messages" messages={[]} emptyText="No messages yet." />);
    expect(screen.getByText("No messages yet.")).toBeTruthy();
    expect(screen.queryByRole("listitem")).toBeNull();
  });

  it("keeps a pinned announcement above the list", () => {
    render(<ChatThread label="Messages" messages={messages} pinned={{ label: "Notice", author: "Asha Rao", text: "Closed on Monday." }} />);
    expect(screen.getByText(/Notice · Asha Rao:/)).toBeTruthy();
  });

  it("is a focusable region so keyboard users can scroll it", () => {
    render(<ChatThread label="Messages" messages={messages} />);
    expect(screen.getByRole("log").getAttribute("tabindex")).toBe("0");
  });

  it("scrolls to the newest message, unless the reader scrolled up", () => {
    const { rerender } = render(<ChatThread label="Messages" messages={messages} />);
    const log = screen.getByRole("log");
    Object.defineProperty(log, "scrollHeight", { configurable: true, value: 1000 });
    Object.defineProperty(log, "clientHeight", { configurable: true, value: 340 });
    rerender(<ChatThread label="Messages" messages={[...messages, { id: "4", author: "Ben Ito", text: "More", time: "9:07" }]} />);
    expect(log.scrollTop).toBe(1000);
    // Reader scrolls up to history: the next message must not yank them down.
    log.scrollTop = 100;
    fireEvent.scroll(log);
    rerender(<ChatThread label="Messages" messages={[...messages, { id: "4", author: "Ben Ito", text: "More", time: "9:07" }, { id: "5", author: "Ben Ito", text: "Again", time: "9:08" }]} />);
    expect(log.scrollTop).toBe(100);
  });
});

describe("Composer", () => {
  it("sends the trimmed text with the button and clears the box", async () => {
    const user = userEvent.setup();
    const onSend = vi.fn();
    render(<Composer onSend={onSend} />);
    await user.type(screen.getByRole("textbox", { name: "Message" }), "  hello there  ");
    await user.click(screen.getByRole("button", { name: "Send" }));
    expect(onSend).toHaveBeenCalledWith("hello there", { flagged: false });
    expect(textarea(screen.getByRole("textbox")).value).toBe("");
  });

  it("sends on Enter, and starts a new line on Shift+Enter", async () => {
    const user = userEvent.setup();
    const onSend = vi.fn();
    render(<Composer onSend={onSend} />);
    const box = screen.getByRole("textbox");
    await user.type(box, "line one{Shift>}{Enter}{/Shift}line two");
    expect(onSend).not.toHaveBeenCalled();
    await user.keyboard("{Enter}");
    expect(onSend).toHaveBeenCalledWith("line one\nline two", { flagged: false });
  });

  it("does not send while an input method is composing", () => {
    const onSend = vi.fn();
    render(<Composer onSend={onSend} />);
    const box = screen.getByRole("textbox");
    fireEvent.change(box, { target: { value: "नमस्ते" } });
    fireEvent.keyDown(box, { key: "Enter", isComposing: true });
    expect(onSend).not.toHaveBeenCalled();
  });

  it("disables Send and ignores Enter while the box is empty or blank", async () => {
    const user = userEvent.setup();
    const onSend = vi.fn();
    render(<Composer onSend={onSend} />);
    const send = screen.getByRole("button", { name: "Send" });
    expect(button(send).disabled).toBe(true);
    await user.type(screen.getByRole("textbox"), "   {Enter}");
    expect(onSend).not.toHaveBeenCalled();
    expect(button(send).disabled).toBe(true);
  });

  it("offers an extra option that is passed on and resets after sending", async () => {
    const user = userEvent.setup();
    const onSend = vi.fn();
    render(<Composer onSend={onSend} flagOption={{ label: "Send as notice" }} />);
    await user.click(screen.getByRole("checkbox", { name: "Send as notice" }));
    await user.type(screen.getByRole("textbox"), "Closed Monday{Enter}");
    expect(onSend).toHaveBeenCalledWith("Closed Monday", { flagged: true });
    expect(checkbox(screen.getByRole("checkbox")).checked).toBe(false);
  });

  it("shows the attach button only when it can do something", async () => {
    const user = userEvent.setup();
    const onAttach = vi.fn();
    const { rerender } = render(<Composer onSend={() => undefined} />);
    expect(screen.queryByRole("button", { name: "Attach a file" })).toBeNull();
    rerender(<Composer onSend={() => undefined} onAttach={onAttach} />);
    await user.click(screen.getByRole("button", { name: "Attach a file" }));
    expect(onAttach).toHaveBeenCalledOnce();
  });

  it("is inert when disabled", () => {
    render(<Composer onSend={() => undefined} disabled />);
    expect(textarea(screen.getByRole("textbox")).disabled).toBe(true);
  });
});
