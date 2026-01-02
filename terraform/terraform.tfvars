# ============================================================================
# Terraform Variables - Ecokart Production Configuration
# ============================================================================
# Custom Domain Setup mit Subdomain Delegation (aws.his4irness23.de)
#
# URLs nach Setup:
# - API Gateway: api.aws.his4irness23.de
# - Customer Shop: shop.aws.his4irness23.de
# - Admin Panel: admin.aws.his4irness23.de
#
# Datum: 16. Dezember 2025
# ============================================================================

# ----------------------------------------------------------------------------
# Project Configuration
# ----------------------------------------------------------------------------
project_name = "ecokart"
environment  = "development"
aws_region   = "eu-central-1"

# ----------------------------------------------------------------------------
# GitHub Configuration
# ----------------------------------------------------------------------------
github_repository = "https://github.com/AndySchlegel/Ecokart-Webshop"

# ----------------------------------------------------------------------------
# Custom Domain Configuration (Subdomain Delegation)
# ----------------------------------------------------------------------------
# WICHTIG: Die Hauptdomain his4irness23.de bleibt bei Infomaniak!
# NUR die Subdomain aws.his4irness23.de wird zu Route 53 delegiert.
# Das schützt VPN Tunnel und Webseite!

enable_custom_domain = true
enable_route53       = true

# Base Domain: Die SUBDOMAIN die zu Route 53 delegiert wird
domain_name = "aws.his4irness23.de"

# Subdomains unter aws.his4irness23.de
api_subdomain   = "api"    # Ergibt: api.aws.his4irness23.de
shop_subdomain  = "shop"   # Ergibt: shop.aws.his4irness23.de
admin_subdomain = "admin"  # Ergibt: admin.aws.his4irness23.de

# ----------------------------------------------------------------------------
# Cognito Configuration
# ----------------------------------------------------------------------------
# Kein pre-created Admin User nötig - Registration über normale UI

# ----------------------------------------------------------------------------
# SES Configuration (E-Mail Service)
# ----------------------------------------------------------------------------
ses_sender_email = "andy.schlegel@chakademie.org"  # Temporär, bis Production Access

# ----------------------------------------------------------------------------
# Security Monitoring Configuration
# ----------------------------------------------------------------------------
security_email = "andy.schlegel23@googlemail.com"  # Empfänger für Security Alerts

# ----------------------------------------------------------------------------
# Amplify Configuration
# ----------------------------------------------------------------------------
enable_amplify       = true  # Customer Shop Frontend
enable_admin_amplify = true  # Admin Frontend

# Basic Auth (optional, für Demo-Schutz)
basic_auth_enabled  = false  # Customer Shop: Kein Basic Auth
basic_auth_user     = "demo"
basic_auth_password = "demo1234"

# Admin Basic Auth (EMPFOHLEN!)
admin_basic_auth_enabled  = true   # Admin Panel: Basic Auth aktiviert
admin_basic_auth_user     = "admin"
admin_basic_auth_password = "admin1234"  # Mind. 7 Zeichen erforderlich

# ----------------------------------------------------------------------------
# Additional Tags
# ----------------------------------------------------------------------------
additional_tags = {
  Owner       = "AndySchlegel"
  CostCenter  = "Development"
  Terraform   = "true"
}
