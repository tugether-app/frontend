// Shared UI primitives for the warm white/gold theme.

import type { ButtonHTMLAttributes, ReactNode } from "react";

type PillVariant = "gold" | "light" | "ghost";

const pillBase =
  "relative inline-flex items-center justify-center gap-2 rounded-btn font-semibold will-change-transform transition-[transform,background-color,box-shadow] duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] active:scale-[0.96] disabled:opacity-50 disabled:active:scale-100";

const pillVariants: Record<PillVariant, string> = {
  // Gold solid, ink text. Primary CTA. Identity color, never swap.
  gold: "bg-gold text-ink shadow-soft hover:bg-gold-deep hover:-translate-y-0.5",
  light: "bg-surface text-ink ring-1 ring-line shadow-soft hover:-translate-y-0.5",
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
      className={`${pillBase} px-6 py-3.5 ${pillVariants[variant]} ${className}`}
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

export function Chip({
  active = false,
  className = "",
  children,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { active?: boolean }) {
  return (
    <button
      className={`inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold transition-[transform,background-color,box-shadow] duration-150 active:scale-[0.94] ${
        active
          ? "bg-gold text-ink shadow-soft"
          : "bg-surface text-ink-soft ring-1 ring-line hover:-translate-y-0.5"
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
      className={`inline-flex items-center gap-1 rounded-full bg-gold-soft px-3 py-1 text-[11px] font-bold uppercase tracking-[0.04em] text-gold-deep ring-1 ring-gold/30 ${className}`}
    >
      {children}
    </span>
  );
}

// White rounded card surface (see .card in globals.css).
export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`card rounded-card ${className}`}>{children}</div>;
}
