"use client";

// Real member identity: Magic Google login. The EOA Magic returns IS the
// member's address -- with Particle Universal Accounts (EIP-7702), it gets
// upgraded to a chain-abstracted account in place, no separate smart-account
// address to compute or deploy (see lib/sdk/particle.ts).
// Replaces the old lib/identity.ts (random per-browser fake address).

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import type { EIP1193Provider } from "viem";
import {
  getMagicProvider,
  getMagicSession,
  isLive as isMagicLive,
  magicLogout,
  startGoogleLogin,
} from "./sdk/magic";
import { getAvatarPref, setAvatarPref } from "./avatarPref";

export type AuthStatus = "loading" | "anon" | "authed";

export interface AuthUser {
  addr: string;
  name: string;
  seed: string;
  email: string;
}

interface AuthCtx {
  status: AuthStatus;
  user: AuthUser | null;
  error: string | null;
  loginWithGoogle: () => void;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
  getProvider: () => EIP1193Provider;
  chooseAvatar: (seed: string) => void;
}

const Ctx = createContext<AuthCtx>({
  status: "loading",
  user: null,
  error: null,
  loginWithGoogle: () => {},
  logout: async () => {},
  refresh: async () => {},
  getProvider: () => {
    throw new Error("Not signed in.");
  },
  chooseAvatar: () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<AuthStatus>("loading");
  const [user, setUser] = useState<AuthUser | null>(null);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!isMagicLive()) {
      setError("Magic is not configured.");
      setStatus("anon");
      setUser(null);
      return;
    }
    try {
      const session = await getMagicSession();
      if (!session) {
        setStatus("anon");
        setUser(null);
        return;
      }
      const addr = session.eoa;
      const seed = getAvatarPref() || addr;
      setUser({ addr, name: session.name, seed, email: session.email });
      setStatus("authed");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Sign-in check failed.");
      setStatus("anon");
      setUser(null);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const loginWithGoogle = useCallback(() => {
    startGoogleLogin(`${window.location.origin}/auth/callback`);
  }, []);

  const logout = useCallback(async () => {
    await magicLogout();
    setStatus("anon");
    setUser(null);
  }, []);

  const getProvider = useCallback((): EIP1193Provider => {
    if (status !== "authed") throw new Error("Not signed in.");
    return getMagicProvider();
  }, [status]);

  // Swap the displayed avatar instantly (no network round trip); persists
  // per browser and is sent along on the next join/create so it shows up for
  // other members too.
  const chooseAvatar = useCallback((seed: string) => {
    setAvatarPref(seed);
    setUser((u) => (u ? { ...u, seed } : u));
  }, []);

  return (
    <Ctx.Provider value={{ status, user, error, loginWithGoogle, logout, refresh, getProvider, chooseAvatar }}>
      {children}
    </Ctx.Provider>
  );
}

export function useAuth() {
  return useContext(Ctx);
}
