# ============================================================================
# Ecokart - Development Environment Configuration
# ============================================================================
# Diese Config wird für den "develop" Branch verwendet.
# Ziel: Günstig, schnell, zum Experimentieren
# AWS Kosten: ~20-30 EUR/Monat
# ============================================================================

# ----------------------------------------------------------------------------
# Allgemeine Konfiguration
# ----------------------------------------------------------------------------

aws_region   = "eu-central-1"  # Frankfurt (näher zu Deutschland, Personal Account)
project_name = "ecokart"
environment  = "development"

# ----------------------------------------------------------------------------
# DynamoDB Konfiguration - KOSTENGÜNSTIG
# ----------------------------------------------------------------------------

# PAY_PER_REQUEST = Du zahlst nur für tatsächliche Zugriffe
# Perfekt für Development, weil oft wenig Traffic
dynamodb_billing_mode = "PAY_PER_REQUEST"

# Point-in-Time Recovery = Backup-Feature
# Development: AUS (spart Kosten, Daten sind nicht kritisch)
enable_point_in_time_recovery = false

# ----------------------------------------------------------------------------
# Lambda Konfiguration - KLEIN
# ----------------------------------------------------------------------------

lambda_runtime     = "nodejs20.x"
lambda_memory_size = 256        # Halbe Power von Production (spart Geld)
lambda_timeout     = 30         # 30 Sekunden reichen für Development
lambda_source_path = "../backend"  # Relativer Pfad von terraform/

# ----------------------------------------------------------------------------
# API Gateway Konfiguration
# ----------------------------------------------------------------------------

api_gateway_stage_name = "dev"  # Stage heißt "dev" statt "Prod"

# Access Logs = Detaillierte Anfrage-Logs in CloudWatch
# Development: AUS (spart Kosten, weniger Logs-Spam)
enable_api_gateway_access_logs = false

# ----------------------------------------------------------------------------
# Amplify Konfiguration
# ----------------------------------------------------------------------------

enable_amplify    = true
github_repository = "https://github.com/AndySchlegel/Ecokart-Webshop"
github_branch     = "develop"  # WICHTIG: Dieser Branch!
amplify_framework = "Next.js - SSR"
amplify_build_command = "npm run build"
amplify_monorepo_app_root = "frontend"

# Basic Auth - Schutz vor neugierigen Augen (nicht Production-ready!)
basic_auth_enabled  = true
basic_auth_user     = "demo"
basic_auth_password = "test1234"  # Schwaches Passwort OK für Dev

# ----------------------------------------------------------------------------
# Admin Frontend Amplify Konfiguration
# ----------------------------------------------------------------------------

enable_admin_amplify          = true
admin_amplify_framework       = "Next.js - SSR"
admin_amplify_build_command   = "npm run build"
admin_amplify_monorepo_app_root = "admin-frontend"

admin_basic_auth_enabled  = true
admin_basic_auth_user     = "admin"
admin_basic_auth_password = "admin1234"

# ----------------------------------------------------------------------------
# Cognito Konfiguration
# ----------------------------------------------------------------------------

enable_cognito_auth = true

# ----------------------------------------------------------------------------
# Database Seeding
# ----------------------------------------------------------------------------

enable_auto_seed = true

# ----------------------------------------------------------------------------
# Custom Domain Konfiguration
# ----------------------------------------------------------------------------

# Custom Domain aktivieren (für 100% reproduzierbare URLs)
# ITERATION 1: Disabled - nutzen Random Amplify URLs zum Testen
enable_custom_domain = false

# Basis-Domain (bei Infomaniak registriert)
domain_name = "his4irness23.de"

# Subdomains (optional - defaults sind bereits gesetzt)
api_subdomain   = "api"    # → api.his4irness23.de
shop_subdomain  = "shop"   # → shop.his4irness23.de
admin_subdomain = "admin"  # → admin.his4irness23.de

# WICHTIG: Nach Deploy DNS CNAME Records in Infomaniak erstellen!
# Verwende: terraform output dns_records_for_infomaniak

# ----------------------------------------------------------------------------
# Route53 DNS Management
# ----------------------------------------------------------------------------

# Route53 aktivieren für 100% automatische DNS-Verwaltung
# Eliminiert manuelle DNS-Schritte in Infomaniak
# ITERATION 1: Disabled - erst nach Basic Stack Test aktivieren
enable_route53 = false

# WICHTIG: Nach erstem Deploy mit enable_route53=true:
# 1. Terraform zeigt Name Server in Outputs
# 2. Diese Name Server bei Infomaniak eintragen (einmalig!)
# 3. DNS Propagation abwarten (5-60 Minuten)
# 4. Danach sind ALLE DNS-Changes automatisch via Terraform

# ----------------------------------------------------------------------------
# Zusätzliche Tags
# ----------------------------------------------------------------------------

additional_tags = {
  Environment  = "development"
  CostCenter   = "development"
  ManagedBy    = "terraform"
  AutoShutdown = "true"  # Könnte für automatisches Herunterfahren genutzt werden
}

# ============================================================================
# WICHTIG FÜR DICH, ANDY:
# ============================================================================
# Diese Config macht die Infrastruktur BEWUSST klein und günstig.
#
# Vorteile:
# - ✅ Niedrige Kosten (~20-30 EUR/Monat)
# - ✅ Schnelles Deployment (weniger Ressourcen)
# - ✅ Du kannst hier "kaputt machen" ohne Drama
#
# Nachteile:
# - ⚠️ Langsamer als Production (256 MB statt 512 MB Lambda)
# - ⚠️ Kein Backup (Point-in-Time Recovery aus)
# - ⚠️ Nicht für echte Kunden geeignet
#
# DAS IST GUT SO! Development soll günstig zum Testen sein! 🚀
# ============================================================================
