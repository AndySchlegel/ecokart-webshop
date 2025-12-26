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
github_owner = "AndySchlegel"
github_repo  = "Ecokart-Webshop"

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
create_admin_user = false

# ----------------------------------------------------------------------------
# Amplify Configuration
# ----------------------------------------------------------------------------
enable_admin_frontend = true

# ----------------------------------------------------------------------------
# Additional Tags
# ----------------------------------------------------------------------------
additional_tags = {
  Owner       = "AndySchlegel"
  CostCenter  = "Development"
  Terraform   = "true"
}
