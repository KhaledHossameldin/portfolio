"use client";

import { useLocale, useTranslations } from "next-intl";
import { usePathname } from "@/i18n/navigation";
import { handleHashClick } from "@/lib/motion/scrollToHash";
import { Reveal } from "../motion/Reveal";
import { LangToggle, ThemeToggle } from "../Toggles";

type FooterLink = { label: string; href: string };

export function Footer() {
  const t = useTranslations("footer");
  const locale = useLocale();
  const pathname = usePathname();
  const links = t.raw("links") as FooterLink[];
  // Smooth-scroll in place when already home; otherwise route to the home anchor.
  const contactHref = pathname === "/" ? "#contact" : `/${locale}#contact`;

  return (
    <footer style={{ borderTop: "1px solid var(--border)", marginTop: "var(--space-9)", background: "var(--bg)" }}>
      <div
        style={{
          maxWidth: "var(--container)",
          margin: "0 auto",
          padding: "var(--space-9) var(--gutter) var(--space-6)",
        }}
      >
        <Reveal>
          <a
            href={contactHref}
            onClick={(e) => handleHashClick(e, contactHref)}
            style={{ textDecoration: "none", color: "inherit" }}
          >
            <h2
              style={{
                font: "var(--type-h2)",
                letterSpacing: "var(--tracking-display)",
                margin: "0 0 var(--space-7)",
                maxWidth: "16ch",
              }}
            >
              {t("headline")}
            </h2>
          </a>
        </Reveal>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
            flexWrap: "wrap",
            gap: "var(--space-6)",
          }}
        >
          <div style={{ display: "flex", flexWrap: "wrap", gap: "var(--space-5)" }}>
            {links.map((l) => (
              <a
                key={l.label}
                href={l.href}
                target={/^https?:|\.pdf$/.test(l.href) ? "_blank" : undefined}
                rel={/^https?:|\.pdf$/.test(l.href) ? "noopener noreferrer" : undefined}
                style={{
                  display: "inline-flex",
                  alignItems: "baseline",
                  gap: "var(--space-2)",
                  fontFamily: "var(--font-mono)",
                  fontSize: "var(--text-sm)",
                  color: "var(--text-muted)",
                  textDecoration: "none",
                }}
              >
                <span style={{ color: "var(--text-faint)" }}>↗</span>
                {l.label}
              </a>
            ))}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "var(--space-3)" }}>
            <LangToggle />
            <ThemeToggle />
          </div>
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "var(--space-3)",
            marginTop: "var(--space-8)",
            paddingTop: "var(--space-5)",
            borderTop: "1px solid var(--border-faint)",
            fontFamily: "var(--font-mono)",
            fontSize: "var(--text-2xs)",
            letterSpacing: "var(--tracking-wide)",
            color: "var(--text-faint)",
          }}
        >
          <span>{t("colophon")}</span>
          <span style={{ fontStyle: "italic" }}>{t("signoff")}</span>
        </div>
      </div>
    </footer>
  );
}
