/**
 * Mock layer for Tauri APIs so the app can run in a regular browser.
 * Notes are persisted to localStorage.
 */
import { Note } from "../types";
import { RUST_DEFAULT_BG, RUST_DEFAULT_FG, DEFAULT_WIDTH, DEFAULT_HEIGHT } from "./constants";

const STORAGE_KEY = "stickynotes:notes";

function loadNotes(): Note[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveNotes(notes: Note[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
}

function makeNote(): Note {
  const now = new Date().toISOString();
  return {
    id: crypto.randomUUID(),
    content: "",
    bg_color: RUST_DEFAULT_BG,
    fg_color: RUST_DEFAULT_FG,
    x: 100,
    y: 100,
    width: DEFAULT_WIDTH,
    height: DEFAULT_HEIGHT,
    window_level: "normal",
    created_at: now,
    updated_at: now,
  };
}

// Command handlers matching the Rust backend
const handlers: Record<string, (args?: any) => any> = {
  create_note: () => {
    const notes = loadNotes();
    const note = makeNote();
    notes.push(note);
    saveNotes(notes);
    return note;
  },
  list_notes: () => loadNotes(),
  get_note: (args: { id: string }) => {
    const note = loadNotes().find((n) => n.id === args.id);
    if (!note) throw new Error(`Note ${args.id} not found`);
    return note;
  },
  update_note: (args: { note: Note }) => {
    const notes = loadNotes();
    const idx = notes.findIndex((n) => n.id === args.note.id);
    if (idx >= 0) notes[idx] = args.note;
    saveNotes(notes);
  },
  delete_note: (args: { id: string }) => {
    const notes = loadNotes().filter((n) => n.id !== args.id);
    saveNotes(notes);
  },
  update_note_position: (args: { id: string; x: number; y: number; width: number; height: number }) => {
    const notes = loadNotes();
    const note = notes.find((n) => n.id === args.id);
    if (note) {
      note.x = args.x;
      note.y = args.y;
      note.width = args.width;
      note.height = args.height;
      saveNotes(notes);
    }
  },
  set_window_level: () => {},
  show_note: () => {},
  show_all_notes: () => {},
  hide_all_notes: () => {},
  close_note_window: () => {},
  save_image: (_args: { data: string; mimeType: string }) => {
    return `data:image/png;base64,placeholder`;
  },
};

/**
 * Install mocks on window.__TAURI_INTERNALS__ so that
 * @tauri-apps/api/core invoke() calls hit our handlers.
 */
export function installBrowserMocks() {
  if (typeof (window as any).__TAURI_INTERNALS__ !== "undefined") {
    return; // Running inside real Tauri — don't mock
  }

  const noop = () => {};

  (window as any).__TAURI_INTERNALS__ = {
    invoke: async (cmd: string, args?: any) => {
      // Handle Tauri plugin commands (webview, window, etc.)
      if (cmd.startsWith("plugin:")) {
        // Window/webview position & size queries
        if (cmd.includes("outer_position")) return { x: 100, y: 100 };
        if (cmd.includes("outer_size")) return { width: 320, height: 280 };
        if (cmd.includes("inner_position")) return { x: 100, y: 100 };
        if (cmd.includes("inner_size")) return { width: 320, height: 280 };
        // Everything else (close, startDragging, etc.) is a no-op
        return;
      }

      const handler = handlers[cmd];
      if (!handler) {
        console.warn(`[browser-mock] unhandled command: ${cmd}`, args);
        return;
      }
      return handler(args);
    },
    metadata: { currentWebview: { label: "main" }, currentWindow: { label: "main" } },
    convertFileSrc: (path: string) => path,
    // Event listener stubs — return unlisten functions
    addEventListener: (_event: string, _handler: any) => Promise.resolve(noop),
  };
}

/**
 * Ensure at least one note exists and return its id.
 */
export async function ensureNoteId(): Promise<string> {
  let notes = loadNotes();
  if (notes.length === 0) {
    const note = makeNote();
    notes.push(note);
    saveNotes(notes);
  }
  return notes[0].id;
}
