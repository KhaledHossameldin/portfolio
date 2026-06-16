variable "aws_region" {
  description = "Primary AWS region for S3, Lambda, SES."
  type        = string
  default     = "eu-central-1"
}

variable "domain_name" {
  description = "Root domain (e.g. khaledportfolio.com). www is canonical; apex forwards to www via GoDaddy."
  type        = string
}

variable "ses_from_address" {
  description = "Verified SES sender address (e.g. hello@khaledportfolio.com)."
  type        = string
}

variable "ses_to_address" {
  description = "Contact-form recipient address. Must be SES-verified while in sandbox."
  type        = string
}

variable "github_org_repo" {
  description = "GitHub org/repo for OIDC trust (e.g. khaled-hossam/portfolio)."
  type        = string
  default     = "khaled-hossam/portfolio"
}
