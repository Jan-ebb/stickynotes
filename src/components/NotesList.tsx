import { useState, useEffect, useCallback, useRef } from "react";
import { listen, type UnlistenFn } from "@tauri-apps/api/event";
import { Note } from "../types";
import { listNotes, createNote } from "../lib/commands";

interface Props {
  currentNoteId: string;
  fgColor: string;
  onOpenNote: (id: string) => void | Promise<void>;
  onDeleteNote: (id: string) => void | Promise<void>;
  closing?: boolean;
}

function stripHtml(html: string): string {
  const div = document.createElement("div");
  div.innerHTML = html;
  return div.textContent || div.innerText || "";
}

function preview(note: Note): string {
  const text = stripHtml(note.content).trim();
  if (!text) return "Empty note";
  return text.length > 50 ? text.slice(0, 50) + "..." : text;
}

export function NotesList({ currentNoteId, fgColor, onOpenNote, onDeleteNote, closing }: Props) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const refreshTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const refresh = useCallback(() => {
    listNotes()
      .then((fetched) => {
        // Sort by created_at DESC for stable ordering.
        // The backend sorts by updated_at which causes notes to jump
        // positions every time one is edited.
        fetched.sort((a, b) => b.created_at.localeCompare(a.created_at));
        setNotes(fetched);
      })
      .catch((e) => console.error("Failed to list notes:", e));
  }, []);

  const queueRefresh = useCallback(() => {
    if (refreshTimer.current) {
      return;
    }
    refreshTimer.current = setTimeout(() => {
      refreshTimer.current = null;
      refresh();
    }, 200);
  }, [refresh]);

  useEffect(() => {
    refresh();

    let unlisten: UnlistenFn | null = null;
    listen("notes-changed", () => {
      queueRefresh();
    })
      .then((fn) => {
        unlisten = fn;
      })
      .catch((e) => console.error("Failed to subscribe to note changes:", e));

    const interval = setInterval(refresh, 30000);
    const onFocus = () => queueRefresh();
    const onVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        queueRefresh();
      }
    };

    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onVisibilityChange);

    return () => {
      clearInterval(interval);
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onVisibilityChange);
      if (refreshTimer.current) {
        clearTimeout(refreshTimer.current);
      }
      if (unlisten) {
        unlisten();
      }
    };
  }, [refresh, queueRefresh]);

  // Arrow key navigation — capture phase so it fires before TipTap/ProseMirror
  useEffect(() => {
    if (notes.length === 0 || confirmId) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "ArrowUp" && e.key !== "ArrowDown") return;
      e.preventDefault();
      e.stopPropagation();
      if (document.activeElement instanceof HTMLElement) {
        document.activeElement.blur();
      }
      const idx = notes.findIndex((n) => n.id === currentNoteId);
      let next: number;
      if (e.key === "ArrowUp") {
        next = idx <= 0 ? notes.length - 1 : idx - 1;
      } else {
        next = idx >= notes.length - 1 ? 0 : idx + 1;
      }
      onOpenNote(notes[next].id);
    };
    document.addEventListener("keydown", onKeyDown, true);
    return () => document.removeEventListener("keydown", onKeyDown, true);
  }, [notes, currentNoteId, confirmId, onOpenNote]);

  // Listen for y/n when confirming
  useEffect(() => {
    if (!confirmId) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "y" || e.key === "Y") {
        e.preventDefault();
        e.stopImmediatePropagation();
        const id = confirmId;
        setConfirmId(null);
        Promise.resolve(onDeleteNote(id)).then(() => queueRefresh()).catch(console.error);
      } else if (e.key === "n" || e.key === "N" || e.key === "Escape") {
        e.preventDefault();
        e.stopImmediatePropagation();
        setConfirmId(null);
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [confirmId, onDeleteNote, queueRefresh]);

  const handleCreate = async () => {
    const note = await createNote();
    await onOpenNote(note.id);
    queueRefresh();
  };

  const handleDeleteClick = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    e.preventDefault();
    setConfirmId(id);
  };

  return (
    <div className={`notes-list${closing ? ' closing' : ''}`}>
      <div className="notes-list-header">
        <span>Notes ({notes.length})</span>
        <button
          className="notes-list-add"
          onClick={handleCreate}
          title="New note"
          style={{ color: fgColor }}
          aria-label="Create new note"
          type="button"
        >
          +
        </button>
      </div>
      <div className="notes-list-items">
        {notes.map((note) => (
          <div
            key={note.id}
            className={`notes-list-item ${note.id === currentNoteId ? "active" : ""}`}
            onClick={() => { if (confirmId !== note.id) onOpenNote(note.id); }}
            onKeyDown={(e) => {
              if (confirmId) return;
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onOpenNote(note.id);
              }
            }}
            role="button"
            tabIndex={0}
            aria-current={note.id === currentNoteId}
          >
            {confirmId === note.id ? (
              <div className="notes-list-item-confirm">
                del? <span className="confirm-key">y</span>/<span className="confirm-key">n</span>
              </div>
            ) : (
              <>
                <div className="notes-list-item-preview">{preview(note)}</div>
                <div className="notes-list-item-meta">
                  {new Date(note.updated_at).toLocaleDateString(undefined, {
                    month: "short",
                    day: "numeric",
                  })}
                </div>
                <button
                  className="notes-list-item-delete"
                  onClick={(e) => handleDeleteClick(e, note.id)}
                  title="Delete note"
                  aria-label={`Delete note ${preview(note)}`}
                  type="button"
                >
                  x
                </button>
              </>
            )}
          </div>
        ))}
        {notes.length === 0 && <div className="notes-list-empty">&gt; no notes</div>}
      </div>
      {notes.length > 1 && (
        <div className="notes-list-hint">
          ↑↓ navigate
        </div>
      )}
    </div>
  );
}
