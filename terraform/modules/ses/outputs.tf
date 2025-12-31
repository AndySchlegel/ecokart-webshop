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

output "domain_identity" {
  description = "SES domain identity (for production access)"
  value       = aws_ses_domain_identity.main.domain
}

output "domain_verification_token" {
  description = "Domain verification token (for Route53)"
  value       = aws_ses_domain_identity.main.verification_token
}

output "dkim_tokens" {
  description = "DKIM tokens for email authentication"
  value       = aws_ses_domain_dkim.main.dkim_tokens
}
