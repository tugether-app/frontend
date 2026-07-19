"use client";

import { useLayoutEffect, useState } from "react";

// Plain CSS `animation` on mount gets swallowed by the View Transitions API
// (see lib/viewTransition.ts): the browser can capture the "after" snapshot
// while the animation is already mid-flight or finished, so nothing visible
// ever plays. This drives the motion off a `transition` instead, toggled
// here -- but starts at `true` (settled/visible) so the server-rendered HTML
// and the very first hydration paint always show the final, correct state.
// That's the safe fallback if JS is slow or never runs (e.g. a bad mobile
// connection): the element just sits in place, exactly like before any
// animation existed. Only once React has hydrated does useLayoutEffect (it
// runs before the browser paints) flip to the "start" position for one
// frame, then a rAF flips it back -- so the transition genuinely plays,
// without ever risking an invisible/off-screen flash.
export function useEnter(): boolean {
  const [entered, setEntered] = useState(true);

  useLayoutEffect(() => {
    setEntered(false);
    const raf = requestAnimationFrame(() => setEntered(true));
    return () => cancelAnimationFrame(raf);
  }, []);

  return entered;
}
