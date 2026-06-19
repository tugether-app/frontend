import type { Goal, Member } from "./types";

// Typed fetch wrappers for client components. Throws Error(message) on failure
// (message comes from the API's { error: { code, message } } shape).

async function call<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...init,
    headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) },
  });
  const body = await res.json().catch(() => null);
  if (!res.ok) {
    const msg = body?.error?.message ?? "Terjadi kesalahan.";
    throw new Error(msg);
  }
  return body as T;
}

export const api = {
  createGoal: (input: { name: string; targetAmount: number; creatorAddr?: string }) =>
    call<Goal>("/api/goals", { method: "POST", body: JSON.stringify(input) }),

  getGoalBySlug: (slug: string) => call<Goal>(`/api/goals/by-slug/${slug}`),

  join: (id: string, input: { memberAddr: string; displayName: string; avatarSeed?: string }) =>
    call<{ member: Member }>(`/api/goals/${id}/join`, { method: "POST", body: JSON.stringify(input) }),

  deposit: (id: string, input: { memberAddr: string; amount: number; sourceChain?: string }) =>
    call<Goal>(`/api/goals/${id}/deposit`, { method: "POST", body: JSON.stringify(input) }),

  withdraw: (id: string, input: { toAddr: string }) =>
    call<Goal>(`/api/goals/${id}/withdraw`, { method: "POST", body: JSON.stringify(input) }),
};
