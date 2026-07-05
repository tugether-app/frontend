"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { Mascot } from "./Mascot";

// Gate for member-only pages (dashboard, profile, activity, notifications,
// settings). Without this, an anonymous visitor could open those routes
// directly and see them render as if signed in. While auth is resolving we
// show a loading screen instead of a flash of protected content; once
// resolved, anon visitors are sent to the marketing front door.
export function RequireAuth({ children }: { children: React.ReactNode }) {
  const { status } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (status === "anon") router.replace("/welcome");
  }, [status, router]);

  if (status !== "authed") {
    return (
      <main className="flex min-h-dvh flex-col items-center justify-center gap-4">
        <Mascot pose="loading" size={140} float />
      </main>
    );
  }

  return <>{children}</>;
}
