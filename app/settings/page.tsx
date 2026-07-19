"use client";

import { Card } from "@/components/ui";
import { BackButton } from "@/components/BackButton";
import { FlagIcon } from "@/components/FlagIcon";
import { RequireAuth } from "@/components/RequireAuth";
import { useI18n } from "@/lib/i18n/provider";
import { LANGS } from "@/lib/i18n/dict";
import { useEnter } from "@/lib/useEnter";

export default function SettingsPage() {
  return (
    <RequireAuth>
      <Settings />
    </RequireAuth>
  );
}

function Settings() {
  const { t, lang, setLang } = useI18n();
  const entered = useEnter();

  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col px-6 pb-10 pt-6">
      <header className="flex items-center gap-3">
        <BackButton fallback="/profile" />
        <span className="font-display text-lg font-semibold text-ink">{t("settings.title")}</span>
      </header>

      <div className={`stagger-enter ${entered ? "" : "is-out"}`}>
        {/* Language */}
        <div style={{ "--i": 0 } as React.CSSProperties}>
          <h2 className="mt-8 text-sm font-bold uppercase tracking-wide text-ink-soft">{t("settings.language")}</h2>
          <Card className="mt-3 divide-y divide-line p-1">
            {LANGS.map((l) => {
              const active = lang === l.code;
              return (
                <button
                  key={l.code}
                  onClick={() => setLang(l.code)}
                  className="flex w-full items-center gap-3 rounded-[18px] px-4 py-3.5 text-left transition active:scale-[0.99]"
                >
                  <FlagIcon code={l.flagCode} size={28} />
                  <span className="flex-1 font-semibold text-ink">{l.label}</span>
                  <span
                    className={`flex h-6 w-6 items-center justify-center rounded-full border-2 transition ${
                      active ? "border-gold bg-gold" : "border-line"
                    }`}
                  >
                    {active && (
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                        <path d="M5 13l4 4L19 7" stroke="#2B2622" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </span>
                </button>
              );
            })}
          </Card>
        </div>

        {/* Currency (locked for now) */}
        <div style={{ "--i": 1 } as React.CSSProperties}>
          <h2 className="mt-8 text-sm font-bold uppercase tracking-wide text-ink-soft">{t("settings.currency")}</h2>
          <Card className="mt-3 flex items-center gap-3 p-4">
            <span className="flex h-9 w-9 items-center justify-center rounded-[12px] bg-gold-soft font-display font-bold text-gold-deep">$</span>
            <span className="flex-1 font-semibold text-ink">USD</span>
            <span className="text-xs font-medium text-ink-soft/70">{t("settings.currencyNote")}</span>
          </Card>
        </div>
      </div>
    </main>
  );
}
