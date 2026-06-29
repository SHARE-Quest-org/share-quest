import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import { TextStyle } from "@tiptap/extension-text-style";
import { Color } from "@tiptap/extension-color";
import FontFamily from "@tiptap/extension-font-family";
import Placeholder from "@tiptap/extension-placeholder";
import TextAlign from "@tiptap/extension-text-align";
import { Extension, Node as TipTapNode, mergeAttributes } from "@tiptap/core";
import { useEffect, useCallback, useRef, useState } from "react";

const FontSize = Extension.create({
  name: "fontSize",
  addOptions() {
    return { types: ["textStyle"] };
  },
  addGlobalAttributes() {
    return [
      {
        types: this.options.types,
        attributes: {
          fontSize: {
            default: null,
            parseHTML: (el: HTMLElement) => el.style.fontSize?.replace(/['"]+/g, "") || null,
            renderHTML: (attrs: Record<string, any>) => {
              if (!attrs.fontSize) return {};
              return { style: `font-size: ${attrs.fontSize}` };
            },
          },
        },
      },
    ];
  },
  addCommands() {
    return {
      setFontSize:
        (fontSize: string) =>
        ({ chain }: any) =>
          chain().setMark("textStyle", { fontSize }).run(),
      unsetFontSize:
        () =>
        ({ chain }: any) =>
          chain().setMark("textStyle", { fontSize: null }).removeEmptyTextStyle().run(),
    } as any;
  },
});

const CustomFrame = TipTapNode.create({
  name: "customFrame",
  group: "block",
  content: "block+",
  defining: true,
  addAttributes() {
    return {
      type: {
        default: "theme",
        parseHTML: (element) => element.getAttribute("data-type"),
        renderHTML: (attributes) => ({ "data-type": attributes.type }),
      },
    };
  },
  parseHTML() {
    return [{ tag: "div[data-type]" }];
  },
  renderHTML({ node, HTMLAttributes }) {
    const type = node.attrs.type;
    let className = "custom-frame rounded-r-xl ";
    let title = "";
    if (type === "theme") {
      className += "custom-frame-theme";
      title = "📌 テーマ";
    } else if (type === "verification") {
      className += "custom-frame-verification";
      title = "🔍 検証";
    } else if (type === "summary") {
      className += "custom-frame-summary";
      title = "💡 まとめ";
    }
    return [
      "div",
      mergeAttributes(HTMLAttributes, { class: className }),
      ["div", { class: "custom-frame-title", contenteditable: "false" }, title],
      ["div", { class: "custom-frame-body" }, 0],
    ];
  },
  addCommands() {
    return {
      setCustomFrame:
        (type: string) =>
        ({ commands }: any) => {
          return commands.wrapIn(this.name, { type });
        },
      unsetCustomFrame:
        () =>
        ({ commands }: any) => {
          return commands.lift(this.name);
        },
      toggleCustomFrame:
        (type: string) =>
        ({ commands }: any) => {
          return commands.toggleWrap(this.name, { type });
        },
    } as any;
  },
});

interface Props {
  content: string;
  onChange: (html: string) => void;
  placeholder?: string;
}

const FONT_SIZES = ["12", "14", "16", "18", "20", "24", "28", "32", "36", "48"];
const FONT_FAMILIES = [
  { label: "デフォルト", value: "" },
  { label: "ゴシック体", value: "sans-serif" },
  { label: "明朝体", value: "serif" },
  { label: "等幅", value: "monospace" },
];
const COLORS = [
  "#000000",
  "#374151",
  "#6B7280",
  "#EF4444",
  "#F97316",
  "#EAB308",
  "#22C55E",
  "#3B82F6",
  "#8B5CF6",
  "#EC4899",
  "#FFFFFF",
  "#FEF2F2",
  "#FFF7ED",
  "#FEFCE8",
  "#F0FDF4",
  "#EFF6FF",
  "#F5F3FF",
  "#FDF2F8",
];

export default function RichTextEditor({ content, onChange, placeholder }: Props) {
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showLinkInput, setShowLinkInput] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");
  const [showImageInput, setShowImageInput] = useState(false);
  const [imageUrl, setImageUrl] = useState("");
  const colorRef = useRef<HTMLDivElement>(null);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: { levels: [1, 2, 3] } }),
      Underline,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: { class: "text-blue-600 underline cursor-pointer" },
      }),
      Image.configure({ HTMLAttributes: { class: "max-w-full rounded-lg my-2" } }),
      TextStyle,
      Color,
      FontFamily,
      FontSize,
      CustomFrame,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Placeholder.configure({ placeholder: placeholder ?? "本文を入力してください..." }),
    ],
    content,
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
    editorProps: {
      attributes: { class: "article-content min-h-[500px] p-4 focus:outline-none" },
    },
  });

  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content);
    }
  }, [content, editor]);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (colorRef.current && !colorRef.current.contains(e.target as Node))
        setShowColorPicker(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const applyLink = useCallback(() => {
    if (!editor) return;
    if (linkUrl) editor.chain().focus().extendMarkRange("link").setLink({ href: linkUrl }).run();
    else editor.chain().focus().unsetLink().run();
    setShowLinkInput(false);
    setLinkUrl("");
  }, [editor, linkUrl]);

  const insertImage = useCallback(() => {
    if (!editor || !imageUrl) return;
    editor.chain().focus().setImage({ src: imageUrl }).run();
    setShowImageInput(false);
    setImageUrl("");
  }, [editor, imageUrl]);

  if (!editor) return null;

  const TB = ({
    onClick,
    active,
    title,
    children,
  }: {
    onClick: () => void;
    active?: boolean;
    title: string;
    children: React.ReactNode;
  }) => (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={`flex items-center justify-center min-w-[44px] min-h-[44px] px-2 py-1.5 rounded text-sm transition-colors ${active ? "bg-blue-100 text-blue-700 font-bold" : "text-gray-600 hover:bg-gray-100"}`}
    >
      {children}
    </button>
  );
  const Div = () => <div className="w-px h-5 bg-gray-200 mx-1 self-center" />;

  return (
    <div className="border border-gray-300 rounded-xl bg-white shadow-sm">
      <div className="border-b border-gray-200 bg-gray-50 p-2 flex flex-wrap items-center gap-0.5 rounded-t-xl sticky top-[52px] z-10">
        <select
          className="text-sm border border-gray-200 rounded px-2 py-1 bg-white text-gray-700 mr-1"
          value={
            editor.isActive("heading", { level: 1 })
              ? "h1"
              : editor.isActive("heading", { level: 2 })
                ? "h2"
                : editor.isActive("heading", { level: 3 })
                  ? "h3"
                  : "paragraph"
          }
          onChange={(e) => {
            const v = e.target.value;
            if (v === "paragraph") editor.chain().focus().setParagraph().run();
            else
              editor
                .chain()
                .focus()
                .toggleHeading({ level: parseInt(v[1]) as 1 | 2 | 3 })
                .run();
          }}
        >
          <option value="paragraph">本文</option>
          <option value="h1">見出し1</option>
          <option value="h2">見出し2</option>
          <option value="h3">見出し3</option>
        </select>
        <select
          className="text-sm border border-gray-200 rounded px-2 py-1 bg-white text-gray-700 mr-1"
          onChange={(e) => {
            const v = e.target.value;
            if (!v) editor.chain().focus().unsetFontFamily().run();
            else editor.chain().focus().setFontFamily(v).run();
          }}
          defaultValue=""
        >
          {FONT_FAMILIES.map((f) => (
            <option key={f.value} value={f.value}>
              {f.label}
            </option>
          ))}
        </select>
        <select
          className="text-sm border border-gray-200 rounded px-2 py-1 bg-white text-gray-700 mr-1"
          onChange={(e) => {
            const v = e.target.value;
            if (!v) (editor.chain().focus() as any).unsetFontSize().run();
            else (editor.chain().focus() as any).setFontSize(`${v}px`).run();
          }}
          defaultValue=""
        >
          <option value="">サイズ</option>
          {FONT_SIZES.map((s) => (
            <option key={s} value={s}>
              {s}px
            </option>
          ))}
        </select>
        <select
          className="text-sm border border-gray-200 rounded px-2 py-1 bg-white text-gray-700 mr-1"
          value={
            editor.isActive("customFrame", { type: "theme" })
              ? "theme"
              : editor.isActive("customFrame", { type: "verification" })
                ? "verification"
                : editor.isActive("customFrame", { type: "summary" })
                  ? "summary"
                  : ""
          }
          onChange={(e) => {
            const v = e.target.value;
            if (!v) {
              (editor.chain().focus() as any).unsetCustomFrame().run();
            } else {
              (editor.chain().focus() as any).toggleCustomFrame(v).run();
            }
          }}
        >
          <option value="">枠なし</option>
          <option value="theme">📌 テーマ枠</option>
          <option value="verification">🔍 検証枠</option>
          <option value="summary">💡 まとめ枠</option>
        </select>
        <Div />
        <TB
          onClick={() => editor.chain().focus().toggleBold().run()}
          active={editor.isActive("bold")}
          title="太字"
        >
          <strong>B</strong>
        </TB>
        <TB
          onClick={() => editor.chain().focus().toggleItalic().run()}
          active={editor.isActive("italic")}
          title="イタリック"
        >
          <em>I</em>
        </TB>
        <TB
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          active={editor.isActive("underline")}
          title="下線"
        >
          <span className="underline">U</span>
        </TB>
        <TB
          onClick={() => editor.chain().focus().toggleStrike().run()}
          active={editor.isActive("strike")}
          title="取り消し線"
        >
          <span className="line-through">S</span>
        </TB>
        <Div />
        <div className="relative" ref={colorRef}>
          <button
            type="button"
            title="文字色"
            onClick={() => setShowColorPicker((v) => !v)}
            className="flex flex-col items-center px-2 py-1 rounded hover:bg-gray-100"
          >
            <span className="text-sm font-bold text-gray-700">A</span>
            <span
              className="h-1 w-5 rounded-sm mt-0.5"
              style={{ backgroundColor: editor.getAttributes("textStyle").color ?? "#000000" }}
            />
          </button>
          {showColorPicker && (
            <div className="absolute top-9 left-0 z-50 bg-white border border-gray-200 rounded-xl shadow-lg p-3 w-48">
              <div className="grid grid-cols-6 gap-1.5">
                {COLORS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => {
                      editor.chain().focus().setColor(c).run();
                      setShowColorPicker(false);
                    }}
                    className="w-6 h-6 rounded border border-gray-200 hover:scale-110 transition-transform"
                    style={{ backgroundColor: c }}
                    title={c}
                  />
                ))}
              </div>
              <button
                type="button"
                onClick={() => {
                  editor.chain().focus().unsetColor().run();
                  setShowColorPicker(false);
                }}
                className="mt-2 text-xs text-gray-500 hover:text-gray-700 w-full text-center"
              >
                色をリセット
              </button>
            </div>
          )}
        </div>
        <Div />
        <TB
          onClick={() => editor.chain().focus().setTextAlign("left").run()}
          active={editor.isActive({ textAlign: "left" })}
          title="左揃え"
        >
          左
        </TB>
        <TB
          onClick={() => editor.chain().focus().setTextAlign("center").run()}
          active={editor.isActive({ textAlign: "center" })}
          title="中央揃え"
        >
          中
        </TB>
        <TB
          onClick={() => editor.chain().focus().setTextAlign("right").run()}
          active={editor.isActive({ textAlign: "right" })}
          title="右揃え"
        >
          右
        </TB>
        <Div />
        <TB
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          active={editor.isActive("bulletList")}
          title="箇条書き"
        >
          • ≡
        </TB>
        <TB
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          active={editor.isActive("orderedList")}
          title="番号付きリスト"
        >
          1.≡
        </TB>
        <Div />
        <TB
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          active={editor.isActive("blockquote")}
          title="引用"
        >
          ❝
        </TB>
        <TB
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          active={editor.isActive("codeBlock")}
          title="コード"
        >
          {"</>"}
        </TB>
        <Div />
        <div className="relative">
          <TB
            onClick={() => setShowLinkInput((v) => !v)}
            active={editor.isActive("link")}
            title="リンク"
          >
            🔗
          </TB>
          {showLinkInput && (
            <div
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/30"
              onClick={() => setShowLinkInput(false)}
            >
              <div
                className="bg-white border border-gray-200 rounded-xl shadow-xl p-4 w-80"
                onClick={(e) => e.stopPropagation()}
              >
                <p className="text-sm font-bold text-gray-700 mb-3">リンクURLを入力</p>
                <input
                  type="url"
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400 mb-3"
                  onKeyDown={(e) => e.key === "Enter" && applyLink()}
                  autoFocus
                />
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={applyLink}
                    className="flex-1 bg-blue-500 text-white text-sm rounded-lg py-2 font-bold hover:bg-blue-600"
                  >
                    適用
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      editor.chain().focus().unsetLink().run();
                      setShowLinkInput(false);
                    }}
                    className="flex-1 border border-gray-200 text-sm rounded-lg py-2 text-gray-600 hover:bg-gray-50"
                  >
                    解除
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
        <div className="relative">
          <TB onClick={() => setShowImageInput((v) => !v)} active={false} title="画像">
            🖼️
          </TB>
          {showImageInput && (
            <div
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/30"
              onClick={() => setShowImageInput(false)}
            >
              <div
                className="bg-white border border-gray-200 rounded-xl shadow-xl p-4 w-80"
                onClick={(e) => e.stopPropagation()}
              >
                <p className="text-sm font-bold text-gray-700 mb-3">画像URLを入力</p>
                <input
                  type="url"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400 mb-3"
                  onKeyDown={(e) => e.key === "Enter" && insertImage()}
                  autoFocus
                />
                <button
                  type="button"
                  onClick={insertImage}
                  className="w-full bg-blue-500 text-white text-sm rounded-lg py-2 font-bold hover:bg-blue-600"
                >
                  挿入
                </button>
              </div>
            </div>
          )}
        </div>
        <Div />
        <TB
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
          active={false}
          title="区切り線"
        >
          —
        </TB>
        <div className="ml-auto flex gap-0.5">
          <TB onClick={() => editor.chain().focus().undo().run()} active={false} title="元に戻す">
            ↩
          </TB>
          <TB onClick={() => editor.chain().focus().redo().run()} active={false} title="やり直し">
            ↪
          </TB>
        </div>
      </div>
      <style>{`
        .ProseMirror p.is-editor-empty:first-child::before { content: attr(data-placeholder); float: left; color: #adb5bd; pointer-events: none; height: 0; }
      `}</style>
      <EditorContent editor={editor} />
    </div>
  );
}
