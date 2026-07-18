"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import {
  Bold,
  Italic,
  Underline,
  Heading1,
  Heading2,
  List,
  ListOrdered,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Quote,
  Minus,
  Undo,
  Redo,
  Link as LinkIcon,
  Code,
} from "lucide-react";
import { cn } from "@/lib/utils";

/* ─── Types ─────────────────────────────────────────────────────────────── */
type FormatState = {
  bold: boolean;
  italic: boolean;
  underline: boolean;
  h1: boolean;
  h2: boolean;
  unorderedList: boolean;
  orderedList: boolean;
  blockquote: boolean;
  code: boolean;
  alignLeft: boolean;
  alignCenter: boolean;
  alignRight: boolean;
};

/* ─── Helpers ────────────────────────────────────────────────────────────── */
function queryFormat(): FormatState {
  return {
    bold: document.queryCommandState("bold"),
    italic: document.queryCommandState("italic"),
    underline: document.queryCommandState("underline"),
    h1: isBlockTag("H1"),
    h2: isBlockTag("H2"),
    unorderedList: document.queryCommandState("insertUnorderedList"),
    orderedList: document.queryCommandState("insertOrderedList"),
    blockquote: isBlockTag("BLOCKQUOTE"),
    code: isBlockTag("PRE"),
    alignLeft:
      document.queryCommandState("justifyLeft") ||
      (!document.queryCommandState("justifyCenter") &&
        !document.queryCommandState("justifyRight") &&
        !document.queryCommandState("justifyFull")),
    alignCenter: document.queryCommandState("justifyCenter"),
    alignRight: document.queryCommandState("justifyRight"),
  };
}

function isBlockTag(tag: string): boolean {
  const sel = window.getSelection();
  if (!sel || sel.rangeCount === 0) return false;
  let node: Node | null = sel.anchorNode;
  while (node && node.nodeName !== "BODY") {
    if (node.nodeName === tag) return true;
    node = node.parentNode;
  }
  return false;
}

function execCmd(cmd: string, value?: string) {
  document.execCommand(cmd, false, value);
}

function toggleBlock(tag: string, editor: HTMLElement) {
  const sel = window.getSelection();
  if (!sel || sel.rangeCount === 0) return;

  let node: Node | null = sel.anchorNode;
  let found: Element | null = null;
  while (node && node !== editor) {
    if (
      node.nodeType === 1 &&
      (node as Element).tagName === tag.toUpperCase()
    ) {
      found = node as Element;
      break;
    }
    node = node.parentNode;
  }

  if (found) {
    // Unwrap: replace block element with a <p>
    const p = document.createElement("p");
    p.innerHTML = found.innerHTML;
    found.parentNode?.replaceChild(p, found);
    const range = document.createRange();
    range.selectNodeContents(p);
    range.collapse(false);
    sel.removeAllRanges();
    sel.addRange(range);
  } else {
    // Wrap current block in tag
    const range = sel.getRangeAt(0);
    const block = document.createElement(tag);

    let ancestor: Node | null = range.commonAncestorContainer;
    while (
      ancestor &&
      ancestor !== editor &&
      !(
        ancestor.nodeType === 1 &&
        (ancestor as Element).matches("p,div,h1,h2,h3,blockquote,pre")
      )
    ) {
      ancestor = ancestor.parentNode;
    }

    if (
      ancestor &&
      ancestor !== editor &&
      (ancestor as Element).matches("p,div,h1,h2,h3,blockquote,pre")
    ) {
      block.innerHTML = (ancestor as Element).innerHTML;
      (ancestor as Element).parentNode?.replaceChild(block, ancestor);
    } else {
      block.appendChild(range.extractContents());
      range.insertNode(block);
    }

    const newRange = document.createRange();
    newRange.selectNodeContents(block);
    newRange.collapse(false);
    sel.removeAllRanges();
    sel.addRange(newRange);
  }
}

/* ─── Toolbar Button ─────────────────────────────────────────────────────── */
function ToolbarBtn({
  active,
  onClick,
  title,
  children,
}: {
  active?: boolean;
  onClick: () => void;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      title={title}
      onMouseDown={(e) => {
        e.preventDefault(); // Prevent editor blur
        onClick();
      }}
      className={cn(
        "w-7 h-7 rounded-lg flex items-center justify-center transition-all text-muted-foreground",
        active
          ? "bg-primary/20 text-primary/90"
          : "hover:bg-muted hover:text-foreground/90",
      )}
    >
      {children}
    </button>
  );
}

function Divider() {
  return <div className="w-px h-4 bg-gray-200 mx-0.5 flex-shrink-0" />;
}

/* ─── Main Component ─────────────────────────────────────────────────────── */
export function DescriptionEditor({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [fmt, setFmt] = useState<FormatState>({
    bold: false,
    italic: false,
    underline: false,
    h1: false,
    h2: false,
    unorderedList: false,
    orderedList: false,
    blockquote: false,
    code: false,
    alignLeft: true,
    alignCenter: false,
    alignRight: false,
  });
  const [charCount, setCharCount] = useState(0);
  const isInitialized = useRef(false);

  // Initialize editor content from value prop (once)
  useEffect(() => {
    if (editorRef.current && !isInitialized.current) {
      isInitialized.current = true;
      if (value) {
        editorRef.current.innerHTML = value.startsWith("<")
          ? value
          : `<p>${value}</p>`;
        setCharCount(editorRef.current.innerText.replace(/\n/g, "").length);
      }
    }
  }, []);

  const updateFormat = useCallback(() => {
    setFmt(queryFormat());
  }, []);

  const handleInput = useCallback(() => {
    if (!editorRef.current) return;
    const html = editorRef.current.innerHTML;
    const text = editorRef.current.innerText;
    setCharCount(text.replace(/\n/g, "").length);
    onChange(html);
    updateFormat();
  }, [onChange, updateFormat]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key.toLowerCase()) {
          case "b":
            e.preventDefault();
            execCmd("bold");
            updateFormat();
            break;
          case "i":
            e.preventDefault();
            execCmd("italic");
            updateFormat();
            break;
          case "u":
            e.preventDefault();
            execCmd("underline");
            updateFormat();
            break;
          case "z":
            if (e.shiftKey) {
              e.preventDefault();
              execCmd("redo");
            } else {
              e.preventDefault();
              execCmd("undo");
            }
            updateFormat();
            break;
        }
      }

      if (e.key === "Tab") {
        e.preventDefault();
        execCmd("insertHTML", "&nbsp;&nbsp;&nbsp;&nbsp;");
      }
    },
    [updateFormat],
  );

  const toggleLink = useCallback(() => {
    const url = prompt("Enter URL:", "https://");
    if (url) execCmd("createLink", url);
    updateFormat();
  }, [updateFormat]);

  const handleBlockToggle = useCallback(
    (tag: string) => {
      if (!editorRef.current) return;
      editorRef.current.focus();
      toggleBlock(tag, editorRef.current);
      handleInput();
    },
    [handleInput],
  );

  const cmd = useCallback(
    (command: string, value?: string) => {
      editorRef.current?.focus();
      execCmd(command, value);
      updateFormat();
      handleInput();
    },
    [updateFormat, handleInput],
  );

  return (
    <div className="rounded-xl border border-border overflow-hidden focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 transition-all bg-card">
      {/* ── Toolbar ─────────────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-0.5 px-2.5 py-2 border-b border-gray-100 bg-muted/50/80">
        {/* History */}
        <ToolbarBtn title="Undo (Ctrl+Z)" onClick={() => cmd("undo")}>
          <Undo size={13} />
        </ToolbarBtn>
        <ToolbarBtn title="Redo (Ctrl+Shift+Z)" onClick={() => cmd("redo")}>
          <Redo size={13} />
        </ToolbarBtn>

        <Divider />

        {/* Headings */}
        <ToolbarBtn
          title="Heading 1"
          active={fmt.h1}
          onClick={() => handleBlockToggle("h1")}
        >
          <Heading1 size={13} />
        </ToolbarBtn>
        <ToolbarBtn
          title="Heading 2"
          active={fmt.h2}
          onClick={() => handleBlockToggle("h2")}
        >
          <Heading2 size={13} />
        </ToolbarBtn>

        <Divider />

        {/* Inline formatting */}
        <ToolbarBtn
          title="Bold (Ctrl+B)"
          active={fmt.bold}
          onClick={() => cmd("bold")}
        >
          <Bold size={13} />
        </ToolbarBtn>
        <ToolbarBtn
          title="Italic (Ctrl+I)"
          active={fmt.italic}
          onClick={() => cmd("italic")}
        >
          <Italic size={13} />
        </ToolbarBtn>
        <ToolbarBtn
          title="Underline (Ctrl+U)"
          active={fmt.underline}
          onClick={() => cmd("underline")}
        >
          <Underline size={13} />
        </ToolbarBtn>
        <ToolbarBtn
          title="Code block"
          active={fmt.code}
          onClick={() => handleBlockToggle("pre")}
        >
          <Code size={13} />
        </ToolbarBtn>

        <Divider />

        {/* Lists */}
        <ToolbarBtn
          title="Bullet list"
          active={fmt.unorderedList}
          onClick={() => cmd("insertUnorderedList")}
        >
          <List size={13} />
        </ToolbarBtn>
        <ToolbarBtn
          title="Numbered list"
          active={fmt.orderedList}
          onClick={() => cmd("insertOrderedList")}
        >
          <ListOrdered size={13} />
        </ToolbarBtn>

        <Divider />

        {/* Block elements */}
        <ToolbarBtn
          title="Blockquote"
          active={fmt.blockquote}
          onClick={() => handleBlockToggle("blockquote")}
        >
          <Quote size={13} />
        </ToolbarBtn>
        <ToolbarBtn
          title="Horizontal rule"
          onClick={() => cmd("insertHorizontalRule")}
        >
          <Minus size={13} />
        </ToolbarBtn>
        <ToolbarBtn title="Insert link" onClick={toggleLink}>
          <LinkIcon size={13} />
        </ToolbarBtn>

        <Divider />

        {/* Alignment */}
        <ToolbarBtn
          title="Align left"
          active={fmt.alignLeft}
          onClick={() => cmd("justifyLeft")}
        >
          <AlignLeft size={13} />
        </ToolbarBtn>
        <ToolbarBtn
          title="Align center"
          active={fmt.alignCenter}
          onClick={() => cmd("justifyCenter")}
        >
          <AlignCenter size={13} />
        </ToolbarBtn>
        <ToolbarBtn
          title="Align right"
          active={fmt.alignRight}
          onClick={() => cmd("justifyRight")}
        >
          <AlignRight size={13} />
        </ToolbarBtn>
      </div>

      {/* ── Content area ─────────────────────────────────────────────────── */}
      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        onInput={handleInput}
        onKeyDown={handleKeyDown}
        onKeyUp={updateFormat}
        onMouseUp={updateFormat}
        onSelect={updateFormat}
        data-placeholder="Describe the role, responsibilities, what a typical day looks like, and what success looks like in this position..."
        className={cn(
          "min-h-[180px] max-h-[420px] overflow-y-auto px-4 py-3 text-sm text-foreground/90 outline-none",
          "leading-relaxed",
          "[&_h1]:text-xl [&_h1]:font-bold [&_h1]:text-foreground [&_h1]:mt-3 [&_h1]:mb-1",
          "[&_h2]:text-base [&_h2]:font-semibold [&_h2]:text-foreground/90 [&_h2]:mt-2.5 [&_h2]:mb-1",
          "[&_p]:mb-1.5",
          "[&_ul]:list-disc [&_ul]:pl-5 [&_ul]:mb-1.5 [&_ul>li]:mb-0.5",
          "[&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:mb-1.5 [&_ol>li]:mb-0.5",
          "[&_blockquote]:border-l-4 [&_blockquote]:border-primary/40 [&_blockquote]:pl-3 [&_blockquote]:italic [&_blockquote]:text-muted-foreground [&_blockquote]:my-2",
          "[&_pre]:bg-muted [&_pre]:rounded-lg [&_pre]:px-3 [&_pre]:py-2 [&_pre]:text-xs [&_pre]:font-mono [&_pre]:my-1.5 [&_pre]:text-foreground/80",
          "[&_a]:text-primary [&_a]:underline [&_a]:cursor-pointer",
          "[&_hr]:border-border [&_hr]:my-3",
          "empty:before:content-[attr(data-placeholder)] before:text-muted-foreground/80 before:pointer-events-none",
        )}
      />

      {/* ── Footer ───────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-3 py-1.5 border-t border-gray-100 bg-muted/50/50">
        <p className="text-xs text-muted-foreground/80">
          Tip:{" "}
          <kbd className="px-1 py-0.5 rounded bg-muted text-muted-foreground text-[10px] font-mono">
            Ctrl+B
          </kbd>{" "}
          <kbd className="px-1 py-0.5 rounded bg-muted text-muted-foreground text-[10px] font-mono">
            Ctrl+I
          </kbd>{" "}
          — well-formatted JDs get 2× more applications
        </p>
        <span className="text-xs text-gray-300">{charCount} chars</span>
      </div>

      <style>{`
        [contenteditable]:empty:before {
          content: attr(data-placeholder);
          color: #9ca3af;
          pointer-events: none;
        }
        [contenteditable]:focus { outline: none; }
      `}</style>
    </div>
  );
}