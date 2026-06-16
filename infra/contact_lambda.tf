locals {
  lambda_src = "${path.module}/../lambda/contact"
}

data "archive_file" "contact_lambda" {
  type        = "zip"
  source_dir  = local.lambda_src
  output_path = "${path.module}/../lambda/contact.zip"
}

resource "aws_iam_role" "contact_lambda" {
  name = "khaled-portfolio-contact-lambda"

  assume_role_policy = data.aws_iam_policy_document.lambda_assume.json
}

data "aws_iam_policy_document" "lambda_assume" {
  statement {
    effect  = "Allow"
    actions = ["sts:AssumeRole"]
    principals {
      type        = "Service"
      identifiers = ["lambda.amazonaws.com"]
    }
  }
}

resource "aws_iam_role_policy_attachment" "lambda_basic" {
  role       = aws_iam_role.contact_lambda.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

resource "aws_iam_role_policy" "lambda_ses" {
  name   = "ses-send"
  role   = aws_iam_role.contact_lambda.id
  policy = data.aws_iam_policy_document.lambda_ses.json
}

data "aws_iam_policy_document" "lambda_ses" {
  statement {
    effect    = "Allow"
    actions   = ["ses:SendEmail", "ses:SendRawEmail"]
    resources = ["*"]
    condition {
      test     = "StringEquals"
      variable = "ses:FromAddress"
      values   = [var.ses_from_address]
    }
  }
}

resource "aws_lambda_function" "contact" {
  function_name    = "khaled-portfolio-contact"
  role             = aws_iam_role.contact_lambda.arn
  runtime          = "nodejs20.x"
  handler          = "index.handler"
  filename         = data.archive_file.contact_lambda.output_path
  source_code_hash = data.archive_file.contact_lambda.output_base64sha256
  timeout          = 10
  memory_size      = 128

  environment {
    variables = {
      SES_FROM_ADDRESS = var.ses_from_address
      SES_TO_ADDRESS   = var.ses_to_address
      SES_REGION       = var.aws_region
      ALLOWED_ORIGIN   = "https://www.${var.domain_name}"
    }
  }
}

resource "aws_lambda_permission" "apigw_contact" {
  statement_id  = "AllowAPIGatewayInvoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.contact.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_apigatewayv2_api.contact.execution_arn}/*/*"
}

# Verify the SES sender identity. The domain owner must click the confirmation
# link sent to ses_from_address before emails can be sent.
resource "aws_ses_email_identity" "sender" {
  email = var.ses_from_address
}

# While SES is in sandbox, the recipient must also be verified.
# Remove this resource once SES production access is granted.
resource "aws_ses_email_identity" "recipient" {
  email = var.ses_to_address
}
