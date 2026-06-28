"use client";

import { useRef, useState, type CSSProperties } from "react";
import { useLocale, useTranslations } from "next-intl";
import * as Dialog from "@radix-ui/react-dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { AnimatePresence, motion } from "framer-motion";
import { usePathname } from "@/i18n/navigation";
import { handleHashClick } from "@/lib/motion/scrollToHash";
import { getLenis } from "@/lib/motion/lenisRef";
import { useMotionActive } from "@/lib/motion/useMotionActive";
import { Button } from "./ui/Button";
import { LangToggle, ThemeToggle } from "./Toggles";

const EASE = [0.22, 1, 0.36, 1] as const;

const SECTIONS = [
  { id: "work", n: "01" },
  { id: "about", n: "02" },
  { id: "stack", n: "03" },
  { id: "contact", n: "04" },
] as const;

const panelLink: CSSProperties = {
  display: "flex",
  alignItems: "baseline",
  gap: "var(--space-3)",
  padding: "var(--space-3) 0",
  color: "var(--text)",
  textDecoration: "none",
  fontSize: "var(--text-lg)",
  fontWeight: "var(--weight-medium)",
};

const linkIdx: CSSProperties = {
  fontFamily: "var(--font-mono)",
  fontSize: "var(--text-2xs)",
  color: "var(--accent)",
};

// One bar of the hamburger; rotates+translates to form the X on open.
function Bar({ open, top, animate }: { open: boolean; top: boolean; animate: boolean }) {
  return (
    <motion.span
      aria-hidden
      style={{
        position: "absolute",
        insetInline: 12,
        height: 1.75,
        borderRadius: 2,
        background: "currentColor",
        top: top ? "calc(50% - 4px)" : "calc(50% + 4px)",
        transformOrigin: "center",
      }}
      animate={open ? { rotate: top ? 45 : -45, y: top ? 4 : -4 } : { rotate: 0, y: 0 }}
      transition={{ duration: animate ? 0.2 : 0, ease: EASE }}
    />
  );
}

export function MobileMenu() {
  const t = useTranslations("nav");
  const locale = useLocale();
  const pathname = usePathname();
  const onHome = pathname === "/";
  const sectionHref = (id: string) => (onHome ? `#${id}` : `/${locale}#${id}`);

  const [open, setOpen] = useState(false);
  const [headerH, setHeaderH] = useState(64);
  const btnRef = useRef<HTMLButtonElement>(null);
  const animate = useMotionActive();
  const dur = animate ? 0.26 : 0;

  // Open/close also locks Lenis (Radix locks body scroll; Lenis needs this too).
  function change(next: boolean) {
    if (next) {
      const h = document.querySelector("header")?.getBoundingClientRect().height;
      if (h) setHeaderH(Math.round(h));
      getLenis()?.stop();
    } else {
      getLenis()?.start();
    }
    setOpen(next);
  }

  function go(e: React.MouseEvent, href: string) {
    change(false); // close + restart Lenis FIRST, so the scroll below isn't ignored
    handleHashClick(e, href); // no-op for cross-page /{locale}#id (full nav); scrolls on home
  }

  return (
    <Dialog.Root open={open} onOpenChange={change}>
      <button
        ref={btnRef}
        type="button"
        className="kp-nav-mobile"
        aria-label={open ? "Close menu" : "Open menu"}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls="kp-mobile-menu"
        onClick={() => change(!open)}
        style={{
          position: "relative",
          marginInlineStart: "auto",
          width: 44,
          height: 44,
          flex: "none",
          appearance: "none",
          border: "none",
          background: "transparent",
          color: "var(--text-strong)",
          cursor: "pointer",
          WebkitTapHighlightColor: "transparent",
        }}
      >
        <Bar open={open} top animate={animate} />
        <Bar open={open} top={false} animate={animate} />
      </button>

      <AnimatePresence>
        {open && (
          <Dialog.Portal forceMount>
            <Dialog.Overlay asChild forceMount>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: dur, ease: EASE }}
                style={{
                  position: "fixed",
                  inset: 0,
                  zIndex: 90,
                  background: "color-mix(in srgb, var(--stone-950) 42%, transparent)",
                }}
              />
            </Dialog.Overlay>

            <Dialog.Content
              id="kp-mobile-menu"
              aria-modal="true"
              aria-describedby={undefined}
              forceMount
              onInteractOutside={(e) => {
                // The header toggle handles its own close; don't double-fire.
                if (btnRef.current && e.target instanceof Node && btnRef.current.contains(e.target)) {
                  e.preventDefault();
                }
              }}
              onCloseAutoFocus={(e) => {
                e.preventDefault();
                btnRef.current?.focus();
              }}
              asChild
            >
              <motion.div
                // Stays opaque while opening (only slides) so page content never
                // shows through the panel; the scrim handles the fade. Exit fades.
                initial={{ opacity: 1, y: -12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: dur, ease: EASE }}
                style={{
                  position: "fixed",
                  top: headerH,
                  insetInline: 0,
                  zIndex: 95,
                  padding: "var(--space-5) var(--gutter) var(--space-7)",
                  // Solid surface (blur is reserved for the nav per DESIGN_SYSTEM)
                  // → guaranteed readable, no content bleed-through.
                  background: "var(--surface)",
                  borderBlockEnd: "1px solid var(--border)",
                  boxShadow: "var(--shadow-md)",
                }}
              >
                <VisuallyHidden asChild>
                  <Dialog.Title>Menu</Dialog.Title>
                </VisuallyHidden>

                <nav style={{ display: "flex", flexDirection: "column" }}>
                  {SECTIONS.map((s) => (
                    <a
                      key={s.id}
                      href={sectionHref(s.id)}
                      style={panelLink}
                      onClick={(e) => go(e, sectionHref(s.id))}
                    >
                      <span className="kp-ltr" style={linkIdx}>
                        {s.n}
                      </span>
                      {t(s.id)}
                    </a>
                  ))}
                </nav>

                <div
                  style={{
                    marginBlockStart: "var(--space-5)",
                    paddingBlockStart: "var(--space-5)",
                    borderBlockStart: "1px solid var(--border)",
                    display: "flex",
                    flexWrap: "wrap",
                    alignItems: "center",
                    gap: "var(--space-4)",
                  }}
                >
                  <LangToggle />
                  <ThemeToggle />
                </div>

                <Button
                  variant="primary"
                  size="md"
                  fullWidth
                  href={sectionHref("contact")}
                  onClick={(e) => go(e, sectionHref("contact"))}
                  style={{ marginBlockStart: "var(--space-5)" }}
                >
                  {t("cta")}
                </Button>
              </motion.div>
            </Dialog.Content>
          </Dialog.Portal>
        )}
      </AnimatePresence>
    </Dialog.Root>
  );
}
