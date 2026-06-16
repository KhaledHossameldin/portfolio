"use client";

import { useLocale } from "next-intl";
import { useTransition, type CSSProperties } from "react";
import { usePathname, useRouter } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { useTheme } from "./ThemeProvider";

const segBase: CSSProperties = {
  appearance: "none",
  border: "none",
  cursor: "pointer",
  padding: "0 var(--space-3)",
  height: 28,
  borderRadius: "var(--radius-xs)",
  fontFamily: "var(--font-mono)",
  fontSize: "var(--text-2xs)",
  letterSpacing: "var(--tracking-wide)",
  textTransform: "uppercase",
  transition:
    "color var(--dur-fast) var(--ease-out), background var(--dur-fast) var(--ease-out)",
};

function seg(active: boolean): CSSProperties {
  return active
    ? {
        ...segBase,
        background: "var(--surface)",
        color: "var(--text)",
        boxShadow: "var(--shadow-xs)",
      }
    : {
        ...segBase,
        background: "transparent",
        color: "var(--text-faint)",
        boxShadow: "none",
      };
}

const groupStyle: CSSProperties = {
  display: "inline-flex",
  gap: 2,
  padding: 3,
  borderRadius: "var(--radius)",
  background: "var(--surface-inset)",
  border: "1px solid var(--border)",
};

/** Language toggle — a real route switch between /en and /de (no middleware). */
export function LangToggle() {
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const [, startTransition] = useTransition();

  function switchTo(next: string) {
    if (next === locale) return;
    startTransition(() => {
      router.replace(pathname, { locale: next });
    });
  }

  return (
    <div role="group" aria-label="Language" style={groupStyle}>
      {routing.locales.map((l) => (
        <button
          key={l}
          type="button"
          aria-pressed={locale === l}
          onClick={() => switchTo(l)}
          style={seg(locale === l)}
        >
          {l.toUpperCase()}
        </button>
      ))}
    </div>
  );
}

/** Theme toggle — client state on <html data-theme>, persisted to localStorage. */
export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  return (
    <div role="group" aria-label="Theme" style={groupStyle}>
      <button
        type="button"
        aria-pressed={theme === "light"}
        onClick={() => setTheme("light")}
        style={seg(theme === "light")}
      >
        Light
      </button>
      <button
        type="button"
        aria-pressed={theme === "dark"}
        onClick={() => setTheme("dark")}
        style={seg(theme === "dark")}
      >
        Dark
      </button>
    </div>
  );
}
