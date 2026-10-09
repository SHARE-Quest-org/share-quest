// @vitest-environment jsdom
import { describe, it, expect, beforeEach, afterEach } from "vite-plus/test";
import { createRoot } from "react-dom/client";
import { act } from "react";
import { useFollows } from "./useFollows";

let currentHook: ReturnType<typeof useFollows>;

function HookTester() {
  currentHook = useFollows();
  return null;
}

describe("useFollows hook", () => {
  let container: HTMLDivElement;

  beforeEach(() => {
    window.localStorage.clear();
    container = document.createElement("div");
    document.body.appendChild(container);
  });

  afterEach(() => {
    document.body.removeChild(container);
  });

  it("initializes with empty followed list and can toggle follow", () => {
    const root = createRoot(container);
    act(() => {
      root.render(<HookTester />);
    });

    expect(currentHook.followedIds).toEqual([]);
    expect(currentHook.isFollowing("writer-1")).toBe(false);

    act(() => {
      currentHook.toggleFollow("writer-1");
    });

    expect(currentHook.followedIds).toEqual(["writer-1"]);
    expect(currentHook.isFollowing("writer-1")).toBe(true);

    act(() => {
      currentHook.toggleFollow("writer-1");
    });

    expect(currentHook.followedIds).toEqual([]);
    expect(currentHook.isFollowing("writer-1")).toBe(false);
  });

  it("persists followed IDs from localStorage", () => {
    window.localStorage.setItem("share_quest_followed_writers", JSON.stringify(["writer-2"]));
    const root = createRoot(container);
    act(() => {
      root.render(<HookTester />);
    });

    expect(currentHook.isFollowing("writer-2")).toBe(true);
  });
});
