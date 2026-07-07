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

output "analytics_log_bucket" { value = aws_s3_bucket.logs.bucket }
output "analytics_database" { value = aws_glue_catalog_database.analytics.name }
output "analytics_table" { value = "${aws_glue_catalog_database.analytics.name}.${aws_glue_catalog_table.cf_logs.name}" }
output "athena_workgroup" { value = aws_athena_workgroup.analytics.name }
output "athena_results_location" { value = "s3://${aws_s3_bucket.logs.bucket}/athena-results/" }

output "analytics_dashboard_name" { value = aws_cloudwatch_dashboard.analytics.dashboard_name }
output "analytics_dashboard_url" { value = "https://${var.aws_region}.console.aws.amazon.com/cloudwatch/home?region=${var.aws_region}#dashboards:name=${aws_cloudwatch_dashboard.analytics.dashboard_name}" }
output "contact_submissions_metric" { value = "${local.metrics_namespace}/${local.contact_metric_name}" }
