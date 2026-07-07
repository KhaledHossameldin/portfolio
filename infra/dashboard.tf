# ---------------------------------------------------------------------------
# Actionable analytics — CloudWatch surface (glance numbers).
#
# (A) Contact submissions: the contact Lambda logs one PII-free line
#     `ANALYTICS contact_sent` on a real successful send (honeypot/validation/
#     send-fail never log it). A metric filter turns that into a custom metric.
# (B) A dashboard shows contacts, CloudFront traffic, and Lambda health at a glance.
#
# Aggregate only — no PII, no client-side tracking, no cookies, no /app change.
# Breakdowns (CV-by-type, projects, locale) live in Athena saved queries (analytics.tf).
# ---------------------------------------------------------------------------

locals {
  metrics_namespace   = "KhaledPortfolio"
  contact_metric_name = "ContactSubmissions"
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

# The everyday read surface. Widgets are per-day sums. Each widget pins its own region:
# CloudFront metrics are global and published to us-east-1; the custom + Lambda metrics
# live in the primary region.
resource "aws_cloudwatch_dashboard" "analytics" {
  dashboard_name = var.dashboard_name

  dashboard_body = jsonencode({
    widgets = [
      {
        type   = "metric"
        x      = 0
        y      = 0
        width  = 12
        height = 6
        properties = {
          title   = "Contact submissions (per day)"
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
        y      = 0
        width  = 12
        height = 6
        properties = {
          title  = "CloudFront requests (total traffic, per day)"
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
        y      = 6
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
