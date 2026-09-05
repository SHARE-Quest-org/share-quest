import DOMPurify from "dompurify";

const ALLOWED_TAGS = [
  "p",
  "h1",
  "h2",
  "h3",
  "strong",
  "em",
  "u",
  "s",
  "ul",
  "ol",
  "li",
  "a",
  "img",
  "blockquote",
  "pre",
  "code",
  "hr",
  "br",
  "span",
  "div", // TipTapのCustomFrame（独自見出し枠）で使用
];

const ALLOWED_ATTR = [
  "href",
  "src",
  "alt",
  "class",
  "style",
  "target",
  "rel",
  "data-type", // CustomFrameの種類属性
  "contenteditable", // CustomFrameのタイトル編集制御
];

// 外部リンクのリバースタブナビング防止: target="_blank" のリンクに rel="noopener noreferrer" を確実に付与
DOMPurify.addHook("afterSanitizeAttributes", (node) => {
  if (node.tagName === "A" && node.getAttribute("target") === "_blank") {
    node.setAttribute("rel", "noopener noreferrer");
  }
});

export function sanitizeHtml(html: string): string {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS,
    ALLOWED_ATTR,
    ALLOW_DATA_ATTR: false,
  });
}
