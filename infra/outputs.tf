output "cloudfront_domain_name" { value = aws_cloudfront_distribution.site.domain_name }
output "cloudfront_distribution_id" { value = aws_cloudfront_distribution.site.id }
output "s3_bucket_name" { value = aws_s3_bucket.site.bucket }
output "deploy_role_arn" { value = aws_iam_role.github_deploy.arn }
output "contact_api_url" { value = "${aws_apigatewayv2_api.contact.api_endpoint}/contact" }
output "acm_validation_records" {
  description = "Place these CNAME(s) in GoDaddy to validate the cert."
  value = [
    for o in aws_acm_certificate.site.domain_validation_options : {
      name  = o.resource_record_name
      type  = o.resource_record_type
      value = o.resource_record_value
    }
  ]
}
