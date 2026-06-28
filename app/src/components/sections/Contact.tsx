"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Reveal } from "../motion/Reveal";
import { Button } from "../ui/Button";
import { Input, Textarea } from "../ui/Input";
import { StatusDot } from "../ui/StatusDot";
import { ArrowUpRight, Github, Linkedin, Mail } from "../ui/icons";

type Status = "idle" | "sending" | "sent" | "error";

const directLink = {
  display: "inline-flex",
  alignItems: "center",
  gap: "var(--space-3)",
  fontFamily: "var(--font-mono)",
  fontSize: "var(--text-sm)",
  color: "var(--text)",
  textDecoration: "none",
} as const;

export function Contact() {
  const t = useTranslations("contact");
  const [status, setStatus] = useState<Status>("idle");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);

    // Honeypot: real users leave `hp_token` empty. Field name MUST match the
    // Lambda's check (index.mjs `data.hp_token`) or the server trap is inert.
    // Name is deliberately not a real field (e.g. company/email) so browser
    // autofill never populates it and drops a legit submission. If filled,
    // treat as a quiet success.
    if (data.get("hp_token")) {
      setStatus("sent");
      form.reset();
      return;
    }

    const endpoint = process.env.NEXT_PUBLIC_CONTACT_API_URL;

    // The real endpoint is provisioned by DevOps later (§10). Until it is wired,
    // this is a config gap (not a user error) — warn the developer in the console
    // and surface the graceful error state that points to the direct links below.
    if (!endpoint) {
      console.warn(
        "NEXT_PUBLIC_CONTACT_API_URL is not set — contact form falls back to the direct links.",
      );
      setStatus("error");
      return;
    }

    setStatus("sending");

    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: data.get("name"),
          email: data.get("email"),
          message: data.get("message"),
          hp_token: data.get("hp_token"),
        }),
      });
      if (!res.ok) throw new Error(String(res.status));
      setStatus("sent");
      form.reset();
    } catch {
      setStatus("error");
    }
  }

  return (
    <section
      aria-labelledby="contact-heading"
      style={{
        maxWidth: "var(--container)",
        margin: "0 auto",
        padding: "var(--space-10) var(--gutter)",
      }}
    >
      <Reveal>
      <span
        id="contact"
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
          gridTemplateColumns: "1fr 1fr",
          gap: "var(--space-9)",
          marginTop: "var(--space-5)",
          alignItems: "start",
        }}
      >
        <div>
          <h2
            id="contact-heading"
            style={{
              font: "var(--type-h2)",
              letterSpacing: "var(--tracking-display)",
              margin: "0 0 var(--space-5)",
              maxWidth: "16ch",
            }}
          >
            {t("title")}
          </h2>
          <p
            style={{
              font: "var(--type-lead)",
              color: "var(--text-muted)",
              margin: "0 0 var(--space-7)",
              maxWidth: "40ch",
            }}
          >
            {t("lead")}
          </p>
          <div style={{ borderTop: "1px solid var(--border)", paddingTop: "var(--space-5)" }}>
            <div
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "var(--text-2xs)",
                letterSpacing: "var(--tracking-label)",
                textTransform: "uppercase",
                color: "var(--text-faint)",
                marginBottom: "var(--space-4)",
              }}
            >
              {t("orReach")}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
              <a href="mailto:contact@khaledhossameldin.com" className="kp-ltr" style={directLink}>
                <Mail />
                contact@khaledhossameldin.com
              </a>
              <a
                href="https://github.com/KhaledHossameldin"
                target="_blank"
                rel="noopener noreferrer"
                className="kp-ltr" style={directLink}
              >
                <Github />
                github.com/KhaledHossameldin
              </a>
              <a
                href="https://www.linkedin.com/in/khaled-hossameldin/"
                target="_blank"
                rel="noopener noreferrer"
                className="kp-ltr" style={directLink}
              >
                <Linkedin />
                linkedin.com/in/khaled-hossameldin
              </a>
            </div>
          </div>
        </div>

        <form
          onSubmit={onSubmit}
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "var(--space-4)",
            background: "var(--surface-card)",
            border: "1px solid var(--border)",
            borderRadius: "var(--radius-lg)",
            padding: "var(--space-7)",
            boxShadow: "var(--shadow-sm)",
          }}
        >
          <Input
            name="name"
            label={t("nameLabel")}
            placeholder={t("namePh")}
            autoComplete="name"
            required
          />
          <Input
            name="email"
            type="email"
            label={t("emailLabel")}
            placeholder={t("emailPh")}
            autoComplete="email"
            required
          />
          <Textarea name="message" label={t("msgLabel")} placeholder={t("msgPh")} rows={4} required />

          {/* Honeypot — visually hidden, off the tab order. Bots fill it; humans
              don't. Field name `hp_token` MUST match the Lambda's check, and is
              not a real field so autofill won't touch it; `new-password` also
              blocks Chrome (which ignores autocomplete="off" for known fields). */}
          <div aria-hidden style={{ position: "absolute", left: "-9999px", width: 1, height: 1, overflow: "hidden" }}>
            <label>
              Leave this field empty
              <input type="text" name="hp_token" tabIndex={-1} autoComplete="new-password" />
            </label>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "var(--space-4)",
              marginTop: "var(--space-2)",
            }}
          >
            {status === "sent" ? (
              <StatusDot tone="available" label={t("sent")} />
            ) : status === "error" ? (
              <span style={{ fontFamily: "var(--font-mono)", fontSize: "var(--text-2xs)", color: "var(--red-500)" }}>
                {t("errorMsg")}
              </span>
            ) : (
              <span style={{ fontFamily: "var(--font-mono)", fontSize: "var(--text-2xs)", color: "var(--text-faint)" }}>
                {t("within")}
              </span>
            )}
            <Button variant="primary" type="submit" disabled={status === "sending"} iconRight={<ArrowUpRight className="kp-mirror" />}>
              {status === "sending" ? t("sending") : t("send")}
            </Button>
          </div>
        </form>
      </div>
      </Reveal>
    </section>
  );
}
