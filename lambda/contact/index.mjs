import { SESv2Client, SendEmailCommand } from "@aws-sdk/client-sesv2";

const ses = new SESv2Client({});
const SENDER = process.env.SES_SENDER;
const RECIPIENT = process.env.SES_RECIPIENT;
const ALLOWED = (process.env.ALLOWED_ORIGINS || "")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function cors(origin) {
  // Echo the origin only when it's on the allowlist; otherwise send no ACAO
  // header so the browser blocks the response. Never reflect "*".
  const allow = ALLOWED.includes(origin) ? origin : "";
  return {
    "Access-Control-Allow-Origin": allow,
    "Access-Control-Allow-Methods": "POST,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    Vary: "Origin",
  };
}

function resp(status, body, origin) {
  return {
    statusCode: status,
    headers: { "Content-Type": "application/json", ...cors(origin) },
    body: JSON.stringify(body),
  };
}

export const handler = async (event) => {
  const origin = event.headers?.origin || event.headers?.Origin || "";
  const method = event.requestContext?.http?.method;

  if (method === "OPTIONS") return resp(204, {}, origin);
  if (method !== "POST") return resp(405, { error: "method_not_allowed" }, origin);

  let data;
  try {
    data = JSON.parse(event.body || "{}");
  } catch {
    return resp(400, { error: "invalid_json" }, origin);
  }

  if (data.company) return resp(200, { ok: true }, origin);

  // Collapse CR/LF in name — it lands in the SES Subject, where a newline would
  // be header injection.
  const name = (data.name || "").trim().replace(/[\r\n]+/g, " ");
  const email = (data.email || "").trim();
  const message = (data.message || "").trim();

  if (!name || name.length > 100) return resp(400, { error: "invalid_name" }, origin);
  if (!EMAIL_RE.test(email) || email.length > 200) return resp(400, { error: "invalid_email" }, origin);
  if (!message || message.length > 5000) return resp(400, { error: "invalid_message" }, origin);

  try {
    await ses.send(
      new SendEmailCommand({
        FromEmailAddress: SENDER,
        Destination: { ToAddresses: [RECIPIENT] },
        ReplyToAddresses: [email],
        Content: {
          Simple: {
            Subject: { Data: `Portfolio contact — ${name}` },
            Body: { Text: { Data: `From: ${name} <${email}>\n\n${message}` } },
          },
        },
      })
    );
  } catch (err) {
    console.error("SES send failed", err);
    return resp(502, { error: "send_failed" }, origin);
  }

  return resp(200, { ok: true }, origin);
};
