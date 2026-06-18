import { useSyncExternalStore } from "react";

// Single source of truth for the user's motion preference. Reactive to a live
// OS/devtools toggle mid-session. SSR/export snapshot is `false` so the static
// HTML is built as the no-FOUC, motion-capable baseline; the client corrects on
// mount if the user prefers reduced motion.

const QUERY = "(prefers-reduced-motion: reduce)";

function subscribe(callback: () => void): () => void {
  if (typeof window === "undefined" || !window.matchMedia) return () => {};
  const mql = window.matchMedia(QUERY);
  mql.addEventListener("change", callback);
  return () => mql.removeEventListener("change", callback);
}

function getSnapshot(): boolean {
  return window.matchMedia(QUERY).matches;
}

function getServerSnapshot(): boolean {
  return false;
}

export function useReducedMotion(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
