// Magic embedded wallet wrapper (Google login -> signer address + profile).
// Live once NEXT_PUBLIC_MAGIC_PUBLISHABLE_KEY is set. Keep all SDK calls behind /lib.

import { Magic } from "magic-sdk";
import { OAuthExtension } from "@magic-ext/oauth";

const hasKey = !!process.env.NEXT_PUBLIC_MAGIC_PUBLISHABLE_KEY;
// Arbitrum mainnet -- Particle Universal Accounts has no testnet, so this is
// the live chain end to end (see CLAUDE.md Architecture Notes).
const ARBITRUM_RPC = process.env.NEXT_PUBLIC_ARBITRUM_RPC_URL || "https://arb1.arbitrum.io/rpc";
const ARBITRUM_CHAIN_ID = 42161;

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

// Hand off to lib/sdk/particle.ts only -- never call SDKs from components.
export function getMagicProvider() {
  return getMagic().rpcProvider;
}

export interface Eip7702Authorization {
  contractAddress: string;
  chainId: number;
  nonce: number;
  v: number;
  r: string;
  s: string;
}

// Signs an EIP-7702 delegation authorization tuple (address + chainId + nonce)
// with the member's own Magic EOA. Used by lib/sdk/particle.ts to authorize
// Particle's Universal Account delegate contract before a first transaction on
// a given chain -- see magic.wallet.sign7702Authorization().
export async function sign7702Authorization(args: {
  contractAddress: string;
  chainId: number;
  nonce: number;
}): Promise<Eip7702Authorization> {
  const result = await getMagic().wallet.sign7702Authorization(args);
  return {
    contractAddress: result.contractAddress,
    chainId: result.chainId,
    nonce: result.nonce,
    v: result.v,
    r: result.r,
    s: result.s,
  };
}

// Raw personal_sign over arbitrary hex bytes (e.g. a Particle UniversalAccount
// transaction's rootHash) via the standard EIP1193 provider -- equivalent to
// ethers Wallet.signMessage(getBytes(hash)) used in Particle's own examples.
export async function signRootHash(eoa: string, hashHex: string): Promise<string> {
  const provider = getMagicProvider();
  return provider.request({
    method: "personal_sign",
    params: [hashHex, eoa],
  }) as Promise<string>;
}
