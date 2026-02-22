import { useEffect, useRef } from "react";
import { getCurrentWebviewWindow } from "@tauri-apps/api/webviewWindow";
import { updateNotePosition } from "../lib/commands";

export function useWindowControls(noteId: string | null) {
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!noteId) return;

    const window = getCurrentWebviewWindow();
    const unlisten: (() => void)[] = [];
    let cancelled = false;

    const persistPosition = async () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
      saveTimer.current = setTimeout(async () => {
        try {
          const pos = await window.outerPosition();
          const size = await window.outerSize();
          await updateNotePosition(
            noteId,
            pos.x,
            pos.y,
            size.width,
            size.height
          );
        } catch (e) {
          console.error("Failed to save position:", e);
        }
      }, 500);
    };

    window.onMoved(persistPosition).then((fn) => {
      if (cancelled) {
        fn();
      } else {
        unlisten.push(fn);
      }
    });
    window.onResized(persistPosition).then((fn) => {
      if (cancelled) {
        fn();
      } else {
        unlisten.push(fn);
      }
    });

    return () => {
      cancelled = true;
      unlisten.forEach((fn) => fn());
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
  }, [noteId]);
}
