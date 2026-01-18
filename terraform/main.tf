# ============================================================================
# Terraform Main Configuration - Ecokart AWS Infrastruktur
# ============================================================================
# Dieses Modul orchestriert die gesamte AWS-Infrastruktur für den Ecokart Webshop.
# Es verwendet Sub-Module für DynamoDB, Lambda und Amplify.

# ----------------------------------------------------------------------------
# Lokale Variablen
# ----------------------------------------------------------------------------

locals {
  # Naming Convention: {project}-{resource}-{environment}
  name_prefix = "${var.project_name}-${var.environment}"

  # Automatisches Branch-Mapping basierend auf Environment
  # Das stellt sicher dass GitHub Actions automatisch den richtigen Branch deployed:
  # - development → develop Branch
  # - staging     → staging Branch
  # - production  → main Branch
  branch_map = {
    development = "develop"
    staging     = "staging"
    production  = "main"
  }

  # Verwende gemappten Branch oder Fallback auf var.github_branch
  github_branch = lookup(local.branch_map, var.environment, var.github_branch)

  # Alle Ressourcen erhalten diese Standard-Tags
  common_tags = merge(
    {
      Project     = var.project_name
      Environment = var.environment
      ManagedBy   = "Terraform"
    },
    var.additional_tags
  )
}

# ----------------------------------------------------------------------------
# GitHub Actions IAM Role - CI/CD Permissions
# ----------------------------------------------------------------------------
# TEMPORARILY DISABLED: Chicken-egg problem with IAM permissions
#
# Die IAM Role existiert in AWS (erstellt via Bootstrap Workflow).
# Management via Terraform führt zu Permission-Problemen (Role kann sich
# nicht selbst verwalten ohne Permissions, die wir ihr geben wollen).
#
# TODO: Später mit permanent AWS Credentials oder manueller IAM Console-Änderung lösen
#
# module "github_actions_role" {
#   source = "./modules/github-actions-role"
#
#   role_name   = "ecokart-github-actions-role"
#   github_repo = "AndySchlegel/Ecokart-Webshop"
#   aws_region  = var.aws_region
#
#   tags = local.common_tags
# }

# ----------------------------------------------------------------------------
# DynamoDB Module - Alle Tables
# ----------------------------------------------------------------------------
# Erstellt 4 DynamoDB Tabellen:
# - ecokart-products (mit CategoryIndex GSI)
# - ecokart-users (mit EmailIndex GSI)
# - ecokart-carts (kein GSI, userId als Partition Key)
# - ecokart-orders (mit UserOrdersIndex GSI)

module "dynamodb" {
  source = "./modules/dynamodb"

  project_name                 = var.project_name
  environment                  = var.environment
  billing_mode                 = var.dynamodb_billing_mode
  read_capacity                = var.dynamodb_read_capacity
  write_capacity               = var.dynamodb_write_capacity
  enable_point_in_time_recovery = var.enable_point_in_time_recovery

  # Seed Data Configuration
  aws_profile = var.aws_profile
  aws_region  = var.aws_region

  tags = local.common_tags
}

# ----------------------------------------------------------------------------
# Cognito Module - User Authentication
# ----------------------------------------------------------------------------
# Erstellt:
# - Cognito User Pool (User-Datenbank)
# - User Pool Client (für Frontend)
# - Auto Admin User Provisioning (optional)
#
# Features:
# - Email als Username
# - Automatische Email-Verification
# - Custom Attribute "role" (admin/customer)
# - Lifecycle Protection (prevent_destroy für staging/production)

module "cognito" {
  source = "./modules/cognito"

  project_name = var.project_name
  environment  = var.environment

  tags = local.common_tags
}

# ----------------------------------------------------------------------------
# SES Module - E-Mail Versand (Order Confirmations)
# ----------------------------------------------------------------------------
# Erstellt:
# - SES E-Mail Identity (Sender Verification)
# - E-Mail Templates (Order Confirmation, Welcome)
# - Configuration Set (für Tracking)
#
# Note: Startet im SES Sandbox Mode
# - Kann nur an verifizierte E-Mails senden
# - Max 200 E-Mails/Tag
# - Für Production: Domain Verification + AWS Support Ticket nötig

module "ses" {
  source = "./modules/ses"

  project_name     = var.project_name
  environment      = var.environment
  domain_name      = var.domain_name
  route53_zone_id  = var.enable_route53 ? module.route53[0].zone_id : ""
  sender_email     = var.ses_sender_email
  brand_name       = "Ecokart"

  enable_welcome_email = false  # Später aktivieren wenn gewünscht

  tags = local.common_tags

  depends_on = [module.route53]
}

# ----------------------------------------------------------------------------
# Assets Module - S3 + CloudFront für Produktbilder
# ----------------------------------------------------------------------------
# Erstellt:
# - S3 Bucket (private, nur CloudFront-Zugriff)
# - CloudFront CDN (schnelle Auslieferung weltweit)
# - 100% reproduzierbar via Terraform
#
# Produktbilder werden via Terraform uploaded und sind verfügbar unter:
# https://{cloudfront-domain}/images/product-name.jpg
#
# Funktioniert ÜBERALL:
# - Frontend (Next.js)
# - Emails (SES)
# - Mobile Apps (zukünftig)
# - Externe Integrationen

module "assets" {
  source = "./modules/assets"

  project_name = var.project_name
  environment  = var.environment

  # CloudFront Price Class (PriceClass_100 = US, Canada, Europe)
  cloudfront_price_class = var.cloudfront_price_class

  tags = local.common_tags
}

# ----------------------------------------------------------------------------
# Lambda Module - Backend API + API Gateway
# ----------------------------------------------------------------------------
# Erstellt:
# - Lambda Function (Express.js App via serverless-http)
# - API Gateway REST API
# - IAM Role mit DynamoDB Permissions
# - CloudWatch Log Group

module "lambda" {
  source = "./modules/lambda"

  project_name  = var.project_name
  environment   = var.environment
  function_name = "${local.name_prefix}-api"

  # Lambda Configuration
  runtime       = var.lambda_runtime
  memory_size   = var.lambda_memory_size
  timeout       = var.lambda_timeout
  source_path   = var.lambda_source_path

  # Environment Variables für Lambda
  environment_variables = {
    NODE_ENV                = "production"
    ENVIRONMENT             = var.environment
    # AWS_REGION is automatically set by Lambda (reserved key)
    DB_TYPE                 = "dynamodb"
    JWT_SECRET              = var.jwt_secret
    # Cognito Configuration for JWT Validation
    COGNITO_USER_POOL_ID    = module.cognito.user_pool_id
    COGNITO_CLIENT_ID       = module.cognito.user_pool_client_id
    # Stripe Payment Integration
    STRIPE_SECRET_KEY       = var.stripe_secret_key
    STRIPE_WEBHOOK_SECRET   = var.stripe_webhook_secret
    # SES E-Mail Configuration (Legacy - keeping for backwards compatibility)
    SES_SENDER_EMAIL        = var.ses_sender_email
    # Resend E-Mail Configuration (Active - Migration from SES, 1. Jan 2026)
    RESEND_API_KEY          = var.resend_api_key
    EMAIL_FROM              = "noreply@aws.his4irness23.de"
    # FRONTEND_URL: Use provided URL or fallback to localhost
    # NOTE: Backend will auto-detect the actual frontend URL from request headers (origin, x-frontend-url)
    # This is just a fallback for local development
    FRONTEND_URL            = var.frontend_url != "" ? var.frontend_url : "http://localhost:3000"
    # Assets CDN URL (CloudFront)
    # Used for product images in emails and frontend
    # Converts relative image paths (/images/product.jpg) to absolute CloudFront URLs
    ASSETS_BASE_URL         = module.assets.assets_base_url
    # Deploy Timestamp - Forces Lambda update on every deploy
    # Without this, Terraform might not detect code changes (source_code_hash can be unreliable)
    DEPLOY_TIMESTAMP        = var.deploy_timestamp
  }

  # DynamoDB Table Names für IAM Permissions
  dynamodb_table_arns = module.dynamodb.table_arns

  # Cognito Integration (API Gateway Authorizer)
  cognito_user_pool_arn = module.cognito.user_pool_arn
  enable_cognito_auth   = var.enable_cognito_auth

  # API Gateway
  api_stage_name         = var.api_gateway_stage_name
  enable_access_logs     = var.enable_api_gateway_access_logs

  tags = local.common_tags

  depends_on = [module.dynamodb, module.cognito]
}

# ----------------------------------------------------------------------------
# Custom Domain Module - API Gateway Custom Domain (Optional)
# ----------------------------------------------------------------------------
# Erstellt nur wenn enable_custom_domain=true:
# - ACM Certificate (SSL/TLS in us-east-1)
# - API Gateway Custom Domain
# - Base Path Mapping
#
# WICHTIG: Nach Deploy DNS CNAME Records in Infomaniak erstellen!
#          Verwende: terraform output dns_records_for_infomaniak

module "custom_domain" {
  count  = var.enable_custom_domain ? 1 : 0
  source = "./modules/custom-domain"

  # Provider Aliases (us-east-1 für ACM Certificate erforderlich!)
  providers = {
    aws           = aws
    aws.us-east-1 = aws.us-east-1
  }

  # Domain Configuration
  domain_name   = var.domain_name
  api_subdomain = var.api_subdomain

  # API Gateway Integration
  api_gateway_id         = module.lambda.api_gateway_id
  api_gateway_stage_name = var.api_gateway_stage_name

  # Metadata
  aws_region  = var.aws_region
  environment = var.environment
  tags        = local.common_tags

  # Route53 Integration (Optional)
  route53_zone_id      = var.enable_route53 ? module.route53[0].zone_id : null
  enable_route53_records = var.enable_route53

  depends_on = [module.lambda, module.route53]
}

# ----------------------------------------------------------------------------
# Route53 Module - DNS Management (Optional)
# ----------------------------------------------------------------------------
# Erstellt Route53 Hosted Zone für vollständige DNS-Automatisierung
# Eliminiert manuelle DNS-Konfiguration in Infomaniak
#
# WICHTIG: Nach Erstellung müssen Name Server bei Infomaniak geändert werden!
#          Siehe: terraform output route53_nameserver_instructions

module "route53" {
  count  = var.enable_route53 ? 1 : 0
  source = "./modules/route53"

  # Domain Configuration
  domain_name        = var.domain_name
  create_hosted_zone = true

  # ACM Certificate Validation Records
  # Werden automatisch von Custom Domain und Amplify Modulen übergeben
  acm_certificate_validation_options = []

  # Metadata
  environment = var.environment
  tags        = local.common_tags
}

# ----------------------------------------------------------------------------
# Amplify Module - Frontend Hosting (Optional)
# ----------------------------------------------------------------------------
# Erstellt nur wenn enable_amplify=true:
# - Amplify App
# - Branch-Konfiguration
# - GitHub Integration
# - Environment Variables

module "amplify" {
  count  = var.enable_amplify ? 1 : 0
  source = "./modules/amplify"

  project_name = var.project_name
  environment  = var.environment
  app_name     = "${local.name_prefix}-frontend"

  # GitHub Integration
  repository          = var.github_repository
  branch_name         = local.github_branch  # Automatisch gemappt basierend auf Environment
  github_access_token = var.github_access_token

  # Build Settings
  framework              = var.amplify_framework
  build_command          = var.amplify_build_command
  monorepo_app_root      = var.amplify_monorepo_app_root

  # AWS Region (für Auto-Build Trigger)
  aws_region = var.aws_region

  # Environment Variables (an Frontend übergeben)
  # AMPLIFY_MONOREPO_APP_ROOT ist erforderlich für Monorepo-Setup
  # Amplify nutzt dies um package.json im richtigen Pfad zu finden
  # Cognito Credentials für Amplify Auth
  # NOTE: FRONTEND_URL is NOT set here to avoid circular dependency
  # Frontend can determine its own URL at runtime using window.location.origin
  environment_variables = {
    AMPLIFY_MONOREPO_APP_ROOT      = var.amplify_monorepo_app_root
    NEXT_PUBLIC_API_URL            = var.enable_custom_domain ? "https://${module.custom_domain[0].api_domain_name}" : module.lambda.api_gateway_url
    AMPLIFY_DIFF_DEPLOY            = "false"
    # Cognito Configuration
    NEXT_PUBLIC_USER_POOL_ID       = module.cognito.user_pool_id
    NEXT_PUBLIC_USER_POOL_CLIENT_ID = module.cognito.user_pool_client_id
    NEXT_PUBLIC_AWS_REGION         = var.aws_region
  }

  # Basic Auth (optional)
  enable_basic_auth = var.basic_auth_enabled
  basic_auth_credentials = var.basic_auth_enabled ? {
    username = var.basic_auth_user
    password = var.basic_auth_password
  } : null

  # Custom Domain (optional)
  enable_custom_domain = var.enable_custom_domain
  custom_domain_name   = var.enable_custom_domain ? "${var.shop_subdomain}.${var.domain_name}" : ""

  # Route53 Integration (Optional)
  route53_zone_id      = var.enable_route53 ? module.route53[0].zone_id : null
  enable_route53_records = var.enable_route53

  tags = local.common_tags

  depends_on = [module.lambda, module.cognito, module.route53]
}

# ----------------------------------------------------------------------------
# Amplify Module - Admin Frontend Hosting (Optional)
# ----------------------------------------------------------------------------
# Erstellt nur wenn enable_admin_amplify=true:
# - Separate Amplify App für Admin Frontend
# - Branch-Konfiguration
# - GitHub Integration
# - Environment Variables
# - Automatischer Initial Build

module "amplify_admin" {
  count  = var.enable_admin_amplify ? 1 : 0
  source = "./modules/amplify"

  project_name = var.project_name
  environment  = var.environment
  app_name     = "${local.name_prefix}-admin-frontend"

  # GitHub Integration
  repository          = var.github_repository
  branch_name         = local.github_branch  # Automatisch gemappt basierend auf Environment
  github_access_token = var.github_access_token

  # Build Settings (Admin-Frontend spezifisch)
  framework              = var.admin_amplify_framework
  build_command          = var.admin_amplify_build_command
  monorepo_app_root      = var.admin_amplify_monorepo_app_root

  # AWS Region (für Auto-Build Trigger)
  aws_region = var.aws_region

  # Environment Variables (an Admin Frontend übergeben)
  # AMPLIFY_MONOREPO_APP_ROOT ist erforderlich für Monorepo-Setup
  # Admin Frontend nutzt Backend API für Admin-Operationen
  # Cognito Credentials für Amplify Auth
  environment_variables = {
    AMPLIFY_MONOREPO_APP_ROOT      = var.admin_amplify_monorepo_app_root
    NEXT_PUBLIC_API_URL            = var.enable_custom_domain ? "https://${module.custom_domain[0].api_domain_name}" : module.lambda.api_gateway_url
    AMPLIFY_DIFF_DEPLOY            = "false"
    # Cognito Configuration (gleicher User Pool wie Customer Frontend)
    NEXT_PUBLIC_USER_POOL_ID       = module.cognito.user_pool_id
    NEXT_PUBLIC_USER_POOL_CLIENT_ID = module.cognito.user_pool_client_id
    NEXT_PUBLIC_AWS_REGION         = var.aws_region
  }

  # Basic Auth für Admin (empfohlen!)
  enable_basic_auth = var.admin_basic_auth_enabled
  basic_auth_credentials = var.admin_basic_auth_enabled ? {
    username = var.admin_basic_auth_user
    password = var.admin_basic_auth_password
  } : null

  # Custom Domain (optional)
  enable_custom_domain = var.enable_custom_domain
  custom_domain_name   = var.enable_custom_domain ? "${var.admin_subdomain}.${var.domain_name}" : ""

  # Route53 Integration (Optional)
  route53_zone_id      = var.enable_route53 ? module.route53[0].zone_id : null
  enable_route53_records = var.enable_route53

  tags = local.common_tags

  depends_on = [module.lambda, module.cognito, module.route53]
}

# ----------------------------------------------------------------------------
# CloudWatch Log Groups (optional)
# ----------------------------------------------------------------------------
# Lambda Log Group wird automatisch von Lambda-Module erstellt
# Zusätzliche Log Groups können hier hinzugefügt werden

# ----------------------------------------------------------------------------
# Security Monitoring Module - Runtime Security Detection
# ----------------------------------------------------------------------------
# Erstellt FREE-tier Security Stack mit:
# - CloudWatch Alarms (5 real-time security event detectors)
# - IAM Access Analyzer (detects exposed resources)
# - SNS Topic (email notifications for security events)
# - EventBridge Daily Security Scan (Lambda @ 8 AM UTC)
# - Lambda Security Monitor (compliance checks)
#
# Real-time Alarms (<5 min detection):
# - Unauthorized API calls
# - Root account usage
# - IAM policy changes
# - Security group changes
# - S3 bucket policy changes
#
# Daily Security Scan (8 AM UTC):
# - Public S3 buckets
# - Security groups with 0.0.0.0/0
# - IAM users without MFA
# - IAM Access Analyzer findings
#
# Cost: $0.00/month (all FREE-tier resources)
# NOTE: After deployment, confirm SNS email subscription!

module "security_monitoring" {
  source = "./modules/security-monitoring"

  project_name   = var.project_name
  environment    = var.environment
  security_email = var.security_email
}

# ----------------------------------------------------------------------------
# Database Seeding (Optional - nur für Development)
# ----------------------------------------------------------------------------
# REMOVED: Old database_seeding module replaced by improved seed script
# in modules/dynamodb/seed.tf which generates:
# - 30 days of realistic order data
# - 40 customers with various registration dates
# - Strategic product stock levels (high/medium/low/critical mix)
#
# The old module was migrating products with original stock values,
# overwriting the realistic values set by the new seed script.
