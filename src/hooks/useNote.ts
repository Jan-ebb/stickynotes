import { useState, useEffect, useRef, useCallback } from "react";
import { Note } from "../types";
import { getNote, updateNote } from "../lib/commands";

export function useNote(noteId: string | null) {
  const [note, setNote] = useState<Note | null>(null);
  const [loading, setLoading] = useState(true);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const noteRef = useRef<Note | null>(null);
  const noteIdRef = useRef(noteId);
  const pendingRef = useRef<Note | null>(null);

  // Keep refs in sync with state/props
  noteRef.current = note;
  noteIdRef.current = noteId;

  const flushSave = useCallback(() => {
    if (saveTimer.current) {
      clearTimeout(saveTimer.current);
      saveTimer.current = null;
    }
    if (pendingRef.current) {
      updateNote(pendingRef.current).catch((e) =>
        console.error("Failed to save note:", e)
      );
      pendingRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (!noteId) {
      setNote(null);
      setLoading(false);
      return;
    }

    // Flush any pending save from previous note before loading new one
    flushSave();

    let cancelled = false;
    setNote(null);
    setLoading(true);

    getNote(noteId)
      .then((n) => {
        if (!cancelled) {
          setNote(n);
        }
      })
      .catch((e) => console.error("Failed to load note:", e))
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [noteId, flushSave]);

  // Flush on unmount
  useEffect(() => {
    return () => {
      flushSave();
    };
  }, [flushSave]);

  const saveNote = useCallback(
    (updated: Note) => {
      setNote(updated);
      pendingRef.current = updated;
      if (saveTimer.current) clearTimeout(saveTimer.current);
      saveTimer.current = setTimeout(() => {
        if (pendingRef.current) {
          updateNote(pendingRef.current).catch((e) =>
            console.error("Failed to save note:", e)
          );
          pendingRef.current = null;
        }
      }, 300);
    },
    []
  );

  const updateContent = useCallback(
    (content: string) => {
      const current = noteRef.current;
      if (!current || current.id !== noteIdRef.current) return;
      const updated = {
        ...current,
        content,
        updated_at: new Date().toISOString(),
      };
      saveNote(updated);
    },
    [saveNote]
  );

  const updateColors = useCallback(
    (bg_color: string, fg_color: string) => {
      const current = noteRef.current;
      if (!current || current.id !== noteIdRef.current) return;
      const updated = {
        ...current,
        bg_color,
        fg_color,
        updated_at: new Date().toISOString(),
      };
      saveNote(updated);
    },
    [saveNote]
  );

  return { note, loading, updateContent, updateColors, setNote: saveNote };
}
