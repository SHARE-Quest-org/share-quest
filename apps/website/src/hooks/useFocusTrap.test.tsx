// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from "vite-plus/test";
import { createRoot } from "react-dom/client";
import { act } from "react";
import { useFocusTrap } from "./useFocusTrap";

function TestModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const ref = useFocusTrap<HTMLDivElement>(isOpen, onClose);
  if (!isOpen) return null;
  return (
    <div ref={ref} role="dialog" aria-modal="true">
      <button id="btn1">Button 1</button>
      <button id="btn2">Button 2</button>
    </div>
  );
}

describe("useFocusTrap", () => {
  let rootContainer: HTMLDivElement;

  beforeEach(() => {
    rootContainer = document.createElement("div");
    document.body.appendChild(rootContainer);
  });

  afterEach(() => {
    document.body.removeChild(rootContainer);
    vi.restoreAllMocks();
  });

  it("handles Escape key to trigger onClose", async () => {
    const onClose = vi.fn();
    const root = createRoot(rootContainer);

    act(() => {
      root.render(<TestModal isOpen={true} onClose={onClose} />);
    });

    const event = new KeyboardEvent("keydown", { key: "Escape", cancelable: true });
    document.dispatchEvent(event);

    expect(onClose).toHaveBeenCalled();
  });
});
