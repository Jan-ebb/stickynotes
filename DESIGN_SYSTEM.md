# StickyNotes Design System

## Colors

### Theme Presets
| Name | Background | Foreground |
|------|-----------|-----------|
| Ghostty | `#282a36` | `#c5c8c6` |
| Dracula | `#282a36` | `#f8f8f2` |
| Monokai | `#272822` | `#f8f8f2` |
| Nord | `#2e3440` | `#d8dee9` |
| Solarized Dark | `#002b36` | `#839496` |
| Solarized Light | `#fdf6e3` | `#657b83` |
| Paper | `#f5f0eb` | `#433633` |
| Matrix | `#0a0a0a` | `#00ff41` |

### Opacity Ladder (derived from `--note-fg`)
- `--note-fg-10`: 0.10 (borders, subtle bg)
- `--note-fg-15`: 0.15 (active bg, scrollbar thumb)
- `--note-fg-20`: 0.20 (hover bg)
- `--note-fg-40`: 0.40 (muted text, labels)
- `--note-fg-60`: 0.60 (secondary text)
- `--note-fg-80`: 0.80 (primary text)
- `--note-bg-80`: light ? `rgba(0,0,0,0.1)` : `rgba(0,0,0,0.4)` (shadow)

### Manager Palette
- `--mgr-bg`: `#111827`
- `--mgr-fg`: `#e5e7eb`
- `--mgr-border`: `#1f2937`
- `--mgr-surface`: `#1f2937`
- `--mgr-surface-border`: `#334155`
- `--mgr-fg-muted`: `#94a3b8`
- `--mgr-fg-10`: `rgba(229, 231, 235, 0.10)`
- `--mgr-fg-15`: `rgba(229, 231, 235, 0.15)`

### Semantic Colors
- Destructive red: `#ff4444` / `rgba(255, 68, 68, ...)`
- Error text: `#ff8c8c`

## Typography

### Font Stack
`'Hack', 'Fira Code', 'JetBrains Mono', 'Menlo', monospace`

### Scale (4 stops + relative)
| Token | Size | Usage |
|-------|------|-------|
| meta | 10px | Sidebar meta, format bar, tooltips, headers |
| chrome | 11px | Toolbar buttons, theme picker, sidebar preview |
| secondary | 12px | Context menu, manager body |
| body | 14px | Editor content, base font |
| _relative_ | 1.4em / 1.15em | Editor headings (em-based) |
| _add button_ | 16px | Sidebar "+" button |

### Weights
- 400: Normal text
- 600: Headings (manager h1)
- 700: Bold (editor headings)

### Line Heights
- 1.5: Editor content
- 1.4: Lists, manager items

## Spacing

| Element | Value |
|---------|-------|
| Toolbar padding | `5px 10px` |
| Format bar padding | `4px 10px` |
| Editor padding | `10px 14px 14px` |
| Toolbar gap | `4px` (both sides) |
| Format bar gap | `1px` |
| Format separator padding | `0 3px` |
| Theme presets gap | `3px` |
| Manager actions gap | `6px` |

## Border Radius (3 values)
- **2px**: Small — buttons, tooltips, inline code, scrollbar thumb, swatches
- **4px**: Medium — popups, theme presets, code blocks, manager buttons
- **6px**: Large — window containers

## Shadows
- Tooltip: `0 2px 6px rgba(0,0,0,0.25)`
- Popup/context menu: `0 4px 16px var(--note-bg-80)`

## Motion
| Animation | Duration | Easing |
|-----------|----------|--------|
| fadeIn | 0.1s | ease-out |
| fadeInScale | 0.12s | ease-out |
| slideInLeft | 0.15s | ease-out |
| fadeOutScale | 0.08s | ease-in |
| slideOutLeft | 0.12s | ease-in |

## Scrollbar
- Width: `4px`
- Thumb: `var(--note-fg-15)`
- Track: `transparent`
- Radius: `2px`

## Opacity Scale
| Value | Usage |
|-------|-------|
| 0.05 | Scrollbar track |
| 0.10–0.15 | Borders, subtle backgrounds |
| 0.35 | Placeholder, inactive elements |
| 0.4 | Utility toolbar buttons |
| 0.45 | Drag grip |
| 0.5 | Default toolbar/format buttons |
| 0.6–0.8 | Text |
| 0.7 | Close button (high priority) |
| 1.0 | Active/primary, hover state |
