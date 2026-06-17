terraform {
  required_version = ">= 1.10"
  required_providers {
    aws     = { source = "hashicorp/aws", version = "~> 5.70" }
    tls     = { source = "hashicorp/tls", version = "~> 4.0" }
    archive = { source = "hashicorp/archive", version = "~> 2.4" }
  }
  backend "s3" {
    bucket       = "khaled-portfolio-tfstate"
    key          = "portfolio/prod/terraform.tfstate"
    region       = "eu-central-1"
    encrypt      = true
    use_lockfile = true
  }
}
provider "aws" {
  region = var.aws_region
  default_tags { tags = local.tags }
}
provider "aws" {
  alias  = "us_east_1"
  region = "us-east-1"
  default_tags { tags = local.tags }
}
locals {
  tags = {
    Project   = "khaled-portfolio"
    Env       = "prod"
    ManagedBy = "terraform"
  }
  allowed_origins = compact([
    "https://${aws_cloudfront_distribution.site.domain_name}",
    var.enable_custom_domain ? "https://www.${var.domain_name}" : "",
  ])
}
