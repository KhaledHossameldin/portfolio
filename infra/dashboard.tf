# ---------------------------------------------------------------------------
# Actionable analytics — CloudWatch surface (glance numbers).
#
# (A) Contact submissions: the contact Lambda logs one PII-free line
#     `ANALYTICS contact_sent` on a real successful send (honeypot/validation/
#     send-fail never log it). A metric filter turns that into a custom metric.
# (B) A dashboard shows contacts, CloudFront traffic, and Lambda health at a glance,
#     with a header that makes clear "requests" are NOT visitors (real breakdowns
#     live in the Athena saved queries — see analytics.tf / ANALYTICS.md).
#
# Aggregate only — no PII, no client-side tracking, no cookies, no /app change.
# Breakdowns (CV-by-type, projects, locale, traffic-quality) live in Athena saved queries.
# ---------------------------------------------------------------------------

locals {
  metrics_namespace   = "KhaledPortfolio"
  contact_metric_name = "ContactSubmissions"

  # Header explainer so the "CloudFront requests" tile can't be misread as "visitors".
  dashboard_help_md = <<-EOT
    ## Reading this dashboard — requests ≠ page views ≠ visitors

    **The "CloudFront requests" tile counts every hit** — HTML **plus** JS/CSS/fonts/images, PDFs, **and bots/scanners**. It is **NOT** a visitor count (it runs several× real people). Do not read it as "visitors per day".

    **Where the real numbers live** — Athena workgroup `khaled-portfolio-analytics` → *Saved queries*:
    - **How many people visited** → `unique-viewers-per-day` (distinct human IPs) and `page-views-per-day`
    - **CV opens** → `cv-opens-by-type`  ·  **How much traffic is automated** → `traffic-quality`
    - **Where they came from** → `top-referrers`, `top-pages`, `locale-split`, `project-views`

    **Contact submissions** (the tile below) is the **only exact conversion metric on this dashboard**. Everything else is CloudFront traffic. Human numbers are a **floor** — UA-spoofing scrapers still read as "browser-ish".
  EOT
}

# Success-only contact line -> custom metric. Substring pattern is robust to plain-text
# or JSON Lambda log formats. default_value=0 keeps the metric continuous on the dashboard.
resource "aws_cloudwatch_log_metric_filter" "contact_submissions" {
  name           = "khaled-portfolio-contact-submissions"
  log_group_name = aws_cloudwatch_log_group.contact.name
  pattern        = "\"ANALYTICS contact_sent\""

  metric_transformation {
    name          = local.contact_metric_name
    namespace     = local.metrics_namespace
    value         = "1"
    default_value = "0"
    unit          = "Count"
  }
}

# The everyday read surface. A text header explains the numbers; the metric widgets are
# per-day sums. Each metric widget pins its own region: CloudFront metrics are global and
# published to us-east-1; the custom + Lambda metrics live in the primary region.
resource "aws_cloudwatch_dashboard" "analytics" {
  dashboard_name = var.dashboard_name

  dashboard_body = jsonencode({
    widgets = [
      {
        type   = "text"
        x      = 0
        y      = 0
        width  = 24
        height = 5
        properties = {
          markdown = local.dashboard_help_md
        }
      },
      {
        type   = "metric"
        x      = 0
        y      = 5
        width  = 12
        height = 6
        properties = {
          title   = "Contact submissions (per day) — the only conversion metric"
          view    = "timeSeries"
          stacked = false
          region  = var.aws_region
          stat    = "Sum"
          period  = 86400
          metrics = [[local.metrics_namespace, local.contact_metric_name]]
          yAxis   = { left = { min = 0 } }
        }
      },
      {
        type   = "metric"
        x      = 12
        y      = 5
        width  = 12
        height = 6
        properties = {
          title  = "CloudFront requests — ALL hits incl. assets + bots (NOT visitors; see Athena)"
          view   = "timeSeries"
          region = "us-east-1" # CloudFront metrics are global -> us-east-1
          stat   = "Sum"
          period = 86400
          metrics = [
            ["AWS/CloudFront", "Requests", "DistributionId", aws_cloudfront_distribution.site.id, "Region", "Global"]
          ]
        }
      },
      {
        type   = "metric"
        x      = 0
        y      = 11
        width  = 12
        height = 6
        properties = {
          title  = "Contact Lambda — invocations & errors (per day)"
          view   = "timeSeries"
          region = var.aws_region
          stat   = "Sum"
          period = 86400
          metrics = [
            ["AWS/Lambda", "Invocations", "FunctionName", aws_lambda_function.contact.function_name],
            ["AWS/Lambda", "Errors", "FunctionName", aws_lambda_function.contact.function_name]
          ]
        }
      }
    ]
  })
}
