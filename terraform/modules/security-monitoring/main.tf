# Security Monitoring Module
# Based on Carl's security monitoring architecture
# FREE-tier AWS Security Stack

# SNS Topic for Security Alerts
resource "aws_sns_topic" "security_alerts" {
  name = "${var.project_name}-security-alerts"

  tags = {
    Project     = var.project_name
    Environment = var.environment
    ManagedBy   = "Terraform"
  }
}

# SNS Email Subscription
resource "aws_sns_topic_subscription" "security_email" {
  topic_arn = aws_sns_topic.security_alerts.arn
  protocol  = "email"
  endpoint  = var.security_email
}

# IAM Access Analyzer - Detects resources shared outside account
# NOTE: Account already has an Access Analyzer (AWS Console default)
# Only 1 analyzer allowed per account - using existing one instead
# resource "aws_accessanalyzer_analyzer" "main" {
#   analyzer_name = "${var.project_name}-access-analyzer"
#   type          = "ACCOUNT"
#
#   tags = {
#     Project     = var.project_name
#     Environment = var.environment
#     ManagedBy   = "Terraform"
#   }
# }

# CloudWatch Log Group for Security Events
resource "aws_cloudwatch_log_group" "security_logs" {
  name              = "/aws/security/${var.project_name}"
  retention_in_days = 7 # FREE tier: up to 7 days

  tags = {
    Project     = var.project_name
    Environment = var.environment
    ManagedBy   = "Terraform"
  }
}

# CloudWatch Alarms - Real-time Security Event Detection

# Alarm 1: Unauthorized API Calls
resource "aws_cloudwatch_metric_alarm" "unauthorized_api_calls" {
  alarm_name          = "${var.project_name}-unauthorized-api-calls"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 1
  metric_name         = "UnauthorizedAPICalls"
  namespace           = "CloudTrailMetrics"
  period              = 300 # 5 minutes
  statistic           = "Sum"
  threshold           = 1
  alarm_description   = "Triggers when unauthorized API calls are detected"
  alarm_actions       = [aws_sns_topic.security_alerts.arn]
  treat_missing_data  = "notBreaching"

  tags = {
    Project     = var.project_name
    Environment = var.environment
    Severity    = "HIGH"
  }
}

# Alarm 2: Root Account Usage
resource "aws_cloudwatch_metric_alarm" "root_account_usage" {
  alarm_name          = "${var.project_name}-root-account-usage"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 1
  metric_name         = "RootAccountUsage"
  namespace           = "CloudTrailMetrics"
  period              = 60 # 1 minute
  statistic           = "Sum"
  threshold           = 0
  alarm_description   = "Triggers when root account is used (should NEVER happen)"
  alarm_actions       = [aws_sns_topic.security_alerts.arn]
  treat_missing_data  = "notBreaching"

  tags = {
    Project     = var.project_name
    Environment = var.environment
    Severity    = "CRITICAL"
  }
}

# Alarm 3: IAM Policy Changes
resource "aws_cloudwatch_metric_alarm" "iam_policy_changes" {
  alarm_name          = "${var.project_name}-iam-policy-changes"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 1
  metric_name         = "IAMPolicyChanges"
  namespace           = "CloudTrailMetrics"
  period              = 300 # 5 minutes
  statistic           = "Sum"
  threshold           = 0
  alarm_description   = "Triggers when IAM policies are modified"
  alarm_actions       = [aws_sns_topic.security_alerts.arn]
  treat_missing_data  = "notBreaching"

  tags = {
    Project     = var.project_name
    Environment = var.environment
    Severity    = "HIGH"
  }
}

# Alarm 4: Security Group Changes
resource "aws_cloudwatch_metric_alarm" "security_group_changes" {
  alarm_name          = "${var.project_name}-security-group-changes"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 1
  metric_name         = "SecurityGroupChanges"
  namespace           = "CloudTrailMetrics"
  period              = 300 # 5 minutes
  statistic           = "Sum"
  threshold           = 0
  alarm_description   = "Triggers when security groups are modified"
  alarm_actions       = [aws_sns_topic.security_alerts.arn]
  treat_missing_data  = "notBreaching"

  tags = {
    Project     = var.project_name
    Environment = var.environment
    Severity    = "MEDIUM"
  }
}

# Alarm 5: S3 Bucket Policy Changes
resource "aws_cloudwatch_metric_alarm" "s3_policy_changes" {
  alarm_name          = "${var.project_name}-s3-policy-changes"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 1
  metric_name         = "S3BucketPolicyChanges"
  namespace           = "CloudTrailMetrics"
  period              = 300 # 5 minutes
  statistic           = "Sum"
  threshold           = 0
  alarm_description   = "Triggers when S3 bucket policies are modified"
  alarm_actions       = [aws_sns_topic.security_alerts.arn]
  treat_missing_data  = "notBreaching"

  tags = {
    Project     = var.project_name
    Environment = var.environment
    Severity    = "HIGH"
  }
}

# EventBridge Rule: Daily Security Scan (8 AM UTC)
resource "aws_cloudwatch_event_rule" "daily_security_scan" {
  name                = "${var.project_name}-daily-security-scan"
  description         = "Triggers daily security compliance check at 8 AM UTC"
  schedule_expression = "cron(0 8 * * ? *)" # 8 AM UTC daily

  tags = {
    Project     = var.project_name
    Environment = var.environment
    ManagedBy   = "Terraform"
  }
}

# EventBridge Target: Lambda Security Monitor
resource "aws_cloudwatch_event_target" "security_monitor" {
  rule      = aws_cloudwatch_event_rule.daily_security_scan.name
  target_id = "SecurityMonitorLambda"
  arn       = aws_lambda_function.security_monitor.arn
}

# Lambda Permission for EventBridge
resource "aws_lambda_permission" "allow_eventbridge" {
  statement_id  = "AllowExecutionFromEventBridge"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.security_monitor.function_name
  principal     = "events.amazonaws.com"
  source_arn    = aws_cloudwatch_event_rule.daily_security_scan.arn
}

# IAM Role for Lambda Security Monitor
resource "aws_iam_role" "lambda_security_monitor" {
  name = "${var.project_name}-lambda-security-monitor"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "lambda.amazonaws.com"
        }
      }
    ]
  })

  tags = {
    Project     = var.project_name
    Environment = var.environment
    ManagedBy   = "Terraform"
  }
}

# IAM Policy: Lambda Security Monitor Permissions
resource "aws_iam_role_policy" "lambda_security_monitor" {
  name = "${var.project_name}-lambda-security-monitor-policy"
  role = aws_iam_role.lambda_security_monitor.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        # CloudWatch Logs
        Effect = "Allow"
        Action = [
          "logs:CreateLogGroup",
          "logs:CreateLogStream",
          "logs:PutLogEvents"
        ]
        Resource = "arn:aws:logs:*:*:*"
      },
      {
        # S3 Bucket Security Checks
        Effect = "Allow"
        Action = [
          "s3:ListAllMyBuckets",
          "s3:GetBucketAcl",
          "s3:GetBucketPolicy",
          "s3:GetBucketPolicyStatus",
          "s3:GetBucketPublicAccessBlock"
        ]
        Resource = "*"
      },
      {
        # Security Group Checks
        Effect = "Allow"
        Action = [
          "ec2:DescribeSecurityGroups",
          "ec2:DescribeSecurityGroupRules"
        ]
        Resource = "*"
      },
      {
        # IAM Access Analyzer
        Effect = "Allow"
        Action = [
          "access-analyzer:ListFindings",
          "access-analyzer:ListAnalyzers"
        ]
        Resource = "*"
      },
      {
        # IAM User MFA Check
        Effect = "Allow"
        Action = [
          "iam:ListUsers",
          "iam:ListMFADevices"
        ]
        Resource = "*"
      },
      {
        # SNS Publish (send alerts)
        Effect = "Allow"
        Action = [
          "sns:Publish"
        ]
        Resource = aws_sns_topic.security_alerts.arn
      }
    ]
  })
}

# Package Lambda Function Code
data "archive_file" "security_monitor" {
  type        = "zip"
  source_file = "${path.module}/lambda/index.py"
  output_path = "${path.module}/lambda/security-monitor.zip"
}

# Lambda Function: Security Monitor
resource "aws_lambda_function" "security_monitor" {
  filename      = data.archive_file.security_monitor.output_path
  function_name = "${var.project_name}-security-monitor"
  role          = aws_iam_role.lambda_security_monitor.arn
  handler       = "index.handler"
  runtime       = "python3.11"
  timeout       = 60
  memory_size   = 256

  source_code_hash = data.archive_file.security_monitor.output_base64sha256

  environment {
    variables = {
      SNS_TOPIC_ARN = aws_sns_topic.security_alerts.arn
      PROJECT_NAME  = var.project_name
    }
  }

  tags = {
    Project     = var.project_name
    Environment = var.environment
    ManagedBy   = "Terraform"
    Purpose     = "Daily Security Compliance Scan"
  }
}

# CloudWatch Log Group for Lambda
resource "aws_cloudwatch_log_group" "lambda_security_monitor" {
  name              = "/aws/lambda/${aws_lambda_function.security_monitor.function_name}"
  retention_in_days = 7

  tags = {
    Project     = var.project_name
    Environment = var.environment
    ManagedBy   = "Terraform"
  }
}
