"use client";

import { useEffect, useRef, useState } from "react";
import Link from "@/components/Link";
import { api } from "@/lib/client";
import { money, timeAgo } from "@/lib/format";
import { NOTIF_TYPES, EVENT_GLYPH, isToday } from "@/lib/activity";
import { useI18n } from "@/lib/i18n/provider";
import type { ActivityEvent } from "@/lib/types";

const PREVIEW_COUNT = 4;

// Bell -> a quick preview panel, not a full page jump. "See all" inside the
// panel is the only way into the full /notifications page.
export function NotificationsPopover() {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const [events, setEvents] = useState<ActivityEvent[] | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  // Fetch eagerly (not just on open) so the unread-style dot can show right away.
  useEffect(() => {
    let on = true;
    api
      .listActivity()
      .then((e) => on && setEvents(e.filter((x) => NOTIF_TYPES.has(x.type))))
      .catch(() => on && setEvents([]));
    return () => {
      on = false;
    };
  }, []);

  useEffect(() => {
    if (!open) return;
    function onDocClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const hasToday = !!events?.some((e) => isToday(e.at));
  const preview = (events ?? []).slice(0, PREVIEW_COUNT);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label={t("notif.title")}
        aria-expanded={open}
        className="relative flex h-10 w-10 items-center justify-center rounded-full bg-surface ring-1 ring-line transition hover:ring-gold active:scale-95"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <path d="M6 9a6 6 0 1112 0c0 5 2 6 2 6H4s2-1 2-6" stroke="#2B2622" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M10 20a2 2 0 004 0" stroke="#2B2622" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
        {hasToday && <span className="absolute right-1.5 top-1.5 h-2.5 w-2.5 rounded-full bg-gold ring-2 ring-surface" />}
      </button>

      {open && (
        <div
          role="dialog"
          aria-label={t("notif.title")}
          className="popover-in absolute right-0 top-12 z-40 w-80 max-w-[88vw] overflow-hidden rounded-card border border-line bg-surface shadow-card-lg"
        >
          <div className="px-4 pb-2 pt-3.5">
            <span className="font-display text-[15px] font-semibold text-ink">{t("notif.title")}</span>
          </div>

          {events === null ? (
            <div className="flex flex-col gap-2 px-4 pb-4">
              {[0, 1, 2].map((i) => (
                <div key={i} className="h-12 rounded-2xl bg-gold-soft/40 shimmer" />
              ))}
            </div>
          ) : preview.length === 0 ? (
            <p className="px-4 pb-4 text-sm font-medium text-ink-soft">{t("notif.empty")}</p>
          ) : (
            <div className="divide-y divide-line">
              {preview.map((e) => (
                <Link
                  key={e.id}
                  href={`/g/${e.goalSlug}`}
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3 px-4 py-2.5 transition-colors hover:bg-gold-soft/40"
                >
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gold-soft text-sm">
                    {EVENT_GLYPH[e.type]}
                  </span>
                  <p className="min-w-0 flex-1 truncate text-[13px] font-semibold text-ink">
                    {t(`ev.${e.type}`, {
                      actor: e.actor,
                      goal: e.goalName,
                      amount: e.amount != null ? money(e.amount) : "",
                    })}
                  </p>
                  <span className="shrink-0 text-[10.5px] font-bold text-ink-soft/70">{timeAgo(e.at)}</span>
                </Link>
              ))}
            </div>
          )}

          <Link
            href="/notifications"
            onClick={() => setOpen(false)}
            className="flex items-center justify-center gap-1 border-t border-line px-4 py-3 text-sm font-bold text-gold-deep transition-colors hover:bg-gold-soft/40"
          >
            {t("notif.seeAll")} <span aria-hidden>→</span>
          </Link>
        </div>
      )}
    </div>
  );
}
