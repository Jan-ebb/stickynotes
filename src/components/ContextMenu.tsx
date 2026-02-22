import { useEffect, useRef, useState } from "react";

interface Props {
  x: number;
  y: number;
  onDelete: () => void;
  onClose: () => void;
  closing?: boolean;
}

export function ContextMenu({
  x,
  y,
  onDelete,
  onClose,
  closing,
}: Props) {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const [pos, setPos] = useState({ x, y });

  // Clamp position to viewport after measuring menu dimensions
  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const clampedX = Math.max(4, Math.min(x, window.innerWidth - rect.width - 4));
    const clampedY = Math.max(4, Math.min(y, window.innerHeight - rect.height - 4));
    if (clampedX !== pos.x || clampedY !== pos.y) {
      setPos({ x: clampedX, y: clampedY });
    }
  }, [x, y]);

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

  return (
    <div
      className={`context-menu${closing ? ' closing' : ''}`}
      style={{ left: pos.x, top: pos.y }}
      ref={rootRef}
      role="menu"
      aria-label="Note options"
    >
      <button
        className="context-menu-item delete"
        onClick={() => {
          onClose();
          onDelete();
        }}
        type="button"
      >
        Delete Note
      </button>
    </div>
  );
}
