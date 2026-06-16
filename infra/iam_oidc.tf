# GitHub's OIDC thumbprint is stable; AWS now auto-verifies GitHub's cert via
# its root CA, but the thumbprint is still required in the resource.
resource "aws_iam_openid_connect_provider" "github" {
  url             = "https://token.actions.githubusercontent.com"
  client_id_list  = ["sts.amazonaws.com"]
  thumbprint_list = ["6938fd4d98bab03faadb97b34396831e3780aea1"]
}

resource "aws_iam_role" "github_deploy" {
  name = "khaled-portfolio-github-deploy"

  assume_role_policy = data.aws_iam_policy_document.github_oidc_trust.json
}

data "aws_iam_policy_document" "github_oidc_trust" {
  statement {
    effect  = "Allow"
    actions = ["sts:AssumeRoleWithWebIdentity"]

    principals {
      type        = "Federated"
      identifiers = [aws_iam_openid_connect_provider.github.arn]
    }

    condition {
      test     = "StringEquals"
      variable = "token.actions.githubusercontent.com:aud"
      values   = ["sts.amazonaws.com"]
    }

    # Scope to the main branch only — PRs cannot deploy.
    condition {
      test     = "StringLike"
      variable = "token.actions.githubusercontent.com:sub"
      values   = ["repo:${var.github_org_repo}:ref:refs/heads/main"]
    }
  }
}

resource "aws_iam_role_policy" "github_deploy" {
  name   = "deploy-policy"
  role   = aws_iam_role.github_deploy.id
  policy = data.aws_iam_policy_document.github_deploy.json
}

data "aws_iam_policy_document" "github_deploy" {
  # Sync static export to the S3 bucket.
  statement {
    effect  = "Allow"
    actions = ["s3:PutObject", "s3:DeleteObject", "s3:GetObject", "s3:ListBucket"]
    resources = [
      aws_s3_bucket.static.arn,
      "${aws_s3_bucket.static.arn}/*",
    ]
  }

  # Invalidate CloudFront cache after each deploy.
  statement {
    effect    = "Allow"
    actions   = ["cloudfront:CreateInvalidation"]
    resources = [aws_cloudfront_distribution.site.arn]
  }
}
