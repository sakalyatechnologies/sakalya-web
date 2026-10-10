import { ChevronLeft, ChevronRight } from "lucide-react";
import { useRef, useState, type KeyboardEvent, type PointerEvent, type ReactNode } from "react";

import { cx } from "../cx.js";

export interface CarouselSlide {
  id: string;
  /** Names the slide in the dots and for screen readers, such as a person's name. */
  label: string;
  content: ReactNode;
}

export interface CarouselLabels {
  previous: string;
  next: string;
  /** Names a slide's dot; `{label}` is replaced by the slide's label. */
  goTo: string;
  /** "Slide 2 of 5"; `{n}` and `{total}` are replaced. */
  position: string;
}

const DEFAULT_LABELS: CarouselLabels = {
  previous: "Previous",
  next: "Next",
  goTo: "Show {label}",
  position: "{n} of {total}",
};

export interface CarouselProps {
  /** Names the carousel for screen readers, such as "Upcoming". */
  label: string;
  slides: readonly CarouselSlide[];
  /** The shown slide, when the product keeps it. */
  index?: number;
  onIndexChange?: (index: number) => void;
  labels?: Partial<CarouselLabels>;
  className?: string;
}

/** A horizontal swipe longer than this many pixels moves a slide. */
const SWIPE_DISTANCE = 40;

/**
 * One featured slide at a time in a hero tile, such as "next up" in a queue. Move with the
 * arrow buttons, the dots, a swipe, or Left and Right arrow keys while it has focus. Moving
 * wraps around, and the change is announced politely. Colours are the hero tile's, so put
 * `text-on-primary` content and `bg-on-primary text-primary` buttons inside it.
 */
export function Carousel({ label, slides, index, onIndexChange, labels, className }: CarouselProps) {
  const text = { ...DEFAULT_LABELS, ...labels };
  const [own, setOwn] = useState(0);
  const swipeFrom = useRef<number | null>(null);
  const total = slides.length;
  const current = total === 0 ? 0 : Math.min(Math.max(index ?? own, 0), total - 1);
  const slide = slides[current];

  const goTo = (next: number) => {
    if (total === 0) {
      return;
    }
    const wrapped = (next + total) % total;
    setOwn(wrapped);
    onIndexChange?.(wrapped);
  };
  const onKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      goTo(current - 1);
    } else if (event.key === "ArrowRight") {
      event.preventDefault();
      goTo(current + 1);
    }
  };
  const onPointerUp = (event: PointerEvent<HTMLElement>) => {
    const from = swipeFrom.current;
    swipeFrom.current = null;
    if (from !== null && Math.abs(event.clientX - from) > SWIPE_DISTANCE) {
      goTo(event.clientX < from ? current + 1 : current - 1);
    }
  };

  if (slide === undefined) {
    return null;
  }
  const position = text.position.replace("{n}", String(current + 1)).replace("{total}", String(total));
  const arrow =
    "rounded-full p-1.5 text-on-primary transition-colors hover:bg-on-primary/15 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-on-primary";
  return (
    <section
      aria-roledescription="carousel"
      aria-label={label}
      onKeyDown={onKeyDown}
      onPointerDown={(event) => {
        swipeFrom.current = event.clientX;
      }}
      onPointerUp={onPointerUp}
      onPointerCancel={() => {
        swipeFrom.current = null;
      }}
      className={cx("sk-rise touch-pan-y rounded-card bg-linear-to-br from-primary to-primary-hover p-5 text-on-primary shadow-card", className)}
    >
      <div className="flex items-center justify-between gap-2">
        <p className="text-[11px] tracking-[0.14em] uppercase">
          {position}
        </p>
        <div className="flex items-center gap-1">
          <button type="button" aria-label={text.previous} onClick={() => { goTo(current - 1); }} className={arrow}>
            <ChevronLeft aria-hidden="true" className="size-4" />
          </button>
          <button type="button" aria-label={text.next} onClick={() => { goTo(current + 1); }} className={arrow}>
            <ChevronRight aria-hidden="true" className="size-4" />
          </button>
        </div>
      </div>
      <p aria-live="polite" className="sr-only">
        {slide.label}, {position}
      </p>
      <div
        key={slide.id}
        role="group"
        aria-roledescription="slide"
        aria-label={`${slide.label}, ${position}`}
        className="sk-rise mt-3"
      >
        {slide.content}
      </div>
      {total > 1 ? (
        <div className="mt-2 flex justify-center gap-1">
          {slides.map((entry, slideIndex) => (
            <button
              key={entry.id}
              type="button"
              aria-label={text.goTo.replace("{label}", entry.label)}
              aria-current={slideIndex === current ? "true" : undefined}
              onClick={() => {
                goTo(slideIndex);
              }}
              // A roomy tap target around the small dot.
              className="group flex items-center rounded-full px-0.5 py-2.5 focus-visible:outline-2 focus-visible:outline-offset-0 focus-visible:outline-on-primary"
            >
              <span
                className={cx("block h-1.5 rounded-full transition-all", slideIndex === current ? "w-6 bg-on-primary" : "w-1.5 bg-on-primary/60")}
              />
            </button>
          ))}
        </div>
      ) : null}
    </section>
  );
}
