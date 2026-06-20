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
      <span aria-hidden>🔗</span> {label ?? t("share.invite")}
    </PillButton>
  );
}
