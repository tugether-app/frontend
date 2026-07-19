"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";

export type Theme = "light" | "dimmed";

interface Ctx {
  theme: Theme;
  setTheme: (t: Theme) => void;
}

const ThemeCtx = createContext<Ctx>({ theme: "light", setTheme: () => {} });

const KEY = "tug_theme";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("light");

  // Load saved theme after mount (avoids SSR/hydration mismatch, same as
  // lib/i18n/provider.tsx) and apply it as a data attribute the CSS in
  // globals.css keys off ([data-theme="dimmed"]).
  useEffect(() => {
    const saved = window.localStorage.getItem(KEY) as Theme | null;
    const initial = saved === "dimmed" ? "dimmed" : "light";
    setThemeState(initial);
    document.documentElement.setAttribute("data-theme", initial);
  }, []);

  const setTheme = useCallback((t: Theme) => {
    setThemeState(t);
    window.localStorage.setItem(KEY, t);
    document.documentElement.setAttribute("data-theme", t);
  }, []);

  return <ThemeCtx.Provider value={{ theme, setTheme }}>{children}</ThemeCtx.Provider>;
}

export function useTheme() {
  return useContext(ThemeCtx);
}
