"use client";

import { useLocale, useTranslations } from "next-intl";
import { Button } from "../ui/Button";
import { StatusDot } from "../ui/StatusDot";
import { ArrowUpRight } from "../ui/icons";

type PanelRow = { k: string; v: string };

const eyebrow = {
  fontFamily: "var(--font-mono)",
  fontSize: "var(--text-2xs)",
  letterSpacing: "var(--tracking-label)",
  textTransform: "uppercase",
  color: "var(--text-faint)",
} as const;

export function Hero() {
  const t = useTranslations("hero");
  const tStatus = useTranslations();
  const locale = useLocale();
  const home = `/${locale}`;
  const panel = t.raw("panel") as PanelRow[];

  return (
    <section
      className="kp-hero"
      style={{
        maxWidth: "var(--container)",
        margin: "0 auto",
        padding: "var(--space-11) var(--gutter) var(--space-10)",
        display: "grid",
        gridTemplateColumns: "minmax(0, 1.55fr) minmax(290px, 0.85fr)",
        gap: "var(--space-9)",
        alignItems: "center",
        minHeight: "78vh",
      }}
    >
      <div>
        <div
          data-rise
          style={{
            display: "flex",
            alignItems: "center",
            gap: "var(--space-4)",
            flexWrap: "wrap",
            animation: "kp-rise var(--dur-reveal) var(--ease-out) both",
          }}
        >
          <span style={eyebrow}>{t("eyebrow")}</span>
          <StatusDot tone="available" label={tStatus("status")} />
        </div>

        <h1
          data-rise
          style={{
            font: "var(--type-display)",
            letterSpacing: "var(--tracking-display)",
            margin: "var(--space-5) 0 0",
            color: "var(--text-strong)",
            maxWidth: "16ch",
            textWrap: "balance",
            animation: "kp-rise var(--dur-reveal) var(--ease-out) both",
            animationDelay: "80ms",
          }}
        >
          {t("line1")}{" "}
          <span style={{ fontStyle: "italic", color: "var(--text-muted)" }}>
            {t("line2")}
          </span>
        </h1>

        <p
          data-rise
          style={{
            font: "var(--type-lead)",
            color: "var(--text-muted)",
            margin: "var(--space-6) 0 0",
            maxWidth: "48ch",
            animation: "kp-rise var(--dur-reveal) var(--ease-out) both",
            animationDelay: "160ms",
          }}
        >
          {t("lead")}
        </p>

        <div
          data-rise
          style={{
            display: "flex",
            gap: "var(--space-3)",
            marginTop: "var(--space-7)",
            flexWrap: "wrap",
            animation: "kp-rise var(--dur-reveal) var(--ease-out) both",
            animationDelay: "240ms",
          }}
        >
          <Button
            variant="primary"
            size="lg"
            href={`${home}#contact`}
            iconRight={<ArrowUpRight />}
          >
            {t("ctaPrimary")}
          </Button>
          <Button variant="secondary" size="lg" href={`${home}#work`}>
            {t("ctaSecondary")}
          </Button>
        </div>
      </div>

      {/* spec panel */}
      <aside
        data-rise
        style={{
          border: "1px solid var(--border)",
          borderRadius: "var(--radius-lg)",
          background: "var(--surface-card)",
          boxShadow: "var(--shadow-sm)",
          padding: "var(--space-6)",
          animation: "kp-rise var(--dur-reveal) var(--ease-out) both",
          animationDelay: "320ms",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            paddingBottom: "var(--space-4)",
            borderBottom: "1px solid var(--border)",
          }}
        >
          <span style={eyebrow}>{t("panelLabel")}</span>
          <StatusDot tone="available" size={12} />
        </div>
        <dl style={{ margin: 0, display: "flex", flexDirection: "column" }}>
          {panel.map((row) => (
            <div
              key={row.k}
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 2,
                padding: "var(--space-3) 0",
                borderBottom: "1px solid var(--border-faint)",
              }}
            >
              <dt style={eyebrow}>{row.k}</dt>
              <dd style={{ margin: 0, fontSize: "var(--text-sm)", color: "var(--text)" }}>
                {row.v}
              </dd>
            </div>
          ))}
        </dl>
      </aside>
    </section>
  );
}
