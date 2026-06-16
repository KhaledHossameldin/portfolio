/**
 * Contact form handler.
 *
 * Env vars (set by Terraform):
 *   SES_FROM_ADDRESS  — verified SES sender
 *   SES_TO_ADDRESS    — recipient (must be SES-verified while in sandbox)
 *   SES_REGION        — AWS region for SES (eu-central-1)
 *   ALLOWED_ORIGIN    — CloudFront origin for CORS (https://www.domain.com)
 *
 * Anti-spam: hidden honeypot field `_hp`. Bots fill it; real users leave it
 * blank. A filled `_hp` returns 200 silently so bots don't retry on 4xx.
 *
 * AWS SDK v3 (@aws-sdk/client-ses) is bundled in the Node 20 Lambda runtime —
 * no node_modules or build step needed.
 */

import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses";

const ses = new SESClient({ region: process.env.SES_REGION ?? "eu-central-1" });

const ALLOWED_ORIGIN = process.env.ALLOWED_ORIGIN ?? "";
const FROM = process.env.SES_FROM_ADDRESS;
const TO = process.env.SES_TO_ADDRESS;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const corsHeaders = {
  "Access-Control-Allow-Origin": ALLOWED_ORIGIN,
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

function reply(statusCode, body) {
  return {
    statusCode,
    headers: { "Content-Type": "application/json", ...corsHeaders },
    body: JSON.stringify(body),
  };
}

export async function handler(event) {
  // API Gateway v2 sends OPTIONS for CORS preflight.
  if (event.requestContext?.http?.method === "OPTIONS") {
    return { statusCode: 204, headers: corsHeaders, body: "" };
  }

  // Parse body (API Gateway v2 may base64-encode binary content-types).
  let body;
  try {
    const raw = event.isBase64Encoded
      ? Buffer.from(event.body ?? "", "base64").toString("utf-8")
      : (event.body ?? "{}");
    body = JSON.parse(raw);
  } catch {
    return reply(400, { error: "Invalid JSON." });
  }

  // Honeypot: filled → bot. Return 200 to suppress retries.
  if (body._hp) {
    return reply(200, { ok: true });
  }

  const name = String(body.name ?? "").trim();
  const email = String(body.email ?? "").trim();
  const message = String(body.message ?? "").trim();

  // Validate required fields.
  if (!name || name.length < 1 || name.length > 100) {
    return reply(400, { error: "Name is required (max 100 characters)." });
  }
  if (!email || !EMAIL_RE.test(email) || email.length > 254) {
    return reply(400, { error: "A valid email address is required." });
  }
  if (!message || message.length < 10 || message.length > 4000) {
    return reply(400, { error: "Message must be between 10 and 4000 characters." });
  }

  try {
    await ses.send(
      new SendEmailCommand({
        Source: FROM,
        Destination: { ToAddresses: [TO] },
        ReplyToAddresses: [email],
        Message: {
          Subject: {
            Charset: "UTF-8",
            Data: `Portfolio contact from ${name}`,
          },
          Body: {
            Text: {
              Charset: "UTF-8",
              Data: `From: ${name} <${email}>\n\n${message}`,
            },
          },
        },
      }),
    );

    return reply(200, { ok: true });
  } catch (err) {
    console.error("SES SendEmail failed:", err);
    return reply(500, {
      error:
        "Message could not be sent. Please try the direct contact links instead.",
    });
  }
}
