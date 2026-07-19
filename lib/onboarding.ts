"use client";

const KEY = "tug_onboarded";
const SESSION_KEY = "tug_tour_shown";

// Has this browser already seen the first-time tour (permanently dismissed
// via the "don't show this again" checkbox), or already shown it once this
// tab session (so navigating home -> create -> home doesn't reopen it)?
export function hasSeenTour(): boolean {
  if (typeof window === "undefined") return true;
  if (window.localStorage.getItem(KEY) === "1") return true;
  return window.sessionStorage.getItem(SESSION_KEY) === "1";
}

// Call the moment the tour is shown, so it won't reopen again this tab
// session even if the user navigates away before dismissing it.
export function markTourShownThisSession() {
  if (typeof window !== "undefined") window.sessionStorage.setItem(SESSION_KEY, "1");
}

export function markTourSeen() {
  if (typeof window !== "undefined") window.localStorage.setItem(KEY, "1");
}
