"use client";

import { useLocale, useTranslations } from "next-intl";
import { getProject, pick } from "@/data/projects";
import type { Locale } from "@/i18n/routing";
import { Reveal } from "../motion/Reveal";
import { Parallax } from "../motion/Parallax";
import { Tag } from "../ui/Tag";
import { Button } from "../ui/Button";
import { ArrowLeft, ArrowRight, ArrowUpRight } from "../ui/icons";

const monoLabel = {
  fontFamily: "var(--font-mono)",
  fontSize: "var(--text-2xs)",
  letterSpacing: "var(--tracking-label)",
  textTransform: "uppercase",
  color: "var(--text-faint)",
} as const;

export function ProjectDetail({ slug }: { slug: string }) {
  const td = useTranslations("projectDetail");
  const locale = useLocale() as Locale;
  const home = `/${locale}`;

  const p = getProject(slug);
  if (!p) return null;

  const categoryLabel = (c: string) => {
    const raw = td.raw("category") as Record<string, string>;
    return raw[c] ?? c;
  };

  const meta = [
    { k: td("roleLabel"), v: pick(p.role, locale) },
    { k: td("periodLabel"), v: p.period },
    { k: td("categoryLabel"), v: categoryLabel(p.category) },
  ];

  return (
    <article
      style={{
        maxWidth: "var(--container)",
        margin: "0 auto",
        padding: "var(--space-8) var(--gutter) var(--space-10)",
      }}
    >
      <a
        href={`${home}#work`}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "var(--space-2)",
          ...monoLabel,
          color: "var(--text-muted)",
          textDecoration: "none",
        }}
      >
        <ArrowLeft className="kp-mirror" />
        {td("back")}
      </a>

      <header style={{ marginTop: "var(--space-7)", paddingBottom: "var(--space-7)", borderBottom: "1px solid var(--border)" }}>
        <span style={{ ...monoLabel, color: "var(--accent)" }}>— {categoryLabel(p.category)}</span>
        <h1
          style={{
            font: "var(--type-h1)",
            letterSpacing: "var(--tracking-display)",
            margin: "var(--space-4) 0 var(--space-3)",
          }}
        >
          {pick(p.title, locale)}
        </h1>
        <p style={{ font: "var(--type-lead)", color: "var(--text-muted)", margin: 0, maxWidth: "52ch" }}>
          {pick(p.tagline, locale)}
        </p>
      </header>

      {/* meta + summary */}
      <div
        className="kp-case-meta"
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 2fr",
          gap: "var(--space-9)",
          padding: "var(--space-7) 0",
          alignItems: "start",
        }}
      >
        <Parallax amount={6}>
          <dl style={{ margin: 0, display: "flex", flexDirection: "column", gap: "var(--space-5)" }}>
            {meta.map((row) => (
              <div key={row.k}>
                <dt style={monoLabel}>{row.k}</dt>
                <dd style={{ margin: "var(--space-1) 0 0", font: "var(--type-body)", color: "var(--text)" }}>{row.v}</dd>
              </div>
            ))}
          </dl>
        </Parallax>
        <Reveal>
          <p style={{ font: "var(--type-lead)", color: "var(--text)", margin: 0, maxWidth: "60ch" }}>{pick(p.summary, locale)}</p>
        </Reveal>
      </div>

      {/* highlights */}
      <Reveal
        style={{
          maxWidth: "var(--container-prose)",
          paddingTop: "var(--space-3)",
        }}
      >
        <h2 style={{ ...monoLabel, margin: "0 0 var(--space-5)" }}>{td("highlightsLabel")}</h2>
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-5)" }}>
          {pick(p.highlights, locale).map((h, i) => (
            <div key={i} style={{ borderInlineStart: "2px solid var(--accent-line)", paddingInlineStart: "var(--space-5)" }}>
              <p style={{ font: "var(--type-body)", color: "var(--text-muted)", margin: 0 }}>{h}</p>
            </div>
          ))}
        </div>
      </Reveal>

      {/* stack */}
      <Reveal style={{ paddingTop: "var(--space-8)" }}>
        <h2 style={{ ...monoLabel, margin: "0 0 var(--space-4)" }}>{td("stackLabel")}</h2>
        <div style={{ display: "flex", gap: "var(--space-2)", flexWrap: "wrap" }}>
          {pick(p.stack, locale).map((s) => (
            <Tag key={s} size="sm">
              {s}
            </Tag>
          ))}
        </div>
      </Reveal>

      {/* links */}
      {p.links.length > 0 && (
        <Reveal style={{ paddingTop: "var(--space-8)" }}>
          <h2 style={{ ...monoLabel, margin: "0 0 var(--space-4)" }}>{td("linksLabel")}</h2>
          <div style={{ display: "flex", gap: "var(--space-3)", flexWrap: "wrap" }}>
            {p.links.map((l) => (
              <Button key={l.url} variant="secondary" size="sm" href={l.url} iconRight={<ArrowUpRight size={16} className="kp-mirror" />}>
                {l.label}
              </Button>
            ))}
          </div>
        </Reveal>
      )}

      <a
        href={`${home}#work`}
        style={{
          display: "flex",
          width: "100%",
          justifyContent: "space-between",
          alignItems: "center",
          background: "var(--surface-card)",
          border: "1px solid var(--border)",
          borderRadius: "var(--radius-lg)",
          padding: "var(--space-6) var(--space-7)",
          marginTop: "var(--space-9)",
          color: "var(--text)",
          textDecoration: "none",
          boxShadow: "var(--shadow-sm)",
        }}
      >
        <span style={{ fontFamily: "var(--font-serif)", fontWeight: 400, fontSize: "var(--text-2xl)", letterSpacing: "var(--tracking-tight)" }}>
          {td("backAll")}
        </span>
        <span style={{ color: "var(--accent)", display: "inline-flex" }}>
          <ArrowRight size={24} className="kp-mirror" />
        </span>
      </a>
    </article>
  );
}
