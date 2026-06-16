terraform {
  required_version = ">= 1.7"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
    archive = {
      source  = "hashicorp/archive"
      version = "~> 2.0"
    }
  }

  # Bootstrap: create this bucket manually (or via aws cli) before `terraform init`.
  # aws s3api create-bucket --bucket <tfstate-bucket-name> --region eu-central-1 \
  #   --create-bucket-configuration LocationConstraint=eu-central-1
  # aws s3api put-bucket-versioning --bucket <tfstate-bucket-name> \
  #   --versioning-configuration Status=Enabled
  backend "s3" {
    bucket  = "khaled-portfolio-tfstate"  # update to your state bucket name
    key     = "portfolio/terraform.tfstate"
    region  = "eu-central-1"
    encrypt = true
  }
}

provider "aws" {
  region = var.aws_region

  default_tags {
    tags = {
      Project   = "khaled-portfolio"
      ManagedBy = "terraform"
    }
  }
}

# ACM certificates for CloudFront must live in us-east-1.
provider "aws" {
  alias  = "us_east_1"
  region = "us-east-1"

  default_tags {
    tags = {
      Project   = "khaled-portfolio"
      ManagedBy = "terraform"
    }
  }
}

data "aws_caller_identity" "current" {}
