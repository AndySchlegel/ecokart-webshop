# ============================================================================
# Amplify Module Outputs
# ============================================================================

# ----------------------------------------------------------------------------
# App Outputs
# ----------------------------------------------------------------------------

output "app_id" {
  description = "Amplify App ID"
  value       = aws_amplify_app.frontend.id
}

output "app_arn" {
  description = "Amplify App ARN"
  value       = aws_amplify_app.frontend.arn
}

output "app_name" {
  description = "Amplify App Name"
  value       = aws_amplify_app.frontend.name
}

output "default_domain" {
  description = "Amplify Default Domain (z.B. main.d123abc.amplifyapp.com)"
  value       = "https://${aws_amplify_branch.main.branch_name}.${aws_amplify_app.frontend.default_domain}"
}

# ----------------------------------------------------------------------------
# Branch Outputs
# ----------------------------------------------------------------------------

output "branch_name" {
  description = "Name des Amplify Branch"
  value       = aws_amplify_branch.main.branch_name
}

output "branch_arn" {
  description = "ARN des Amplify Branch"
  value       = aws_amplify_branch.main.arn
}

output "branch_url" {
  description = "URL des Branch Deployments"
  value       = "https://${aws_amplify_branch.main.branch_name}.${aws_amplify_app.frontend.default_domain}"
}

# ----------------------------------------------------------------------------
# Webhook Outputs
# ----------------------------------------------------------------------------

output "webhook_url" {
  description = "Webhook URL für manuelle Deployments"
  value       = aws_amplify_webhook.main.url
  sensitive   = true
}

output "webhook_arn" {
  description = "Webhook ARN"
  value       = aws_amplify_webhook.main.arn
}

# ----------------------------------------------------------------------------
# Custom Domain Outputs
# ----------------------------------------------------------------------------

output "custom_domain_enabled" {
  description = "Ist Custom Domain aktiviert?"
  value       = var.enable_custom_domain
}

output "custom_domain_name" {
  description = "Custom Domain Name"
  value       = var.enable_custom_domain ? var.custom_domain_name : null
}

output "custom_domain_certificate_verification_records" {
  description = "DNS Records für Zertifikat-Validierung"
  value       = var.enable_custom_domain ? aws_amplify_domain_association.custom_domain[0].certificate_verification_dns_record : null
}

output "custom_domain_sub_domains" {
  description = "Sub-Domain DNS Records (CNAME Targets)"
  value       = var.enable_custom_domain ? aws_amplify_domain_association.custom_domain[0].sub_domain : null
}

# ----------------------------------------------------------------------------
# Helpful Commands
# ----------------------------------------------------------------------------

output "useful_commands" {
  description = "Nützliche AWS CLI Befehle für Amplify Management"
  value = {
    list_jobs        = "aws amplify list-jobs --app-id ${aws_amplify_app.frontend.id} --branch-name ${aws_amplify_branch.main.branch_name}"
    start_deployment = "aws amplify start-deployment --app-id ${aws_amplify_app.frontend.id} --branch-name ${aws_amplify_branch.main.branch_name}"
    get_app          = "aws amplify get-app --app-id ${aws_amplify_app.frontend.id}"
  }
}
