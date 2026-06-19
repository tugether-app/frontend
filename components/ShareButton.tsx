"use client";

import { PillButton } from "./ui";
import { useToast } from "./Toast";

// Copy/share the invite link. Uses native share sheet on mobile when available.

export function ShareButton({ slug, label = "Invite friends" }: { slug: string; label?: string }) {
  const toast = useToast();

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
      toast("Link copied", "success");
    } catch {
      // user cancelled the share sheet; ignore
    }
  }

  return (
    <PillButton variant="light" onClick={share} className="w-full">
      <span aria-hidden>🔗</span> {label}
    </PillButton>
  );
}
