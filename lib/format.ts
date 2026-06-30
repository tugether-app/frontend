import type { Goal } from "./types";

// USD display for now. A later language/currency setting can swap this.
export function money(n: number): string {
  return "$" + Math.round(n).toLocaleString("en-US");
}

export function progressPct(goal: Pick<Goal, "collectedAmount" | "targetAmount">): number {
  if (goal.targetAmount <= 0) return 0;
  return Math.min(100, Math.round((goal.collectedAmount / goal.targetAmount) * 100));
}

export function shortAddr(addr?: string): string {
  if (!addr) return "";
  return addr.slice(0, 6) + "..." + addr.slice(-4);
}

// Deterministic warm color for an avatar from its seed.
export function avatarColor(seed: string): string {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) % 360;
  const hue = 20 + (h % 35); // warm range (gold/peach/coral)
  return `hsl(${hue} 80% 62%)`;
}

export function initials(name: string): string {
  const parts = name.trim().split(/\s+/);
  return (parts[0]?.[0] ?? "?").toUpperCase() + (parts[1]?.[0]?.toUpperCase() ?? "");
}

// Compact relative time: "now", "5m", "3h", "2d", "4w".
export function timeAgo(iso: string): string {
  const s = Math.max(0, (Date.now() - new Date(iso).getTime()) / 1000);
  if (s < 60) return "now";
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d}d`;
  return `${Math.floor(d / 7)}w`;
}
