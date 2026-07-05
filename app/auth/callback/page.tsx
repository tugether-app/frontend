"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Mascot } from "@/components/Mascot";
import { useToast } from "@/components/Toast";
import { completeGoogleLogin } from "@/lib/sdk/magic";
import { useAuth } from "@/lib/auth";
import { withViewTransition } from "@/lib/viewTransition";
import { useI18n } from "@/lib/i18n/provider";

export default function AuthCallbackPage() {
  const { t } = useI18n();
  const router = useRouter();
  const toast = useToast();
  const { refresh } = useAuth();
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;

    (async () => {
      try {
        await completeGoogleLogin();
        await refresh();
        const next = window.sessionStorage.getItem("tug_auth_next") ?? "/";
        window.sessionStorage.removeItem("tug_auth_next");
        withViewTransition(() => router.replace(next));
      } catch {
        toast(t("login.cancelled"), "error");
        withViewTransition(() => router.replace("/login"));
      }
    })();
  }, [refresh, router, toast, t]);

  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-4 px-6 text-center">
      <Mascot pose="loading" size={160} float />
      <p className="text-sm font-semibold text-ink-soft">{t("login.signingIn")}</p>
    </main>
  );
}
