# ============================================================================
# Terraform Outputs - Ecokart AWS Infrastruktur
# ============================================================================
# Diese Outputs liefern wichtige Informationen über die erstellten Ressourcen.

# ----------------------------------------------------------------------------
# GitHub Actions IAM Role Outputs
# ----------------------------------------------------------------------------
# Auskommentiert, da IAM Role via Bootstrap Workflow verwaltet wird

# output "github_actions_role_arn" {
#   description = "ARN of the GitHub Actions IAM role"
#   value       = module.github_actions_role.role_arn
# }

# output "github_actions_role_name" {
#   description = "Name of the GitHub Actions IAM role"
#   value       = module.github_actions_role.role_name
# }

# ----------------------------------------------------------------------------
# DynamoDB Outputs
# ----------------------------------------------------------------------------

output "dynamodb_table_names" {
  description = "Namen aller erstellten DynamoDB Tabellen"
  value       = module.dynamodb.table_names
}

output "dynamodb_table_arns" {
  description = "ARNs aller erstellten DynamoDB Tabellen"
  value       = module.dynamodb.table_arns
}

output "products_table_name" {
  description = "Name der Products Tabelle"
  value       = module.dynamodb.products_table_name
}

output "users_table_name" {
  description = "Name der Users Tabelle"
  value       = module.dynamodb.users_table_name
}

output "carts_table_name" {
  description = "Name der Carts Tabelle"
  value       = module.dynamodb.carts_table_name
}

output "orders_table_name" {
  description = "Name der Orders Tabelle"
  value       = module.dynamodb.orders_table_name
}

# ----------------------------------------------------------------------------
# Lambda Outputs
# ----------------------------------------------------------------------------

output "lambda_function_name" {
  description = "Name der Lambda Function"
  value       = module.lambda.function_name
}

output "lambda_function_arn" {
  description = "ARN der Lambda Function"
  value       = module.lambda.function_arn
}

output "lambda_invoke_arn" {
  description = "Invoke ARN der Lambda Function"
  value       = module.lambda.invoke_arn
}

output "lambda_role_arn" {
  description = "ARN der Lambda Execution Role"
  value       = module.lambda.role_arn
}

# ----------------------------------------------------------------------------
# API Gateway Outputs
# ----------------------------------------------------------------------------

output "api_gateway_url" {
  description = "API Gateway Endpoint URL (Basis-URL für Frontend)"
  value       = module.lambda.api_gateway_url
}

output "api_gateway_id" {
  description = "ID des API Gateway REST API"
  value       = module.lambda.api_gateway_id
}

output "api_gateway_stage" {
  description = "API Gateway Stage Name"
  value       = var.api_gateway_stage_name
}

# ----------------------------------------------------------------------------
# Cognito Outputs
# ----------------------------------------------------------------------------

output "cognito_user_pool_id" {
  description = "Cognito User Pool ID (für Frontend NEXT_PUBLIC_USER_POOL_ID)"
  value       = module.cognito.user_pool_id
}

output "cognito_user_pool_arn" {
  description = "Cognito User Pool ARN"
  value       = module.cognito.user_pool_arn
}

output "cognito_user_pool_client_id" {
  description = "Cognito User Pool Client ID (für Frontend NEXT_PUBLIC_USER_POOL_CLIENT_ID)"
  value       = module.cognito.user_pool_client_id
}

output "cognito_user_pool_endpoint" {
  description = "Cognito User Pool Endpoint"
  value       = module.cognito.user_pool_endpoint
}

# ----------------------------------------------------------------------------
# SES (E-Mail Service) Outputs
# ----------------------------------------------------------------------------

output "ses_sender_email" {
  description = "SES Sender E-Mail Adresse (muss verifiziert werden!)"
  value       = module.ses.sender_email
}

output "ses_configuration_set_name" {
  description = "SES Configuration Set Name (für Tracking)"
  value       = module.ses.configuration_set_name
}

output "ses_order_confirmation_template" {
  description = "SES Template Name für Order Confirmation E-Mails"
  value       = module.ses.order_confirmation_template_name
}

output "ses_email_identity_arn" {
  description = "SES E-Mail Identity ARN"
  value       = module.ses.email_identity_arn
}

# ----------------------------------------------------------------------------
# Amplify Outputs (conditional)
# ----------------------------------------------------------------------------

output "amplify_app_id" {
  description = "Amplify App ID (nur wenn enable_amplify=true)"
  value       = var.enable_amplify ? module.amplify[0].app_id : null
}

output "amplify_app_url" {
  description = "Amplify App URL (nur wenn enable_amplify=true)"
  value       = var.enable_amplify ? module.amplify[0].default_domain : null
}

output "amplify_branch_url" {
  description = "Amplify Branch URL (nur wenn enable_amplify=true)"
  value       = var.enable_amplify ? module.amplify[0].branch_url : null
}

# ----------------------------------------------------------------------------
# Admin Amplify Outputs (conditional)
# ----------------------------------------------------------------------------

output "admin_amplify_app_id" {
  description = "Admin Amplify App ID (nur wenn enable_admin_amplify=true)"
  value       = var.enable_admin_amplify ? module.amplify_admin[0].app_id : null
}

output "admin_amplify_app_url" {
  description = "Admin Amplify App URL (nur wenn enable_admin_amplify=true)"
  value       = var.enable_admin_amplify ? module.amplify_admin[0].default_domain : null
}

output "admin_amplify_branch_url" {
  description = "Admin Amplify Branch URL (nur wenn enable_admin_amplify=true)"
  value       = var.enable_admin_amplify ? module.amplify_admin[0].branch_url : null
}

# ----------------------------------------------------------------------------
# Assets (S3 + CloudFront) Outputs
# ----------------------------------------------------------------------------

output "assets_bucket_name" {
  description = "S3 Bucket Name für Assets"
  value       = module.assets.bucket_name
}

output "assets_cloudfront_domain" {
  description = "CloudFront Domain für Assets (für product imageUrl)"
  value       = module.assets.cloudfront_domain_name
}

output "assets_base_url" {
  description = "Base URL für Assets (https://cloudfront-domain)"
  value       = module.assets.assets_base_url
}

output "assets_cloudfront_distribution_id" {
  description = "CloudFront Distribution ID (für Cache Invalidation)"
  value       = module.assets.cloudfront_distribution_id
}

# ----------------------------------------------------------------------------
# Custom Domain Outputs (conditional)
# ----------------------------------------------------------------------------

output "custom_domain_enabled" {
  description = "Ist Custom Domain aktiviert?"
  value       = var.enable_custom_domain
}

output "api_custom_domain_name" {
  description = "API Custom Domain Name (z.B. api.his4irness23.de)"
  value       = var.enable_custom_domain ? module.custom_domain[0].api_domain_name : null
}

output "api_certificate_arn" {
  description = "ARN des SSL Zertifikats für API Domain"
  value       = var.enable_custom_domain ? module.custom_domain[0].certificate_arn : null
}

output "dns_records_for_infomaniak" {
  description = "DNS Records die in Infomaniak erstellt werden müssen"
  value = var.enable_custom_domain ? {
    api = {
      name  = module.custom_domain[0].dns_record_for_infomaniak.name
      type  = module.custom_domain[0].dns_record_for_infomaniak.type
      value = module.custom_domain[0].dns_record_for_infomaniak.value
      note  = "CNAME Record für API Gateway Custom Domain"
    }
    shop = var.enable_amplify && var.enable_custom_domain ? {
      name  = "${var.shop_subdomain}.${var.domain_name}"
      type  = "CNAME"
      value = try(module.amplify[0].custom_domain_sub_domains[0].dns_target, "pending...")
      note  = "CNAME Record für Shop Custom Domain (Amplify)"
      certificate_validation = try(module.amplify[0].custom_domain_certificate_verification_records, "pending...")
    } : null
    admin = var.enable_admin_amplify && var.enable_custom_domain ? {
      name  = "${var.admin_subdomain}.${var.domain_name}"
      type  = "CNAME"
      value = try(module.amplify_admin[0].custom_domain_sub_domains[0].dns_target, "pending...")
      note  = "CNAME Record für Admin Custom Domain (Amplify)"
      certificate_validation = try(module.amplify_admin[0].custom_domain_certificate_verification_records, "pending...")
    } : null
  } : null
}

output "certificate_validation_options" {
  description = "Zertifikat-Validierung DNS Records (falls manuell benötigt)"
  value       = var.enable_custom_domain ? module.custom_domain[0].certificate_domain_validation_options : null
  sensitive   = false
}

# ----------------------------------------------------------------------------
# Setup Instructions
# ----------------------------------------------------------------------------

output "setup_complete" {
  description = "Nächste Schritte nach Terraform Apply"
  value = <<-EOT

    ╔═══════════════════════════════════════════════════════════════════╗
    ║                    Ecokart AWS Deployment                         ║
    ║                      Setup erfolgreich!                           ║
    ╚═══════════════════════════════════════════════════════════════════╝

    📋 Erstellte Ressourcen:
    ────────────────────────────────────────────────────────────────────

    DynamoDB Tables:
      • ecokart-products  (${module.dynamodb.products_table_name})
      • ecokart-users     (${module.dynamodb.users_table_name})
      • ecokart-carts     (${module.dynamodb.carts_table_name})
      • ecokart-orders    (${module.dynamodb.orders_table_name})

    Lambda Backend:
      • Function: ${module.lambda.function_name}
      • Runtime:  ${var.lambda_runtime}
      • Memory:   ${var.lambda_memory_size} MB

    API Gateway:
      • URL: ${module.lambda.api_gateway_url}
      • Stage: ${var.api_gateway_stage_name}

    ${var.enable_amplify ? "Amplify Frontend:\n      • App URL: ${module.amplify[0].default_domain}\n      • Branch: ${var.github_branch}" : ""}

    ${var.enable_admin_amplify ? "Admin Frontend:\n      • App URL: ${module.amplify_admin[0].default_domain}\n      • Branch: ${var.github_branch}" : ""}

    SES (E-Mail Service):
      • Sender: ${module.ses.sender_email}
      • Templates: Order Confirmation, Welcome
      • Status: ⚠️  E-Mail Verifizierung erforderlich!

    🚀 Nächste Schritte:
    ────────────────────────────────────────────────────────────────────

    1. SES E-Mail verifizieren (WICHTIG!):
       → AWS sendet E-Mail an: ${module.ses.sender_email}
       → Öffne E-Mail und klicke Verification-Link
       → Ohne Verifizierung können KEINE E-Mails gesendet werden!

    2. DynamoDB mit Daten füllen:
       cd ../../../backend
       npm run dynamodb:migrate:single -- --region ${var.aws_region}

    3. Testuser erstellen (optional):
       cd ../../../backend
       node scripts/create-test-user.js
       → Login: demo@ecokart.com / Demo1234!

    4. API testen:
       curl ${module.lambda.api_gateway_url}api/products

    5. Frontend Environment Variable setzen:
       NEXT_PUBLIC_API_URL=${module.lambda.api_gateway_url}

    ${var.enable_amplify || var.enable_admin_amplify ? "6. GitHub-Verbindung herstellen (EINMALIG!):\n       ../../scripts/connect-github.sh\n       → Öffnet automatisch die AWS Console URLs\n       → Klicke \"Reconnect repository\" für jede App\n       → Nach Verbindung starten Builds automatisch\n" : ""}
    📚 Dokumentation:
    ────────────────────────────────────────────────────────────────────
    Siehe terraform/README.md für Details

    ⚠️  Sicherheitshinweise:
    ────────────────────────────────────────────────────────────────────
    • JWT Secret in Production ändern!
    • Point-in-Time Recovery aktivieren (DynamoDB)
    • CloudWatch Logs aktivieren (API Gateway)
    • CORS auf Frontend-Domain beschränken

  EOT
}

# ----------------------------------------------------------------------------
# Quick Reference
# ----------------------------------------------------------------------------

output "quick_reference" {
  description = "Schnellreferenz für wichtige Befehle"
  value = {
    api_base_url          = module.lambda.api_gateway_url
    test_api              = "curl ${module.lambda.api_gateway_url}api/products"
    lambda_logs           = "aws logs tail /aws/lambda/${module.lambda.function_name} --follow --region ${var.aws_region}"
    dynamodb_scan         = "aws dynamodb scan --table-name ${module.dynamodb.products_table_name} --region ${var.aws_region}"
    amplify_app_id        = var.enable_amplify ? module.amplify[0].app_id : "N/A (enable_amplify=false)"
    admin_amplify_app_id  = var.enable_admin_amplify ? module.amplify_admin[0].app_id : "N/A (enable_admin_amplify=false)"
    update_lambda         = "cd ../backend && npm run build && terraform apply -target=module.lambda"
    connect_github        = "../../scripts/connect-github.sh (from terraform/examples/basic/)"
  }
}

# ----------------------------------------------------------------------------
# AWS Console URLs
# ----------------------------------------------------------------------------

output "aws_console_urls" {
  description = "AWS Console URLs für manuelle Schritte"
  value = {
    customer_amplify_console = var.enable_amplify ? "https://${var.aws_region}.console.aws.amazon.com/amplify/home?region=${var.aws_region}#/${module.amplify[0].app_id}" : "N/A"
    admin_amplify_console    = var.enable_admin_amplify ? "https://${var.aws_region}.console.aws.amazon.com/amplify/home?region=${var.aws_region}#/${module.amplify_admin[0].app_id}" : "N/A"
    lambda_console           = "https://${var.aws_region}.console.aws.amazon.com/lambda/home?region=${var.aws_region}#/functions/${module.lambda.function_name}"
    dynamodb_console         = "https://${var.aws_region}.console.aws.amazon.com/dynamodbv2/home?region=${var.aws_region}#tables"
  }
}
