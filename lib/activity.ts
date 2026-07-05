import type { EventType } from "./types";

// Shared between the notifications popover, /notifications, and /activity so
// the "what counts as a notification" and "is this today" rules only live
// in one place.

export const NOTIF_TYPES = new Set<EventType>(["joined", "deposited", "reached", "withdrawn"]);

export const EVENT_GLYPH: Record<EventType, string> = {
  created: "🎯",
  joined: "👋",
  deposited: "🪙",
  reached: "🎉",
  withdrawn: "✅",
};

export function isToday(iso: string): boolean {
  const d = new Date(iso);
  const now = new Date();
  return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth() && d.getDate() === now.getDate();
}
