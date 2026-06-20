"use client";

import { useEffect, useRef, useState } from "react";
import { money } from "@/lib/format";

// Animated money counter. Tweens from the previous value to the new one so a
// deposit feels like the total is climbing. Respects reduced-motion.
export function CountUp({ value, className }: { value: number; className?: string }) {
  const [display, setDisplay] = useState(value);
  const from = useRef(value);

  useEffect(() => {
    const reduce =
      typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    const start = from.current;
    const end = value;
    if (reduce || start === end) {
      setDisplay(end);
      from.current = end;
      return;
    }
    const t0 = performance.now();
    const dur = 700;
    let raf = 0;
    const tick = (t: number) => {
      const p = Math.min(1, (t - t0) / dur);
      const eased = 1 - Math.pow(1 - p, 3);
      setDisplay(Math.round(start + (end - start) * eased));
      if (p < 1) raf = requestAnimationFrame(tick);
      else from.current = end;
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value]);

  return <span className={className}>{money(display)}</span>;
}
