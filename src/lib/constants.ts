import { Theme } from "../types";

export const NOTE_THEMES: Theme[] = [
  // dark
  { name: "Void",        bg: "#0a0a0a", fg: "#00ff88" },
  { name: "Concrete",    bg: "#1a1a1a", fg: "#a0a0a0" },
  { name: "Nord",        bg: "#2e3440", fg: "#d8dee9" },
  { name: "Solarized",   bg: "#002b36", fg: "#839496" },
  { name: "Oxide",       bg: "#1c1210", fg: "#c4956a" },
  { name: "Blueprint",   bg: "#0a1628", fg: "#5599dd" },
  // paper
  { name: "Paper",       bg: "#f5f5f0", fg: "#1a1a1a" },
  { name: "Bone",        bg: "#e8e4df", fg: "#3a3530" },
  { name: "Frost",       bg: "#eceff4", fg: "#2e3440" },
  { name: "Post-it",     bg: "#fff3a0", fg: "#5a4520" },
  { name: "Kraft",       bg: "#d4c4a8", fg: "#3e3328" },
  { name: "Notepad",     bg: "#fffef2", fg: "#2c2c2c" },
];

export const DEFAULT_WIDTH = 320;
export const DEFAULT_HEIGHT = 280;

// Rust backend defaults (Note::new() in notes.rs)
export const RUST_DEFAULT_BG = "#0a0e14";
export const RUST_DEFAULT_FG = "#00ff88";
