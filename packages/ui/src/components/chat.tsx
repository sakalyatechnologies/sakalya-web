import { Megaphone, Paperclip, Pin, Send } from "lucide-react";
import { useEffect, useId, useRef, useState, type SyntheticEvent, type KeyboardEvent, type ReactNode } from "react";

import { cx } from "../cx.js";
import { Avatar } from "./primitives.js";

export interface ChatMessage {
  id: string;
  author: string;
  /** The author's photo, if any; otherwise their initials. */
  authorImageUrl?: string;
  text: string;
  /** Already formatted for display, such as "9:02" or "Yesterday". */
  time: string;
  /** The viewer's own message: right-aligned and in the primary colour. */
  mine?: boolean;
  /** A highlighted announcement, such as one sent to everyone. */
  flagged?: boolean;
}

export interface ChatThreadLabels {
  /** The word added to a flagged message's header, such as "Notice". */
  flagged: string;
  /** Said before the author's name for the viewer's own messages. */
  you: string;
}

const THREAD_LABELS: ChatThreadLabels = { flagged: "Notice", you: "You" };

export interface ChatThreadProps {
  /** Names the message list for screen readers, such as "Messages in general". */
  label: string;
  messages: readonly ChatMessage[];
  /** Shown when there are no messages. */
  emptyText?: string;
  /** An announcement kept above the messages, such as the latest flagged message. */
  pinned?: { author: string; text: string; label: string } | undefined;
  /** Height of the scrolling list. Defaults to a comfortable 340px. */
  height?: number;
  labels?: Partial<ChatThreadLabels>;
  className?: string;
}

/** Within this many pixels of the end, a new message keeps the list scrolled to the end. */
const STICK_DISTANCE = 80;

/**
 * A conversation: a scrolling log of message bubbles, the viewer's on the right. New messages
 * are announced politely, and the list follows them unless the reader has scrolled up to read
 * history. The list scrolls by keyboard, so it is a focusable region.
 */
export function ChatThread({ label, messages, emptyText, pinned, height = 340, labels, className }: ChatThreadProps) {
  const text = { ...THREAD_LABELS, ...labels };
  const scroller = useRef<HTMLDivElement>(null);
  const stuck = useRef(true);

  useEffect(() => {
    const element = scroller.current;
    if (element !== null && stuck.current) {
      element.scrollTop = element.scrollHeight;
    }
  }, [messages.length]);

  return (
    <div className={cx("flex min-w-0 flex-col gap-3", className)}>
      {pinned !== undefined ? (
        <p className="flex items-start gap-2 rounded-2xl bg-warning-soft p-3 text-sm text-warning-text">
          <Pin aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
          <span>
            <b className="font-semibold">
              {pinned.label} · {pinned.author}:
            </b>{" "}
            {pinned.text}
          </span>
        </p>
      ) : null}
      <div
        ref={scroller}
        tabIndex={0}
        role="log"
        aria-label={label}
        aria-live="polite"
        aria-relevant="additions"
        onScroll={(event) => {
          const element = event.currentTarget;
          stuck.current = element.scrollHeight - element.scrollTop - element.clientHeight < STICK_DISTANCE;
        }}
        style={{ height }}
        className="overflow-y-auto rounded-2xl bg-background p-3 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
      >
        {messages.length === 0 ? (
          <p className="py-10 text-center text-sm text-muted">{emptyText ?? ""}</p>
        ) : (
          <ol className="flex flex-col gap-3">
            {messages.map((message) => (
              <li key={message.id} className={cx("flex gap-2", message.mine === true && "flex-row-reverse")}>
                {/* The author's name is in the message header, so the avatar is decoration. */}
                <span aria-hidden="true" className="shrink-0">
                  <Avatar name={message.author} size="sm" {...(message.authorImageUrl === undefined ? {} : { imageUrl: message.authorImageUrl })} />
                </span>
                <div
                  className={cx(
                    "max-w-[78%] rounded-2xl px-3 py-2 text-sm",
                    message.flagged === true
                      ? "bg-warning-soft text-warning-text"
                      : message.mine === true
                        ? "bg-primary text-on-primary"
                        : "border border-border bg-surface text-text",
                  )}
                >
                  <p className={cx("text-[11px]", message.flagged === true || message.mine === true ? "" : "text-muted")}>
                    {message.mine === true ? text.you : message.author} · {message.time}
                    {message.flagged === true ? ` · ${text.flagged}` : ""}
                  </p>
                  <p className="whitespace-pre-wrap break-words">{message.text}</p>
                </div>
              </li>
            ))}
          </ol>
        )}
      </div>
    </div>
  );
}

export interface ComposerLabels {
  /** Accessible name of the message box. */
  message: string;
  send: string;
  attach: string;
}

const COMPOSER_LABELS: ComposerLabels = { message: "Message", send: "Send", attach: "Attach a file" };

export interface ComposerProps {
  /** Called with the trimmed text, and whether the extra option was ticked. Never called for empty text. */
  onSend: (text: string, options: { flagged: boolean }) => void;
  placeholder?: string;
  /**
   * An optional tick box under the box, such as "Send as notice". Ticking it sets `flagged` on
   * the send; it resets after each send.
   */
  flagOption?: { label: string; hint?: ReactNode };
  /** Adds an attach button that calls this. Omit to hide the button. */
  onAttach?: () => void;
  maxLength?: number;
  disabled?: boolean;
  labels?: Partial<ComposerLabels>;
  className?: string;
}

/**
 * A message box with a send button. Enter sends, Shift+Enter starts a new line, and Enter
 * while composing text with an input method (such as Devanagari) never sends by accident.
 * The send button is disabled while the box is empty.
 */
export function Composer({ onSend, placeholder, flagOption, onAttach, maxLength, disabled = false, labels, className }: ComposerProps) {
  const text = { ...COMPOSER_LABELS, ...labels };
  const [draft, setDraft] = useState("");
  const [flagged, setFlagged] = useState(false);
  const flagId = useId();
  const ready = draft.trim() !== "" && !disabled;

  const send = () => {
    if (!ready) {
      return;
    }
    onSend(draft.trim(), { flagged });
    setDraft("");
    setFlagged(false);
  };
  const onSubmit = (event: SyntheticEvent) => {
    event.preventDefault();
    send();
  };
  const onKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey && !event.nativeEvent.isComposing) {
      event.preventDefault();
      send();
    }
  };

  return (
    <form onSubmit={onSubmit} className={cx("flex flex-col gap-2", className)}>
      <div className="flex items-end gap-2">
        {onAttach !== undefined ? (
          <button
            type="button"
            aria-label={text.attach}
            onClick={onAttach}
            disabled={disabled}
            className="grid size-10 shrink-0 place-items-center rounded-full border border-border text-text transition-colors hover:bg-surface-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:opacity-50"
          >
            <Paperclip aria-hidden="true" className="size-4" />
          </button>
        ) : null}
        <textarea
          aria-label={text.message}
          value={draft}
          rows={1}
          maxLength={maxLength}
          disabled={disabled}
          placeholder={placeholder}
          onChange={(event) => {
            setDraft(event.target.value);
          }}
          onKeyDown={onKeyDown}
          className="max-h-32 min-h-10 w-full resize-none rounded-3xl border border-border-strong bg-background px-4 py-2 text-sm text-text placeholder:text-muted focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-primary disabled:opacity-50"
        />
        <button
          type="submit"
          aria-label={text.send}
          disabled={!ready}
          className="grid size-10 shrink-0 place-items-center rounded-full bg-primary text-on-primary transition-colors hover:bg-primary-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:opacity-50"
        >
          <Send aria-hidden="true" className="size-4" />
        </button>
      </div>
      {flagOption !== undefined ? (
        <div className="flex flex-wrap items-center gap-2 text-xs text-muted">
          <input
            id={flagId}
            type="checkbox"
            checked={flagged}
            disabled={disabled}
            onChange={(event) => {
              setFlagged(event.target.checked);
            }}
            className="size-4 accent-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          />
          <label htmlFor={flagId} className="inline-flex items-center gap-1.5">
            <Megaphone aria-hidden="true" className="size-3.5" />
            {flagOption.label}
          </label>
          {flagOption.hint}
        </div>
      ) : null}
    </form>
  );
}
