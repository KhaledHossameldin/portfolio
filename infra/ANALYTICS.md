# Analytics — CloudFront standard logs → private S3 → Athena

Privacy-scoped, **server-side, aggregate-only** web analytics. No client-side tracking, no
cookies, no third-party scripts, no cookie banner — nothing is added to `/app` or shipped to the
browser. All of it is Terraform (`analytics.tf`, `dashboard.tf`); a human runs `terraform apply`
(Terraform is not run in CI).

## Which number means what — requests are NOT visitors

> **The dashboard's "CloudFront requests" tile is raw traffic — HTML _plus_ assets (JS/CSS/fonts/
> images) _plus_ bots/scanners. It is NOT a visitor count** (it typically runs several× the number
> of real people). Reading it as "visitors per day" is the single easiest way to mislead yourself —
> that is exactly the misread this section exists to prevent.

| You want… | Read | Notes |
|---|---|---|
| **How many people visited** | `unique-viewers-per-day` (distinct human IPs) + `page-views-per-day` | Bots + assets excluded. Distinct-IP undercounts (NAT/CGNAT) and can overcount (IPv6 rotation) → an **approximation**, and a **ceiling on humans is really a floor** because UA-spoofers still count. |
| **Which pages / locales / projects** | `top-pages`, `locale-split`, `project-views` | Humans only. |
| **CV opens (Mobile vs DevOps)** | `cv-opens-by-type` | Distinct openers per CV, with range-request de-dup. |
| **How much traffic is automated** | `traffic-quality` | bot / scanner / tool / browser-ish split — see caveat below. |
| **Where visitors came from** | `top-referrers` | External sources + `(direct/none)`. |
| **Contacts — the real conversion** | CloudWatch metric `KhaledPortfolio/ContactSubmissions` (dashboard tile) | Counted server-side in the Lambda — **exact**, and the **only true conversion number**. |

**"Humans only" is a shared filter.** The metric queries drop assets and obvious non-humans:
`/_next/*` and static extensions (`.js .css .woff2 .png .svg .ico .webmanifest …`), plus User-Agents
matching `bot|crawl|spider|scan|curl|wget|python|headless`, matched on `lower(url_decode(cs_user_agent))`
(**CloudFront URL-encodes the UA**, so decode first; matching is case-insensitive). Page metrics also
require `cs_method='GET'` and `sc_status < 400`. **CV opens deliberately do NOT require `GET`** — a PDF
open is logged as range/`206`/`HEAD` rows, not a clean `GET 200`, and requiring `GET` is exactly the
bug that once made `cv-opens-by-type` report **0**.

**Honest floor, not truth.** `traffic-quality` and the human filter are **UA heuristics**. A scraper
that sends a real browser User-Agent is indistinguishable from a person and lands in **"browser-ish"**.
So "browser-ish" / unique-viewer numbers are a **floor on automation removed**, not a guarantee of real
humans. Treat them as directional, never exact.

## Two surfaces — where to read each number

| Surface | Read it in | Best for |
|---|---|---|
| **CloudWatch dashboard** `khaled-portfolio-analytics` | CloudWatch console → Dashboards | Everyday glance: **contact submissions/day**, CloudFront requests/day, Lambda health |
| **Athena saved queries** (workgroup `khaled-portfolio-analytics`) | Athena console → Saved queries | Breakdowns: CV-by-type, projects, locale split, top pages/referrers, geography |

Why two: **contact submissions** are counted server-side in the **Lambda** (the contact POST goes to
API Gateway → Lambda, *not* through CloudFront), so they surface as a **CloudWatch metric**.
**Traffic / pages / CV opens** come from **CloudFront access logs**, queried in **Athena**. The
`page-views-vs-cv-opens` funnel lives in Athena; pair it with the dashboard's contact count for the
full picture.

## How it works

```
CloudFront (existing distribution)
   │  standard access logs (legacy), include_cookies = false
   ▼
s3://<log bucket>/cf/           private · AES256 · Block Public Access on · ACLs for awslogsdelivery
   │  schema-on-read (Glue external table, tab-delimited, 2 header lines skipped)
   ▼
Amazon Athena  (workgroup: khaled-portfolio-analytics)
   │  results → s3://<log bucket>/athena-results/   (SSE-S3, short retention)
   ▼
Aggregate queries: page views, top pages, referrers, edge geography, traffic over time
```

- **Database:** `khaled_portfolio_analytics` · **Table:** `cloudfront_standard_logs`
- **Workgroup:** `khaled-portfolio-analytics` (pins the private results location; 1 GiB per-query
  scan cap as a cost guardrail).

## Privacy model (read before querying)

- CloudFront logs contain **viewer IP addresses = personal data (GDPR).** Treat every query as
  **aggregate only** — counts, trends, distributions. **Never** use the logs to identify, single
  out, or profile an individual visitor.
- **Bounded retention:** log objects auto-expire after `log_retention_days` (default **90**,
  allowed **30–90**); Athena results after `athena_results_retention_days` (default **14**).
  CloudFront never deletes logs itself — the S3 lifecycle is the control that caps how long any IP
  is stored. Lower `log_retention_days` for stricter data-minimization.
- The bucket is **private** (Block Public Access fully on), **encrypted** (AES256), and rejects
  non-TLS access. Delivery uses an S3 **ACL** grant to the CloudFront `awslogsdelivery` account
  (legacy standard logging requires ACLs enabled) — this grant is to a specific AWS canonical
  user, not the public.
- The deploy (OIDC) role is **not** granted any access to this bucket — least privilege preserved.

## Running the example queries

The eleven examples in `athena/queries/*.sql` are provisioned as **saved queries** in the workgroup.

**Console:** Athena → switch **Workgroup** to `khaled-portfolio-analytics` → **Saved queries** →
pick one → **Run**. (Or paste any `.sql` file into the editor.)

**CLI:**

```bash
aws athena start-query-execution \
  --work-group khaled-portfolio-analytics \
  --query-execution-context Database=khaled_portfolio_analytics \
  --query-string "$(cat infra/athena/queries/page-views-per-day.sql)"
```

The page / viewer / CV / project / locale queries are **humans only** (bots + assets filtered — see
the shared filter above); `requests-over-time` and `requests-by-edge-location` intentionally count
**all** traffic.

| Query | Answers |
|---|---|
| `page-views-per-day.sql` | HTML page views per day (bots + assets excluded) |
| `top-pages.sql` | Most-visited paths (humans only) |
| `unique-viewers-per-day.sql` | Approx. distinct **human** viewers — `COUNT(DISTINCT c_ip)` (see caveat in file) |
| `traffic-quality.sql` | How much traffic is automated — **bot / scanner / tool / browser-ish** (UA heuristic; a floor, not truth) |
| `requests-by-edge-location.sql` | Requests by CloudFront edge PoP — a **geographic proxy** (see caveat); all traffic |
| `top-referrers.sql` | Where external traffic comes from (external + `(direct/none)`) |
| `requests-over-time.sql` | Daily traffic + edge cache-hit ratio (all traffic, incl. assets) |
| `cv-opens-by-type.sql` | **Which CV resonates** — Mobile vs DevOps PDF (distinct openers; range-request de-dup; any method) |
| `project-views.sql` | Case-study `/work/<slug>/` pages, ranked (across locales; humans only) |
| `locale-split.sql` | Page views by locale — `/en` vs `/de` vs `/ar` (humans only) |
| `page-views-vs-cv-opens.sql` | Per-day funnel: page views vs CV opens (humans only; contacts: see dashboard) |

### Geography caveat

CloudFront **standard** logs expose the **edge Point of Presence** (`x_edge_location`, e.g.
`FRA56` = Frankfurt), **not the viewer's country.** The edge PoP approximates region only. True
viewer-country would require real-time logs or an added `CloudFront-Viewer-Country` header —
intentionally out of scope (extra cost/complexity; this stays aggregate-only).

## CloudWatch dashboard & the contact metric

Defined in `dashboard.tf`. The **`khaled-portfolio-analytics`** dashboard leads with a **markdown
header** ("requests ≠ visitors" + where each real number lives) so the traffic tile can't be misread,
then three per-day widgets:

- **Contact submissions/day** — the real "people who contacted me" count (the only exact conversion).
- **CloudFront requests/day** — relabelled **"ALL hits incl. assets + bots (NOT visitors; see
  Athena)"**. The free `AWS/CloudFront` `Requests` metric counts every request (HTML + assets + bots),
  so it is **not** a visitor count; it is global, published to **us-east-1**, so the widget pins
  `region: us-east-1`. Real visitor/page numbers live in the Athena saved queries above.
- **Contact Lambda invocations & errors/day** — health.

**How the contact count works (honeypot-safe, no PII):** on a *successful* send only (honeypot
passed + validation passed + SES `SendEmail` ok), the Lambda emits one line — `ANALYTICS
contact_sent` — with **no name/email/message**. Honeypot-dropped, validation-failed, and
send-failed requests return earlier and never log it. A metric filter
(`khaled-portfolio-contact-submissions`) on the Lambda log group counts that line into
**`KhaledPortfolio/ContactSubmissions`** (value 1). The metric appears after the first real
submission; the dashboard shows a continuous 0 line until then (`default_value = 0`).

## Apply (human, with AWS credentials)

```bash
terraform -chdir=infra init
terraform -chdir=infra plan     # expect: adds (log bucket + Glue/Athena), 1 change
                                # (the CloudFront distribution gains logging), 0 destroy
terraform -chdir=infra apply
```

Attaching logging is an **in-place update** to the existing distribution — the site origin, OAC,
ACM, CloudFront Function, security headers, API Gateway, Lambda, and OIDC role are untouched.
Confirm **0 to destroy** in the plan before applying.

First log delivery is **best-effort** and can take up to ~1 hour; logs arrive only for hours that
had traffic. Then run `page-views-per-day` (or `SELECT * FROM
khaled_portfolio_analytics.cloudfront_standard_logs LIMIT 10`) to confirm data lands.

## Teardown

`terraform destroy` removes the workgroup + Glue objects and empties/deletes the log bucket
(`force_destroy = true`) and its logs. Disabling logging alone (removing the `logging_config`
block) stops new logs but leaves existing objects to expire on their lifecycle schedule.
