"use client";

// User-chosen avatar, persisted per browser. Avatar's palette is picked by
// hashing a seed string; single-digit seeds "0".."5" hash to charCode % 6,
// landing exactly on each of Avatar's 6 palettes in order, so these presets
// deterministically cover every distinct look with zero guesswork.
export const AVATAR_PRESETS = ["0", "1", "2", "3", "4", "5"] as const;

const KEY = "tug_avatar_seed";

export function getAvatarPref(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(KEY);
}

export function setAvatarPref(seed: string) {
  if (typeof window !== "undefined") window.localStorage.setItem(KEY, seed);
}
