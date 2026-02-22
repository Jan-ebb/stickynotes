const STORAGE_KEY = "stickynotes:defaultTheme";

interface ThemePreference {
  bg: string;
  fg: string;
}

export function getDefaultTheme(): ThemePreference | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed.bg === "string" && typeof parsed.fg === "string") {
      return parsed;
    }
    return null;
  } catch {
    return null;
  }
}

export function setDefaultTheme(bg: string, fg: string): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ bg, fg }));
  } catch {
    // localStorage unavailable — ignore
  }
}
