"use client";
/* eslint-disable @next/next/no-img-element */

import { useEffect, useState } from "react";
import { BackButton } from "@/components/BackButton";
import { BottomNav } from "@/components/BottomNav";
import { RequireAuth } from "@/components/RequireAuth";
import { ActivityFeed } from "@/components/ActivityFeed";
import { api } from "@/lib/client";
import { useI18n } from "@/lib/i18n/provider";
import type { ActivityEvent } from "@/lib/types";

// Notifications = the milestone/social subset of the activity feed.
const NOTIF_TYPES = new Set(["joined", "deposited", "reached", "withdrawn"]);

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

  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col px-6 pb-28 pt-6">
      <header className="flex items-center gap-3">
        <BackButton fallback="/" />
        <span className="font-display text-lg font-semibold text-ink">{t("notif.title")}</span>
      </header>

      {events === null ? (
        <div className="mt-6 flex flex-col gap-2">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-16 rounded-card bg-gold-soft/40 shimmer" />
          ))}
        </div>
      ) : events.length === 0 ? (
        <div className="mt-12 flex flex-col items-center text-center">
          <img src="/art/state/empty-notification.png" alt="" aria-hidden className="h-44 w-auto select-none" draggable={false} />
          <p className="mt-3 font-display text-xl font-semibold text-ink">{t("notif.empty")}</p>
          <p className="mt-2 max-w-xs text-sm font-medium text-ink-soft">{t("notif.emptyHint")}</p>
        </div>
      ) : (
        <ActivityFeed events={events} />
      )}

      <BottomNav />
    </main>
  );
}
