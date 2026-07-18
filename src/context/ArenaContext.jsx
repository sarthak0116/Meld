import { createContext, useContext, useState, useEffect } from "react";

/**
 * Persists arena state across route changes so navigating to /
 * and back to /arena doesn't reset the active lobby, view, or theme.
 * Theme is also persisted to localStorage so it survives page reloads.
 */
const ArenaContext = createContext(null);

export function ArenaProvider({ children }) {
  const [activeView, setActiveView] = useState("lobby");
  const [unreadNotifCount, setUnreadNotifCount] = useState(0);
  const [theme, setTheme] = useState(() => {
    try {
      return localStorage.getItem("meld_theme") || "light";
    } catch {
      return "light";
    }
  });

  // Persist theme changes
  useEffect(() => {
    try {
      localStorage.setItem("meld_theme", theme);
    } catch {
      // localStorage unavailable — silently ignore
    }
  }, [theme]);

  return (
    <ArenaContext.Provider value={{ activeView, setActiveView, theme, setTheme, unreadNotifCount, setUnreadNotifCount }}>
      {children}
    </ArenaContext.Provider>
  );
}

export function useArena() {
  const ctx = useContext(ArenaContext);
  if (!ctx) throw new Error("useArena must be used inside <ArenaProvider>");
  return ctx;
}
