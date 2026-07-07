variable "aws_region" {
  type    = string
  default = "eu-central-1"
}
variable "domain_name" {
  description = "Apex domain. www.<this> is the canonical host."
  type        = string
  default     = "khaledhossameldin.com"
}
variable "enable_custom_domain" {
  description = "Attach ACM cert + www alias. Set true ONLY after the cert is ISSUED."
  type        = bool
  default     = false
}
variable "github_repo" {
  description = "owner/repo for OIDC trust, e.g. khaled/portfolio."
  type        = string
}
variable "ses_sender_email" {
  description = "Verified SES From address."
  type        = string
}
variable "ses_recipient_email" {
  description = "Inbox receiving contact mail (verified in SES sandbox)."
  type        = string
}

# --- Analytics (CloudFront standard logs -> private S3 -> Athena) ---

variable "log_bucket_name" {
  description = "Private bucket for CloudFront standard access logs + Athena query results."
  type        = string
  default     = "khaled-portfolio-logs-prod"
}
variable "cf_log_prefix" {
  description = "Key prefix under which CloudFront writes standard logs."
  type        = string
  default     = "cf/"
}
variable "log_retention_days" {
  description = "Days before CloudFront log objects auto-expire. Bounds retention of viewer IPs (personal data)."
  type        = number
  default     = 90
  validation {
    condition     = var.log_retention_days >= 30 && var.log_retention_days <= 90
    error_message = "log_retention_days must be between 30 and 90 (GDPR data-minimization)."
  }
}
variable "athena_results_retention_days" {
  description = "Days before Athena query-result objects auto-expire."
  type        = number
  default     = 14
}
variable "analytics_database_name" {
  description = "Glue catalog database for analytics (lowercase / underscores)."
  type        = string
  default     = "khaled_portfolio_analytics"
}
variable "athena_workgroup_name" {
  description = "Athena workgroup for aggregate-only analytics queries."
  type        = string
  default     = "khaled-portfolio-analytics"
}
variable "dashboard_name" {
  description = "CloudWatch dashboard name (glance surface: contacts, traffic, Lambda health)."
  type        = string
  default     = "khaled-portfolio-analytics"
}
