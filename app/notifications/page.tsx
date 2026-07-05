"use client";
/* eslint-disable @next/next/no-img-element */

import { useEffect, useMemo, useState } from "react";
import { BackButton } from "@/components/BackButton";
import { BottomNav } from "@/components/BottomNav";
import { RequireAuth } from "@/components/RequireAuth";
import { ActivityFeed } from "@/components/ActivityFeed";
import { Chip } from "@/components/ui";
import { api } from "@/lib/client";
import { NOTIF_TYPES, isToday } from "@/lib/activity";
import { useI18n } from "@/lib/i18n/provider";
import type { ActivityEvent } from "@/lib/types";

type Filter = "all" | "today";

export default function NotificationsPage() {
  return (
    <RequireAuth>
      <NotificationsView />
    </RequireAuth>
  );
}

function NotificationsView() {
  const { t } = useI18n();
  const [events, setEvents] = useState<ActivityEvent[] | null>(null);
  const [filter, setFilter] = useState<Filter>("all");

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

  const filtered = useMemo(() => {
    if (!events) return null;
    return filter === "today" ? events.filter((e) => isToday(e.at)) : events;
  }, [events, filter]);

  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col px-6 pb-28 pt-6">
      <header className="flex items-center gap-3">
        <BackButton fallback="/" />
        <span className="font-display text-lg font-semibold text-ink">{t("notif.title")}</span>
      </header>

      {events !== null && events.length > 0 && (
        <div className="mt-5 flex gap-2">
          <Chip active={filter === "all"} onClick={() => setFilter("all")}>
            {t("filter.all")}
          </Chip>
          <Chip active={filter === "today"} onClick={() => setFilter("today")}>
            {t("filter.today")}
          </Chip>
        </div>
      )}

      {events === null ? (
        <div className="mt-5 flex flex-col gap-2">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-14 rounded-2xl bg-gold-soft/40 shimmer" />
          ))}
        </div>
      ) : events.length === 0 ? (
        <div className="mt-10 flex flex-col items-center text-center">
          <img src="/art/state/empty-notification.png" alt="" aria-hidden className="h-40 w-auto select-none" draggable={false} />
          <p className="mt-3 font-display text-xl font-semibold text-ink">{t("notif.empty")}</p>
          <p className="mt-2 max-w-xs text-sm font-medium text-ink-soft">{t("notif.emptyHint")}</p>
        </div>
      ) : filtered && filtered.length === 0 ? (
        <p className="mt-8 text-center text-sm font-medium text-ink-soft">{t("notif.emptyToday")}</p>
      ) : (
        filtered && <div className="mt-5"><ActivityFeed events={filtered} /></div>
      )}

      <BottomNav />
    </main>
  );
}
