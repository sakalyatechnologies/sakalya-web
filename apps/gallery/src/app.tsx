import { useMemo, useState, type ReactNode } from "react";

import {
  PRESETS,
  checkContrast,
  createTheme,
  studioTheme,
  parseHexColor,
  type HexColor,
  type Preset,
  type Theme,
  type ThemeMode,
} from "@sakalya/tokens";
import { ThemeScope, ToastProvider } from "@sakalya/ui";

import { Catalogue } from "./catalogue.js";
import { SampleDashboard } from "./sample-dashboard.js";
import { SampleForm } from "./sample-form.js";
import { SampleTable } from "./sample-table.js";
import { StudioKit } from "./studio-kit.js";

const FIRST_PRESET: Preset | undefined = PRESETS[0];

type Page = "components" | "studio" | "form" | "table" | "dashboard";

const PAGES: readonly { key: Page; label: string }[] = [
  { key: "components", label: "Components" },
  { key: "studio", label: "Studio kit" },
  { key: "form", label: "Sample form" },
  { key: "table", label: "Sample table" },
  { key: "dashboard", label: "Sample dashboard" },
];

function PageContent({ page }: { page: Page }) {
  switch (page) {
    case "components":
      return <Catalogue />;
    case "studio":
      return <StudioKit />;
    case "form":
      return <SampleForm />;
    case "table":
      return <SampleTable />;
    case "dashboard":
      return <SampleDashboard />;
  }
}

/** Start-up state from the URL, such as `?page=table&mode=dark&compare=1`, for sharing a view. */
const params = new URLSearchParams(window.location.search);
const START_PAGE: Page = PAGES.find((entry) => entry.key === params.get("page"))?.key ?? "components";
const START_MODE: ThemeMode = params.get("mode") === "dark" ? "dark" : "light";
const START_COMPARE = params.get("compare") === "1";
const START_STUDIO = params.get("theme") === "studio";

/** One themed copy of the page, with its own toasts so they carry its theme. */
function Themed({ theme, caption, children }: { theme: Theme; caption?: string; children: ReactNode }) {
  return (
    <ThemeScope theme={theme} className="min-h-full">
      <ToastProvider>
        {caption !== undefined ? <p className="px-6 pt-4 text-xs font-bold uppercase tracking-wide text-muted">{caption}</p> : null}
        {children}
      </ToastProvider>
    </ThemeScope>
  );
}

function pillClass(pressed: boolean): string {
  return pressed
    ? "inline-flex items-center gap-2 rounded-full border border-slate-900 bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white"
    : "inline-flex items-center gap-2 rounded-full border border-slate-200 px-3 py-1.5 text-xs font-semibold";
}

/** The gallery: theme controls above a page rendered with the chosen theme. */
export function App() {
  const [page, setPage] = useState<Page>(START_PAGE);
  const [presetKey, setPresetKey] = useState(FIRST_PRESET?.key ?? "mint");
  const [custom, setCustom] = useState("");
  const [mode, setMode] = useState<ThemeMode>(START_MODE);
  const [compare, setCompare] = useState(START_COMPARE);
  const [studio, setStudio] = useState(START_STUDIO);

  const active = PRESETS.find((p) => p.key === presetKey) ?? FIRST_PRESET;
  const second = PRESETS.find((p) => p.key === (active?.key === "lotus" ? "ocean" : "lotus"));
  const customColor: HexColor | null = custom === "" ? null : parseHexColor(custom);
  const brand = customColor ?? active?.brand;

  const theme = useMemo(
    () =>
      studio
        ? studioTheme(mode)
        : brand === undefined
          ? null
          : createTheme({ brand, mode, radius: active?.radius ?? 16, surface: active?.surface ?? "soft" }),
    [brand, mode, active, studio],
  );
  const issues = theme ? checkContrast(theme) : [];

  if (theme === null || brand === undefined) {
    return null;
  }

  const shown = [
    { name: customColor === null ? (active?.name ?? "Custom") : "Custom", brand, preset: active },
    ...(second === undefined ? [] : [{ name: second.name, brand: second.brand, preset: second }]),
  ];
  const brandVariants = shown.flatMap((variant) =>
    (["light", "dark"] as const).map((variantMode) => ({
      caption: `${variant.name} · ${variantMode}`,
      theme: createTheme({
        brand: variant.brand,
        mode: variantMode,
        radius: variant.preset?.radius ?? 16,
        surface: variant.preset?.surface ?? "soft",
      }),
    })),
  );
  // Studio first when chosen, so its two modes sit beside the active preset's.
  const variants = studio
    ? [
        { caption: "Studio · light", theme: studioTheme("light") },
        { caption: "Studio · dark", theme: studioTheme("dark") },
        ...brandVariants.slice(0, 2),
      ]
    : brandVariants;
  const names = studio ? ["Studio", ...shown.slice(0, 1).map((variant) => variant.name)] : shown.map((variant) => variant.name);

  return (
    <div className="min-h-full bg-slate-100 text-slate-900">
      <div className="border-b border-slate-200 bg-white px-4 py-3 sm:px-6">
        <div className="mx-auto flex max-w-[1500px] flex-wrap items-center gap-x-6 gap-y-3">
          <p className="text-sm font-bold">Sakalya Web Gallery</p>
          <nav aria-label="Gallery pages" className="flex flex-wrap gap-2">
            {PAGES.map((entry) => (
              <button
                key={entry.key}
                type="button"
                aria-pressed={page === entry.key}
                onClick={() => {
                  setPage(entry.key);
                }}
                className={pillClass(page === entry.key)}
              >
                {entry.label}
              </button>
            ))}
          </nav>
          <fieldset className="flex flex-wrap items-center gap-2">
            <legend className="sr-only">Theme preset</legend>
            <button
              type="button"
              aria-pressed={studio}
              title="Editorial workspace look: ivory, sage and a deep green rail"
              onClick={() => {
                setStudio(!studio);
              }}
              className={pillClass(studio)}
            >
              Studio
            </button>
            {PRESETS.map((p) => (
              <button
                key={p.key}
                type="button"
                aria-pressed={p.key === presetKey && customColor === null}
                title={p.description}
                onClick={() => {
                  setPresetKey(p.key);
                  setCustom("");
                }}
                className={pillClass(p.key === presetKey && customColor === null)}
              >
                <span aria-hidden="true" className="size-3 rounded-full" style={{ background: p.brand }} />
                {p.name}
              </button>
            ))}
          </fieldset>
          <label className="flex items-center gap-2 text-xs font-semibold">
            Brand colour
            <input
              id="brand-input"
              value={custom}
              placeholder={active?.brand ?? "#14a89a"}
              onChange={(e) => {
                setCustom(e.target.value);
              }}
              aria-invalid={custom !== "" && customColor === null}
              className="w-24 rounded-lg border border-slate-300 px-2 py-1 font-mono text-xs aria-invalid:border-red-500"
            />
          </label>
          <button
            type="button"
            onClick={() => {
              setMode(mode === "light" ? "dark" : "light");
            }}
            className={pillClass(false)}
          >
            {mode === "light" ? "Switch to dark" : "Switch to light"}
          </button>
          <button
            type="button"
            aria-pressed={compare}
            onClick={() => {
              setCompare(!compare);
            }}
            className={pillClass(compare)}
          >
            Side by side: {names.join(" and ")}, light and dark
          </button>
          <p className="text-xs text-slate-600" role="status">
            {issues.length === 0
              ? "Contrast: all checks pass"
              : `Contrast: ${String(issues.length)} issue${issues.length === 1 ? "" : "s"}, ${issues[0]?.message ?? ""}`}
          </p>
        </div>
      </div>
      {compare ? (
        <div className="grid gap-px bg-slate-300 xl:grid-cols-2">
          {variants.map((variant) => (
            <Themed key={variant.caption} theme={variant.theme} caption={variant.caption}>
              <PageContent page={page} />
            </Themed>
          ))}
        </div>
      ) : (
        <Themed theme={theme}>
          <PageContent page={page} />
        </Themed>
      )}
    </div>
  );
}
