import type { CSSProperties } from "react";

type Tone = "available" | "accent" | "busy" | "off";

const tones: Record<Tone, string> = {
  available: "var(--status-available)",
  accent: "var(--accent)",
  busy: "var(--amber-500)",
  off: "var(--text-faint)",
};

// Live indicator with a soft pulse (the only loop in the UI). The pulse keyframes
// live in globals.css and are neutralised under prefers-reduced-motion.
export function StatusDot({
  tone = "available",
  size = 8,
  pulse = true,
  label,
  style,
}: {
  tone?: Tone;
  size?: number;
  pulse?: boolean;
  label?: string;
  style?: CSSProperties;
}) {
  const color = tones[tone];
  const dot = (
    <span
      style={{
        position: "relative",
        display: "inline-flex",
        width: size,
        height: size,
        flex: "none",
      }}
    >
      {pulse && (
        <span
          aria-hidden
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: "var(--radius-full)",
            background: color,
            animation: "kp-pulse 2.4s var(--ease-out) infinite",
          }}
        />
      )}
      <span
        style={{
          position: "relative",
          width: size,
          height: size,
          borderRadius: "var(--radius-full)",
          background: color,
        }}
      />
    </span>
  );

  if (!label) return <span style={style}>{dot}</span>;

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "var(--space-2)",
        ...style,
      }}
    >
      {dot}
      <span
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: "var(--text-2xs)",
          letterSpacing: "var(--tracking-wide)",
          textTransform: "uppercase",
          color: "var(--text-muted)",
        }}
      >
        {label}
      </span>
    </span>
  );
}
