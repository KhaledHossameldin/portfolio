resource "aws_sesv2_email_identity" "sender" {
  email_identity = var.ses_sender_email
}
resource "aws_sesv2_email_identity" "recipient" {
  email_identity = var.ses_recipient_email
}
data "archive_file" "contact" {
  type        = "zip"
  source_dir  = "${path.module}/../lambda/contact"
  output_path = "${path.module}/../lambda/contact-build.zip"
}
data "aws_iam_policy_document" "lambda_assume" {
  statement {
    actions = ["sts:AssumeRole"]
    principals {
      type        = "Service"
      identifiers = ["lambda.amazonaws.com"]
    }
  }
}
resource "aws_iam_role" "contact_lambda" {
  name               = "khaled-portfolio-contact-lambda"
  assume_role_policy = data.aws_iam_policy_document.lambda_assume.json
}
resource "aws_iam_role_policy_attachment" "lambda_logs" {
  role       = aws_iam_role.contact_lambda.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}
data "aws_iam_policy_document" "lambda_ses" {
  statement {
    actions   = ["ses:SendEmail"]
    resources = ["*"]
    condition {
      test     = "StringEquals"
      variable = "ses:FromAddress"
      values   = [var.ses_sender_email]
    }
  }
}
resource "aws_iam_role_policy" "lambda_ses" {
  name   = "ses-send"
  role   = aws_iam_role.contact_lambda.id
  policy = data.aws_iam_policy_document.lambda_ses.json
}
resource "aws_cloudwatch_log_group" "contact" {
  name              = "/aws/lambda/khaled-portfolio-contact"
  retention_in_days = 14
}
resource "aws_lambda_function" "contact" {
  function_name    = "khaled-portfolio-contact"
  role             = aws_iam_role.contact_lambda.arn
  runtime          = "nodejs20.x"
  handler          = "index.handler"
  filename         = data.archive_file.contact.output_path
  source_code_hash = data.archive_file.contact.output_base64sha256
  timeout          = 10
  memory_size      = 128
  environment {
    variables = {
      SES_SENDER      = var.ses_sender_email
      SES_RECIPIENT   = var.ses_recipient_email
      ALLOWED_ORIGINS = join(",", local.allowed_origins)
    }
  }
  depends_on = [aws_cloudwatch_log_group.contact]
}
