"use client";

// Per-browser demo identity, persisted in localStorage so a refresh keeps you
// as the same member (deposits + "joined" state survive reloads). Stands in for
// the Magic login until the SDK is wired.

export interface Identity {
  addr: string;
  name: string;
  seed: string;
}

const KEY = "tug_identity";

function randomAddr(): string {
  let hex = "";
  for (let i = 0; i < 40; i++) hex += Math.floor(Math.random() * 16).toString(16);
  return "0x" + hex;
}

// Read or create the identity. Call inside useEffect (client only) to avoid
// SSR/hydration mismatch.
export function getIdentity(): Identity {
  if (typeof window === "undefined") return { addr: "", name: "You", seed: "you" };
  const raw = window.localStorage.getItem(KEY);
  if (raw) {
    try {
      return JSON.parse(raw) as Identity;
    } catch {
      /* fall through to recreate */
    }
  }
  const addr = randomAddr();
  const id: Identity = { addr, name: "You", seed: addr };
  window.localStorage.setItem(KEY, JSON.stringify(id));
  return id;
}
