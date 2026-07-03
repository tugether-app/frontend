"use client";

// Real member identity: Magic Google login + a ZeroDev smart account address.
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
import { getSmartAccountAddress, isLive as isZeroDevLive } from "./sdk/smartAccount";

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
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<AuthStatus>("loading");
  const [user, setUser] = useState<AuthUser | null>(null);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!isMagicLive() || !isZeroDevLive()) {
      setError(!isMagicLive() ? "Magic is not configured." : "ZeroDev is not configured.");
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
      const addr = await getSmartAccountAddress(getMagicProvider());
      setUser({ addr, name: session.name, seed: addr, email: session.email });
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

  return (
    <Ctx.Provider value={{ status, user, error, loginWithGoogle, logout, refresh, getProvider }}>
      {children}
    </Ctx.Provider>
  );
}

export function useAuth() {
  return useContext(Ctx);
}
