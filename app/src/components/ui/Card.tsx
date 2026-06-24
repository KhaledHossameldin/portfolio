"use client";

import type { CSSProperties, ReactNode } from "react";
import { useReducedMotion } from "@/lib/motion/useReducedMotion";

// Project/content surface. Hairline border in dark, soft shadow in light.
// `interactive` adds the calm 2px lift + accent border on hover.
export function Card({
  interactive = false,
  href,
  external = false,
  padding = "var(--space-6)",
  onClick,
  children,
  style,
}: {
  interactive?: boolean;
  href?: string;
  external?: boolean;
  padding?: string;
  onClick?: () => void;
  children: ReactNode;
  style?: CSSProperties;
}) {
  const reduced = useReducedMotion();

  const base: CSSProperties = {
    display: "block",
    position: "relative",
    padding,
    background: "var(--surface-card)",
    border: "1px solid var(--border)",
    borderRadius: "var(--radius-lg)",
    color: "var(--text)",
    textDecoration: "none",
    // Pointer only when the whole card is a click target; an interactive (hover)
    // card that isn't a link keeps the default cursor (its inner links are clickable).
    cursor: href || onClick ? "pointer" : "default",
    boxShadow: "var(--shadow-sm)",
    transition:
      "border-color var(--dur) var(--ease-out), transform var(--dur) var(--ease-out)",
    ...style,
  };

  // Hover affordance applies to EVERY interactive card (featured + non-featured).
  // The border always warms; the 2px lift is gated behind reduced-motion.
  const onEnter = interactive
    ? (e: React.MouseEvent<HTMLElement>) => {
        e.currentTarget.style.borderColor = "var(--accent-line)";
        if (!reduced) e.currentTarget.style.transform = "translateY(-2px)";
      }
    : undefined;
  const onLeave = interactive
    ? (e: React.MouseEvent<HTMLElement>) => {
        e.currentTarget.style.borderColor = "var(--border)";
        e.currentTarget.style.transform = "none";
      }
    : undefined;

  if (href) {
    return (
      <a
        href={href}
        target={external ? "_blank" : undefined}
        rel={external ? "noopener noreferrer" : undefined}
        style={base}
        onMouseEnter={onEnter}
        onMouseLeave={onLeave}
      >
        {children}
      </a>
    );
  }

  return (
    <div
      style={base}
      onClick={onClick}
      // Keyboard-operable when it acts as a button (has onClick).
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={
        onClick
          ? (e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onClick();
              }
            }
          : undefined
      }
      // Visible focus ring for keyboard users (inline styles → no CSS :focus).
      onFocus={
        onClick
          ? (e) => {
              e.currentTarget.style.outline = "2px solid var(--accent)";
              e.currentTarget.style.outlineOffset = "2px";
            }
          : undefined
      }
      onBlur={
        onClick
          ? (e) => {
              e.currentTarget.style.outline = "none";
            }
          : undefined
      }
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
    >
      {children}
    </div>
  );
}
