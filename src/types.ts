export type WindowLevel = "normal" | "alwaysOnTop" | "desktop";

export interface Note {
  id: string;
  content: string;
  bg_color: string;
  fg_color: string;
  x: number;
  y: number;
  width: number;
  height: number;
  window_level: WindowLevel;
  created_at: string;
  updated_at: string;
}

export interface Theme {
  name: string;
  bg: string;
  fg: string;
}
