import { getLenis } from "./lenisRef";

// Matches globals.css `scroll-padding-top: 76px` so a smooth scroll lands the
// section below the sticky nav.
const NAV_OFFSET = 76;

function resolveTarget(hash: string): HTMLElement | null {
  const id = hash.startsWith("#") ? hash.slice(1) : hash;
  if (!id) return null;
  try {
    return document.getElementById(id);
  } catch {
    return null;
  }
}

// Scroll to an in-page hash. Routes through Lenis when it's live (so the hijacked
// scroll stays consistent), otherwise native scrollIntoView.
export function scrollToHash(hash: string): void {
  const el = resolveTarget(hash);
  if (!el) return;
  const lenis = getLenis();
  if (lenis) {
    lenis.scrollTo(el, { offset: -NAV_OFFSET });
  } else {
    el.scrollIntoView({ behavior: "smooth", block: "start" });
  }
}

// Click handler for in-page hash links. Same-document hashes (`#work`) are
// intercepted for a Lenis-driven smooth scroll; cross-page links
// (`/en#work` from a sub-page) fall through to normal navigation, and the
// landing page handles the hash via scrollToHashOnMount.
export function handleHashClick(
  e: { preventDefault: () => void },
  href: string,
): void {
  if (!href.startsWith("#") || href === "#") return;
  e.preventDefault();
  scrollToHash(href);
  if (typeof history !== "undefined") {
    history.pushState(null, "", href);
  }
}

// On a fresh landing at /{locale}#section, scroll only after layout has settled
// (fonts can reflow positions). Waits for fonts + two animation frames.
export function scrollToHashOnMount(): void {
  if (typeof window === "undefined") return;
  const hash = window.location.hash;
  if (!hash || hash === "#") return;

  const run = () => {
    requestAnimationFrame(() => requestAnimationFrame(() => scrollToHash(hash)));
  };

  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(run).catch(run);
  } else {
    run();
  }
}
