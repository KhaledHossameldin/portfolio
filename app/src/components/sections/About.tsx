"use client";

import { useTranslations } from "next-intl";

type Fact = { k: string; v: string };

export function About() {
  const t = useTranslations("about");
  const facts = t.raw("facts") as Fact[];

  return (
    <section
      id="about"
      style={{
        maxWidth: "var(--container)",
        margin: "0 auto",
        padding: "var(--space-10) var(--gutter)",
      }}
    >
      <span
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: "var(--text-2xs)",
          letterSpacing: "var(--tracking-label)",
          textTransform: "uppercase",
          color: "var(--accent)",
        }}
      >
        — {t("eyebrow")}
      </span>
      <div
        className="kp-col2"
        style={{
          display: "grid",
          gridTemplateColumns: "1.4fr 1fr",
          gap: "var(--space-9)",
          marginTop: "var(--space-5)",
          alignItems: "start",
        }}
      >
        <div>
          <h2
            style={{
              font: "var(--type-h2)",
              letterSpacing: "var(--tracking-display)",
              margin: "0 0 var(--space-6)",
              maxWidth: "18ch",
            }}
          >
            {t("title")}
          </h2>
          <p style={{ font: "var(--type-lead)", color: "var(--text)", margin: "0 0 var(--space-5)", maxWidth: "54ch" }}>
            {t("body1")}
          </p>
          <p style={{ font: "var(--type-body)", color: "var(--text-muted)", margin: 0, maxWidth: "54ch" }}>
            {t("body2")}
          </p>
        </div>
        <dl style={{ margin: 0, display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
          {facts.map((f) => (
            <div key={f.k} style={{ borderTop: "1px solid var(--border)", paddingTop: "var(--space-3)" }}>
              <dt
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "var(--text-2xs)",
                  letterSpacing: "var(--tracking-label)",
                  textTransform: "uppercase",
                  color: "var(--text-faint)",
                  marginBottom: "var(--space-2)",
                }}
              >
                {f.k}
              </dt>
              <dd style={{ margin: 0, font: "var(--type-body)", color: "var(--text)" }}>{f.v}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
