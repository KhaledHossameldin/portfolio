"use client";

import { useLocale, useTranslations } from "next-intl";
import { Card } from "../ui/Card";
import { Tag } from "../ui/Tag";
import { ArrowUpRight } from "../ui/icons";

type Project = {
  id: string;
  tag: string;
  title: string;
  subtitle: string;
  blurb: string;
  stack: string[];
  action: "case" | "external" | "none";
  href?: string;
  badge: string | null;
  top: "arrow" | "badge";
};

type AlsoItem = {
  title: string;
  meta: string;
  year: string;
  role: string;
  href: string;
};

const eyebrow = {
  fontFamily: "var(--font-mono)",
  fontSize: "var(--text-2xs)",
  letterSpacing: "var(--tracking-label)",
  textTransform: "uppercase",
} as const;

export function SelectedWork() {
  const t = useTranslations("work");
  const tAlso = useTranslations("also");
  const tProjects = useTranslations();
  const locale = useLocale();
  const projects = tProjects.raw("projects") as Project[];
  const also = tAlso.raw("items") as AlsoItem[];
  const total = String(projects.length).padStart(2, "0");

  return (
    <section
      id="work"
      style={{
        maxWidth: "var(--container)",
        margin: "0 auto",
        padding: "var(--space-10) var(--gutter)",
      }}
    >
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
            maxWidth: "28ch",
            margin: 0,
          }}
        >
          {t("note")}
        </p>
      </header>

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
          const interactive = p.action !== "none";
          const cardHref =
            p.action === "case"
              ? `/${locale}/work/${p.id}`
              : p.action === "external"
                ? p.href
                : undefined;

          return (
            <Card
              key={p.id}
              interactive={interactive}
              href={cardHref}
              external={p.action === "external"}
              padding="var(--space-7)"
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  gap: "var(--space-4)",
                }}
              >
                <span
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: "var(--text-xs)",
                    letterSpacing: "var(--tracking-wide)",
                    color: "var(--text-faint)",
                  }}
                >
                  <span style={{ color: "var(--text)", fontWeight: "var(--weight-medium)" }}>
                    {idx}
                  </span>{" "}
                  / {total} &nbsp;·&nbsp; {p.tag}
                </span>
                {p.top === "arrow" && (
                  <span style={{ color: "var(--text-faint)", display: "inline-flex" }}>
                    <ArrowUpRight />
                  </span>
                )}
                {p.top === "badge" && p.badge && (
                  <span
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: "var(--text-2xs)",
                      letterSpacing: "var(--tracking-wide)",
                      textTransform: "uppercase",
                      color: "var(--text-faint)",
                      border: "1px solid var(--border-strong)",
                      borderRadius: "var(--radius-full)",
                      padding: "2px var(--space-2)",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {p.badge}
                  </span>
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
                }}
              >
                <span style={{ color: "var(--text)" }}>{p.subtitle}.</span> {p.blurb}
              </p>
              <div style={{ display: "flex", gap: "var(--space-2)", flexWrap: "wrap" }}>
                {p.stack.map((s) => (
                  <Tag key={s} size="sm">
                    {s}
                  </Tag>
                ))}
              </div>
            </Card>
          );
        })}
      </div>

      {/* open source & writing */}
      <div style={{ marginTop: "var(--space-8)" }}>
        <span style={{ ...eyebrow, color: "var(--text-faint)" }}>— {tAlso("eyebrow")}</span>
        <div style={{ marginTop: "var(--space-4)" }}>
          {also.map((a) => (
            <a
              key={a.title}
              href={a.href}
              target={a.href.startsWith("http") ? "_blank" : undefined}
              rel={a.href.startsWith("http") ? "noopener noreferrer" : undefined}
              className="kp-also-row"
              style={{
                display: "grid",
                gridTemplateColumns: "1fr auto auto",
                gap: "var(--space-5)",
                alignItems: "baseline",
                padding: "var(--space-4) 0",
                borderTop: "1px solid var(--border)",
                color: "var(--text)",
                textDecoration: "none",
              }}
            >
              <span style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <span
                  style={{
                    fontFamily: "var(--font-serif)",
                    fontSize: "var(--text-lg)",
                    letterSpacing: "var(--tracking-tight)",
                    color: "var(--text-strong)",
                  }}
                >
                  {a.title}
                </span>
                <span
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: "var(--text-2xs)",
                    letterSpacing: "var(--tracking-wide)",
                    color: "var(--text-faint)",
                  }}
                >
                  {a.meta}
                </span>
              </span>
              <span style={{ fontSize: "var(--text-sm)", color: "var(--text-muted)" }}>
                {a.role}
              </span>
              <span
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "var(--text-xs)",
                  color: "var(--text-faint)",
                }}
              >
                {a.year}
              </span>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
