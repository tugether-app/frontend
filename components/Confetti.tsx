"use client";

// Gold/success confetti burst. Mount when a goal hits its target.

const COLORS = ["#F4B740", "#E09A1E", "#FFD36B", "#3FB984", "#F6B6A0"];

export function Confetti({ count = 70 }: { count?: number }) {
  const pieces = Array.from({ length: count }, (_, i) => {
    const left = (i * 137.5) % 100; // golden-angle spread, deterministic
    const delay = (i % 10) * 0.12;
    const duration = 2.4 + ((i * 7) % 18) / 10;
    const w = 6 + (i % 4) * 2;
    const color = COLORS[i % COLORS.length];
    return (
      <span
        key={i}
        className="confetti-piece"
        style={{
          left: `${left}%`,
          width: w,
          height: w * 1.6,
          background: color,
          animationDelay: `${delay}s`,
          animationDuration: `${duration}s`,
        }}
      />
    );
  });

  return (
    <div className="pointer-events-none fixed inset-0 z-40 overflow-hidden" aria-hidden>
      {pieces}
    </div>
  );
}
