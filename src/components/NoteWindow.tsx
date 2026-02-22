import { useState, useCallback, useRef, useEffect } from "react";
import { getCurrentWebviewWindow } from "@tauri-apps/api/webviewWindow";
import { useNote } from "../hooks/useNote";
import { useWindowControls } from "../hooks/useWindowControls";
import { NoteToolbar } from "./NoteToolbar";
import { NoteEditor } from "./NoteEditor";
import { NotesList } from "./NotesList";
import { ContextMenu } from "./ContextMenu";
import { deleteNote, listNotes, createNote } from "../lib/commands";
import { withAlpha, isLightColor, deriveOverlayBg } from "../lib/colors";
import { getDefaultTheme } from "../lib/preferences";
import { RUST_DEFAULT_BG, RUST_DEFAULT_FG } from "../lib/constants";

interface Props {
  noteId: string;
}

type PanelState = 'hidden' | 'visible' | 'closing';

export function NoteWindow({ noteId: initialNoteId }: Props) {
  const [currentNoteId, setCurrentNoteId] = useState(initialNoteId);
  const currentNoteIdRef = useRef(currentNoteId);
  currentNoteIdRef.current = currentNoteId;
  const [listState, setListState] = useState<PanelState>('hidden');
  const listTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { note, loading, updateContent, updateColors } =
    useNote(currentNoteId);
  useWindowControls(currentNoteId);

  // Gate theme transition behind data-ready to prevent flash on initial load
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const id = requestAnimationFrame(() => setReady(true));
    return () => cancelAnimationFrame(id);
  }, []);

  // Apply stored default theme for new notes with Rust defaults
  const appliedDefaultRef = useRef<Set<string>>(new Set());
  useEffect(() => {
    if (!note || loading) return;
    if (appliedDefaultRef.current.has(note.id)) return;
    appliedDefaultRef.current.add(note.id);

    const isRustDefault =
      note.bg_color === RUST_DEFAULT_BG && note.fg_color === RUST_DEFAULT_FG;
    const isEmpty = !note.content || note.content === "<p></p>" || note.content.trim() === "";

    if (isRustDefault && isEmpty) {
      const pref = getDefaultTheme();
      if (pref && (pref.bg !== RUST_DEFAULT_BG || pref.fg !== RUST_DEFAULT_FG)) {
        updateColors(pref.bg, pref.fg);
      }
    }
  }, [note, loading, updateColors]);

  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    closing?: boolean;
  } | null>(null);
  const ctxTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleContextMenu = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      setContextMenu({ x: e.clientX, y: e.clientY });
    },
    []
  );

  const handleDeleteNote = useCallback(async (id: string) => {
    await deleteNote(id);
    if (currentNoteIdRef.current === id) {
      const remaining = await listNotes();
      if (remaining.length > 0) {
        setCurrentNoteId(remaining[0].id);
      } else {
        const fresh = await createNote();
        setCurrentNoteId(fresh.id);
      }
    }
  }, []);

  const [confirmDelete, setConfirmDelete] = useState(false);

  const requestDelete = useCallback(() => {
    setConfirmDelete(true);
  }, []);

  useEffect(() => {
    if (!confirmDelete) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "y" || e.key === "Y") {
        e.preventDefault();
        e.stopImmediatePropagation();
        setConfirmDelete(false);
        handleDeleteNote(currentNoteId).catch(console.error);
      } else if (e.key === "n" || e.key === "N" || e.key === "Escape") {
        e.preventDefault();
        e.stopImmediatePropagation();
        setConfirmDelete(false);
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [confirmDelete, currentNoteId, handleDeleteNote]);

  const toggleList = useCallback(() => {
    if (listState === 'visible') {
      setListState('closing');
      if (listTimer.current) clearTimeout(listTimer.current);
      listTimer.current = setTimeout(() => setListState('hidden'), 120);
    } else if (listState === 'hidden') {
      setListState('visible');
    } else if (listState === 'closing') {
      if (listTimer.current) clearTimeout(listTimer.current);
      setListState('visible');
    }
  }, [listState]);

  const closeContextMenu = useCallback(() => {
    if (!contextMenu || contextMenu.closing) return;
    setContextMenu({ ...contextMenu, closing: true });
    if (ctxTimer.current) clearTimeout(ctxTimer.current);
    ctxTimer.current = setTimeout(() => setContextMenu(null), 80);
  }, [contextMenu]);

  const handleOpenNote = useCallback((id: string) => {
    setCurrentNoteId(id);
  }, []);

  const handleCreateNote = useCallback(async () => {
    await createNote();
    if (listState === 'visible') {
      setListState('closing');
      if (listTimer.current) clearTimeout(listTimer.current);
      listTimer.current = setTimeout(() => setListState('hidden'), 120);
    }
  }, [listState]);

  // Refocus editor when sidebar closes so arrow keys scroll again
  useEffect(() => {
    if (listState === 'hidden') {
      const tiptap = document.querySelector('.tiptap') as HTMLElement | null;
      tiptap?.focus();
    }
  }, [listState]);

  // Cmd+[ toggle list
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.metaKey && e.key === "[") {
        e.preventDefault();
        toggleList();
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [toggleList]);

  const handleResize = useCallback(
    (e: React.MouseEvent, direction: string) => {
      e.preventDefault();
      const window = getCurrentWebviewWindow();
      const dirMap: Record<string, string> = {
        n: "North",
        s: "South",
        e: "East",
        w: "West",
        ne: "NorthEast",
        nw: "NorthWest",
        se: "SouthEast",
        sw: "SouthWest",
      };
      const dir = dirMap[direction];
      if (dir) {
        window.startResizeDragging(dir as any);
      }
    },
    []
  );

  const displayNote = note;
  const fg = displayNote?.fg_color ?? "#a0a0a0";
  const bg = displayNote?.bg_color ?? "#1e1e1e";
  const bgWithAlpha = withAlpha(bg, 0.95);
  const overlayBg = deriveOverlayBg(bg);
  const light = isLightColor(bg);

  // Sync document background with note theme to eliminate white flash on resize
  useEffect(() => {
    document.documentElement.style.backgroundColor = bg;
    document.body.style.backgroundColor = bg;
  }, [bg]);

  return (
    <div
      className="note-window"
      data-ready={ready ? "" : undefined}
      style={{
        backgroundColor: bgWithAlpha,
        color: fg,
        '--note-bg': bg,
        '--note-fg': fg,
        '--overlay-bg': overlayBg,
        '--note-fg-05': withAlpha(fg, 0.05),
        '--note-fg-06': withAlpha(fg, 0.06),
        '--note-fg-08': withAlpha(fg, 0.08),
        '--note-fg-10': withAlpha(fg, 0.10),
        '--note-fg-12': withAlpha(fg, 0.12),
        '--note-fg-15': withAlpha(fg, 0.15),
        '--note-fg-20': withAlpha(fg, 0.20),
        '--note-fg-25': withAlpha(fg, 0.25),
        '--note-fg-30': withAlpha(fg, 0.30),
        '--note-fg-40': withAlpha(fg, 0.40),
        '--note-fg-50': withAlpha(fg, 0.50),
        '--note-fg-60': withAlpha(fg, 0.60),
        '--note-fg-70': withAlpha(fg, 0.70),
        '--note-fg-80': withAlpha(fg, 0.80),
        '--note-bg-80': light ? 'rgba(0,0,0,0.15)' : 'rgba(0,0,0,0.35)',
      } as React.CSSProperties}
      onContextMenu={handleContextMenu}
    >
      {/* Resize handles */}
      <div className="resize-n" onMouseDown={(e) => handleResize(e, "n")} />
      <div className="resize-s" onMouseDown={(e) => handleResize(e, "s")} />
      <div className="resize-e" onMouseDown={(e) => handleResize(e, "e")} />
      <div className="resize-w" onMouseDown={(e) => handleResize(e, "w")} />
      <div className="resize-ne" onMouseDown={(e) => handleResize(e, "ne")} />
      <div className="resize-nw" onMouseDown={(e) => handleResize(e, "nw")} />
      <div className="resize-se" onMouseDown={(e) => handleResize(e, "se")} />
      <div className="resize-sw" onMouseDown={(e) => handleResize(e, "sw")} />

      <NoteToolbar
        bgColor={bg}
        fgColor={fg}
        showList={listState !== 'hidden'}
        onToggleList={toggleList}
        onCreateNote={handleCreateNote}
        onColorChange={updateColors}
      />

      {confirmDelete && (
        <div className="confirm-bar">
          delete note? <span className="confirm-key">y</span>/<span className="confirm-key">n</span>
        </div>
      )}

      <div className="note-body">
        {listState !== 'hidden' && (
          <NotesList
            currentNoteId={currentNoteId}
            fgColor={fg}
            onOpenNote={handleOpenNote}
            onDeleteNote={handleDeleteNote}
            closing={listState === 'closing'}
          />
        )}
        {loading || !note || note.id !== currentNoteId ? (
          <div className="note-editor" style={{ color: fg }}>
            <div className="note-loading">
              <span>{loading ? "..." : "_ not found"}</span>
            </div>
          </div>
        ) : (
          <NoteEditor
            key={currentNoteId}
            content={note.content}
            fgColor={note.fg_color}
            onChange={updateContent}
            onDelete={requestDelete}
          />
        )}
      </div>

      {contextMenu && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          onDelete={requestDelete}
          onClose={closeContextMenu}
          closing={contextMenu.closing}
        />
      )}
    </div>
  );
}
