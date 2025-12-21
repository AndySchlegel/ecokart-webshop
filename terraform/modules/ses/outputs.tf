# ============================================================================
# SES Module - Outputs
# ============================================================================

output "sender_email" {
  description = "Verified sender e-mail address"
  value       = aws_ses_email_identity.sender.email
}

output "configuration_set_name" {
  description = "SES configuration set name"
  value       = aws_ses_configuration_set.main.name
}

output "order_confirmation_template_name" {
  description = "Order confirmation template name"
  value       = aws_ses_template.order_confirmation.name
}

output "email_identity_arn" {
  description = "SES email identity ARN"
  value       = aws_ses_email_identity.sender.arn
}
