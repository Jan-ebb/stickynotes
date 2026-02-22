# StickyNotes Design Lessons

## What Worked

### Opacity-based hierarchy
Using distinct opacity values (0.4, 0.45, 0.5, 0.7) for toolbar buttons creates clear visual hierarchy without adding color complexity. The close button at 0.7 reads as most prominent; utility buttons at 0.4 recede naturally.

### CSS variable-driven Manager
Moving hardcoded hex values to CSS variables (`--mgr-*`) on the root div keeps the Manager visually connected to the design system while maintaining a distinct palette. Easy to theme later.

### State machine for exit animations
The `'hidden' | 'visible' | 'closing'` pattern with setTimeout cleanup is reliable for CSS exit animations. Key insight: on "select" actions (like picking a theme), skip the animation and go directly to 'hidden' for instant feedback. Only animate on explicit close/dismiss.

### ASCII consistency
Replacing the SVG trash icon with `del` text unified the entire icon language. Every interactive element now uses the same monospace ASCII vocabulary.

## Patterns to Reuse
- 3-value border-radius system (2px/4px/6px) scales well for compact UIs
- `flex-wrap: wrap` on format bars prevents overflow at narrow widths
- Tooltip shadows (`0 2px 6px rgba(0,0,0,0.25)`) add depth without visual weight

## Mistakes to Avoid
- Don't use more than 4 font size stops in a compact app — the difference between 9px and 10px is barely perceptible but creates inconsistency
- Don't mix rgba red values (`rgba(255,60,60,...)` vs `rgba(255,68,68,...)`) — pick one and use it everywhere
