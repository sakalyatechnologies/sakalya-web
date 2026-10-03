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
}

/**
 * Lets anything inside it show toasts with `useToast`. Place it inside the app's `ThemeScope`
 * so toasts carry the theme. F6 moves keyboard focus to the toasts.
 */
export function ToastProvider({ children, limit = 3, duration = 5000, closeLabel = "Dismiss" }: ToastProviderProps) {
  const [manager] = useState(() => BaseToast.createToastManager<ToastData>());
  return (
    <ToastContext value={manager}>
      <BaseToast.Provider toastManager={manager} limit={limit} timeout={duration}>
        {children}
        <ToastViewport closeLabel={closeLabel} />
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

const TONE_ICON = {
  neutral: Info,
  info: Info,
  success: CheckCircle2,
  warning: AlertTriangle,
  danger: OctagonAlert,
} as const;

function ToastViewport({ closeLabel }: { closeLabel: string }) {
  const portal = usePortalTheme();
  const { toasts } = BaseToast.useToastManager<ToastData>();
  return (
    <BaseToast.Portal {...portal}>
      <BaseToast.Viewport className="fixed inset-x-3 bottom-3 z-50 flex flex-col gap-2 outline-none sm:inset-x-auto sm:right-6 sm:bottom-6 sm:w-96">
        {toasts.map((toast) => (
          <ToastCard key={toast.id} toast={toast} closeLabel={closeLabel} />
        ))}
      </BaseToast.Viewport>
    </BaseToast.Portal>
  );
}

function ToastCard({ toast, closeLabel }: { toast: ToastObject<ToastData>; closeLabel: string }) {
  const tone = toast.data?.tone ?? "neutral";
  const Icon = TONE_ICON[tone];
  return (
    <BaseToast.Root
      toast={toast}
      className={cx(
        "flex items-start gap-3 rounded-card border border-border bg-surface p-3 text-text shadow-xl",
        "[transform:translateX(var(--toast-swipe-movement-x))_translateY(var(--toast-swipe-movement-y))] transition-[opacity,transform] duration-200",
        "data-starting-style:translate-y-3 data-starting-style:opacity-0 data-ending-style:opacity-0 data-limited:hidden",
      )}
    >
      <IconBubble tone={tone} size="sm">
        <Icon className="size-4" />
      </IconBubble>
      <div className="min-w-0 flex-1 pt-1">
        <BaseToast.Title className="text-sm font-bold text-text" />
        <BaseToast.Description className="mt-0.5 text-sm text-muted" />
      </div>
      <BaseToast.Close aria-label={closeLabel} className={CLOSE_BUTTON}>
        <X aria-hidden="true" className="size-4" />
      </BaseToast.Close>
    </BaseToast.Root>
  );
}
