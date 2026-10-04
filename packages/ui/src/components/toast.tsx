import { Toast as BaseToast, type ToastManager, type ToastObject } from "@base-ui/react/toast";
import { AlertTriangle, CheckCircle2, Info, OctagonAlert, X } from "lucide-react";
import { createContext, useContext, useMemo, useState, type ReactNode } from "react";

import { cx } from "../cx.js";
import { CLOSE_BUTTON } from "./overlay-parts.js";
import { IconBubble } from "./primitives.js";
import { usePortalTheme } from "./theme-scope.js";

export type ToastTone = "neutral" | "success" | "warning" | "danger" | "info";

export interface ToastOptions {
  title: string;
  description?: string | undefined;
  tone?: ToastTone;
  /** Milliseconds before it disappears; `0` keeps it until dismissed. */
  duration?: number;
}

export interface ToastApi {
  /** Shows a toast and returns its id. Danger toasts are announced immediately. */
  show: (options: ToastOptions) => string;
  /** Dismisses one toast, or all of them without an id. */
  dismiss: (id?: string) => void;
}

interface ToastData {
  tone: ToastTone;
}

const ToastContext = createContext<ToastManager<ToastData> | null>(null);

export interface ToastProviderProps {
  children: ReactNode;
  /** How many toasts show at once. */
  limit?: number;
  /** Default milliseconds before a toast disappears. */
  duration?: number;
  /** The dismiss button's accessible name. */
  closeLabel?: string;
  /** `card` (default) is a bordered card at the bottom right; `pill` is a dark one-line pill at the bottom centre. */
  appearance?: ToastAppearance;
}

export type ToastAppearance = "card" | "pill";

/**
 * Lets anything inside it show toasts with `useToast`. Place it inside the app's `ThemeScope`
 * so toasts carry the theme. F6 moves keyboard focus to the toasts.
 */
export function ToastProvider({ children, limit = 3, duration = 5000, closeLabel = "Dismiss", appearance = "card" }: ToastProviderProps) {
  const [manager] = useState(() => BaseToast.createToastManager<ToastData>());
  return (
    <ToastContext value={manager}>
      <BaseToast.Provider toastManager={manager} limit={limit} timeout={duration}>
        {children}
        <ToastViewport closeLabel={closeLabel} appearance={appearance} />
      </BaseToast.Provider>
    </ToastContext>
  );
}

/** Shows and dismisses toasts. Must be called inside a `ToastProvider`. */
export function useToast(): ToastApi {
  const manager = useContext(ToastContext);
  if (manager === null) {
    throw new Error("useToast must be called inside a ToastProvider");
  }
  return useMemo<ToastApi>(
    () => ({
      show: ({ title, description, tone = "neutral", duration }) =>
        manager.add({
          title,
          description,
          data: { tone },
          priority: tone === "danger" ? "high" : "low",
          ...(duration === undefined ? {} : { timeout: duration }),
        }),
      dismiss: (id) => {
        manager.close(id);
      },
    }),
    [manager],
  );
}

const PILL_CLOSE =
  "inline-flex size-8 shrink-0 items-center justify-center rounded-full text-surface transition-colors hover:bg-surface/15 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-surface";

const TONE_ICON = {
  neutral: Info,
  info: Info,
  success: CheckCircle2,
  warning: AlertTriangle,
  danger: OctagonAlert,
} as const;

function ToastViewport({ closeLabel, appearance }: { closeLabel: string; appearance: ToastAppearance }) {
  const portal = usePortalTheme();
  const { toasts } = BaseToast.useToastManager<ToastData>();
  return (
    <BaseToast.Portal {...portal}>
      <BaseToast.Viewport
        className={cx(
          "fixed z-50 flex flex-col gap-2 outline-none",
          appearance === "pill"
            ? "bottom-6 left-1/2 w-max max-w-[calc(100vw-2rem)] -translate-x-1/2 items-center"
            : "inset-x-3 bottom-3 sm:inset-x-auto sm:right-6 sm:bottom-6 sm:w-96",
        )}
      >
        {toasts.map((toast) => (
          <ToastCard key={toast.id} toast={toast} closeLabel={closeLabel} appearance={appearance} />
        ))}
      </BaseToast.Viewport>
    </BaseToast.Portal>
  );
}

function ToastCard({ toast, closeLabel, appearance }: { toast: ToastObject<ToastData>; closeLabel: string; appearance: ToastAppearance }) {
  const tone = toast.data?.tone ?? "neutral";
  const Icon = TONE_ICON[tone];
  return (
    <BaseToast.Root
      toast={toast}
      className={cx(
        "flex gap-3 shadow-xl",
        appearance === "pill"
          ? "items-center rounded-full bg-text py-2.5 pr-2.5 pl-5 text-surface"
          : "items-start rounded-card border border-border bg-surface p-3 text-text",
        "[transform:translateX(var(--toast-swipe-movement-x))_translateY(var(--toast-swipe-movement-y))] transition-[opacity,transform] duration-200",
        "data-starting-style:translate-y-3 data-starting-style:opacity-0 data-ending-style:opacity-0 data-limited:hidden",
      )}
    >
      {appearance === "pill" ? null : (
        <IconBubble tone={tone} size="sm">
          <Icon className="size-4" />
        </IconBubble>
      )}
      <div className={cx("min-w-0 flex-1", appearance === "pill" ? "" : "pt-1")}>
        <BaseToast.Title className={cx("text-sm", appearance === "pill" ? "font-semibold text-surface" : "font-bold text-text")} />
        <BaseToast.Description className={cx("mt-0.5 text-sm", appearance === "pill" ? "text-surface/80" : "text-muted")} />
      </div>
      <BaseToast.Close aria-label={closeLabel} className={appearance === "pill" ? PILL_CLOSE : CLOSE_BUTTON}>
        <X aria-hidden="true" className="size-4" />
      </BaseToast.Close>
    </BaseToast.Root>
  );
}
