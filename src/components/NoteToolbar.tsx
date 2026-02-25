import { useEffect, useState, useRef, useCallback } from "react";
import { getCurrentWebviewWindow } from "@tauri-apps/api/webviewWindow";
import { ThemePicker } from "./ThemePicker";
import { IconList, IconListCollapse, IconPlus, IconTheme, IconClose } from "./ToolbarIcons";

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

  // Responsive: switch to icons when toolbar is narrow
  const toolbarRef = useRef<HTMLDivElement>(null);
  const [compact, setCompact] = useState(false);

  useEffect(() => {
    const el = toolbarRef.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setCompact(entry.contentRect.width < 240);
      }
    });
    ro.observe(el);
    return () => ro.disconnect();
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
        className={`note-toolbar ${compact ? "note-toolbar-compact" : ""}`}
        data-tauri-drag-region
        ref={toolbarRef}
      >
        <div className="toolbar-left" data-tauri-drag-region>
          <ToolbarBtn
            label={showList ? "[-]" : "[=]"}
            icon={showList
              ? <IconListCollapse color={fgColor} />
              : <IconList color={fgColor} />
            }
            compact={compact}
            tooltip="notes  ⌘["
            active={showList}
            fgColor={fgColor}
            onClick={onToggleList}
          />
        </div>
        <div className="toolbar-right">
          <ToolbarBtn
            label="[+]"
            icon={<IconPlus color={fgColor} />}
            compact={compact}
            tooltip="new note  ⌘N"
            fgColor={fgColor}
            className="toolbar-btn-util"
            onClick={onCreateNote}
          />
          <ToolbarBtn
            label="[t]"
            icon={<IconTheme color={fgColor} />}
            compact={compact}
            tooltip="theme  ⌘T"
            fgColor={fgColor}
            className="toolbar-btn-util"
            onClick={toggleThemes}
          />
          <ToolbarBtn
            label="[x]"
            icon={<IconClose color={fgColor} />}
            compact={compact}
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
  icon,
  compact,
  tooltip,
  fgColor,
  onClick,
  active,
  className,
}: {
  label: string;
  icon?: React.ReactNode;
  compact?: boolean;
  tooltip: string;
  fgColor: string;
  onClick: () => void;
  active?: boolean;
  className?: string;
}) {
  const [showTip, setShowTip] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const wrapRef = useRef<HTMLSpanElement>(null);
  const tipRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    return () => { if (timer.current) clearTimeout(timer.current); };
  }, []);

  // Reposition tooltip to stay within viewport
  useEffect(() => {
    if (!showTip) return;
    const tip = tipRef.current;
    const wrap = wrapRef.current;
    if (!tip || !wrap) return;
    const wrapRect = wrap.getBoundingClientRect();
    const tipWidth = tip.offsetWidth;
    // Default: centered under the button
    let left = (wrapRect.width - tipWidth) / 2;
    const absLeft = wrapRect.left + left;
    const absRight = absLeft + tipWidth;
    const pad = 6;
    if (absLeft < pad) {
      left = pad - wrapRect.left;
    } else if (absRight > window.innerWidth - pad) {
      left = window.innerWidth - pad - tipWidth - wrapRect.left;
    }
    tip.style.left = `${left}px`;
    tip.style.transform = 'none';
    tip.style.visibility = 'visible';
  }, [showTip]);

  const handleEnter = () => {
    timer.current = setTimeout(() => setShowTip(true), 400);
  };
  const handleLeave = () => {
    if (timer.current) clearTimeout(timer.current);
    setShowTip(false);
  };

  return (
    <span
      className="toolbar-btn-wrap"
      ref={wrapRef}
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
    >
      <button
        className={`toolbar-btn ${active ? "toolbar-btn-active" : ""} ${className || ""}`}
        onClick={onClick}
        style={{ color: fgColor }}
        aria-label={tooltip}
        type="button"
      >
        {compact && icon ? icon : label}
      </button>
      {showTip && (
        <span className="toolbar-tooltip" ref={tipRef}>
          {tooltip}
        </span>
      )}
    </span>
  );
}
