// Shared UI primitives for the warm white/gold theme.
// Buttons are chunky "candy" 3D: a solid gold-deep base edge that the button
// presses into on active. Matches the UI reference.

import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";

type PillVariant = "gold" | "light" | "ghost" | "danger";

const base =
  "relative inline-flex items-center justify-center gap-2 rounded-btn font-display font-semibold will-change-transform transition-[transform,box-shadow,background-color,border-color] duration-150 ease-[cubic-bezier(0.22,1,0.36,1)] disabled:cursor-not-allowed";

const variants: Record<PillVariant, string> = {
  // Primary gold, ink text, 3D base. Identity color, never swap.
  gold: "bg-gold text-ink shadow-candy active:translate-y-[3px] active:shadow-candy-active disabled:bg-[#F1ECE2] disabled:text-[#BCB4A8] disabled:shadow-none disabled:translate-y-0",
  // Secondary: white, soft border, gold-deep text.
  light:
    "bg-surface text-gold-deep ring-[1.5px] ring-line hover:ring-gold active:translate-y-[2px] disabled:opacity-50",
  ghost: "bg-transparent text-ink-soft hover:text-ink",
  // Same chunky 3D "candy" language as gold, in the error red -- for
  // destructive confirmations (sign out, delete, etc).
  danger:
    "bg-error text-white shadow-[0_5px_0_#B8362D,0_8px_18px_rgba(226,87,76,0.25)] active:translate-y-[3px] active:shadow-[0_2px_0_#B8362D] disabled:bg-[#F1ECE2] disabled:text-[#BCB4A8] disabled:shadow-none disabled:translate-y-0",
};

export function Spinner({ className = "" }: { className?: string }) {
  return (
    <span
      className={`inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent ${className}`}
      aria-hidden
    />
  );
}

export const PillButton = forwardRef<
  HTMLButtonElement,
  ButtonHTMLAttributes<HTMLButtonElement> & { variant?: PillVariant; loading?: boolean }
>(function PillButton({ variant = "gold", loading = false, className = "", children, disabled, ...props }, ref) {
  return (
    <button
      ref={ref}
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
});

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

// Small four-point sparkle, used in badges instead of the OS "✨" emoji so it
// renders identically everywhere and matches the app's own line-icon style.
export function SparkleIcon({ size = 12, className = "" }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden className={className}>
      <path
        d="M12 2c.6 4.2 2.8 6.4 7 7-4.2.6-6.4 2.8-7 7-.6-4.2-2.8-6.4-7-7 4.2-.6 6.4-2.8 7-7z"
        fill="#E09A1E"
      />
    </svg>
  );
}

// Small filled checkmark, used in success pills/badges instead of concatenating
// a plain "✓" character onto the text.
export function CheckCircleIcon({ size = 14, className = "" }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden className={className}>
      <circle cx="12" cy="12" r="10" fill="currentColor" opacity="0.15" />
      <path d="M7.5 12.5l3 3 6-6.5" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
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
