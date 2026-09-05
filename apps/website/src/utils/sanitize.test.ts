import { describe, it, expect } from "vite-plus/test";
import { sanitizeHtml } from "./sanitize";

describe("sanitizeHtml", () => {
  it("allows safe HTML elements", () => {
    const input = "<p>Hello <strong>world</strong></p>";
    expect(sanitizeHtml(input)).toBe(input);
  });

  it("removes script tags to prevent XSS", () => {
    const input = '<p>Hello</p><script>alert("xss")</script>';
    expect(sanitizeHtml(input)).toBe("<p>Hello</p>");
  });

  it("removes inline event handlers", () => {
    const input = '<img src="valid.png" onerror="alert(1)" alt="test">';
    const output = sanitizeHtml(input);
    expect(output).not.toContain("onerror");
    expect(output).toContain('src="valid.png"');
  });

  it("removes javascript: pseudo-protocol in links", () => {
    const input = '<a href="javascript:alert(1)">Click me</a>';
    const output = sanitizeHtml(input);
    expect(output).not.toContain("javascript:");
  });

  it('adds rel="noopener noreferrer" to links with target="_blank"', () => {
    const input = '<a href="https://example.com" target="_blank">External Link</a>';
    const output = sanitizeHtml(input);
    expect(output).toContain('rel="noopener noreferrer"');
    expect(output).toContain('target="_blank"');
  });

  it("preserves TipTap CustomFrame attributes", () => {
    const input =
      '<div data-type="custom-frame" class="custom-frame my-4" style="background-color: #f0fdf4; border: 2px solid #22c55e;">' +
      '<div class="frame-title" contenteditable="false">タイトル</div>' +
      '<div class="frame-content"><p>本文内容</p></div>' +
      "</div>";
    const output = sanitizeHtml(input);
    expect(output).toContain('data-type="custom-frame"');
    expect(output).toContain('contenteditable="false"');
    expect(output).toContain("frame-title");
    expect(output).toContain("frame-content");
    expect(output).toContain("background-color: #f0fdf4");
  });

  it("disallows dangerous tags like iframe and form", () => {
    const input = '<iframe src="https://evil.com"></iframe><form action="/steal"><input /></form>';
    const output = sanitizeHtml(input);
    expect(output).not.toContain("iframe");
    expect(output).not.toContain("form");
  });
});
