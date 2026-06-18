"use client";

import { useEffect, useRef } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useReducedMotion } from "@/lib/motion/useReducedMotion";
import { Reveal } from "../motion/Reveal";
import { Parallax } from "../motion/Parallax";
import { Tag } from "../ui/Tag";
import { ArrowLeft, ArrowRight } from "../ui/icons";

type Metric = { n: string; l: string };

const monoLabel = {
  fontFamily: "var(--font-mono)",
  fontSize: "var(--text-2xs)",
  letterSpacing: "var(--tracking-label)",
  textTransform: "uppercase",
  color: "var(--text-faint)",
} as const;

export function CaseStudy() {
  const t = useTranslations("case");
  const locale = useLocale();
  const home = `/${locale}`;
  const metrics = t.raw("metrics") as Metric[];
  const stack = t.raw("stack") as string[];

  const reduced = useReducedMotion();
  const articleRef = useRef<HTMLElement>(null);
  const headerRef = useRef<HTMLElement>(null);

  // Pin the case-study header while the meta + narrative scroll past. Distance
  // is derived from the narrative end (endTrigger), never hard-coded, so longer
  // DE copy doesn't break it. Lenis drives ScrollTrigger.update (set up in the
  // provider), so the pin tracks the smooth scroll.
  useEffect(() => {
    const header = headerRef.current;
    const article = articleRef.current;
    if (reduced || !header || !article) return;

    let cancelled = false;
    let cleanup = () => {};

    (async () => {
      const [{ ScrollTrigger }] = await Promise.all([
        import("gsap/ScrollTrigger"),
        import("gsap"),
      ]);
      if (cancelled) return;
      const { gsap } = await import("gsap");
      gsap.registerPlugin(ScrollTrigger);

      const st = ScrollTrigger.create({
        trigger: header,
        start: "top 76px",
        endTrigger: article,
        end: "bottom 80%",
        pin: header,
        pinSpacing: true,
      });

      cleanup = () => st.kill();
    })();

    return () => {
      cancelled = true;
      cleanup();
    };
  }, [reduced]);

  return (
    <article
      ref={articleRef}
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
          fontFamily: "var(--font-mono)",
          fontSize: "var(--text-2xs)",
          letterSpacing: "var(--tracking-label)",
          textTransform: "uppercase",
          color: "var(--text-muted)",
          textDecoration: "none",
        }}
      >
        <ArrowLeft />
        {t("back")}
      </a>

      <header ref={headerRef} style={{ marginTop: "var(--space-7)", paddingBottom: "var(--space-7)", borderBottom: "1px solid var(--border)", background: "var(--bg)" }}>
        <span style={{ ...monoLabel, color: "var(--accent)" }}>— {t("eyebrow")}</span>
        <h1
          style={{
            font: "var(--type-h1)",
            letterSpacing: "var(--tracking-display)",
            margin: "var(--space-4) 0 var(--space-3)",
          }}
        >
          {t("title")}
        </h1>
        <p style={{ font: "var(--type-lead)", color: "var(--text-muted)", margin: 0, maxWidth: "46ch" }}>
          {t("subtitle")}
        </p>
      </header>

      {/* meta + metrics */}
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
        <dl style={{ margin: 0, display: "flex", flexDirection: "column", gap: "var(--space-5)" }}>
          {[
            { k: t("roleLabel"), v: t("roleVal") },
            { k: t("clientLabel"), v: t("clientVal") },
            { k: t("yearLabel"), v: t("yearVal") },
          ].map((row) => (
            <div key={row.k}>
              <dt style={monoLabel}>{row.k}</dt>
              <dd style={{ margin: "var(--space-1) 0 0", font: "var(--type-body)", color: "var(--text)" }}>{row.v}</dd>
            </div>
          ))}
        </dl>
        <Parallax amount={6} style={{ display: "flex", gap: "var(--space-8)", flexWrap: "wrap" }}>
          {metrics.map((m) => (
            <div key={m.l}>
              <div
                style={{
                  fontFamily: "var(--font-serif)",
                  fontWeight: 400,
                  fontSize: "var(--text-3xl)",
                  letterSpacing: "var(--tracking-display)",
                  color: "var(--accent)",
                  lineHeight: 1,
                }}
              >
                {m.n}
              </div>
              <div
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "var(--text-2xs)",
                  letterSpacing: "var(--tracking-wide)",
                  color: "var(--text-faint)",
                  marginTop: "var(--space-2)",
                  maxWidth: "18ch",
                }}
              >
                {m.l}
              </div>
            </div>
          ))}
        </Parallax>
      </div>

      {/* narrative */}
      <Reveal
        style={{
          maxWidth: "var(--container-prose)",
          display: "flex",
          flexDirection: "column",
          gap: "var(--space-8)",
          paddingTop: "var(--space-5)",
        }}
      >
        <div>
          <h2 style={{ ...monoLabel, margin: "0 0 var(--space-4)" }}>{t("problemLabel")}</h2>
          <p style={{ font: "var(--type-lead)", color: "var(--text)", margin: 0 }}>{t("problemBody")}</p>
        </div>

        <div>
          <h2 style={{ ...monoLabel, margin: "0 0 var(--space-5)" }}>{t("builtLabel")}</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-5)" }}>
            <div style={{ borderLeft: "2px solid var(--accent-line)", paddingLeft: "var(--space-5)" }}>
              <h3
                style={{
                  fontFamily: "var(--font-serif)",
                  fontWeight: 400,
                  fontSize: "var(--text-xl)",
                  letterSpacing: "var(--tracking-tight)",
                  margin: "0 0 var(--space-2)",
                }}
              >
                {t("appLabel")}
              </h3>
              <p style={{ font: "var(--type-body)", color: "var(--text-muted)", margin: 0 }}>{t("appBody")}</p>
            </div>
            <div style={{ borderLeft: "2px solid var(--accent-line)", paddingLeft: "var(--space-5)" }}>
              <h3
                style={{
                  fontFamily: "var(--font-serif)",
                  fontWeight: 400,
                  fontSize: "var(--text-xl)",
                  letterSpacing: "var(--tracking-tight)",
                  margin: "0 0 var(--space-2)",
                }}
              >
                {t("cloudLabel")}
              </h3>
              <p style={{ font: "var(--type-body)", color: "var(--text-muted)", margin: 0 }}>{t("cloudBody")}</p>
            </div>
          </div>
        </div>

        <div>
          <h2 style={{ ...monoLabel, margin: "0 0 var(--space-4)" }}>{t("stackLabel")}</h2>
          <div style={{ display: "flex", gap: "var(--space-2)", flexWrap: "wrap" }}>
            {stack.map((s) => (
              <Tag key={s} size="sm">
                {s}
              </Tag>
            ))}
          </div>
        </div>

        <div>
          <h2 style={{ ...monoLabel, margin: "0 0 var(--space-4)" }}>{t("outcomeLabel")}</h2>
          <p style={{ font: "var(--type-lead)", color: "var(--text)", margin: 0 }}>{t("outcomeBody")}</p>
        </div>

        <div style={{ borderTop: "1px solid var(--border)", paddingTop: "var(--space-5)" }}>
          <h2 style={{ ...monoLabel, margin: "0 0 var(--space-3)" }}>{t("noteLabel")}</h2>
          <p style={{ font: "var(--type-body)", color: "var(--text-muted)", margin: 0, fontStyle: "italic" }}>
            {t("noteBody")}
          </p>
        </div>
      </Reveal>

      <a
        href={`${home}#work`}
        style={{
          display: "flex",
          width: "100%",
          justifyContent: "space-between",
          alignItems: "center",
          textAlign: "left",
          background: "var(--surface-card)",
          border: "1px solid var(--border)",
          borderRadius: "var(--radius-lg)",
          padding: "var(--space-6) var(--space-7)",
          marginTop: "var(--space-8)",
          color: "var(--text)",
          textDecoration: "none",
          boxShadow: "var(--shadow-sm)",
        }}
      >
        <span style={{ fontFamily: "var(--font-serif)", fontWeight: 400, fontSize: "var(--text-2xl)", letterSpacing: "var(--tracking-tight)" }}>
          {t("backAll")}
        </span>
        <span style={{ color: "var(--accent)", display: "inline-flex" }}>
          <ArrowRight size={24} />
        </span>
      </a>
    </article>
  );
}
