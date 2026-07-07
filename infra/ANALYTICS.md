# Analytics — CloudFront standard logs → private S3 → Athena

Privacy-scoped, **server-side, aggregate-only** web analytics. No client-side tracking, no
cookies, no third-party scripts, no cookie banner — nothing is added to `/app` or shipped to the
browser. All of it is Terraform (`analytics.tf`, `dashboard.tf`); a human runs `terraform apply`
(Terraform is not run in CI).

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

The ten examples in `athena/queries/*.sql` are provisioned as **saved queries** in the workgroup.

**Console:** Athena → switch **Workgroup** to `khaled-portfolio-analytics` → **Saved queries** →
pick one → **Run**. (Or paste any `.sql` file into the editor.)

**CLI:**

```bash
aws athena start-query-execution \
  --work-group khaled-portfolio-analytics \
  --query-execution-context Database=khaled_portfolio_analytics \
  --query-string "$(cat infra/athena/queries/page-views-per-day.sql)"
```

| Query | Answers |
|---|---|
| `page-views-per-day.sql` | HTML page views per day (assets excluded) |
| `top-pages.sql` | Most-visited paths |
| `unique-viewers-per-day.sql` | Approx. distinct viewers — `COUNT(DISTINCT c_ip)` (see caveat in file) |
| `requests-by-edge-location.sql` | Requests by CloudFront edge PoP — a **geographic proxy** (see caveat) |
| `top-referrers.sql` | Where external traffic comes from (external + `(direct/none)`) |
| `requests-over-time.sql` | Daily traffic + edge cache-hit ratio |
| `cv-opens-by-type.sql` | **Which CV resonates** — Mobile vs DevOps PDF (approx. distinct openers) |
| `project-views.sql` | Case-study `/work/<slug>/` pages, ranked (across locales) |
| `locale-split.sql` | Page views by locale — `/en` vs `/de` vs `/ar` |
| `page-views-vs-cv-opens.sql` | Per-day funnel: page views vs CV opens (contacts: see dashboard) |

### Geography caveat

CloudFront **standard** logs expose the **edge Point of Presence** (`x_edge_location`, e.g.
`FRA56` = Frankfurt), **not the viewer's country.** The edge PoP approximates region only. True
viewer-country would require real-time logs or an added `CloudFront-Viewer-Country` header —
intentionally out of scope (extra cost/complexity; this stays aggregate-only).

## CloudWatch dashboard & the contact metric

Defined in `dashboard.tf`. The **`khaled-portfolio-analytics`** dashboard has three per-day widgets:

- **Contact submissions/day** — the real "people who contacted me" count.
- **CloudFront requests/day** — total traffic (the free `AWS/CloudFront` `Requests` metric; it is
  global, published to **us-east-1**, so that widget pins `region: us-east-1`).
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
