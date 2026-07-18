"use client";

import { PillButton } from "./ui";
import { useToast } from "./Toast";
import { useI18n } from "@/lib/i18n/provider";

// Copy/share the invite link. Uses native share sheet on mobile when available.

export function ShareButton({ slug, label }: { slug: string; label?: string }) {
  const toast = useToast();
  const { t } = useI18n();

  async function share() {
    const base = typeof window !== "undefined" ? window.location.origin : "";
    const url = `${base}/g/${slug}`;
    const data = { title: "Let's save together on Tugether", text: "I started a shared savings goal, join me", url };
    try {
      if (navigator.share) {
        await navigator.share(data);
        return;
      }
      await navigator.clipboard.writeText(url);
      toast(t("share.copied"), "success");
    } catch {
      // user cancelled the share sheet; ignore
    }
  }

  return (
    <PillButton variant="light" onClick={share} className="w-full">
      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" aria-hidden>
        <circle cx="18" cy="6" r="3" stroke="#E09A1E" strokeWidth="1.9" />
        <circle cx="6" cy="12" r="3" stroke="#E09A1E" strokeWidth="1.9" />
        <circle cx="18" cy="18" r="3" stroke="#E09A1E" strokeWidth="1.9" />
        <path d="M8.7 10.6l6.6-3.2M8.7 13.4l6.6 3.2" stroke="#E09A1E" strokeWidth="1.9" strokeLinecap="round" />
      </svg>
      {label ?? t("share.invite")}
    </PillButton>
  );
}
