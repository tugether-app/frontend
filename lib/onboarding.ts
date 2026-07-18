"use client";

const KEY = "tug_onboarded";

// Has this browser already seen the first-time tour? Checked once on the
// dashboard's first mount after signing in.
export function hasSeenTour(): boolean {
  if (typeof window === "undefined") return true;
  return window.localStorage.getItem(KEY) === "1";
}

export function markTourSeen() {
  if (typeof window !== "undefined") window.localStorage.setItem(KEY, "1");
}
