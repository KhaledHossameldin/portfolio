# Analytics — CloudFront standard logs → private S3 → Athena

Privacy-scoped, **server-side, aggregate-only** web analytics. No client-side tracking, no
cookies, no third-party scripts, no cookie banner — nothing is added to `/app` or shipped to the
browser. All of it is Terraform (`analytics.tf`); a human runs `terraform apply` (Terraform is
not run in CI).

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

The six examples in `athena/queries/*.sql` are provisioned as **saved queries** in the workgroup.

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
| `top-referrers.sql` | Where external traffic comes from |
| `requests-over-time.sql` | Daily traffic + edge cache-hit ratio |

### Geography caveat

CloudFront **standard** logs expose the **edge Point of Presence** (`x_edge_location`, e.g.
`FRA56` = Frankfurt), **not the viewer's country.** The edge PoP approximates region only. True
viewer-country would require real-time logs or an added `CloudFront-Viewer-Country` header —
intentionally out of scope (extra cost/complexity; this stays aggregate-only).

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
