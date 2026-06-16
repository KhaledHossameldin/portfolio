# CloudFront requires ACM certs in us-east-1.
resource "aws_acm_certificate" "site" {
  provider = aws.us_east_1

  domain_name               = "www.${var.domain_name}"
  subject_alternative_names = [var.domain_name]
  validation_method         = "DNS"

  lifecycle {
    create_before_destroy = true
  }
}

# Expose the CNAME records so they can be placed manually in GoDaddy.
# See outputs.tf for acm_validation_cnames.
resource "aws_acm_certificate_validation" "site" {
  provider        = aws.us_east_1
  certificate_arn = aws_acm_certificate.site.arn

  # Omit validation_record_fqdns — validation is confirmed manually via GoDaddy.
  # Terraform will wait up to its timeout for ACM to flip to ISSUED after the
  # CNAME appears in DNS. Run `terraform apply` after placing the CNAME.
  timeouts {
    create = "30m"
  }
}
