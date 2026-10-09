import React, { createContext, useContext, useState, useCallback, useEffect } from "react";

export interface UIContextType {
  toastMessage: string;
  showToast: (message: string) => void;
  hideToast: () => void;
  fontSize: string;
  setFontSize: React.Dispatch<React.SetStateAction<string>>;
  getFontSizeClass: () => string;
}

export const UIContext = createContext<UIContextType | undefined>(undefined);

export function UIProvider({ children }: { children: React.ReactNode }) {
  const [toastMessage, setToastMessage] = useState("");
  const [fontSize, setFontSize] = useState<string>(() => {
    return localStorage.getItem("preferred_font_size") || "medium";
  });

  const showToast = useCallback((message: string) => {
    setToastMessage(message);
    const timer = setTimeout(() => {
      setToastMessage("");
    }, 4000);
    return () => clearTimeout(timer);
  }, []);

  const hideToast = useCallback(() => {
    setToastMessage("");
  }, []);

  useEffect(() => {
    localStorage.setItem("preferred_font_size", fontSize);
  }, [fontSize]);

  const getFontSizeClass = useCallback(() => {
    switch (fontSize) {
      case "small":
        return "text-sm leading-relaxed";
      case "large":
        return "text-lg leading-loose";
      case "xlarge":
        return "text-xl leading-loose";
      default:
        return "text-base leading-relaxed";
    }
  }, [fontSize]);

  const value: UIContextType = {
    toastMessage,
    showToast,
    hideToast,
    fontSize,
    setFontSize,
    getFontSizeClass,
  };

  return <UIContext.Provider value={value}>{children}</UIContext.Provider>;
}

export function useUI() {
  const context = useContext(UIContext);
  if (!context) {
    throw new Error("useUI must be used within a UIProvider");
  }
  return context;
}
