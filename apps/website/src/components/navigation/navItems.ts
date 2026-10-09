import React from "react";
import {
  CustomHomeIcon,
  CustomSearchIcon,
  CustomUserIcon,
  CustomStarIcon,
  CustomSettingsIcon,
} from "../icons/NavIcons";

export interface NavItemConfig {
  id: string;
  path: string;
  label: string;
  Icon: React.ComponentType<{ className?: string; active?: boolean }>;
  isActive: (pathname: string) => boolean;
}

export const NAV_ITEMS: NavItemConfig[] = [
  {
    id: "home",
    path: "/",
    label: "トップ",
    Icon: CustomHomeIcon,
    isActive: (pathname: string) => pathname === "/" || pathname === "",
  },
  {
    id: "search",
    path: "/search",
    label: "探す",
    Icon: CustomSearchIcon,
    isActive: (pathname: string) => pathname === "/search",
  },
  {
    id: "writers",
    path: "/writers",
    label: "ライター",
    Icon: CustomUserIcon,
    isActive: (pathname: string) => pathname.startsWith("/writers"),
  },
  {
    id: "favorites",
    path: "/favorites",
    label: "お気に入り",
    Icon: CustomStarIcon,
    isActive: (pathname: string) => pathname === "/favorites",
  },
  {
    id: "settings",
    path: "/settings",
    label: "設定",
    Icon: CustomSettingsIcon,
    isActive: (pathname: string) =>
      pathname.startsWith("/settings") ||
      pathname.startsWith("/writer-dash") ||
      pathname.startsWith("/editor-dash"),
  },
];
