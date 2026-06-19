// Magic embedded wallet wrapper (Google/email login -> signer address).
// STUB: returns deterministic fake addresses. Swap for real magic-sdk when
// NEXT_PUBLIC_MAGIC_PUBLISHABLE_KEY is set. Keep all SDK calls behind /lib.

const hasKey = !!process.env.NEXT_PUBLIC_MAGIC_PUBLISHABLE_KEY;

function fakeAddr(seed: string): string {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  return "0x" + h.toString(16).padStart(40, "0").slice(0, 40);
}

export interface MagicSession {
  address: string;
  email?: string;
}

// TODO(live): magic.oauth.loginWithRedirect / getMetadata.
export async function loginWithEmail(email: string): Promise<MagicSession> {
  if (hasKey) throw new Error("Magic live mode not wired yet");
  return { address: fakeAddr(email), email };
}

export function isLive(): boolean {
  return hasKey;
}
