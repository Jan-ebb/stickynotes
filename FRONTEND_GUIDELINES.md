# StickyNotes Frontend Guidelines

## Component Structure
Each window type is a top-level component (`NoteWindow`, `ManagerWindow`). Sub-components: `NoteToolbar`, `NoteEditor`, `NotesList`, `ThemePicker`, `ContextMenu`.

## State Management
React hooks (`useState`, `useCallback`, `useRef`). Custom hooks: `useNote` (note data + debounced saves), `useWindowControls` (position/size persistence). No global state library.

## Styling Approach
Pure CSS in `src/styles/global.css` + inline styles for dynamic theme values (CSS variables set on container divs). No Tailwind, no CSS-in-JS, no CSS modules.

## File Structure
- `src/components/*.tsx` — UI components
- `src/hooks/*.ts` — State management hooks
- `src/lib/*.ts` — Utilities, Tauri commands, constants
- `src/styles/*.css` — All styling
- `src/types.ts` — Shared TypeScript types

## Event System
Tauri event bus (`notes-changed`) for cross-window sync. Debounced refresh (200ms) on events.

## Conventions
- Monospace font everywhere
- ASCII bracket notation for buttons: `[x]`, `[M]`, `[#]`, `[-]`, `[≡]`
- Two-color theming per note (bg + fg with opacity ladder)
- `aria-label` on all interactive elements
- `type="button"` on all buttons
- Exit animations use state machine pattern: `'hidden' | 'visible' | 'closing'`
