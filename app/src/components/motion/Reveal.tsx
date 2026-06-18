"use client";

import { useSyncExternalStore, type CSSProperties, type ReactNode } from "react";
import { motion, type Variants } from "framer-motion";
import { useReducedMotion } from "@/lib/motion/useReducedMotion";

// Mirrors --ease-out / --dur-reveal from globals.css.
const EASE = [0.22, 1, 0.36, 1] as const;

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE } },
};

const groupVariants: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};

const viewport = { once: true, margin: "-10% 0px" } as const;

// SSR-safe "is the client hydrated yet" flag — false on the server and the
// first client render, true thereafter. No effect/setState, so it sidesteps the
// cascading-render lint rule.
const emptySubscribe = () => () => {};
function useHydrated(): boolean {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  );
}

// True only after hydration AND when motion is allowed. Server + reduced-motion
// render the final state with no `initial`, so there is no FOUC for no-JS or
// reduced-motion users.
function useMotionActive(): boolean {
  const reduced = useReducedMotion();
  const hydrated = useHydrated();
  return hydrated && !reduced;
}

type RevealProps = {
  children: ReactNode;
  /** Use inside <RevealGroup>: inherit the parent's staggered animation. */
  item?: boolean;
  className?: string;
  style?: CSSProperties;
};

export function Reveal({ children, item = false, className, style }: RevealProps) {
  const active = useMotionActive();

  if (!active) {
    return (
      <div className={className} style={style}>
        {children}
      </div>
    );
  }

  if (item) {
    // Parent (RevealGroup) drives initial/animate; child only declares variants.
    return (
      <motion.div className={className} style={style} variants={itemVariants}>
        {children}
      </motion.div>
    );
  }

  return (
    <motion.div
      className={className}
      style={style}
      variants={itemVariants}
      initial="hidden"
      whileInView="show"
      viewport={viewport}
    >
      {children}
    </motion.div>
  );
}

// Staggers its <Reveal item> children once the group scrolls into view.
export function RevealGroup({
  children,
  className,
  style,
}: {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
}) {
  const active = useMotionActive();

  if (!active) {
    return (
      <div className={className} style={style}>
        {children}
      </div>
    );
  }

  return (
    <motion.div
      className={className}
      style={style}
      variants={groupVariants}
      initial="hidden"
      whileInView="show"
      viewport={viewport}
    >
      {children}
    </motion.div>
  );
}
