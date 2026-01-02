output "sns_topic_arn" {
  description = "ARN of the security alerts SNS topic"
  value       = aws_sns_topic.security_alerts.arn
}

output "access_analyzer_arn" {
  description = "ARN of the IAM Access Analyzer"
  value       = aws_accessanalyzer_analyzer.main.arn
}

output "lambda_function_name" {
  description = "Name of the security monitor Lambda function"
  value       = aws_lambda_function.security_monitor.function_name
}

output "lambda_function_arn" {
  description = "ARN of the security monitor Lambda function"
  value       = aws_lambda_function.security_monitor.arn
}

output "cloudwatch_alarms" {
  description = "List of CloudWatch alarm names"
  value = [
    aws_cloudwatch_metric_alarm.unauthorized_api_calls.alarm_name,
    aws_cloudwatch_metric_alarm.root_account_usage.alarm_name,
    aws_cloudwatch_metric_alarm.iam_policy_changes.alarm_name,
    aws_cloudwatch_metric_alarm.security_group_changes.alarm_name,
    aws_cloudwatch_metric_alarm.s3_policy_changes.alarm_name
  ]
}

output "daily_scan_schedule" {
  description = "Daily security scan schedule"
  value       = aws_cloudwatch_event_rule.daily_security_scan.schedule_expression
}
