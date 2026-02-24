import { useEffect, useRef, useState, useCallback } from "react";
import { NOTE_THEMES } from "../lib/constants";
import { normalizeHexColor } from "../lib/colors";
import { setDefaultTheme, getDefaultTheme } from "../lib/preferences";

interface Props {
  currentBg: string;
  currentFg: string;
  onSelect: (bg: string, fg: string) => void;
  onClose: () => void;
  closing?: boolean;
}

export function ThemePicker({ currentBg, currentFg, onSelect, onClose, closing }: Props) {
  const [customBg, setCustomBg] = useState(currentBg);
  const [customFg, setCustomFg] = useState(currentFg);
  const [defaultSaved, setDefaultSaved] = useState(false);
  const savedTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const rootRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setCustomBg(currentBg);
    setCustomFg(currentFg);
  }, [currentBg, currentFg]);

  useEffect(() => {
    const onMouseDown = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) {
        onClose();
      }
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    document.addEventListener("mousedown", onMouseDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onMouseDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [onClose]);

  const handleSetDefault = useCallback(() => {
    setDefaultTheme(currentBg, currentFg);
    setDefaultSaved(true);
    if (savedTimer.current) clearTimeout(savedTimer.current);
    savedTimer.current = setTimeout(() => setDefaultSaved(false), 1500);
  }, [currentBg, currentFg]);

  useEffect(() => {
    return () => {
      if (savedTimer.current) clearTimeout(savedTimer.current);
    };
  }, []);

  const storedDefault = getDefaultTheme();
  const isCurrentDefault = storedDefault?.bg === currentBg && storedDefault?.fg === currentFg;

  // Apply custom colors live as the user types valid hex values
  useEffect(() => {
    const bg = normalizeHexColor(customBg);
    const fg = normalizeHexColor(customFg);
    if (bg && fg && (bg !== currentBg || fg !== currentFg)) {
      onSelect(bg, fg);
    }
  }, [customBg, customFg]);

  return (
    <div
      className={`theme-picker${closing ? ' closing' : ''}`}
      ref={rootRef}
      onClick={(e) => e.stopPropagation()}
      role="dialog"
      aria-label="Theme picker"
    >
      <div className="theme-picker-header">
        <span>Theme</span>
        <button
          className="theme-picker-close"
          onClick={onClose}
          aria-label="Close theme picker"
          type="button"
        >
          x
        </button>
      </div>
      <div className="theme-presets">
        {NOTE_THEMES.map((theme) => (
          <button
            key={theme.name}
            className={`theme-preset ${
              currentBg === theme.bg && currentFg === theme.fg ? "active" : ""
            }`}
            onClick={() => onSelect(theme.bg, theme.fg)}
            title={theme.name}
            type="button"
          >
            <span
              className="theme-swatch"
              style={{ background: theme.bg, color: theme.fg }}
            >
              A
            </span>
            <span className="theme-name">{theme.name}</span>
          </button>
        ))}
      </div>
      <div className="theme-custom">
        <label>
          bg
          <input
            type="text"
            value={customBg}
            onChange={(e) => setCustomBg(e.target.value)}
            placeholder="#0a0e14"
            maxLength={7}
            aria-label="Background color"
          />
        </label>
        <label>
          fg
          <input
            type="text"
            value={customFg}
            onChange={(e) => setCustomFg(e.target.value)}
            placeholder="#00ff88"
            maxLength={7}
            aria-label="Foreground color"
          />
        </label>
      </div>
      <div className="theme-default-action">
        <button
          className="theme-set-default"
          onClick={handleSetDefault}
          disabled={isCurrentDefault && !defaultSaved}
          type="button"
        >
          {defaultSaved ? "✓ saved" : isCurrentDefault ? "is default" : "set as default"}
        </button>
      </div>
    </div>
  );
}
