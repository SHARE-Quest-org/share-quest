import { createContext, useContext } from "react";
import type { Profile } from "../supabase";
import type { Article, Series } from "../App";

export interface AppContextType {
  // Authentication & Profile
  profile: Profile | null;
  setProfile: React.Dispatch<React.SetStateAction<Profile | null>>;
  userRole: "guest" | "viewer" | "writer" | "editor";
  setUserRole: React.Dispatch<React.SetStateAction<"guest" | "viewer" | "writer" | "editor">>;
  authLoading: boolean;

  // Global UI helpers
  showToast: (message: string) => void;
  navigate: (view: string, param?: string | null) => void;
  currentView: string;
  viewParam: string | null;

  // Core Data
  writers: Profile[];
  setWriters: React.Dispatch<React.SetStateAction<Profile[]>>;
  articles: Article[];
  setArticles: React.Dispatch<React.SetStateAction<Article[]>>;
  seriesList: Series[];
  setSeriesList: React.Dispatch<React.SetStateAction<Series[]>>;

  // Favorites
  favorites: string[];
  setFavorites: React.Dispatch<React.SetStateAction<string[]>>;
  toggleFavorite: (articleId: string) => void;

  // Font Settings
  fontSize: string;
  setFontSize: React.Dispatch<React.SetStateAction<string>>;
  getFontSizeClass: () => string;
}

export const AppContext = createContext<AppContextType | undefined>(undefined);

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used within an AppContext.Provider");
  }
  return context;
};
