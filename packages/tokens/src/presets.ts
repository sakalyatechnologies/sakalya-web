/** Ready-made looks a tenant can start from, then adjust. */

import { hex, type HexColor } from "./color.js";
import type { SurfaceStyle } from "./theme.js";

export type PresetKey = "mint" | "ocean" | "lotus" | "saffron" | "tulsi" | "indigo" | "slate";

export interface Preset {
  key: PresetKey;
  name: string;
  description: string;
  brand: HexColor;
  radius: number;
  surface: SurfaceStyle;
}

export const PRESETS: readonly Preset[] = [
  { key: "mint", name: "Mint", description: "Fresh teal, soft cards. Dental and family clinics.", brand: hex("#14a89a"), radius: 18, surface: "soft" },
  { key: "ocean", name: "Ocean", description: "Calm blue, clinical and trusted.", brand: hex("#2563eb"), radius: 14, surface: "soft" },
  { key: "lotus", name: "Lotus", description: "Warm rose. Gynecology, maternity, skin.", brand: hex("#db2777"), radius: 20, surface: "soft" },
  { key: "saffron", name: "Saffron", description: "Energetic orange. Pediatrics and wellness.", brand: hex("#ea580c"), radius: 16, surface: "soft" },
  { key: "tulsi", name: "Tulsi", description: "Deep green. Ayurveda and general practice.", brand: hex("#15803d"), radius: 12, surface: "flat" },
  { key: "indigo", name: "Indigo", description: "Modern violet-blue, premium feel.", brand: hex("#4f46e5"), radius: 16, surface: "soft" },
  { key: "slate", name: "Slate", description: "Neutral and understated. Hospitals and groups.", brand: hex("#334155"), radius: 10, surface: "flat" },
];

/** The preset with `key`. */
export function preset(key: PresetKey): Preset {
  const found = PRESETS.find((p) => p.key === key);
  if (found === undefined) {
    throw new Error(`unknown preset ${key}`);
  }
  return found;
}
