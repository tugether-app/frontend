"use client";

import { PillButton } from "./ui";
import { useToast } from "./Toast";

// Copy/share the invite link. Uses native share sheet on mobile when available.

export function ShareButton({ slug, label = "Ajak teman" }: { slug: string; label?: string }) {
  const toast = useToast();

  async function share() {
    const base = typeof window !== "undefined" ? window.location.origin : "";
    const url = `${base}/g/${slug}`;
    const data = { title: "Yuk nabung bareng di Tugether", text: "Aku buat tujuan nabung bareng, gabung yuk", url };
    try {
      if (navigator.share) {
        await navigator.share(data);
        return;
      }
      await navigator.clipboard.writeText(url);
      toast("Link disalin", "success");
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
