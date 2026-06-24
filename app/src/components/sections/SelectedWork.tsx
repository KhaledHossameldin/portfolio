"use client";

import { useLocale, useTranslations } from "next-intl";
import { Reveal } from "../motion/Reveal";
import { Card } from "../ui/Card";
import { Tag } from "../ui/Tag";
import { ArrowUpRight } from "../ui/icons";

type Link = { label: string; url: string };

type Project = {
  slug: string;
  title: string;
  tagline: string;
  role: string;
  contribution?: "author" | "lead" | "developer" | "maintenance";
  period: string;
  category: string;
  summary: string;
  stack: string[];
  highlights: string[];
  links: Link[];
  detail: boolean;
};

type AlsoItem = {
  kind: "oss" | "paper";
  title: string;
  meta: string;
  desc: string;
  role: string;
  year?: string;
  links: Link[];
  cite?: string;
  citeUrl?: string;
};

const eyebrow = {
  fontFamily: "var(--font-mono)",
  fontSize: "var(--text-2xs)",
  letterSpacing: "var(--tracking-label)",
  textTransform: "uppercase",
} as const;

const metaMono = {
  fontFamily: "var(--font-mono)",
  fontSize: "var(--text-xs)",
  letterSpacing: "var(--tracking-wide)",
  color: "var(--text-faint)",
} as const;

const storeLink = {
  display: "inline-flex",
  alignItems: "center",
  gap: "var(--space-1)",
  fontFamily: "var(--font-mono)",
  fontSize: "var(--text-2xs)",
  letterSpacing: "var(--tracking-wide)",
  textTransform: "uppercase",
  color: "var(--text-muted)",
  textDecoration: "none",
  border: "1px solid var(--border-strong)",
  borderRadius: "var(--radius-full)",
  padding: "2px var(--space-3)",
  whiteSpace: "nowrap",
} as const;

export function SelectedWork() {
  const t = useTranslations("work");
  const tAlso = useTranslations("also");
  const td = useTranslations("projectDetail");
  const tRoot = useTranslations();
  const locale = useLocale();

  const projects = tRoot.raw("projects") as Project[];
  const also = tAlso.raw("items") as AlsoItem[];
  const total = String(projects.length).padStart(2, "0");

  const contributionTag = (c?: string) => {
    if (c === "maintenance") return td("tagMaintenance");
    if (c === "lead") return td("tagLead");
    if (c === "author") return td("tagAuthor");
    return null;
  };
  const categoryLabel = (c: string) => {
    const raw = td.raw("category") as Record<string, string>;
    return raw[c] ?? c;
  };

  return (
    <section
      id="work"
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
                maxWidth: "20ch",
              }}
            >
              {t("title")}
            </h2>
          </div>
          <p
            style={{
              font: "var(--type-small)",
              color: "var(--text-faint)",
              fontStyle: "italic",
              maxWidth: "30ch",
              margin: 0,
            }}
          >
            {t("note")}
          </p>
        </header>
      </Reveal>

      {/* Plain grid (not RevealGroup): each card reveals on its OWN whileInView
          so every card animates uniformly as it scrolls in, rather than the whole
          grid staggering at once (which left lower cards animating off-screen). */}
      <div
        className="kp-work-grid"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(2, 1fr)",
          gap: "var(--space-5)",
        }}
      >
        {projects.map((p, i) => {
          const idx = String(i + 1).padStart(2, "0");
          const cTag = contributionTag(p.contribution);
          const cardHref = p.detail ? `/${locale}/work/${p.slug}` : undefined;

          const head = (
            <>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  gap: "var(--space-4)",
                }}
              >
                <span style={metaMono}>
                  <span style={{ color: "var(--text)", fontWeight: "var(--weight-medium)" }}>{idx}</span> /{" "}
                  {total} &nbsp;·&nbsp; {categoryLabel(p.category)}
                </span>
                {p.detail ? (
                  <span style={{ color: "var(--text-faint)", display: "inline-flex" }}>
                    <ArrowUpRight />
                  </span>
                ) : (
                  cTag && (
                    <span
                      style={{
                        ...eyebrow,
                        fontSize: "var(--text-2xs)",
                        color: "var(--text-faint)",
                        border: "1px solid var(--border-strong)",
                        borderRadius: "var(--radius-full)",
                        padding: "2px var(--space-2)",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {cTag}
                    </span>
                  )
                )}
              </div>

              <h3
                style={{
                  fontFamily: "var(--font-serif)",
                  fontWeight: 400,
                  fontSize: "var(--text-2xl)",
                  letterSpacing: "var(--tracking-tight)",
                  margin: "var(--space-5) 0 var(--space-1)",
                }}
              >
                {p.title}
              </h3>
              <p
                style={{
                  font: "var(--type-body)",
                  color: "var(--text-muted)",
                  margin: "0 0 var(--space-5)",
                  display: "-webkit-box",
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden",
                }}
              >
                {p.tagline}
              </p>
            </>
          );

          // Bottom block — stack tags (+ store links for non-detail cards),
          // pushed to the card's base with margin-top:auto so footers align
          // across a row even when taglines differ in length.
          const footer = (
            <div style={{ marginTop: "auto" }}>
              <div style={{ display: "flex", gap: "var(--space-2)", flexWrap: "wrap" }}>
                {p.stack.slice(0, 5).map((s) => (
                  <Tag key={s} size="sm">
                    {s}
                  </Tag>
                ))}
              </div>
              {/* Non-detail cards: surface store links so they aren't dead ends.
                  drs-space has no links → nothing renders. */}
              {!p.detail && p.links.length > 0 && (
                <div style={{ display: "flex", gap: "var(--space-2)", flexWrap: "wrap", marginTop: "var(--space-5)" }}>
                  {p.links.map((l) => (
                    <a
                      key={l.url}
                      href={l.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={storeLink}
                    >
                      {l.label}
                      <ArrowUpRight size={12} />
                    </a>
                  ))}
                </div>
              )}
            </div>
          );

          return (
            <Reveal key={p.slug} style={{ height: "100%" }}>
              <Card
                interactive={p.detail}
                href={cardHref}
                padding="var(--space-7)"
                style={{ height: "100%", display: "flex", flexDirection: "column" }}
              >
                {head}
                {footer}
              </Card>
            </Reveal>
          );
        })}
      </div>

      {/* open source & writing — NOT work cards */}
      <Reveal style={{ marginTop: "var(--space-9)" }}>
        <span style={{ ...eyebrow, color: "var(--text-faint)" }}>— {tAlso("eyebrow")}</span>
        <div style={{ marginTop: "var(--space-5)", display: "flex", flexDirection: "column", gap: "var(--space-6)" }}>
          {also.map((a) => (
            <div
              key={a.title}
              style={{
                borderTop: "1px solid var(--border)",
                paddingTop: "var(--space-5)",
                display: "grid",
                gridTemplateColumns: "1fr",
                gap: "var(--space-3)",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: "var(--space-4)", flexWrap: "wrap" }}>
                <span
                  style={{
                    fontFamily: "var(--font-serif)",
                    fontSize: "var(--text-xl)",
                    letterSpacing: "var(--tracking-tight)",
                    color: "var(--text-strong)",
                  }}
                >
                  {a.title}
                </span>
                <span style={metaMono}>
                  {a.meta}
                  {a.year ? ` · ${a.year}` : ""} · {a.role}
                </span>
              </div>
              <p style={{ font: "var(--type-body)", color: "var(--text-muted)", margin: 0, maxWidth: "70ch" }}>
                {a.desc}
              </p>
              <div style={{ display: "flex", gap: "var(--space-3)", flexWrap: "wrap", alignItems: "center" }}>
                {a.links.map((l) => (
                  <a key={l.url} href={l.url} target="_blank" rel="noopener noreferrer" style={storeLink}>
                    {l.label}
                    <ArrowUpRight size={12} />
                  </a>
                ))}
                {a.cite && (
                  <a
                    href={a.citeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ ...metaMono, textDecoration: "none", color: "var(--text-muted)" }}
                  >
                    {a.cite}
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      </Reveal>
    </section>
  );
}
