// Wrap a navigation in the native View Transitions API when the browser
// supports it, so route changes cross-fade instead of hard-cutting. Falls
// back to calling the callback directly (no new dependency, no-op on
// unsupported browsers, and skipped entirely under reduced motion).
export function withViewTransition(run: () => void) {
  const reduce =
    typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
  const supported = typeof document !== "undefined" && "startViewTransition" in document;

  if (reduce || !supported) {
    run();
    return;
  }
  (document as unknown as { startViewTransition: (cb: () => void) => void }).startViewTransition(run);
}
