# StickyNotes

Floating sticky notes with a terminal aesthetic. Built with Tauri, React, and TypeScript.

## Install (macOS)

Download the latest `.dmg` from [Releases](https://github.com/Jan-ebb/stickynotes/releases), or:

```bash
curl -sL $(curl -s https://api.github.com/repos/Jan-ebb/stickynotes/releases/latest | grep browser_download_url | cut -d '"' -f 4) -o StickyNotes.dmg
open StickyNotes.dmg
```

Drag StickyNotes to Applications.

> **Note:** Since the app isn't code-signed, macOS may show an "unidentified developer" warning. Right-click the app > Open to bypass it.

## Development

**Prerequisites:** Node.js 18+ and Rust (via [rustup](https://rustup.rs))

```bash
git clone https://github.com/Jan-ebb/stickynotes.git
cd stickynotes
npm ci
npm run tauri dev
```

**Frontend only** (no Rust needed):

```bash
npm ci
npm run dev
```

Opens at `http://localhost:1420` with Tauri APIs mocked via localStorage.

## Recommended IDE Setup

- [VS Code](https://code.visualstudio.com/) + [Tauri](https://marketplace.visualstudio.com/items?itemName=tauri-apps.tauri-vscode) + [rust-analyzer](https://marketplace.visualstudio.com/items?itemName=rust-lang.rust-analyzer)
