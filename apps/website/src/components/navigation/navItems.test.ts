import { describe, it, expect } from "vite-plus/test";
import { NAV_ITEMS } from "./navItems";

describe("NAV_ITEMS navigation configuration", () => {
  it("defines the 5 standard navigation items", () => {
    expect(NAV_ITEMS).toHaveLength(5);
    const ids = NAV_ITEMS.map((item) => item.id);
    expect(ids).toEqual(["home", "search", "writers", "favorites", "settings"]);
  });

  it("correctly identifies active route for home", () => {
    const homeItem = NAV_ITEMS.find((item) => item.id === "home")!;
    expect(homeItem.isActive("/")).toBe(true);
    expect(homeItem.isActive("")).toBe(true);
    expect(homeItem.isActive("/search")).toBe(false);
  });

  it("correctly identifies active route for search", () => {
    const searchItem = NAV_ITEMS.find((item) => item.id === "search")!;
    expect(searchItem.isActive("/search")).toBe(true);
    expect(searchItem.isActive("/")).toBe(false);
  });

  it("correctly identifies active route for writers and writer detail", () => {
    const writersItem = NAV_ITEMS.find((item) => item.id === "writers")!;
    expect(writersItem.isActive("/writers")).toBe(true);
    expect(writersItem.isActive("/writers/alice")).toBe(true);
    expect(writersItem.isActive("/favorites")).toBe(false);
  });

  it("correctly identifies active route for settings including dashboards", () => {
    const settingsItem = NAV_ITEMS.find((item) => item.id === "settings")!;
    expect(settingsItem.isActive("/settings")).toBe(true);
    expect(settingsItem.isActive("/writer-dash")).toBe(true);
    expect(settingsItem.isActive("/writer-dash/new")).toBe(true);
    expect(settingsItem.isActive("/editor-dash")).toBe(true);
    expect(settingsItem.isActive("/editor-dash/articles")).toBe(true);
    expect(settingsItem.isActive("/search")).toBe(false);
  });
});
