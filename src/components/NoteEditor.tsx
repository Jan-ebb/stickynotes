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

  useEffect(() => {
    const onTransaction = () => rerender((n) => n + 1);
    editor.on("transaction", onTransaction);
    return () => { editor.off("transaction", onTransaction); };
  }, [editor]);

  return (
    <div className="format-bar">
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

  useEffect(() => {
    return () => {
      if (timer.current) {
        clearTimeout(timer.current);
      }
    };
  }, []);

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
        title={`${tooltip} (${shortcut})`}
      >
        {label}
      </button>
      {show && (
        <span className="fmt-tooltip">
          {tooltip} <span className="fmt-tooltip-key">{shortcut}</span>
        </span>
      )}
    </span>
  );
}
