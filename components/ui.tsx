// Shared UI primitives for the warm white/gold theme.
// Buttons are chunky "candy" 3D: a solid gold-deep base edge that the button
// presses into on active. Matches the UI reference.

import type { ButtonHTMLAttributes, ReactNode } from "react";

type PillVariant = "gold" | "light" | "ghost";

const base =
  "relative inline-flex items-center justify-center gap-2 rounded-btn font-display font-semibold will-change-transform transition-[transform,box-shadow,background-color,border-color] duration-150 ease-[cubic-bezier(0.22,1,0.36,1)] disabled:cursor-not-allowed";

const variants: Record<PillVariant, string> = {
  // Primary gold, ink text, 3D base. Identity color, never swap.
  gold: "bg-gold text-ink shadow-candy active:translate-y-[3px] active:shadow-candy-active disabled:bg-[#F1ECE2] disabled:text-[#BCB4A8] disabled:shadow-none disabled:translate-y-0",
  // Secondary: white, soft border, gold-deep text.
  light:
    "bg-surface text-gold-deep ring-[1.5px] ring-line hover:ring-gold active:translate-y-[2px] disabled:opacity-50",
  ghost: "bg-transparent text-ink-soft hover:text-ink",
};

export function Spinner({ className = "" }: { className?: string }) {
  return (
    <span
      className={`inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent ${className}`}
      aria-hidden
    />
  );
}

export function PillButton({
  variant = "gold",
  loading = false,
  className = "",
  children,
  disabled,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: PillVariant;
  loading?: boolean;
}) {
  return (
    <button
      disabled={disabled || loading}
      aria-busy={loading}
      className={`${base} px-7 py-3.5 text-[17px] ${variants[variant]} ${className}`}
      {...props}
    >
      <span className={`inline-flex items-center gap-2 ${loading ? "invisible" : ""}`}>
        {children}
      </span>
      {loading && (
        <span className="absolute inset-0 flex items-center justify-center">
          <Spinner />
        </span>
      )}
    </button>
  );
}

// Selectable amount/filter chip (e.g. Rp 50rb). Gold when active.
export function Chip({
  active = false,
  className = "",
  children,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { active?: boolean }) {
  return (
    <button
      className={`inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-bold transition-[transform,background-color] duration-150 active:scale-[0.94] ${
        active ? "bg-gold text-ink" : "bg-gold-soft text-gold-deep hover:bg-gold/30"
      } ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

export function Badge({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full bg-surface px-3 py-1.5 text-[12px] font-bold text-ink ring-1 ring-line shadow-soft ${className}`}
    >
      {children}
    </span>
  );
}

// White rounded card surface.
export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div className={`rounded-card border border-line bg-surface shadow-card ${className}`}>
      {children}
    </div>
  );
}
