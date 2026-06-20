"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { DICTS, type Lang } from "./dict";

type T = (key: string, vars?: Record<string, string | number>) => string;
interface Ctx {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: T;
}

const I18nCtx = createContext<Ctx>({ lang: "en", setLang: () => {}, t: (k) => k });

const KEY = "tug_lang";

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>("en");

  // Load saved language after mount (avoids SSR/hydration mismatch).
  useEffect(() => {
    const saved = window.localStorage.getItem(KEY) as Lang | null;
    if (saved === "en" || saved === "id") setLangState(saved);
  }, []);

  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    window.localStorage.setItem(KEY, l);
    document.documentElement.lang = l;
  }, []);

  const t = useCallback<T>(
    (key, vars) => {
      let s = DICTS[lang][key] ?? DICTS.en[key] ?? key;
      if (vars) for (const k in vars) s = s.replace(`{${k}}`, String(vars[k]));
      return s;
    },
    [lang],
  );

  return <I18nCtx.Provider value={{ lang, setLang, t }}>{children}</I18nCtx.Provider>;
}

export function useI18n() {
  return useContext(I18nCtx);
}
