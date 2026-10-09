// @vitest-environment jsdom
/* eslint-disable @typescript-eslint/unbound-method */
import { describe, it, expect, beforeEach, afterEach } from "vite-plus/test";
import { createRoot } from "react-dom/client";
import { act } from "react";
import { ArticleComments } from "./ArticleComments";
import { AuthProvider } from "../context/AuthContext";

// Enable React act support
(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;

function setNativeValue(element: HTMLInputElement | HTMLTextAreaElement, value: string) {
  const valueSetter = Object.getOwnPropertyDescriptor(element, "value")?.set;
  const prototype = Object.getPrototypeOf(element);
  const prototypeValueSetter = Object.getOwnPropertyDescriptor(prototype, "value")?.set;

  if (prototypeValueSetter && valueSetter !== prototypeValueSetter) {
    prototypeValueSetter.call(element, value);
  } else if (valueSetter) {
    valueSetter.call(element, value);
  } else {
    element.value = value;
  }
  element.dispatchEvent(new Event("input", { bubbles: true }));
  element.dispatchEvent(new Event("change", { bubbles: true }));
}

describe("ArticleComments", () => {
  let container: HTMLDivElement;

  beforeEach(() => {
    localStorage.clear();
    container = document.createElement("div");
    document.body.appendChild(container);
  });

  afterEach(() => {
    document.body.removeChild(container);
  });

  it("renders empty state initially", () => {
    const root = createRoot(container);
    act(() => {
      root.render(
        <AuthProvider>
          <ArticleComments articleId="test-article-1" />
        </AuthProvider>,
      );
    });

    expect(container.textContent).toContain("感想・コメント (0)");
    expect(container.textContent).toContain("まだコメントはありません。");
  });

  it("allows submitting a new comment", () => {
    const root = createRoot(container);
    act(() => {
      root.render(
        <AuthProvider>
          <ArticleComments articleId="test-article-1" />
        </AuthProvider>,
      );
    });

    const nameInput = container.querySelector(
      'input[placeholder="お名前（未入力の場合は匿名）"]',
    ) as HTMLInputElement;
    const contentTextarea = container.querySelector("textarea") as HTMLTextAreaElement;
    const form = container.querySelector("form") as HTMLFormElement;

    act(() => {
      setNativeValue(nameInput, "読者A");
      setNativeValue(contentTextarea, "とても参考になりました！");
    });

    act(() => {
      form.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }));
    });

    expect(container.textContent).toContain("感想・コメント (1)");
    expect(container.textContent).toContain("とても参考になりました！");
    expect(container.textContent).toContain("読者A");
  });
});
