const HEX_COLOR_RE = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;

function expandHex(hex: string): string {
  if (hex.length === 4) {
    return `#${hex[1]}${hex[1]}${hex[2]}${hex[2]}${hex[3]}${hex[3]}`;
  }
  return hex;
}

export function normalizeHexColor(value: string): string | null {
  const trimmed = value.trim();
  const prefixed = trimmed.startsWith("#") ? trimmed : `#${trimmed}`;
  if (!HEX_COLOR_RE.test(prefixed)) {
    return null;
  }
  return expandHex(prefixed).toLowerCase();
}

export function withAlpha(hex: string, alpha: number): string {
  const normalized = normalizeHexColor(hex);
  if (!normalized) {
    return hex;
  }
  const clamped = Math.max(0, Math.min(alpha, 1));
  const alphaHex = Math.round(clamped * 255)
    .toString(16)
    .padStart(2, "0");
  return `${normalized}${alphaHex}`;
}

export function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const normalized = normalizeHexColor(hex);
  if (!normalized) return null;
  const r = parseInt(normalized.slice(1, 3), 16);
  const g = parseInt(normalized.slice(3, 5), 16);
  const b = parseInt(normalized.slice(5, 7), 16);
  return { r, g, b };
}

export function isLightColor(hex: string): boolean {
  const rgb = hexToRgb(hex);
  if (!rgb) return false;
  const luminance = (0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b) / 255;
  return luminance > 0.5;
}

function rgbToHex(r: number, g: number, b: number): string {
  const clamp = (v: number) => Math.max(0, Math.min(255, Math.round(v)));
  return `#${clamp(r).toString(16).padStart(2, "0")}${clamp(g).toString(16).padStart(2, "0")}${clamp(b).toString(16).padStart(2, "0")}`;
}

export function deriveOverlayBg(bgHex: string): string {
  const rgb = hexToRgb(bgHex);
  if (!rgb) return "#1a1e24";
  if (isLightColor(bgHex)) {
    return rgbToHex(
      Math.round(rgb.r * 0.92),
      Math.round(rgb.g * 0.92),
      Math.round(rgb.b * 0.92),
    );
  }
  return rgbToHex(rgb.r + 16, rgb.g + 16, rgb.b + 16);
}
