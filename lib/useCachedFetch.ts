"use client";

import { useEffect, useRef, useState } from "react";

// Every list page (dashboard, goals, activity, notifications) fetched fresh
// on every single mount: navigate away and back, and the component's state
// resets to null, so a skeleton flashes again even for data you just saw
// ten seconds ago. That's what made switching pages feel like it was always
// "loading" -- there was no memory between visits.
//
// This is a tiny stale-while-revalidate cache: a module-level Map (outside
// React state, so it survives unmount/remount across navigations). If a key
// is already cached, the hook returns that data on the very first render --
// no skeleton -- while a fresh fetch runs quietly in the background and
// swaps in once it resolves. First-ever visit to a key still shows the
// loading state, exactly once.
const cache = new Map<string, unknown>();

export function useCachedFetch<T>(key: string, fetcher: () => Promise<T>): T | null {
  const [data, setData] = useState<T | null>(() => (cache.has(key) ? (cache.get(key) as T) : null));
  const fetcherRef = useRef(fetcher);
  fetcherRef.current = fetcher;

  useEffect(() => {
    let on = true;
    // Seed from cache immediately if this effect fires for a key we already
    // have (e.g. key changed, like a different goal slug).
    if (cache.has(key)) setData(cache.get(key) as T);

    fetcherRef.current()
      .then((result) => {
        if (!on) return;
        cache.set(key, result);
        setData(result);
      })
      .catch(() => {
        // Transient error: keep showing whatever we already have (cached or
        // null) rather than blanking the screen.
      });
    return () => {
      on = false;
    };
  }, [key]);

  return data;
}

export function invalidateCache(key: string) {
  cache.delete(key);
}
