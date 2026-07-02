// Magic embedded wallet wrapper (Google login -> signer address + profile).
// Live once NEXT_PUBLIC_MAGIC_PUBLISHABLE_KEY is set. Keep all SDK calls behind /lib.

import { Magic } from "magic-sdk";
import { OAuthExtension } from "@magic-ext/oauth";

const hasKey = !!process.env.NEXT_PUBLIC_MAGIC_PUBLISHABLE_KEY;
// Arbitrum Sepolia for now (dev/testing, matches the ZeroDev project chain).
// Switch to Arbitrum One (42161, https://arb1.arbitrum.io/rpc) for the mainnet deploy.
const ARBITRUM_RPC = process.env.NEXT_PUBLIC_ARBITRUM_RPC_URL || "https://sepolia-rollup.arbitrum.io/rpc";
const ARBITRUM_CHAIN_ID = 421614;

export function isLive(): boolean {
  return hasKey;
}

export interface MagicProfile {
  eoa: string;
  email: string;
  name: string;
}

let _magic: Magic<[OAuthExtension]> | undefined;

// Magic must only be constructed in the browser, after a live key is confirmed.
function getMagic(): Magic<[OAuthExtension]> {
  if (typeof window === "undefined") throw new Error("Magic is browser-only.");
  if (!hasKey) throw new Error("Magic is not configured. Set NEXT_PUBLIC_MAGIC_PUBLISHABLE_KEY.");
  if (!_magic) {
    _magic = new Magic(process.env.NEXT_PUBLIC_MAGIC_PUBLISHABLE_KEY!, {
      network: { rpcUrl: ARBITRUM_RPC, chainId: ARBITRUM_CHAIN_ID },
      extensions: [new OAuthExtension()],
    });
  }
  return _magic;
}

// Kicks off the redirect to Google. Never resolves (full page navigation).
export function startGoogleLogin(redirectURI: string) {
  return getMagic().oauth.loginWithRedirect({ provider: "google", redirectURI });
}

// Call on the callback page after the redirect back from Google.
export async function completeGoogleLogin(): Promise<MagicProfile> {
  const result = await getMagic().oauth.getRedirectResult();
  const eoa = result.magic.userMetadata.wallets.ethereum?.publicAddress ?? "";
  const email = result.oauth.userInfo.email ?? result.magic.userMetadata.email ?? "";
  const name = result.oauth.userInfo.name ?? email.split("@")[0] ?? "Member";
  if (!eoa) throw new Error("Google sign-in did not return an account.");
  return { eoa, email, name };
}

// Restores an existing session (e.g. on page reload). Returns null if signed out.
export async function getMagicSession(): Promise<MagicProfile | null> {
  const magic = getMagic();
  const isLoggedIn = await magic.user.isLoggedIn();
  if (!isLoggedIn) return null;
  const info = await magic.user.getInfo();
  const eoa = info.wallets.ethereum?.publicAddress ?? "";
  if (!eoa) return null;
  const email = info.email ?? "";
  return { eoa, email, name: email.split("@")[0] || "Member" };
}

export async function magicLogout(): Promise<void> {
  if (!hasKey) return;
  await getMagic().user.logout();
}

// Hand off to lib/sdk/smartAccount.ts only -- never call SDKs from components.
export function getMagicProvider() {
  return getMagic().rpcProvider;
}
