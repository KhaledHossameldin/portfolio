import { useSyncExternalStore } from "react";

// Single source of truth for the user's motion preference. Reactive to a live
// OS/devtools toggle mid-session. SSR/export snapshot is `false` so the static
// HTML is built as the no-FOUC, motion-capable baseline; the client corrects on
// mount if the user prefers reduced motion.

const QUERY = "(prefers-reduced-motion: reduce)";

// Reuse one MediaQueryList so getSnapshot doesn't allocate a fresh one on every
// render. Mirrors the cache in useMediaQuery.
let mql: MediaQueryList | null = null;
function getMql(): MediaQueryList | null {
  if (typeof window === "undefined" || !window.matchMedia) return null;
  if (!mql) mql = window.matchMedia(QUERY);
  return mql;
}

function subscribe(callback: () => void): () => void {
  const m = getMql();
  if (!m) return () => {};
  m.addEventListener("change", callback);
  return () => m.removeEventListener("change", callback);
}

function getSnapshot(): boolean {
  return getMql()?.matches ?? false;
}

function getServerSnapshot(): boolean {
  return false;
}

export function useReducedMotion(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
