"use client";

import { useEffect, useRef, useState } from "react";

// Signature object. A white piggy jar that fills with gold coins by progress.
// Pure SVG so it renders before any generated art exists. A generated jar PNG
// can later replace the <JarBody> art while keeping the fill + face logic.

export function CoinJar({
  pct,
  size = 240,
  reached = false,
  className = "",
}: {
  pct: number; // 0..100
  size?: number;
  reached?: boolean;
  className?: string;
}) {
  const clamped = Math.max(0, Math.min(100, pct));
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

  // Inner cavity coordinates (viewBox 0 0 200 220).
  const cavityTop = 78;
  const cavityBottom = 196;
  const cavityH = cavityBottom - cavityTop;
  const fillY = cavityBottom - (cavityH * clamped) / 100;

  return (
    <div
      className={`relative inline-block ${className}`}
      style={{ width: size, height: size * 1.1 }}
      role="img"
      aria-label={`Celengan terisi ${clamped} persen`}
    >
      {/* Dropping coin */}
      {showCoin && (
        <div className="coin-drop pointer-events-none absolute left-1/2 top-0 z-20 -translate-x-1/2">
          <Coin size={size * 0.16} />
        </div>
      )}

      <svg
        viewBox="0 0 200 220"
        width={size}
        height={size * 1.1}
        className={bump ? "jar-bump" : ""}
      >
        <defs>
          <linearGradient id="goldFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#FFD36B" />
            <stop offset="100%" stopColor="#E09A1E" />
          </linearGradient>
          <linearGradient id="glass" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="100%" stopColor="#FBF6EC" />
          </linearGradient>
          {/* Clip the coin fill to the jar cavity. */}
          <clipPath id="cavity">
            <path d="M40 78 Q40 70 48 70 L152 70 Q160 70 160 78 L160 188 Q160 200 148 200 L52 200 Q40 200 40 188 Z" />
          </clipPath>
        </defs>

        {/* Feet */}
        <ellipse cx="62" cy="205" rx="12" ry="9" fill="#F4B740" />
        <ellipse cx="138" cy="205" rx="12" ry="9" fill="#F4B740" />

        {/* Jar body (white glass) */}
        <path
          d="M34 80 Q34 60 54 58 L146 58 Q166 60 166 80 L166 186 Q166 206 146 206 L54 206 Q34 206 34 186 Z"
          fill="url(#glass)"
          stroke="#ECE7DE"
          strokeWidth="3"
        />

        {/* Coin fill (clipped) */}
        <g clipPath="url(#cavity)">
          <rect
            className="fill-rise"
            x="34"
            y={fillY}
            width="132"
            height={cavityBottom - fillY + 6}
            fill="url(#goldFill)"
          />
          {/* A couple coins peeking at the surface */}
          {clamped > 6 && (
            <>
              <circle cx="70" cy={fillY + 8} r="9" fill="#FFD36B" stroke="#E09A1E" strokeWidth="2" />
              <circle cx="100" cy={fillY + 4} r="9" fill="#FFE39A" stroke="#E09A1E" strokeWidth="2" />
              <circle cx="130" cy={fillY + 9} r="9" fill="#FFD36B" stroke="#E09A1E" strokeWidth="2" />
            </>
          )}
        </g>

        {/* Glass sheen */}
        <path d="M50 70 Q44 120 52 180" stroke="#FFFFFF" strokeWidth="6" strokeLinecap="round" opacity="0.7" fill="none" />

        {/* Rim / opening */}
        <ellipse cx="100" cy="58" rx="42" ry="12" fill="#FBF6EC" stroke="#ECE7DE" strokeWidth="3" />
        <ellipse cx="100" cy="56" rx="30" ry="7" fill="#2B2622" opacity="0.85" />

        {/* Face (upper body, always visible) */}
        <g transform="translate(0,4)">
          <circle cx="84" cy="96" r="4.5" fill="#2B2622" />
          <circle cx="116" cy="96" r="4.5" fill="#2B2622" />
          <circle cx="85.5" cy="94.5" r="1.3" fill="#fff" />
          <circle cx="117.5" cy="94.5" r="1.3" fill="#fff" />
          <ellipse cx="74" cy="104" rx="6" ry="3.5" fill="#F6B6A0" opacity="0.8" />
          <ellipse cx="126" cy="104" rx="6" ry="3.5" fill="#F6B6A0" opacity="0.8" />
          <path
            d="M90 104 Q100 112 110 104"
            stroke="#2B2622"
            strokeWidth="3"
            strokeLinecap="round"
            fill="none"
          />
        </g>

        {/* Celebration sparks when reached */}
        {reached && (
          <g stroke="#F4B740" strokeWidth="4" strokeLinecap="round">
            <line x1="150" y1="40" x2="158" y2="32" />
            <line x1="160" y1="50" x2="170" y2="48" />
            <line x1="150" y1="58" x2="158" y2="62" />
          </g>
        )}
      </svg>
    </div>
  );
}

function Coin({ size = 36 }: { size?: number }) {
  return (
    <svg viewBox="0 0 40 40" width={size} height={size}>
      <circle cx="20" cy="20" r="18" fill="#FFD36B" stroke="#E09A1E" strokeWidth="3" />
      <path
        d="M20 14 c-3 -4 -9 -1 -9 4 c0 4 5 7 9 10 c4 -3 9 -6 9 -10 c0 -5 -6 -8 -9 -4 Z"
        fill="#E09A1E"
      />
    </svg>
  );
}
