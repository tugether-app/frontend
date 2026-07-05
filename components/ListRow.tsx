"use client";

import Link from "./Link";
import type { ReactNode } from "react";

// A tappable menu row: icon left, label left-aligned, chevron right. This is
// the right pattern for "go look at this other screen" navigation (Profile's
// My goals / Activity / Settings). A centered label with a trailing "->" text
// arrow reads as a primary call-to-action, not a menu item, which is why it
// felt off. A left-aligned label with a small chevron is the standard
// affordance for a navigable list row (iOS/Android settings pattern).
function Chevron() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden className="shrink-0 text-ink-soft/60">
      <path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function RowContent({ icon, label }: { icon?: ReactNode; label: string }) {
  return (
    <>
      {icon && <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[12px] bg-gold-soft">{icon}</span>}
      <span className="flex-1 text-left font-display text-[15px] font-semibold text-ink">{label}</span>
      <Chevron />
    </>
  );
}

const rowClass =
  "flex w-full items-center gap-3 rounded-card border border-line bg-surface px-4 py-3.5 shadow-card transition-[transform,box-shadow] duration-150 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-0.5 active:scale-[0.99] active:translate-y-0";

export function ListRow({ href, icon, label }: { href: string; icon?: ReactNode; label: string }) {
  return (
    <Link href={href} className={rowClass}>
      <RowContent icon={icon} label={label} />
    </Link>
  );
}

export function ListRowButton({
  onClick,
  icon,
  label,
}: {
  onClick: () => void;
  icon?: ReactNode;
  label: string;
}) {
  return (
    <button type="button" onClick={onClick} className={rowClass}>
      <RowContent icon={icon} label={label} />
    </button>
  );
}
