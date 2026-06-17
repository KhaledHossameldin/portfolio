resource "aws_acm_certificate" "site" {
  provider          = aws.us_east_1
  domain_name       = "www.${var.domain_name}"
  validation_method = "DNS"
  lifecycle { create_before_destroy = true }
}
resource "aws_acm_certificate_validation" "site" {
  count           = var.enable_custom_domain ? 1 : 0
  provider        = aws.us_east_1
  certificate_arn = aws_acm_certificate.site.arn
}
