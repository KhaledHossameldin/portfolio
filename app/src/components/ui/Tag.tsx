import type { CSSProperties, ReactNode } from "react";

type Variant = "outline" | "solid";
type Size = "sm" | "md";

const sizes: Record<Size, { height: number; padding: string; font: string }> = {
  sm: { height: 24, padding: "0 var(--space-2)", font: "var(--text-2xs)" },
  md: { height: 28, padding: "0 var(--space-3)", font: "var(--text-xs)" },
};

export function Tag({
  variant = "outline",
  active = false,
  size = "md",
  children,
  style,
}: {
  variant?: Variant;
  active?: boolean;
  size?: Size;
  children: ReactNode;
  style?: CSSProperties;
}) {
  const s = sizes[size];
  const variantStyle: CSSProperties =
    variant === "solid"
      ? {
          background: "var(--surface-2)",
          borderColor: "var(--border)",
          color: "var(--text)",
        }
      : {
          background: active ? "var(--accent-soft)" : "transparent",
          borderColor: active ? "var(--accent-line)" : "var(--border-strong)",
          color: active ? "var(--accent)" : "var(--text-muted)",
        };

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "var(--space-1)",
        height: s.height,
        padding: s.padding,
        fontFamily: "var(--font-mono)",
        fontSize: s.font,
        fontWeight: "var(--weight-regular)",
        letterSpacing: "var(--tracking-wide)",
        lineHeight: 1,
        borderRadius: "var(--radius-sm)",
        border: "1px solid transparent",
        whiteSpace: "nowrap",
        ...variantStyle,
        ...style,
      }}
    >
      {children}
    </span>
  );
}
