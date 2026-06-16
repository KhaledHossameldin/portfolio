locals {
  bucket_name = "khaled-portfolio-static-${data.aws_caller_identity.current.account_id}"
}

resource "aws_s3_bucket" "static" {
  bucket = local.bucket_name
}

resource "aws_s3_bucket_versioning" "static" {
  bucket = aws_s3_bucket.static.id
  versioning_configuration {
    status = "Enabled"
  }
}

resource "aws_s3_bucket_public_access_block" "static" {
  bucket = aws_s3_bucket.static.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

# OAC (Origin Access Control) is the modern replacement for OAI.
# Policy grants CloudFront service principal read access scoped to this distribution.
resource "aws_s3_bucket_policy" "static" {
  bucket = aws_s3_bucket.static.id
  policy = data.aws_iam_policy_document.s3_oac.json

  depends_on = [aws_s3_bucket_public_access_block.static]
}

data "aws_iam_policy_document" "s3_oac" {
  statement {
    sid    = "AllowCloudFrontOAC"
    effect = "Allow"

    principals {
      type        = "Service"
      identifiers = ["cloudfront.amazonaws.com"]
    }

    actions   = ["s3:GetObject"]
    resources = ["${aws_s3_bucket.static.arn}/*"]

    condition {
      test     = "StringEquals"
      variable = "AWS:SourceArn"
      values   = [aws_cloudfront_distribution.site.arn]
    }
  }
}
