import { useSyncExternalStore } from "react";
import { useReducedMotion } from "./useReducedMotion";

// SSR-safe "is the client hydrated yet" flag — false on the server and the first
// client render, true thereafter. No effect/setState, so it sidesteps the
// cascading-render lint rule.
const emptySubscribe = () => () => {};
export function useHydrated(): boolean {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  );
}

// True only after hydration AND when motion is allowed. Server + reduced-motion
// render the final state with no entrance, so there's no FOUC for no-JS or
// reduced-motion users.
export function useMotionActive(): boolean {
  const reduced = useReducedMotion();
  const hydrated = useHydrated();
  return hydrated && !reduced;
}
