import qrcode from "qrcode-generator";
import { useMemo } from "react";

export type QrErrorCorrection = "L" | "M" | "Q" | "H";

export interface QrCodeProps {
  /** The text or URL to encode. */
  value: string;
  /** Rendered size in pixels (square), quiet zone included. */
  size?: number;
  /**
   * Accessible name: say what the code is for, such as "Scan to pay". Screen-reader users
   * cannot scan it, so also give the value as text near the code.
   */
  label: string;
  /** How much damage the code survives, at the cost of density. "M" recovers about 15%. */
  errorCorrection?: QrErrorCorrection;
  /** Empty modules around the code. Scanners need 4; fewer can fail on busy backgrounds. */
  quietZone?: number;
  /** Shown instead of the code when `value` is too long to encode. */
  tooLongText?: string;
  className?: string;
}

interface Encoded {
  count: number;
  path: string;
}

/** Encodes `value`, or returns null when it does not fit in the largest code. */
function encode(value: string, errorCorrection: QrErrorCorrection): Encoded | null {
  try {
    const code = qrcode(0, errorCorrection);
    code.addData(value);
    code.make();
    const count = code.getModuleCount();
    // One path segment per horizontal run of dark modules keeps the markup small.
    const segments: string[] = [];
    for (let row = 0; row < count; row += 1) {
      let col = 0;
      while (col < count) {
        if (!code.isDark(row, col)) {
          col += 1;
          continue;
        }
        const from = col;
        while (col < count && code.isDark(row, col)) {
          col += 1;
        }
        segments.push(`M${String(from)},${String(row)}h${String(col - from)}v1h-${String(col - from)}z`);
      }
    }
    return { count, path: segments.join("") };
  } catch {
    // qrcode-generator throws when the data exceeds the largest version's capacity.
    return null;
  }
}

/**
 * A real, scannable QR code drawn as SVG paths: no images, no `dangerouslySetInnerHTML`.
 * Modules are always dark on white, whatever the theme, because many scanners cannot read
 * inverted codes: this is the one place a component does not follow theme colours.
 */
export function QrCode({
  value,
  size = 120,
  label,
  errorCorrection = "M",
  quietZone = 4,
  tooLongText = "Too long for a QR code",
  className,
}: QrCodeProps) {
  const encoded = useMemo(() => encode(value, errorCorrection), [value, errorCorrection]);
  if (encoded === null) {
    return (
      <p role="alert" className="text-sm text-danger-text">
        {tooLongText}
      </p>
    );
  }
  const margin = Math.max(0, Math.round(quietZone));
  const span = encoded.count + margin * 2;
  return (
    <svg
      role="img"
      aria-label={label}
      width={size}
      height={size}
      viewBox={`${String(-margin)} ${String(-margin)} ${String(span)} ${String(span)}`}
      shapeRendering="crispEdges"
      className={className}
    >
      <rect x={-margin} y={-margin} width={span} height={span} className="fill-white" />
      <path d={encoded.path} className="fill-black" />
    </svg>
  );
}
