# StickyNotes App Flow

## App Launch
Manager window opens → shows note list sorted by `updated_at`.

## Note Creation
Tray "New Note" / Manager "New Note" / Sidebar "+" / Cmd+Shift+N → creates note with Ghostty theme defaults (320x280, pos 100,100) → opens note window.

## Note Editing
Click note in Manager or Sidebar → opens frameless note window → type in Tiptap editor → auto-saves (300ms debounce).

## Note Navigation
Sidebar toggle `[≡]` → slide-in panel (140px) showing all notes → click to open in new window.

## Theming
`[#]` button → theme picker popup (top-right) → 8 presets + custom hex input → instant apply.

## Window Level
`[-]` button cycles Normal → AlwaysOnTop → Desktop. Right-click context menu for direct selection.

## Window Management
Manager "Show All" / "Hide All" / "Open Latest". Tray mirrors same actions.

## Closing Behavior
- `[x]` hides note (persists, reappears on relaunch)
- Manager close hides (persists)
- Delete via format bar `del` button, sidebar `x`, or context menu → confirm dialog → permanent removal

## Global Shortcuts
- `Cmd+Shift+N` — New note
- `Cmd+Shift+M` — Show manager
