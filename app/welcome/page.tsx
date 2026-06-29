"use client";

/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { Badge, PillButton } from "@/components/ui";
import { WordMark } from "@/components/BrandIcon";
import { useI18n } from "@/lib/i18n/provider";

// Marketing front door / splash. The in-app home is the dashboard at `/`.

const STEP_ART = ["/art/step-goal.png", "/art/step-invite.png", "/art/step-save.png"];

export default function Welcome() {
  const { t } = useI18n();
  const steps = [1, 2, 3].map((n, i) => ({ art: STEP_ART[i], title: t(`welcome.step${n}.t`), desc: t(`welcome.step${n}.d`) }));

  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col px-6 pb-10 pt-6">
      <header className="flex items-center justify-between">
        <WordMark />
      </header>

      <div className="rise-in mt-6 flex flex-col items-center text-center">
        <Badge>
          <span aria-hidden>✨</span> {t("welcome.badge")}
        </Badge>
        <img
          src="/art/hero-scene.png"
          alt="Tugether jar saving with friends"
          className="float-slow mt-4 h-auto w-[300px] select-none"
          draggable={false}
        />
        <h1 className="mt-2 font-display text-[2.6rem] font-bold leading-[1.04] tracking-tight text-ink">
          {t("welcome.title1")}
          <br />
          <span className="text-gold-deep">{t("welcome.title2")}</span>
        </h1>
        <p className="mt-4 max-w-xs text-[15px] leading-relaxed text-ink-soft">{t("welcome.subtitle")}</p>
      </div>

      <div className="stagger mt-8 grid grid-cols-3 gap-3">
        {steps.map((s, i) => (
          <div
            key={i}
            style={{ "--i": i } as React.CSSProperties}
            className="rounded-card border border-line bg-surface px-2 pb-4 pt-3 text-center shadow-card"
          >
            <img src={s.art} alt="" aria-hidden className="mx-auto h-16 w-auto select-none" draggable={false} />
            <span className="mt-1.5 block font-display text-sm font-semibold text-ink">{s.title}</span>
            <span className="mt-1 block text-[11px] leading-snug text-ink-soft">{s.desc}</span>
          </div>
        ))}
      </div>

      <div className="mt-auto flex flex-col items-center gap-3 pt-8">
        <Link href="/" className="w-full">
          <PillButton className="w-full py-4 text-base">
            {t("welcome.getStarted")} <span aria-hidden>→</span>
          </PillButton>
        </Link>
        <p className="text-xs text-ink-soft/80">{t("welcome.noSeed")}</p>
      </div>

      <footer className="mt-10 flex flex-col items-center gap-1 border-t border-line pt-6 text-center">
        <p className="text-xs font-semibold text-ink-soft/70">{t("welcome.builtFor")}</p>
        <p className="text-[11px] font-medium text-ink-soft/60">{t("welcome.powered")}</p>
      </footer>
    </main>
  );
}
