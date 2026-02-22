# StickyNotes Tech Stack

## Runtime
Tauri 2.x (Rust backend + WebView frontend). macOS target.

## Frontend
React 18, TypeScript, Vite bundler.

## Editor
Tiptap (ProseMirror) with StarterKit, Underline, Placeholder extensions.

## Styling
Plain CSS (no preprocessor, no utility framework). CSS variables for theming. Inline styles for dynamic values only.

## Fonts
System monospace stack. Hack available via user install, falls back to Fira Code → JetBrains Mono → Menlo.

## Native Capabilities
Frameless windows, custom resize handles, system tray, global shortcuts, window level control (always-on-top, desktop).

## Constraints
- Native transparency requires `macos-private-api` feature (currently disabled). CSS-only dark backgrounds as workaround.
- No web fonts — relies on locally installed monospace fonts.
- WebView rendering — no direct access to Metal/GPU compositing.
- Window animations are CSS-only (no native window transition APIs).
- No responsive breakpoints needed — windows are user-resizable floating panels.
