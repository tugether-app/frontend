// Small inline jar mark for headers / nav. Mirrors the app icon at a glance.

export function BrandIcon({ size = 32 }: { size?: number }) {
  return (
    <svg viewBox="0 0 40 40" width={size} height={size} aria-hidden>
      <ellipse cx="14" cy="37" rx="3" ry="2" fill="#F4B740" />
      <ellipse cx="26" cy="37" rx="3" ry="2" fill="#F4B740" />
      <path
        d="M8 16 Q8 11 13 10 L27 10 Q32 11 32 16 L32 33 Q32 38 27 38 L13 38 Q8 38 8 33 Z"
        fill="#FFFFFF"
        stroke="#ECE7DE"
        strokeWidth="2"
      />
      <path d="M8 26 L32 26 L32 33 Q32 38 27 38 L13 38 Q8 38 8 33 Z" fill="#F4B740" opacity="0.9" />
      <ellipse cx="20" cy="10" rx="9" ry="3" fill="#FBF6EC" stroke="#ECE7DE" strokeWidth="2" />
      <ellipse cx="20" cy="9.5" rx="6" ry="1.6" fill="#2B2622" opacity="0.85" />
      <circle cx="16" cy="19" r="1.6" fill="#2B2622" />
      <circle cx="24" cy="19" r="1.6" fill="#2B2622" />
      <path d="M17 21.5 Q20 24 23 21.5" stroke="#2B2622" strokeWidth="1.6" strokeLinecap="round" fill="none" />
    </svg>
  );
}

// Brand lockup: the real app icon + wordmark.
export function WordMark({ size = 30 }: { size?: number }) {
  return (
    <span className="inline-flex items-center gap-2">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/icon-192.png"
        alt="Tugether"
        width={size}
        height={size}
        className="rounded-[9px] shadow-sm ring-1 ring-line"
        draggable={false}
      />
      <span className="font-display text-lg font-bold tracking-tight text-ink">tugether</span>
    </span>
  );
}
