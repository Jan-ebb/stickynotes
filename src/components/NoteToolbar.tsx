import { useEffect, useState, useRef, useCallback } from "react";
import { getCurrentWebviewWindow } from "@tauri-apps/api/webviewWindow";
import { ThemePicker } from "./ThemePicker";

type ThemeState = 'hidden' | 'visible' | 'closing';

interface Props {
  bgColor: string;
  fgColor: string;
  showList: boolean;
  onToggleList: () => void;
  onCreateNote: () => void;
  onColorChange: (bg: string, fg: string) => void;
}

export function NoteToolbar({
  bgColor,
  fgColor,
  showList,
  onToggleList,
  onCreateNote,
  onColorChange,
}: Props) {
  const [themeState, setThemeState] = useState<ThemeState>('hidden');
  const themeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const themeStateRef = useRef(themeState);
  themeStateRef.current = themeState;

  const onCreateNoteRef = useRef(onCreateNote);
  onCreateNoteRef.current = onCreateNote;

  const closeThemes = useCallback(() => {
    if (themeStateRef.current !== 'visible') return;
    setThemeState('closing');
    if (themeTimer.current) clearTimeout(themeTimer.current);
    themeTimer.current = setTimeout(() => setThemeState('hidden'), 100);
  }, []);

  const toggleThemes = useCallback(() => {
    if (themeStateRef.current === 'hidden') {
      setThemeState('visible');
    } else if (themeStateRef.current === 'visible') {
      setThemeState('closing');
      if (themeTimer.current) clearTimeout(themeTimer.current);
      themeTimer.current = setTimeout(() => setThemeState('hidden'), 100);
    } else if (themeStateRef.current === 'closing') {
      if (themeTimer.current) clearTimeout(themeTimer.current);
      setThemeState('visible');
    }
  }, []);

  const handleClose = useCallback(() => {
    getCurrentWebviewWindow().close().catch((e) => {
      console.error("Failed to close note window:", e);
    });
  }, []);

  // Keyboard shortcuts: Cmd+N = new, Cmd+T = theme, Cmd+W = close
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.metaKey && e.key === "n") {
        e.preventDefault();
        onCreateNoteRef.current();
      } else if (e.metaKey && e.key === "t") {
        e.preventDefault();
        toggleThemes();
      } else if (e.metaKey && e.key === "w") {
        e.preventDefault();
        handleClose();
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [toggleThemes, handleClose]);

  return (
    <>
      <div
        className="note-toolbar"
        data-tauri-drag-region
      >
        <div className="toolbar-left" data-tauri-drag-region>
          <ToolbarBtn
            label={showList ? "[-]" : "[=]"}
            tooltip="notes  ⌘["
            active={showList}
            fgColor={fgColor}
            onClick={onToggleList}
          />
        </div>
        <div className="toolbar-right">
          <ToolbarBtn
            label="[+]"
            tooltip="new note  ⌘N"
            fgColor={fgColor}
            className="toolbar-btn-util"
            onClick={onCreateNote}
          />
          <ToolbarBtn
            label="[t]"
            tooltip="theme  ⌘T"
            fgColor={fgColor}
            className="toolbar-btn-util"
            onClick={toggleThemes}
          />
          <ToolbarBtn
            label="[x]"
            tooltip="hide  ⌘W"
            fgColor={fgColor}
            className="toolbar-btn-close"
            onClick={handleClose}
          />
        </div>
      </div>
      {themeState !== 'hidden' && (
        <ThemePicker
          currentBg={bgColor}
          currentFg={fgColor}
          onSelect={(bg, fg) => {
            onColorChange(bg, fg);
            setThemeState('hidden');
            if (themeTimer.current) clearTimeout(themeTimer.current);
          }}
          onClose={closeThemes}
          closing={themeState === 'closing'}
        />
      )}
    </>
  );
}

function ToolbarBtn({
  label,
  tooltip,
  fgColor,
  onClick,
  active,
  className,
}: {
  label: string;
  tooltip: string;
  fgColor: string;
  onClick: () => void;
  active?: boolean;
  className?: string;
}) {
  return (
    <button
      className={`toolbar-btn ${active ? "toolbar-btn-active" : ""} ${className || ""}`}
      onClick={onClick}
      style={{ color: fgColor }}
      aria-label={tooltip}
      title={tooltip}
      type="button"
    >
      {label}
    </button>
  );
}
