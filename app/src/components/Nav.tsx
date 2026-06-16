"use client";

import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Button } from "./ui/Button";
import { LangToggle, ThemeToggle } from "./Toggles";

const navLink = {
  display: "inline-flex",
  alignItems: "baseline",
  gap: 6,
  color: "var(--text-muted)",
  textDecoration: "none",
  fontSize: "var(--text-sm)",
  fontWeight: "var(--weight-medium)",
} as const;

const navIdx = {
  fontFamily: "var(--font-mono)",
  fontSize: "var(--text-2xs)",
  color: "var(--text-faint)",
} as const;

// Sticky header with backdrop blur and mono-indexed links. Anchor links resolve
// against the locale home so they work from the case-study route too.
export function Nav() {
  const t = useTranslations("nav");
  const locale = useLocale();
  const home = `/${locale}`;

  return (
    <header
      style={{
        position: "sticky",
        top: 0,
        zIndex: 100,
        display: "flex",
        alignItems: "center",
        gap: "var(--space-5)",
        flexWrap: "wrap",
        padding: "var(--space-3) var(--gutter)",
        background: "color-mix(in srgb, var(--bg) 80%, transparent)",
        backdropFilter: "saturate(140%) blur(14px)",
        WebkitBackdropFilter: "saturate(140%) blur(14px)",
        borderBottom: "1px solid var(--border)",
      }}
    >
      <Link
        href="/"
        style={{
          flex: "none",
          fontFamily: "var(--font-serif)",
          fontSize: "var(--text-xl)",
          letterSpacing: "var(--tracking-tight)",
          color: "var(--text-strong)",
          textDecoration: "none",
        }}
      >
        Khaled<span style={{ color: "var(--accent)" }}>.</span>
      </Link>

      <nav
        className="kp-nav-links"
        style={{
          display: "flex",
          alignItems: "center",
          gap: "var(--space-5)",
          marginLeft: "var(--space-3)",
        }}
      >
        <a href={`${home}#work`} style={navLink}>
          <span style={navIdx}>01</span>
          {t("work")}
        </a>
        <a href={`${home}#about`} style={navLink}>
          <span style={navIdx}>02</span>
          {t("about")}
        </a>
        <a href={`${home}#stack`} style={navLink}>
          <span style={navIdx}>03</span>
          {t("stack")}
        </a>
        <a href={`${home}#contact`} style={navLink}>
          <span style={navIdx}>04</span>
          {t("contact")}
        </a>
      </nav>

      <div
        style={{
          marginLeft: "auto",
          display: "flex",
          alignItems: "center",
          gap: "var(--space-3)",
          flexWrap: "wrap",
        }}
      >
        <LangToggle />
        <ThemeToggle />
        <Button variant="primary" size="sm" href={`${home}#contact`}>
          {t("cta")}
        </Button>
      </div>
    </header>
  );
}
