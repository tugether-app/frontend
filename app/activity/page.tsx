"use client";
/* eslint-disable @next/next/no-img-element */

import { BackButton } from "@/components/BackButton";
import { RequireAuth } from "@/components/RequireAuth";
import { ActivityFeed } from "@/components/ActivityFeed";
import { api } from "@/lib/client";
import { useCachedFetch } from "@/lib/useCachedFetch";
import { useI18n } from "@/lib/i18n/provider";

export default function ActivityPage() {
  return (
    <RequireAuth>
      <ActivityView />
    </RequireAuth>
  );
}

function ActivityView() {
  const { t } = useI18n();
  const events = useCachedFetch("activity:all", () => api.listActivity());

  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col px-6 pb-10 pt-6">
      <header className="flex items-center gap-3">
        <BackButton fallback="/profile" />
        <span className="font-display text-lg font-semibold text-ink">{t("activity.title")}</span>
      </header>

      {events === null ? (
        <div className="mt-6 flex flex-col gap-2">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="h-14 rounded-2xl bg-gold-soft/40 shimmer" />
          ))}
        </div>
      ) : events.length === 0 ? (
        <div className="mt-10 flex flex-col items-center text-center">
          <img src="/art/state/empty-history.png" alt="" aria-hidden className="h-40 w-auto select-none" draggable={false} />
          <p className="mt-3 font-display text-xl font-semibold text-ink">{t("activity.empty")}</p>
          <p className="mt-2 max-w-xs text-sm font-medium text-ink-soft">{t("activity.emptyHint")}</p>
        </div>
      ) : (
        <div className="mt-6">
          <ActivityFeed events={events} />
        </div>
      )}
    </main>
  );
}
