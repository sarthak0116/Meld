import { createContext, useContext, useState } from "react";

/**
 * Persists arena state across route changes so navigating to /
 * and back to /arena doesn't reset the active lobby, view, or theme.
 */
const ArenaContext = createContext(null);

export function ArenaProvider({ children }) {
  const [activeView, setActiveView] = useState("lobby");
  const [theme,      setTheme]      = useState("light");

  return (
    <ArenaContext.Provider value={{ activeView, setActiveView, theme, setTheme }}>
      {children}
    </ArenaContext.Provider>
  );
}

export function useArena() {
  const ctx = useContext(ArenaContext);
  if (!ctx) throw new Error("useArena must be used inside <ArenaProvider>");
  return ctx;
}
