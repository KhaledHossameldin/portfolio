import { useSyncExternalStore } from "react";

// SSR-safe reactive media query. Server snapshot is `false` (matches the
// motion-capable baseline); the client corrects on mount and on live changes.
// Same store pattern as useReducedMotion — no effect/setState.

// Reuse one MediaQueryList per query so getSnapshot doesn't allocate a fresh one
// on every call.
const cache = new Map<string, MediaQueryList>();

function getMql(query: string): MediaQueryList | null {
  if (typeof window === "undefined" || !window.matchMedia) return null;
  let mql = cache.get(query);
  if (!mql) {
    mql = window.matchMedia(query);
    cache.set(query, mql);
  }
  return mql;
}

export function useMediaQuery(query: string): boolean {
  return useSyncExternalStore(
    (callback) => {
      const mql = getMql(query);
      if (!mql) return () => {};
      mql.addEventListener("change", callback);
      return () => mql.removeEventListener("change", callback);
    },
    () => getMql(query)?.matches ?? false,
    () => false,
  );
}
