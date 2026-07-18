"use client";

import Link from "@/components/Link";
import type { ActivityEvent } from "@/lib/types";
import { money, timeAgo } from "@/lib/format";
import { EVENT_GLYPH, groupEventsByDay } from "@/lib/activity";
import { useI18n } from "@/lib/i18n/provider";

// Grouped by day (Today, Yesterday, then real calendar dates) instead of one
// endless list or a same-day-only filter: each section is its own compact
// card with thin-divided rows, so history reads like a real timeline.
export function ActivityFeed({ events }: { events: ActivityEvent[] }) {
  const { t, lang } = useI18n();
  const groups = groupEventsByDay(events, lang);

  return (
    <div className="stagger flex flex-col gap-5">
      {groups.map((g, gi) => (
        <div key={g.kind === "date" ? g.dateLabel : g.kind} style={{ "--i": Math.min(gi, 6) } as React.CSSProperties}>
          <h3 className="mb-2 px-1 text-xs font-bold uppercase tracking-wide text-ink-soft">
            {g.kind === "today" ? t("date.today") : g.kind === "yesterday" ? t("date.yesterday") : g.dateLabel}
          </h3>
          <div className="divide-y divide-line overflow-hidden rounded-card border border-line bg-surface shadow-card">
            {g.events.map((e) => (
              <Link
                key={e.id}
                href={`/g/${e.goalSlug}`}
                className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-gold-soft/40"
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gold-soft">
                  {EVENT_GLYPH[e.type]}
                </span>
                <p className="min-w-0 flex-1 truncate text-[13.5px] font-semibold text-ink">
                  {t(`ev.${e.type}`, {
                    actor: e.actor,
                    goal: e.goalName,
                    amount: e.amount != null ? money(e.amount) : "",
                  })}
                </p>
                <span className="shrink-0 text-[11px] font-bold text-ink-soft/70">{timeAgo(e.at)}</span>
              </Link>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
