output "cloudfront_domain" {
  description = "CloudFront distribution domain — set this as the www CNAME target in GoDaddy."
  value       = aws_cloudfront_distribution.site.domain_name
}

output "cloudfront_distribution_id" {
  description = "CloudFront distribution ID — used by the deploy workflow for cache invalidation."
  value       = aws_cloudfront_distribution.site.id
}

output "s3_bucket_name" {
  description = "Static-site S3 bucket — sync out/ here in CI."
  value       = aws_s3_bucket.static.bucket
}

output "contact_api_url" {
  description = "Contact form endpoint — set as NEXT_PUBLIC_CONTACT_API_URL in the web build."
  value       = "${aws_apigatewayv2_stage.contact.invoke_url}/contact"
}

output "github_deploy_role_arn" {
  description = "IAM role ARN assumed by GitHub Actions via OIDC."
  value       = aws_iam_role.github_deploy.arn
}

output "acm_validation_cnames" {
  description = "Place these CNAME records manually in GoDaddy to validate the ACM certificate."
  value = {
    for dvo in aws_acm_certificate.site.domain_validation_options : dvo.domain_name => {
      name  = dvo.resource_record_name
      type  = dvo.resource_record_type
      value = dvo.resource_record_value
    }
  }
}
