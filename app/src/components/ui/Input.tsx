"use client";

import { useState, type CSSProperties } from "react";

type CommonProps = {
  label?: string;
  hint?: string;
  error?: string;
  name?: string;
  id?: string;
  required?: boolean;
  placeholder?: string;
  style?: CSSProperties;
};

const labelStyle: CSSProperties = {
  fontFamily: "var(--font-mono)",
  fontSize: "var(--text-2xs)",
  letterSpacing: "var(--tracking-label)",
  textTransform: "uppercase",
  color: "var(--text-faint)",
};

function fieldBorder(error?: string, focused?: boolean) {
  return `1px solid ${
    error ? "var(--red-500)" : focused ? "var(--accent)" : "var(--border-strong)"
  }`;
}

export function Input({
  label,
  hint,
  error,
  id,
  name,
  type = "text",
  required,
  placeholder,
  style,
  autoComplete,
}: CommonProps & { type?: string; autoComplete?: string }) {
  const inputId =
    id || (label ? `in-${label.replace(/\s+/g, "-").toLowerCase()}` : undefined);
  const [focused, setFocused] = useState(false);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)", ...style }}>
      {label && (
        <label htmlFor={inputId} style={labelStyle}>
          {label}
        </label>
      )}
      <input
        id={inputId}
        name={name}
        type={type}
        required={required}
        placeholder={placeholder}
        autoComplete={autoComplete}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{
          height: 46,
          padding: "0 var(--space-4)",
          fontFamily: "var(--font-sans)",
          fontSize: "var(--text-base)",
          color: "var(--text)",
          background: "var(--surface-inset)",
          border: fieldBorder(error, focused),
          borderRadius: "var(--radius)",
          outline: "none",
          boxShadow: focused && !error ? "0 0 0 3px var(--accent-soft)" : "none",
          transition:
            "border-color var(--dur-fast) var(--ease-out), box-shadow var(--dur-fast) var(--ease-out)",
        }}
      />
      {(hint || error) && (
        <span
          style={{
            fontSize: "var(--text-xs)",
            color: error ? "var(--red-500)" : "var(--text-faint)",
          }}
        >
          {error || hint}
        </span>
      )}
    </div>
  );
}

export function Textarea({
  label,
  hint,
  error,
  id,
  name,
  rows = 4,
  required,
  placeholder,
  style,
}: CommonProps & { rows?: number }) {
  const inputId =
    id || (label ? `ta-${label.replace(/\s+/g, "-").toLowerCase()}` : undefined);
  const [focused, setFocused] = useState(false);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)", ...style }}>
      {label && (
        <label htmlFor={inputId} style={labelStyle}>
          {label}
        </label>
      )}
      <textarea
        id={inputId}
        name={name}
        rows={rows}
        required={required}
        placeholder={placeholder}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{
          padding: "var(--space-3) var(--space-4)",
          fontFamily: "var(--font-sans)",
          fontSize: "var(--text-base)",
          lineHeight: "var(--lh-normal)",
          color: "var(--text)",
          background: "var(--surface-inset)",
          border: fieldBorder(error, focused),
          borderRadius: "var(--radius)",
          outline: "none",
          resize: "vertical",
          boxShadow: focused && !error ? "0 0 0 3px var(--accent-soft)" : "none",
          transition:
            "border-color var(--dur-fast) var(--ease-out), box-shadow var(--dur-fast) var(--ease-out)",
        }}
      />
      {(hint || error) && (
        <span
          style={{
            fontSize: "var(--text-xs)",
            color: error ? "var(--red-500)" : "var(--text-faint)",
          }}
        >
          {error || hint}
        </span>
      )}
    </div>
  );
}
