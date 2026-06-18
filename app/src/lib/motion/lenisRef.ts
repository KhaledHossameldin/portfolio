import type Lenis from "lenis";

// Module-level handle to the live Lenis instance so scrollToHash can drive it
// without threading a context through the tree. Null when Lenis isn't running
// (reduced motion, pre-mount, or after teardown).
let instance: Lenis | null = null;

export function setLenis(next: Lenis | null): void {
  instance = next;
}

export function getLenis(): Lenis | null {
  return instance;
}
