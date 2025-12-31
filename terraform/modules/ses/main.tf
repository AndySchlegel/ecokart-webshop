# ============================================================================
# SES Module - E-Mail Versand für Order Confirmations
# ============================================================================
# Purpose: Setup Amazon SES (Simple Email Service) für transaktionale E-Mails
#
# Features:
# - E-Mail Identity Verification (für Development/Sandbox)
# - E-Mail Templates (Order Confirmation, etc.)
# - Configuration Set (für E-Mail Tracking)
#
# Note: SES startet im SANDBOX Mode
# - Kann nur an verifizierte E-Mails senden
# - Max 200 E-Mails/Tag
# - Für Production: Domain Verification + AWS Support Ticket nötig
# ============================================================================

# ----------------------------------------------------------------------------
# 1. SES Domain Identity (Domain verifizieren für Production Access)
# ----------------------------------------------------------------------------
# Verifiziert die komplette Domain (z.B. his4irness23.de)
# Requirement für SES Production Access Request
# DNS Records werden automatisch via Route53 erstellt

resource "aws_ses_domain_identity" "main" {
  domain = var.domain_name
}

# DKIM Tokens für Domain Verification (E-Mail Authentifizierung)
resource "aws_ses_domain_dkim" "main" {
  domain = aws_ses_domain_identity.main.domain
}

# DNS Records für DKIM Verification (automatisch via Route53)
# Diese Records beweisen, dass wir die Domain besitzen
resource "aws_route53_record" "ses_dkim" {
  count = 3 # AWS generiert 3 DKIM Tokens

  zone_id = var.route53_zone_id
  name    = "${aws_ses_domain_dkim.main.dkim_tokens[count.index]}._domainkey"
  type    = "CNAME"
  ttl     = 600
  records = ["${aws_ses_domain_dkim.main.dkim_tokens[count.index]}.dkim.amazonses.com"]
}

# ----------------------------------------------------------------------------
# 2. SES Email Identity (Sender E-Mail verifizieren)
# ----------------------------------------------------------------------------
# Erstellt eine verifizierte E-Mail Adresse
# AWS schickt Verification E-Mail an diese Adresse
# User muss Link klicken → dann kann von dieser E-Mail gesendet werden

resource "aws_ses_email_identity" "sender" {
  email = var.sender_email
}

# ----------------------------------------------------------------------------
# 2. SES Configuration Set (für E-Mail Tracking)
# ----------------------------------------------------------------------------
# Tracking von:
# - Bounces (E-Mail nicht zugestellt)
# - Complaints (Spam Reports)
# - Opens/Clicks (optional)

resource "aws_ses_configuration_set" "main" {
  name = "${var.project_name}-${var.environment}"

  # Reputation Metrics aktivieren
  reputation_metrics_enabled = true

  # Sending aktivieren
  sending_enabled = true
}

# Event Destination für Bounces/Complaints (optional - später mit SNS)
# resource "aws_ses_event_destination" "cloudwatch" {
#   name                   = "cloudwatch-destination"
#   configuration_set_name = aws_ses_configuration_set.main.name
#   enabled                = true
#   matching_types         = ["bounce", "complaint"]
#
#   cloudwatch_destination {
#     default_value  = "default"
#     dimension_name = "ses:configuration-set"
#     value_source   = "emailHeader"
#   }
# }

# ----------------------------------------------------------------------------
# 3. SES E-Mail Template - Order Confirmation
# ----------------------------------------------------------------------------
# HTML E-Mail Template für Bestellbestätigungen

resource "aws_ses_template" "order_confirmation" {
  name = "${var.project_name}-order-confirmation"

  subject = "Deine AIR LEGACY Bestellung ist bestätigt"

  # HTML Version (schön formatiert)
  html = templatefile("${path.module}/templates/order-confirmation.html", {
    brand_name = var.brand_name
  })

  # Text Version (Fallback)
  text = templatefile("${path.module}/templates/order-confirmation.txt", {
    brand_name = var.brand_name
  })
}

# ----------------------------------------------------------------------------
# 4. SES E-Mail Template - Welcome E-Mail (optional)
# ----------------------------------------------------------------------------
# Welcome E-Mail nach User Registration (zusätzlich zu Cognito Verification)

resource "aws_ses_template" "welcome" {
  count = var.enable_welcome_email ? 1 : 0

  name = "${var.project_name}-welcome"

  subject = "🌿 Willkommen bei ${var.brand_name}!"

  html = templatefile("${path.module}/templates/welcome.html", {
    brand_name = var.brand_name
  })

  text = templatefile("${path.module}/templates/welcome.txt", {
    brand_name = var.brand_name
  })
}
