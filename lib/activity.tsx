import type { ActivityEvent, EventType } from "./types";

// Shared between the notifications popover, /notifications, and /activity so
// the "what counts as a notification" and "is this today" rules only live
// in one place. Icons are small line-SVGs (not OS emoji) so the feed reads
// as part of the app's own icon language instead of mismatched platform art.

export const NOTIF_TYPES = new Set<EventType>(["joined", "deposited", "reached", "withdrawn"]);

const iconProps = { width: 16, height: 16, viewBox: "0 0 24 24", fill: "none" as const };
const stroke = { stroke: "#E09A1E", strokeWidth: 1.9, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };

export const EVENT_GLYPH: Record<EventType, React.ReactNode> = {
  created: (
    <svg {...iconProps} aria-hidden>
      <circle cx="12" cy="12" r="8" {...stroke} />
      <circle cx="12" cy="12" r="3.5" {...stroke} />
    </svg>
  ),
  joined: (
    <svg {...iconProps} aria-hidden>
      <circle cx="10" cy="9" r="3.3" {...stroke} />
      <path d="M4 19c.6-3.4 3-5.3 6-5.3s5.4 1.9 6 5.3" {...stroke} />
      <path d="M17 8v5M14.5 10.5h5" {...stroke} />
    </svg>
  ),
  deposited: (
    <svg {...iconProps} aria-hidden>
      <circle cx="12" cy="12" r="8" {...stroke} />
      <path d="M9 12c0-1.4 1.3-2 3-2s3 .6 3 2-1.3 2-3 2-3 .6-3 2 1.3 2 3 2 3-.6 3-2" {...stroke} />
      <path d="M12 7v1.3M12 15.7V17" {...stroke} />
    </svg>
  ),
  reached: (
    <svg {...iconProps} aria-hidden>
      <path d="M12 3l2.2 4.6 5 .7-3.6 3.6.9 5-4.5-2.4-4.5 2.4.9-5-3.6-3.6 5-.7z" {...stroke} strokeLinejoin="round" />
    </svg>
  ),
  withdrawn: (
    <svg {...iconProps} aria-hidden>
      <circle cx="12" cy="12" r="8" {...stroke} />
      <path d="M8.5 12.5l2.3 2.3L15.5 10" {...stroke} />
    </svg>
  ),
};

export function isToday(iso: string): boolean {
  const d = new Date(iso);
  const now = new Date();
  return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth() && d.getDate() === now.getDate();
}

export function isYesterday(iso: string): boolean {
  const d = new Date(iso);
  const y = new Date();
  y.setDate(y.getDate() - 1);
  return d.getFullYear() === y.getFullYear() && d.getMonth() === y.getMonth() && d.getDate() === y.getDate();
}

export type DayGroup = { kind: "today" | "yesterday" | "date"; dateLabel?: string; events: ActivityEvent[] };

// Groups an already-newest-first event list into day sections: Today,
// Yesterday, then real calendar dates for everything older -- instead of a
// single "show everything" list or a same-day-only filter, both of which
// either ran on forever or hid history entirely.
export function groupEventsByDay(events: ActivityEvent[], locale: "en" | "id"): DayGroup[] {
  const order: string[] = [];
  const byDay = new Map<string, ActivityEvent[]>();
  for (const e of events) {
    const key = new Date(e.at).toDateString();
    if (!byDay.has(key)) {
      byDay.set(key, []);
      order.push(key);
    }
    byDay.get(key)!.push(e);
  }

  const thisYear = new Date().getFullYear();
  return order.map((key) => {
    const dayEvents = byDay.get(key)!;
    if (isToday(dayEvents[0].at)) return { kind: "today" as const, events: dayEvents };
    if (isYesterday(dayEvents[0].at)) return { kind: "yesterday" as const, events: dayEvents };
    const d = new Date(dayEvents[0].at);
    const dateLabel = d.toLocaleDateString(locale === "id" ? "id-ID" : "en-US", {
      month: "short",
      day: "numeric",
      year: d.getFullYear() !== thisYear ? "numeric" : undefined,
    });
    return { kind: "date" as const, dateLabel, events: dayEvents };
  });
}
