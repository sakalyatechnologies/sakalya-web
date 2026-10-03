import { useMemo, useState } from "react";

import {
  PRESETS,
  checkContrast,
  createTheme,
  parseHexColor,
  type HexColor,
  type Preset,
  type ThemeMode,
} from "@sakalya/tokens";
import { ThemeScope } from "@sakalya/ui";

import { SampleDashboard } from "./sample-dashboard.js";

const FIRST_PRESET: Preset | undefined = PRESETS[0];

/** The gallery: theme controls above a sample screen rendered with the chosen theme. */
export function App() {
  const [presetKey, setPresetKey] = useState(FIRST_PRESET?.key ?? "mint");
  const [custom, setCustom] = useState("");
  const [mode, setMode] = useState<ThemeMode>("light");

  const active = PRESETS.find((p) => p.key === presetKey) ?? FIRST_PRESET;
  const customColor: HexColor | null = custom === "" ? null : parseHexColor(custom);
  const brand = customColor ?? active?.brand;

  const theme = useMemo(
    () =>
      brand === undefined
        ? null
        : createTheme({ brand, mode, radius: active?.radius ?? 16, surface: active?.surface ?? "soft" }),
    [brand, mode, active],
  );
  const issues = theme ? checkContrast(theme) : [];

  if (theme === null) {
    return null;
  }

  return (
    <div className="min-h-full bg-slate-100 text-slate-900">
      <div className="border-b border-slate-200 bg-white px-4 py-3 sm:px-6">
        <div className="mx-auto flex max-w-[1500px] flex-wrap items-center gap-x-6 gap-y-3">
          <p className="text-sm font-bold">Sakalya Web Gallery</p>
          <fieldset className="flex flex-wrap items-center gap-2">
            <legend className="sr-only">Theme preset</legend>
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
                className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-3 py-1.5 text-xs font-semibold aria-pressed:border-slate-900 aria-pressed:bg-slate-900 aria-pressed:text-white"
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
            className="rounded-full border border-slate-200 px-3 py-1.5 text-xs font-semibold"
          >
            {mode === "light" ? "Switch to dark" : "Switch to light"}
          </button>
          <p className="text-xs text-slate-600" role="status">
            {issues.length === 0
              ? "Contrast: all checks pass"
              : `Contrast: ${String(issues.length)} issue${issues.length === 1 ? "" : "s"}, ${issues[0]?.message ?? ""}`}
          </p>
        </div>
      </div>
      <ThemeScope theme={theme} className="min-h-[calc(100%-57px)]">
        <SampleDashboard />
      </ThemeScope>
    </div>
  );
}
