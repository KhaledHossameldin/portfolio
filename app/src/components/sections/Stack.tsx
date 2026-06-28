"use client";

import { useTranslations } from "next-intl";
import { Reveal, RevealGroup } from "../motion/Reveal";
import { Tag } from "../ui/Tag";

type Group = { label: string; items: string[] };

const eyebrow = {
  fontFamily: "var(--font-mono)",
  fontSize: "var(--text-2xs)",
  letterSpacing: "var(--tracking-label)",
  textTransform: "uppercase",
} as const;

export function Stack() {
  const t = useTranslations("stack");
  const groups = t.raw("groups") as Group[];

  return (
    <section
      id="stack"
      style={{
        maxWidth: "var(--container)",
        margin: "0 auto",
        padding: "var(--space-10) var(--gutter)",
      }}
    >
      <Reveal>
        <header
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
            flexWrap: "wrap",
            gap: "var(--space-4)",
            marginBottom: "var(--space-8)",
          }}
        >
          <div>
            <span style={{ ...eyebrow, color: "var(--accent)" }}>— {t("eyebrow")}</span>
            <h2
              style={{
                font: "var(--type-h2)",
                letterSpacing: "var(--tracking-display)",
                margin: "var(--space-4) 0 0",
                maxWidth: "18ch",
              }}
            >
              {t("title")}
            </h2>
          </div>
          <p
            className="kp-em"
            style={{
              font: "var(--type-small)",
              color: "var(--text-faint)",
              fontStyle: "italic",
              maxWidth: "28ch",
              margin: 0,
            }}
          >
            {t("note")}
          </p>
        </header>
      </Reveal>

      <RevealGroup
        className="kp-stack-grid"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: "var(--space-6)",
        }}
      >
        {groups.map((g) => (
          <Reveal item key={g.label} style={{ borderTop: "1px solid var(--border)", paddingTop: "var(--space-4)" }}>
            <div
              style={{
                display: "flex",
                alignItems: "baseline",
                gap: "var(--space-2)",
                marginBottom: "var(--space-4)",
              }}
            >
              <span style={{ fontFamily: "var(--font-mono)", fontSize: "var(--text-2xs)", color: "var(--text-faint)" }}>
                {g.label}
              </span>
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "var(--space-2)" }}>
              {g.items.map((it) => (
                <Tag key={it} size="sm">
                  {it}
                </Tag>
              ))}
            </div>
          </Reveal>
        ))}
      </RevealGroup>
    </section>
  );
}
