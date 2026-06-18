import { useSyncExternalStore } from "react";

// SSR-safe reactive media query. Server snapshot is `false` (matches the
// motion-capable baseline); the client corrects on mount and on live changes.
// Same store pattern as useReducedMotion — no effect/setState.
export function useMediaQuery(query: string): boolean {
  return useSyncExternalStore(
    (callback) => {
      if (typeof window === "undefined" || !window.matchMedia) return () => {};
      const mql = window.matchMedia(query);
      mql.addEventListener("change", callback);
      return () => mql.removeEventListener("change", callback);
    },
    () => window.matchMedia(query).matches,
    () => false,
  );
}
