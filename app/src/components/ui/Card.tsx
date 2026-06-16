"use client";

import type { CSSProperties, ReactNode } from "react";

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
  const base: CSSProperties = {
    display: "block",
    position: "relative",
    padding,
    background: "var(--surface-card)",
    border: "1px solid var(--border)",
    borderRadius: "var(--radius-lg)",
    color: "var(--text)",
    textDecoration: "none",
    cursor: interactive || href || onClick ? "pointer" : "default",
    boxShadow: "var(--shadow-sm)",
    transition:
      "border-color var(--dur) var(--ease-out), transform var(--dur) var(--ease-out)",
    ...style,
  };

  const onEnter = interactive
    ? (e: React.MouseEvent<HTMLElement>) => {
        e.currentTarget.style.borderColor = "var(--accent-line)";
        e.currentTarget.style.transform = "translateY(-2px)";
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
    <div style={base} onClick={onClick} onMouseEnter={onEnter} onMouseLeave={onLeave}>
      {children}
    </div>
  );
}
