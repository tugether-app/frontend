// Gold progress ring with the percentage at center. Pairs with the coin jar.

export function ProgressRing({
  pct,
  size = 72,
  stroke = 8,
  showLabel = true,
}: {
  pct: number;
  size?: number;
  stroke?: number;
  showLabel?: boolean;
}) {
  const clamped = Math.max(0, Math.min(100, pct));
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const offset = c - (clamped / 100) * c;

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#FDF3DC" strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="#F4B740"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 0.8s cubic-bezier(0.22,1,0.36,1)" }}
        />
      </svg>
      {showLabel && (
        <span
          className="absolute font-display font-bold text-gold-deep"
          style={{ fontSize: size * 0.26 }}
        >
          {clamped}%
        </span>
      )}
    </div>
  );
}
