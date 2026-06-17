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
