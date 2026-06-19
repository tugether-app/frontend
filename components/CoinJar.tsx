"use client";

import { useEffect, useRef, useState } from "react";

// Signature object. A white piggy jar that fills with gold heart-coins by
// progress, and changes expression as it fills. Pure SVG so it renders before
// any generated art exists.

export type JarFace = "neutral" | "happy" | "excited" | "celebrate";

export function faceForFill(fill: number): JarFace {
  if (fill >= 100) return "celebrate";
  if (fill >= 80) return "excited";
  if (fill >= 1) return "happy";
  return "neutral";
}

export function CoinJar({
  pct,
  size = 240,
  face,
  sparkles,
  className = "",
}: {
  pct: number; // 0..100
  size?: number;
  face?: JarFace;
  sparkles?: boolean;
  className?: string;
}) {
  const clamped = Math.max(0, Math.min(100, pct));
  const mood = face ?? faceForFill(clamped);
  const showSparkles = sparkles ?? mood === "celebrate";

  const [bump, setBump] = useState(false);
  const [showCoin, setShowCoin] = useState(false);
  const prev = useRef(clamped);

  // When progress increases, drop a coin + bump the jar.
  useEffect(() => {
    if (clamped > prev.current) {
      setShowCoin(true);
      setBump(true);
      const t1 = setTimeout(() => setShowCoin(false), 900);
      const t2 = setTimeout(() => setBump(false), 520);
      prev.current = clamped;
      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
      };
    }
    prev.current = clamped;
  }, [clamped]);

  // Inner cavity coordinates (viewBox 0 0 200 224).
  const cavityTop = 80;
  const cavityBottom = 198;
  const cavityH = cavityBottom - cavityTop;
  const fillY = cavityBottom - (cavityH * clamped) / 100;

  return (
    <div
      className={`relative inline-block ${className}`}
      style={{ width: size, height: size * 1.12 }}
      role="img"
      aria-label={`Jar filled ${clamped} percent`}
    >
      {showCoin && (
        <div className="coin-drop pointer-events-none absolute left-1/2 top-0 z-20 -translate-x-1/2">
          <Coin size={size * 0.17} />
        </div>
      )}

      <svg viewBox="0 0 200 224" width={size} height={size * 1.12} className={bump ? "jar-bump" : ""}>
        <defs>
          <linearGradient id="tugGold" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#FFD976" />
            <stop offset="100%" stopColor="#E09A1E" />
          </linearGradient>
          <linearGradient id="tugGlass" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="100%" stopColor="#FBF6EC" />
          </linearGradient>
          <clipPath id="tugCavity">
            <path d="M40 80 Q40 72 48 72 L152 72 Q160 72 160 80 L160 190 Q160 202 148 202 L52 202 Q40 202 40 190 Z" />
          </clipPath>
        </defs>

        {/* Feet */}
        <ellipse cx="64" cy="207" rx="12" ry="9" fill="#F4B740" />
        <ellipse cx="136" cy="207" rx="12" ry="9" fill="#F4B740" />

        {/* Jar body */}
        <path
          d="M34 82 Q34 62 54 60 L146 60 Q166 62 166 82 L166 188 Q166 208 146 208 L54 208 Q34 208 34 188 Z"
          fill="url(#tugGlass)"
          stroke="#ECE7DE"
          strokeWidth="3"
        />

        {/* Coin fill (clipped to cavity) */}
        <g clipPath="url(#tugCavity)" className={clamped > 0 ? "fill-rise" : ""}>
          <rect x="34" y={fillY} width="132" height={cavityBottom - fillY + 8} fill="url(#tugGold)" />
          {/* Inner bottom shadow for depth */}
          <ellipse cx="100" cy={cavityBottom} rx="70" ry="22" fill="#C9821A" opacity="0.45" />
          {clamped > 5 && (
            <>
              {/* Meniscus: a lighter band at the coin surface */}
              <ellipse cx="100" cy={fillY + 2} rx="66" ry="9" fill="#FFE39A" opacity="0.9" />
              <CoinSurface y={fillY} dense={clamped > 45} />
            </>
          )}
        </g>

        {/* Glass body highlight (soft blob, top-left) */}
        <path
          d="M52 74 Q44 110 50 158"
          stroke="#FFFFFF"
          strokeWidth="8"
          strokeLinecap="round"
          opacity="0.75"
          fill="none"
        />
        <ellipse cx="68" cy="92" rx="9" ry="16" fill="#FFFFFF" opacity="0.5" transform="rotate(-18 68 92)" />

        {/* Rim / opening */}
        <ellipse cx="100" cy="60" rx="44" ry="13" fill="#FBF6EC" stroke="#ECE7DE" strokeWidth="3" />
        <ellipse cx="100" cy="58" rx="31" ry="7.5" fill="#2B2622" opacity="0.85" />

        {/* Face */}
        <Face mood={mood} />

        {/* Celebration sparkles */}
        {showSparkles && (
          <g stroke="#F4B740" strokeWidth="4" strokeLinecap="round">
            <line x1="150" y1="42" x2="159" y2="33" />
            <line x1="162" y1="52" x2="173" y2="50" />
            <line x1="150" y1="62" x2="159" y2="66" />
            <line x1="42" y1="46" x2="33" y2="38" />
          </g>
        )}
      </svg>
    </div>
  );
}

// Heart-coins stacked at the fill surface. A second row appears once the jar
// is reasonably full, so it reads as a real coin pile.
function CoinSurface({ y, dense }: { y: number; dense?: boolean }) {
  const top = [
    { cx: 68, dy: 8 },
    { cx: 100, dy: 3 },
    { cx: 132, dy: 8 },
  ];
  const lower = [
    { cx: 84, dy: 17 },
    { cx: 116, dy: 17 },
    { cx: 100, dy: 26 },
  ];
  const coins = dense ? [...lower, ...top] : top; // draw lower first (behind)
  return (
    <>
      {coins.map((c, i) => (
        <g key={`${c.cx}-${c.dy}`} transform={`translate(${c.cx}, ${y + c.dy})`}>
          <circle r="9.5" fill={i % 2 ? "#FFE39A" : "#FFD976"} stroke="#E09A1E" strokeWidth="2" />
          <circle cx="-3" cy="-3" r="2.4" fill="#FFFFFF" opacity="0.6" />
          <path d="M0 -3 c-2 -2.6 -6 -0.6 -6 2.4 c0 2.6 3.4 4.6 6 6.4 c2.6 -1.8 6 -3.8 6 -6.4 c0 -3 -4 -5 -6 -2.4 Z" fill="#E09A1E" />
        </g>
      ))}
    </>
  );
}

function Face({ mood }: { mood: JarFace }) {
  const blush = (
    <>
      <ellipse cx="74" cy="106" rx="6.5" ry="4" fill="#F6B6A0" opacity="0.85" />
      <ellipse cx="126" cy="106" rx="6.5" ry="4" fill="#F6B6A0" opacity="0.85" />
    </>
  );
  return (
    <g transform="translate(0,6)">
      {mood === "celebrate" || mood === "excited" ? (
        // Sparkly star-ish happy eyes (filled with a small highlight).
        <>
          <circle cx="84" cy="96" r="5.5" fill="#2B2622" />
          <circle cx="116" cy="96" r="5.5" fill="#2B2622" />
          <circle cx="86" cy="94" r="1.7" fill="#fff" />
          <circle cx="118" cy="94" r="1.7" fill="#fff" />
        </>
      ) : (
        <>
          <circle cx="84" cy="96" r="4.5" fill="#2B2622" />
          <circle cx="116" cy="96" r="4.5" fill="#2B2622" />
          <circle cx="85.5" cy="94.5" r="1.3" fill="#fff" />
          <circle cx="117.5" cy="94.5" r="1.3" fill="#fff" />
        </>
      )}
      {blush}
      {mood === "neutral" && (
        <path d="M92 106 Q100 109 108 106" stroke="#2B2622" strokeWidth="3" strokeLinecap="round" fill="none" />
      )}
      {mood === "happy" && (
        <path d="M90 104 Q100 112 110 104" stroke="#2B2622" strokeWidth="3" strokeLinecap="round" fill="none" />
      )}
      {(mood === "excited" || mood === "celebrate") && (
        // Open happy mouth.
        <path d="M89 104 Q100 118 111 104 Q100 110 89 104 Z" fill="#2B2622" />
      )}
    </g>
  );
}

function Coin({ size = 36 }: { size?: number }) {
  return (
    <svg viewBox="0 0 40 40" width={size} height={size}>
      <circle cx="20" cy="20" r="18" fill="#FFD976" stroke="#E09A1E" strokeWidth="3" />
      <path
        d="M20 13 c-3 -4 -9 -1 -9 4 c0 4 5 7 9 10 c4 -3 9 -6 9 -10 c0 -5 -6 -8 -9 -4 Z"
        fill="#E09A1E"
      />
    </svg>
  );
}
