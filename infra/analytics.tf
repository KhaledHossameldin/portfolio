# ---------------------------------------------------------------------------
# Privacy-scoped, server-side web analytics.
#
# CloudFront standard access logs (legacy)  ->  private S3 log bucket  ->  Athena
# (schema-on-read over S3; NOT a datastore, so §2 "no database" holds).
#
# AGGREGATE ONLY: page views, top pages, referrers, rough geography (edge PoP),
# traffic over time. Never individual profiling. There is NO client-side tracking,
# NO cookies, NO third-party — nothing is added to /app or shipped to the browser.
#
# GDPR: CloudFront logs contain viewer IPs = personal data. The bucket is private +
# encrypted, and log objects AUTO-EXPIRE via lifecycle (var.log_retention_days) —
# CloudFront never deletes logs itself, so the lifecycle is what bounds retention.
# ---------------------------------------------------------------------------

data "aws_canonical_user_id" "current" {}

locals {
  # awslogsdelivery — the AWS account CloudFront uses to write standard (legacy)
  # logs. Documented, region-independent canonical ID; must be granted FULL_CONTROL
  # on the log bucket ACL or delivery fails.
  cloudfront_logs_canonical_id = "c4c1ede66af53448b93c283ce9448c4ba468c9432aa01d700d3878632f77d2d0"

  # CloudFront standard log file fields, in order. Non-partitioned: standard logs are
  # flat gzip files (cf/<dist-id>.YYYY-MM-DD-HH.<hash>.gz); date/time live in each row.
  cf_log_columns = [
    { name = "date", type = "date" },
    { name = "time", type = "string" },
    { name = "x_edge_location", type = "string" },
    { name = "sc_bytes", type = "bigint" },
    { name = "c_ip", type = "string" },
    { name = "cs_method", type = "string" },
    { name = "cs_host", type = "string" },
    { name = "cs_uri_stem", type = "string" },
    { name = "sc_status", type = "int" },
    { name = "cs_referrer", type = "string" },
    { name = "cs_user_agent", type = "string" },
    { name = "cs_uri_query", type = "string" },
    { name = "cs_cookie", type = "string" },
    { name = "x_edge_result_type", type = "string" },
    { name = "x_edge_request_id", type = "string" },
    { name = "x_host_header", type = "string" },
    { name = "cs_protocol", type = "string" },
    { name = "cs_bytes", type = "bigint" },
    { name = "time_taken", type = "float" },
    { name = "x_forwarded_for", type = "string" },
    { name = "ssl_protocol", type = "string" },
    { name = "ssl_cipher", type = "string" },
    { name = "x_edge_response_result_type", type = "string" },
    { name = "cs_protocol_version", type = "string" },
    { name = "fle_status", type = "string" },
    { name = "fle_encrypted_fields", type = "int" },
    { name = "c_port", type = "int" },
    { name = "time_to_first_byte", type = "float" },
    { name = "x_edge_detailed_result_type", type = "string" },
    { name = "sc_content_type", type = "string" },
    { name = "sc_content_len", type = "bigint" },
    { name = "sc_range_start", type = "bigint" },
    { name = "sc_range_end", type = "bigint" },
  ]

  # Example queries provisioned as saved Athena queries (source of truth = the .sql files).
  analytics_queries = [
    "page-views-per-day",
    "top-pages",
    "unique-viewers-per-day",
    "requests-by-edge-location",
    "top-referrers",
    "requests-over-time",
  ]
}

# --- Private log bucket ----------------------------------------------------

resource "aws_s3_bucket" "logs" {
  bucket = var.log_bucket_name
  # Logs are ephemeral + auto-expiring; allow clean teardown.
  force_destroy = true
}

resource "aws_s3_bucket_public_access_block" "logs" {
  bucket                  = aws_s3_bucket.logs.id
  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

# Legacy CloudFront standard logging REQUIRES ACLs enabled. "Bucket owner enforced"
# would disable ACLs and block delivery, so we use "Bucket owner preferred". The ACL
# grant below is to a specific canonical user (not public), so this stays fully
# compatible with Block Public Access = all-on.
resource "aws_s3_bucket_ownership_controls" "logs" {
  bucket = aws_s3_bucket.logs.id
  rule { object_ownership = "BucketOwnerPreferred" }
}

resource "aws_s3_bucket_acl" "logs" {
  depends_on = [aws_s3_bucket_ownership_controls.logs]
  bucket     = aws_s3_bucket.logs.id
  access_control_policy {
    owner { id = data.aws_canonical_user_id.current.id }
    grant {
      grantee {
        type = "CanonicalUser"
        id   = data.aws_canonical_user_id.current.id
      }
      permission = "FULL_CONTROL"
    }
    grant {
      grantee {
        type = "CanonicalUser"
        id   = local.cloudfront_logs_canonical_id
      }
      permission = "FULL_CONTROL"
    }
  }
}

resource "aws_s3_bucket_server_side_encryption_configuration" "logs" {
  bucket = aws_s3_bucket.logs.id
  rule {
    apply_server_side_encryption_by_default {
      # AES256 (SSE-S3): works with CloudFront log delivery out of the box. SSE-KMS
      # would require a key policy for delivery.logs.amazonaws.com — avoided.
      sse_algorithm = "AES256"
    }
  }
}

# Bounds retention of personal data (viewer IPs). No versioning on this bucket, so
# expiration truly deletes objects (no lingering noncurrent versions).
resource "aws_s3_bucket_lifecycle_configuration" "logs" {
  bucket = aws_s3_bucket.logs.id

  rule {
    id     = "expire-cf-logs"
    status = "Enabled"
    filter { prefix = var.cf_log_prefix }
    expiration { days = var.log_retention_days }
  }

  rule {
    id     = "expire-athena-results"
    status = "Enabled"
    filter { prefix = "athena-results/" }
    expiration { days = var.athena_results_retention_days }
  }

  rule {
    id     = "abort-incomplete-mpu"
    status = "Enabled"
    filter {}
    abort_incomplete_multipart_upload { days_after_initiation = 7 }
  }
}

# Defense in depth: reject any non-TLS access. This is a Deny (not a public grant),
# so it is compatible with Block Public Access. CloudFront delivers logs via the ACL
# grant above, not via this policy.
data "aws_iam_policy_document" "logs" {
  statement {
    sid       = "DenyInsecureTransport"
    effect    = "Deny"
    actions   = ["s3:*"]
    resources = [aws_s3_bucket.logs.arn, "${aws_s3_bucket.logs.arn}/*"]
    principals {
      type        = "*"
      identifiers = ["*"]
    }
    condition {
      test     = "Bool"
      variable = "aws:SecureTransport"
      values   = ["false"]
    }
  }
}

resource "aws_s3_bucket_policy" "logs" {
  bucket     = aws_s3_bucket.logs.id
  policy     = data.aws_iam_policy_document.logs.json
  depends_on = [aws_s3_bucket_public_access_block.logs]
}

# --- Athena / Glue (schema-on-read, no datastore) --------------------------

resource "aws_glue_catalog_database" "analytics" {
  name = var.analytics_database_name
}

# External table over the CloudFront standard (legacy) log format: tab-separated,
# gzip, two header lines (#Version / #Fields) skipped.
resource "aws_glue_catalog_table" "cf_logs" {
  name          = "cloudfront_standard_logs"
  database_name = aws_glue_catalog_database.analytics.name
  table_type    = "EXTERNAL_TABLE"

  parameters = {
    EXTERNAL                 = "TRUE"
    "skip.header.line.count" = "2"
  }

  storage_descriptor {
    location      = "s3://${aws_s3_bucket.logs.bucket}/${var.cf_log_prefix}"
    input_format  = "org.apache.hadoop.mapred.TextInputFormat"
    output_format = "org.apache.hadoop.hive.ql.io.HiveIgnoreKeyTextOutputFormat"

    ser_de_info {
      serialization_library = "org.apache.hadoop.hive.serde2.lazy.LazySimpleSerDe"
      parameters = {
        "field.delim"          = "\t"
        "serialization.format" = "\t"
      }
    }

    dynamic "columns" {
      for_each = local.cf_log_columns
      content {
        name = columns.value.name
        type = columns.value.type
      }
    }
  }
}

# Dedicated workgroup: pins the (private, encrypted) results location and caps the
# bytes any single query may scan (cost guardrail).
resource "aws_athena_workgroup" "analytics" {
  name          = var.athena_workgroup_name
  description   = "Aggregate-only analytics over CloudFront standard logs. No PII profiling."
  state         = "ENABLED"
  force_destroy = true

  configuration {
    enforce_workgroup_configuration    = true
    publish_cloudwatch_metrics_enabled = false
    bytes_scanned_cutoff_per_query     = 1073741824 # 1 GiB — plenty for this site; caps cost.

    result_configuration {
      output_location = "s3://${aws_s3_bucket.logs.bucket}/athena-results/"
      encryption_configuration {
        encryption_option = "SSE_S3"
      }
    }
  }
}

# Example queries as saved queries in the console (SQL lives in athena/queries/*.sql).
resource "aws_athena_named_query" "examples" {
  for_each  = toset(local.analytics_queries)
  name      = each.key
  database  = aws_glue_catalog_database.analytics.name
  workgroup = aws_athena_workgroup.analytics.name
  query     = file("${path.module}/athena/queries/${each.key}.sql")
}
