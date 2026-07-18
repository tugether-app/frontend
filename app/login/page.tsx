"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Badge, Card, PillButton, SparkleIcon } from "@/components/ui";
import { WordMark } from "@/components/BrandIcon";
import { useAuth } from "@/lib/auth";
import { withViewTransition } from "@/lib/viewTransition";
import { useI18n } from "@/lib/i18n/provider";

function LoginContent() {
  const { t } = useI18n();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { status, error, loginWithGoogle } = useAuth();
  const [starting, setStarting] = useState(false);

  useEffect(() => {
    if (status === "authed") withViewTransition(() => router.replace("/"));
  }, [status, router]);

  function start() {
    setStarting(true);
    window.sessionStorage.setItem("tug_auth_next", searchParams.get("next") ?? "/");
    loginWithGoogle();
  }

  return (
    <>
      <Badge>
        <SparkleIcon /> {t("login.badge")}
      </Badge>
      <h1 className="mt-4 font-display text-[2rem] font-bold leading-tight tracking-tight text-ink">
        {t("login.title")}
      </h1>
      <p className="mt-3 max-w-xs text-[15px] leading-relaxed text-ink-soft">{t("login.subtitle")}</p>

      {error ? (
        <Card className="mt-8 w-full max-w-xs p-5">
          <p className="text-sm font-medium text-ink-soft">{t("login.configMissing")}</p>
        </Card>
      ) : (
        <PillButton onClick={start} loading={starting} className="mt-8 w-full max-w-xs py-4 text-base">
          {t("login.continueGoogle")}
        </PillButton>
      )}
    </>
  );
}

export default function LoginPage() {
  const { t } = useI18n();
  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col items-center px-6 pb-10 pt-10 text-center">
      <WordMark />
      <div className="rise-in mt-10 flex flex-1 flex-col items-center justify-center">
        <Suspense fallback={null}>
          <LoginContent />
        </Suspense>
      </div>
      <p className="text-xs text-ink-soft/80">{t("welcome.noSeed")}</p>
    </main>
  );
}
