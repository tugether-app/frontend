"use client";
/* eslint-disable @next/next/no-img-element */

import { BackButton } from "@/components/BackButton";
import { RequireAuth } from "@/components/RequireAuth";
import { ActivityFeed } from "@/components/ActivityFeed";
import { api } from "@/lib/client";
import { NOTIF_TYPES } from "@/lib/activity";
import { useCachedFetch } from "@/lib/useCachedFetch";
import { useI18n } from "@/lib/i18n/provider";

export default function NotificationsPage() {
  return (
    <RequireAuth>
      <NotificationsView />
    </RequireAuth>
  );
}

function NotificationsView() {
  const { t } = useI18n();
  // Same cache key as /activity: same underlying fetch, just filtered here,
  // so visiting either page warms the other too.
  const allEvents = useCachedFetch("activity:all", () => api.listActivity());
  const events = allEvents?.filter((x) => NOTIF_TYPES.has(x.type)) ?? null;

  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col px-6 pb-10 pt-6">
      <header className="flex items-center gap-3">
        <BackButton fallback="/" />
        <span className="font-display text-lg font-semibold text-ink">{t("notif.title")}</span>
      </header>

      {events === null ? (
        <div className="mt-6 flex flex-col gap-2">
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
      ) : (
        <div className="mt-6">
          <ActivityFeed events={events} />
        </div>
      )}
    </main>
  );
}
