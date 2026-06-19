// Illustrated person avatar. Deterministic palette + hijab from the seed.
// Mirrors the av() generator in the UI reference.

type Palette = { bg: string; skin: string; hair: string; hijab?: boolean };

const PALETTES: Palette[] = [
  { bg: "#FDEBD2", skin: "#F0C49A", hair: "#3A2F28" },
  { bg: "#E7F2EC", skin: "#E8B88A", hair: "#2B2622" },
  { bg: "#FBE3DC", skin: "#F2C6A0", hair: "#E08A6E", hijab: true },
  { bg: "#F4ECDA", skin: "#B07A4E", hair: "#241B14" },
  { bg: "#EDE7F0", skin: "#EBC2A0", hair: "#4A3B30" },
  { bg: "#FCEFD0", skin: "#D9A77A", hair: "#1F1A16", hijab: true },
];

function pick(seed: string): Palette {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  return PALETTES[h % PALETTES.length];
}

export function Avatar({ seed, size = 48 }: { seed: string; size?: number }) {
  const p = pick(seed);
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" style={{ display: "block" }} aria-hidden>
      <circle cx="24" cy="24" r="24" fill={p.bg} />
      {p.hijab ? (
        <path d="M24 8c-9 0-13 7-13 14 0 6 4 10 4 14h18c0-4 4-8 4-14 0-7-4-14-13-14z" fill={p.hair} />
      ) : (
        <path
          d="M11 22c0-8 5-13 13-13s13 5 13 13c0 2-1 4-2 5 0-6-4-9-11-9s-11 3-11 9c-1-1-2-3-2-5z"
          fill={p.hair}
        />
      )}
      <circle cx="24" cy="25" r="11" fill={p.skin} />
      <circle cx="20" cy="24" r="1.7" fill="#2B2622" />
      <circle cx="28" cy="24" r="1.7" fill="#2B2622" />
      <path d="M21 29q3 2.6 6 0" stroke="#2B2622" strokeWidth="1.6" fill="none" strokeLinecap="round" />
      <circle cx="17.5" cy="27.5" r="2" fill="#F6B6A0" opacity="0.7" />
      <circle cx="30.5" cy="27.5" r="2" fill="#F6B6A0" opacity="0.7" />
    </svg>
  );
}
