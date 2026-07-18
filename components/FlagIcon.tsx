"use client";

import { useId } from "react";

// Real SVG flags, not emoji. Windows has no color-flag glyph for regional
// indicator sequences and falls back to rendering the raw two-letter code
// ("GB", "ID") as plain text -- exactly what showed up in the language
// picker. This renders identically on every platform.

function GB({ size, radius }: { size: number; radius: number }) {
  const id = useId();
  return (
    <svg width={size} height={(size * 2) / 3} viewBox="0 0 30 20" aria-hidden>
      <clipPath id={id}>
        <rect width="30" height="20" rx={radius} />
      </clipPath>
      <g clipPath={`url(#${id})`}>
        <rect width="30" height="20" fill="#00247D" />
        <path d="M0 0L30 20M30 0L0 20" stroke="#FFF" strokeWidth="4" />
        <path d="M0 0L30 20M30 0L0 20" stroke="#CF142B" strokeWidth="2" />
        <path d="M15 0V20M0 10H30" stroke="#FFF" strokeWidth="6.5" />
        <path d="M15 0V20M0 10H30" stroke="#CF142B" strokeWidth="3.5" />
      </g>
    </svg>
  );
}

function ID({ size, radius }: { size: number; radius: number }) {
  const id = useId();
  return (
    <svg width={size} height={(size * 2) / 3} viewBox="0 0 30 20" aria-hidden>
      <clipPath id={id}>
        <rect width="30" height="20" rx={radius} />
      </clipPath>
      <g clipPath={`url(#${id})`}>
        <rect width="30" height="20" fill="#FFF" />
        <rect width="30" height="10" fill="#CE1126" />
      </g>
    </svg>
  );
}

const FLAGS = { gb: GB, id: ID };

export function FlagIcon({ code, size = 26, className = "" }: { code: keyof typeof FLAGS; size?: number; className?: string }) {
  const F = FLAGS[code];
  return (
    <span
      className={`inline-block shrink-0 overflow-hidden rounded-[4px] ring-1 ring-ink/10 ${className}`}
      style={{ width: size, height: (size * 2) / 3 }}
    >
      <F size={size} radius={0} />
    </span>
  );
}
