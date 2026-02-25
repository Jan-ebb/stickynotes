import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Image from "@tiptap/extension-image";
import { useEffect, useRef, useState, useCallback } from "react";
import { saveImage } from "../lib/commands";

interface Props {
  content: string;
  fgColor: string;
  onChange: (content: string) => void;
  onDelete: () => void;
}

async function fileToMediaUrl(file: File): Promise<string | null> {
  const validTypes = ["image/png", "image/jpeg", "image/jpg", "image/gif", "image/webp", "image/svg+xml"];
  if (!validTypes.includes(file.type)) return null;

  const buffer = await file.arrayBuffer();
  const base64 = btoa(
    new Uint8Array(buffer).reduce((s, b) => s + String.fromCharCode(b), "")
  );
  const filename = await saveImage(base64, file.type);
  return `http://media.localhost/${filename}`;
}

export function NoteEditor({ content, fgColor, onChange, onDelete }: Props) {
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  const initialContent = useRef(content);

  const handlePaste = useCallback((_view: unknown, event: ClipboardEvent) => {
    const items = event.clipboardData?.items;
    if (!items) return false;

    for (const item of items) {
      if (item.type.startsWith("image/")) {
        event.preventDefault();
        const file = item.getAsFile();
        if (!file) return true;
        fileToMediaUrl(file).then((url) => {
          if (url && editorRef.current) {
            editorRef.current.chain().focus().setImage({ src: url }).run();
          }
        });
        return true;
      }
    }
    return false;
  }, []);

  const handleDrop = useCallback((_view: unknown, event: DragEvent) => {
    const files = event.dataTransfer?.files;
    if (!files?.length) return false;

    for (const file of files) {
      if (file.type.startsWith("image/")) {
        event.preventDefault();
        fileToMediaUrl(file).then((url) => {
          if (url && editorRef.current) {
            editorRef.current.chain().focus().setImage({ src: url }).run();
          }
        });
        return true;
      }
    }
    return false;
  }, []);

  const editorRef = useRef<ReturnType<typeof useEditor>>(null);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
      }),
      Underline,
      Image.configure({
        inline: false,
        allowBase64: false,
      }),

    ],
    content: initialContent.current,
    onUpdate: ({ editor }) => {
      onChangeRef.current(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: "note-editor-content",
        spellcheck: "false",
      },
      handlePaste,
      handleDrop,
    },
  });

  editorRef.current = editor;

  if (!editor) return null;

  return (
    <div className="note-editor" style={{ color: fgColor }}>
      <FormatBar editor={editor} fgColor={fgColor} onDelete={onDelete} />
      <EditorContent editor={editor} />
    </div>
  );
}

type FormatBarMode = "normal" | "del-hidden" | "collapsed";

function FormatBar({
  editor,
  fgColor,
  onDelete,
}: {
  editor: ReturnType<typeof useEditor> & {};
  fgColor: string;
  onDelete: () => void;
}) {
  const [, rerender] = useState(0);
  const [mode, setMode] = useState<FormatBarMode>("normal");
  const [menuOpen, setMenuOpen] = useState(false);
  const barRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onTransaction = () => rerender((n) => n + 1);
    editor.on("transaction", onTransaction);
    return () => { editor.off("transaction", onTransaction); };
  }, [editor]);

  // Overflow detection via ResizeObserver
  useEffect(() => {
    const bar = barRef.current;
    const inner = innerRef.current;
    if (!bar || !inner) return;

    const check = () => {
      // Reset to normal to measure full content width
      const barWidth = bar.clientWidth;
      const innerWidth = inner.scrollWidth;
      // del button is ~36px; hide it first before full collapse
      const delBtnWidth = 36;

      if (innerWidth <= barWidth) {
        setMode("normal");
      } else if (innerWidth - delBtnWidth <= barWidth) {
        setMode("del-hidden");
      } else {
        setMode("collapsed");
      }
    };

    const ro = new ResizeObserver(check);
    ro.observe(bar);
    // Also check after a frame to catch initial render
    const raf = requestAnimationFrame(check);
    return () => {
      ro.disconnect();
      cancelAnimationFrame(raf);
    };
  }, []);

  // Close menu on outside click or Escape
  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        setMenuOpen(false);
      }
    };
    const onClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onClick);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onClick);
    };
  }, [menuOpen]);

  const formatButtons = (
    <>
      <FmtBtn label="B" tooltip="bold" shortcut="Cmd+B" active={editor.isActive("bold")} fgColor={fgColor} onAction={() => editor.chain().focus().toggleBold().run()} />
      <FmtBtn label="I" tooltip="italic" shortcut="Cmd+I" active={editor.isActive("italic")} fgColor={fgColor} onAction={() => editor.chain().focus().toggleItalic().run()} />
      <FmtBtn label="U" tooltip="underline" shortcut="Cmd+U" active={editor.isActive("underline")} fgColor={fgColor} onAction={() => editor.chain().focus().toggleUnderline().run()} />
      <FmtBtn label="S" tooltip="strikethrough" shortcut="Cmd+Shift+X" active={editor.isActive("strike")} fgColor={fgColor} onAction={() => editor.chain().focus().toggleStrike().run()} />
      <span className="fmt-sep">|</span>
      <FmtBtn label="H1" tooltip="heading 1" shortcut="Cmd+Alt+1" active={editor.isActive("heading", { level: 1 })} fgColor={fgColor} onAction={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} />
      <FmtBtn label="H2" tooltip="heading 2" shortcut="Cmd+Alt+2" active={editor.isActive("heading", { level: 2 })} fgColor={fgColor} onAction={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} />
      <span className="fmt-sep">|</span>
      <FmtBtn label="*" tooltip="bullet list" shortcut="Cmd+Shift+8" active={editor.isActive("bulletList")} fgColor={fgColor} onAction={() => editor.chain().focus().toggleBulletList().run()} />
      <FmtBtn label="1." tooltip="numbered list" shortcut="Cmd+Shift+7" active={editor.isActive("orderedList")} fgColor={fgColor} onAction={() => editor.chain().focus().toggleOrderedList().run()} />
      <span className="fmt-sep">|</span>
      <FmtBtn label=">" tooltip="blockquote" shortcut="Cmd+Shift+B" active={editor.isActive("blockquote")} fgColor={fgColor} onAction={() => editor.chain().focus().toggleBlockquote().run()} />
      <FmtBtn label="<>" tooltip="inline code" shortcut="Cmd+E" active={editor.isActive("code")} fgColor={fgColor} onAction={() => editor.chain().focus().toggleCode().run()} />
    </>
  );

  const deleteButton = (
    <button
      className="fmt-btn fmt-delete-btn"
      onClick={onDelete}
      style={{ color: fgColor }}
      type="button"
      aria-label="Delete note"
      title="Delete note"
    >
      del
    </button>
  );

  return (
    <div className="format-bar" ref={barRef}>
      {/* Always-present hidden measurer for overflow detection */}
      <div className="format-bar-measurer" ref={innerRef} aria-hidden="true">
        {formatButtons}
        {deleteButton}
      </div>

      {mode === "collapsed" ? (
        <div className="format-bar-overflow-wrap" ref={menuRef}>
          <button
            className="fmt-btn fmt-overflow-btn"
            style={{ color: fgColor }}
            type="button"
            aria-label="Formatting options"
            title="Formatting options"
            onClick={() => setMenuOpen((v) => !v)}
          >
            ...
          </button>
          {menuOpen && (
            <div className="fmt-overflow-menu">
              {formatButtons}
              <span className="fmt-sep">|</span>
              {deleteButton}
            </div>
          )}
        </div>
      ) : (
        <div className="format-bar-visible">
          {formatButtons}
          {mode === "normal" && deleteButton}
        </div>
      )}
    </div>
  );
}

function FmtBtn({
  label,
  tooltip,
  shortcut,
  active,
  fgColor,
  onAction,
}: {
  label: string;
  tooltip: string;
  shortcut: string;
  active: boolean;
  fgColor: string;
  onAction: () => void;
}) {
  const [show, setShow] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const wrapRef = useRef<HTMLSpanElement>(null);
  const tipRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  // Reposition tooltip to stay within viewport
  useEffect(() => {
    if (!show) return;
    const tip = tipRef.current;
    const wrap = wrapRef.current;
    if (!tip || !wrap) return;
    const wrapRect = wrap.getBoundingClientRect();
    const tipWidth = tip.offsetWidth;
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
  }, [show]);

  const handleEnter = () => {
    timer.current = setTimeout(() => setShow(true), 300);
  };
  const handleLeave = () => {
    if (timer.current) clearTimeout(timer.current);
    setShow(false);
  };

  return (
    <span
      className="fmt-btn-wrap"
      ref={wrapRef}
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
    >
      <button
        className={`fmt-btn ${active ? "fmt-active" : ""}`}
        onMouseDown={(e) => {
          e.preventDefault();
          onAction();
        }}
        style={{ color: fgColor }}
        type="button"
        aria-label={tooltip}
      >
        {label}
      </button>
      {show && (
        <span className="fmt-tooltip" ref={tipRef}>
          {tooltip} <span className="fmt-tooltip-key">{shortcut}</span>
        </span>
      )}
    </span>
  );
}
