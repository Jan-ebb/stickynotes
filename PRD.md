# StickyNotes Product Requirements

## Multi-Window Notes
Each note is an independent frameless native window with its own theme, position, size, and window level.

## Rich Text Editing
Tiptap editor with bold, italic, underline, strikethrough, H1/H2, bullet/ordered lists, blockquote, inline code.

## Theming
8 preset themes + custom hex colors. Per-note. Two-color system (bg + fg) with derived opacity ladder.

## Window Levels
Normal, Always on Top, Desktop (behind all windows).

## Persistence
All note data (content, position, size, theme, window level) persisted to JSON at `~/Library/Application Support/com.stickynotes.app/notes.json`.

## Close = Hide
Closing a note hides it; it reappears on next launch. Only explicit Delete removes permanently.

## Manager Window
Central list of all notes with preview text, timestamps. Actions: New Note, Show All, Hide All, Open Latest.

## System Tray
New Note, Open Manager, Show All, Hide All, Quit.

## Global Shortcuts
- `Cmd+Shift+N` — New note
- `Cmd+Shift+M` — Show manager
