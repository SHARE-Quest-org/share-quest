// @vitest-environment jsdom
import { describe, it, expect, beforeEach, afterEach, vi } from "vite-plus/test";
import { createRoot } from "react-dom/client";
import { act } from "react";
import { BrowserRouter } from "react-router-dom";
import { RoleRoute } from "./RoleRoute";
import { UIProvider } from "../context/UIContext";
import { DataProvider } from "../context/DataContext";
import * as AuthContextModule from "../context/AuthContext";

(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;

describe("RoleRoute access control", () => {
  let container: HTMLDivElement;
  let root: ReturnType<typeof createRoot> | null = null;

  beforeEach(() => {
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(() => {
    if (root) {
      act(() => {
        root!.unmount();
      });
      root = null;
    }
    document.body.removeChild(container);
    vi.restoreAllMocks();
  });

  function renderWithRouter(ui: React.ReactElement) {
    act(() => {
      root!.render(
        <BrowserRouter>
          <UIProvider>
            <DataProvider>{ui}</DataProvider>
          </UIProvider>
        </BrowserRouter>,
      );
    });
  }

  it("renders spinner when auth is loading", () => {
    vi.spyOn(AuthContextModule, "useAuth").mockReturnValue({
      userRole: "guest",
      authLoading: true,
      user: null,
      profile: null,
      setProfile: vi.fn(),
      setUserRole: vi.fn(),
      mfaChallengeRequired: false,
      setMfaChallengeRequired: vi.fn(),
      refreshProfile: vi.fn(),
    });

    renderWithRouter(
      <RoleRoute requiredRole="editor">
        <div>保護されたコンテンツ</div>
      </RoleRoute>,
    );

    expect(container.textContent).not.toContain("保護されたコンテンツ");
    expect(container.querySelector(".animate-spin")).not.toBeNull();
  });

  it("blocks guest user from authenticated role and shows AccessDeniedView", () => {
    vi.spyOn(AuthContextModule, "useAuth").mockReturnValue({
      userRole: "guest",
      authLoading: false,
      user: null,
      profile: null,
      setProfile: vi.fn(),
      setUserRole: vi.fn(),
      mfaChallengeRequired: false,
      setMfaChallengeRequired: vi.fn(),
      refreshProfile: vi.fn(),
    });

    renderWithRouter(
      <RoleRoute requiredRole="authenticated">
        <div>認証済み専用</div>
      </RoleRoute>,
    );

    expect(container.textContent).not.toContain("認証済み専用");
    expect(container.textContent).toContain("アクセス権限がありません");
  });

  it("allows writer and editor to access writer route", () => {
    // 1. Writer access
    vi.spyOn(AuthContextModule, "useAuth").mockReturnValue({
      userRole: "writer",
      authLoading: false,
      user: null,
      profile: null,
      setProfile: vi.fn(),
      setUserRole: vi.fn(),
      mfaChallengeRequired: false,
      setMfaChallengeRequired: vi.fn(),
      refreshProfile: vi.fn(),
    });

    renderWithRouter(
      <RoleRoute requiredRole="writer">
        <div>ライターダッシュボード</div>
      </RoleRoute>,
    );

    expect(container.textContent).toContain("ライターダッシュボード");

    // 2. Editor access
    vi.spyOn(AuthContextModule, "useAuth").mockReturnValue({
      userRole: "editor",
      authLoading: false,
      user: null,
      profile: null,
      setProfile: vi.fn(),
      setUserRole: vi.fn(),
      mfaChallengeRequired: false,
      setMfaChallengeRequired: vi.fn(),
      refreshProfile: vi.fn(),
    });

    renderWithRouter(
      <RoleRoute requiredRole="writer">
        <div>ライターダッシュボード</div>
      </RoleRoute>,
    );

    expect(container.textContent).toContain("ライターダッシュボード");
  });

  it("blocks writer from editor route", () => {
    vi.spyOn(AuthContextModule, "useAuth").mockReturnValue({
      userRole: "writer",
      authLoading: false,
      user: null,
      profile: null,
      setProfile: vi.fn(),
      setUserRole: vi.fn(),
      mfaChallengeRequired: false,
      setMfaChallengeRequired: vi.fn(),
      refreshProfile: vi.fn(),
    });

    renderWithRouter(
      <RoleRoute requiredRole="editor">
        <div>編集長ダッシュボード</div>
      </RoleRoute>,
    );

    expect(container.textContent).not.toContain("編集長ダッシュボード");
    expect(container.textContent).toContain("アクセス権限がありません");
  });

  it("allows editor to access editor route", () => {
    vi.spyOn(AuthContextModule, "useAuth").mockReturnValue({
      userRole: "editor",
      authLoading: false,
      user: null,
      profile: null,
      setProfile: vi.fn(),
      setUserRole: vi.fn(),
      mfaChallengeRequired: false,
      setMfaChallengeRequired: vi.fn(),
      refreshProfile: vi.fn(),
    });

    renderWithRouter(
      <RoleRoute requiredRole="editor">
        <div>編集長ダッシュボード</div>
      </RoleRoute>,
    );

    expect(container.textContent).toContain("編集長ダッシュボード");
  });
});
