"use client";

import type { CSSProperties, ReactNode } from "react";

type Variant = "primary" | "secondary" | "ghost" | "link";
type Size = "sm" | "md" | "lg";

const sizes: Record<Size, { padding: string; height: number | string; font: string }> = {
  sm: { padding: "0 var(--space-3)", height: 32, font: "var(--text-sm)" },
  md: { padding: "0 var(--space-5)", height: 42, font: "var(--text-base)" },
  lg: { padding: "0 var(--space-6)", height: 52, font: "var(--text-md)" },
};

const variants: Record<Variant, CSSProperties> = {
  primary: {
    background: "var(--accent)",
    color: "var(--text-on-accent)",
    borderColor: "var(--accent)",
  },
  secondary: {
    background: "transparent",
    color: "var(--text)",
    borderColor: "var(--border-strong)",
  },
  ghost: {
    background: "transparent",
    color: "var(--text-muted)",
    borderColor: "transparent",
  },
  link: {
    background: "transparent",
    color: "var(--accent)",
    borderColor: "transparent",
    height: "auto",
    padding: 0,
  },
};

type ButtonProps = {
  variant?: Variant;
  size?: Size;
  type?: "button" | "submit" | "reset";
  href?: string;
  iconRight?: ReactNode;
  iconLeft?: ReactNode;
  fullWidth?: boolean;
  disabled?: boolean;
  onClick?: (e: React.MouseEvent<HTMLElement>) => void;
  children?: ReactNode;
  style?: CSSProperties;
};

export function Button({
  variant = "secondary",
  size = "md",
  type = "button",
  href,
  iconRight,
  iconLeft,
  fullWidth = false,
  disabled = false,
  onClick,
  children,
  style,
}: ButtonProps) {
  const s = sizes[size];
  const base: CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "var(--space-2)",
    height: variant === "link" ? "auto" : s.height,
    padding: variant === "link" ? 0 : s.padding,
    width: fullWidth ? "100%" : undefined,
    fontFamily: "var(--font-sans)",
    fontSize: s.font,
    fontWeight: "var(--weight-medium)",
    lineHeight: 1,
    letterSpacing: "var(--tracking-tight)",
    borderRadius: "var(--radius)",
    border: "1px solid transparent",
    cursor: disabled ? "not-allowed" : "pointer",
    opacity: disabled ? 0.45 : 1,
    textDecoration: "none",
    whiteSpace: "nowrap",
    transition:
      "background var(--dur-fast) var(--ease-out), border-color var(--dur-fast) var(--ease-out), color var(--dur-fast) var(--ease-out), transform var(--dur-fast) var(--ease-out)",
    WebkitTapHighlightColor: "transparent",
    userSelect: "none",
    ...variants[variant],
    ...style,
  };

  const onEnter = disabled
    ? undefined
    : (e: React.MouseEvent<HTMLElement>) => {
        const el = e.currentTarget;
        if (variant === "primary") el.style.background = "var(--accent-hover)";
        else if (variant === "secondary") {
          el.style.borderColor = "var(--accent-line)";
          el.style.color = "var(--accent)";
        } else if (variant === "ghost") {
          el.style.background = "var(--surface-hover)";
          el.style.color = "var(--text)";
        } else if (variant === "link") el.style.color = "var(--accent-hover)";
      };

  const onLeave = disabled
    ? undefined
    : (e: React.MouseEvent<HTMLElement>) => {
        Object.assign(e.currentTarget.style, {
          background: variants[variant].background ?? "",
          borderColor: variants[variant].borderColor ?? "",
          color: variants[variant].color ?? "",
          // Clear any active-press transform; mouseup may not fire if the
          // pointer left the element while pressed.
          transform: "none",
        });
      };

  const onDown = disabled
    ? undefined
    : (e: React.MouseEvent<HTMLElement>) => {
        e.currentTarget.style.transform = "translateY(0.5px) scale(0.99)";
      };
  const onUp = disabled
    ? undefined
    : (e: React.MouseEvent<HTMLElement>) => {
        e.currentTarget.style.transform = "none";
      };

  const inner = (
    <>
      {iconLeft && (
        <span style={{ display: "inline-flex", marginLeft: variant === "link" ? 0 : -2 }}>
          {iconLeft}
        </span>
      )}
      {children}
      {iconRight && (
        <span style={{ display: "inline-flex", marginRight: variant === "link" ? 0 : -2 }}>
          {iconRight}
        </span>
      )}
    </>
  );

  if (href) {
    return (
      <a
        href={href}
        style={base}
        onClick={onClick}
        onMouseEnter={onEnter}
        onMouseLeave={onLeave}
        onMouseDown={onDown}
        onMouseUp={onUp}
      >
        {inner}
      </a>
    );
  }

  return (
    <button
      type={type}
      disabled={disabled}
      style={base}
      onClick={onClick}
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
      onMouseDown={onDown}
      onMouseUp={onUp}
    >
      {inner}
    </button>
  );
}
