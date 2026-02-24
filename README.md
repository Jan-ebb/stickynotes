# StickyNotes

Floating sticky notes with a terminal aesthetic. Built with Tauri, React, and TypeScript.

## Install (macOS)

```bash
curl -sL https://raw.githubusercontent.com/Jan-ebb/stickynotes/main/install.sh | bash
```

This downloads the latest release, installs to /Applications, and handles macOS Gatekeeper.

Alternatively, download the `.dmg` manually from [Releases](https://github.com/Jan-ebb/stickynotes/releases). Since the app isn't code-signed, you'll need to strip the quarantine flag after dragging to Applications:

```bash
xattr -cr /Applications/StickyNotes.app
```

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
