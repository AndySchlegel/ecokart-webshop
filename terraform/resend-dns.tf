# ============================================================================
# Resend Email Service - DNS Records
# ============================================================================
# Domain: aws.his4irness23.de
# Purpose: Email sending via Resend (External Email Provider)
# Date: 1. Januar 2026
#
# These records enable:
# - Domain verification (DKIM)
# - Email sending (SPF)
#
# Note: These records are STATIC and will NOT change!
# ============================================================================

locals {
  resend_enabled = var.enable_route53 # Only create if Route53 is enabled
}

# ----------------------------------------------------------------------------
# 1. DKIM Record - Domain Verification
# ----------------------------------------------------------------------------
# Proves domain ownership to Resend
# Enables sending from any @aws.his4irness23.de address

resource "aws_route53_record" "resend_dkim" {
  count = local.resend_enabled ? 1 : 0

  zone_id = module.route53[0].zone_id
  name    = "resend._domainkey.aws.his4irness23.de"
  type    = "TXT"
  ttl     = 600

  records = [
    "p=MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQDff+ZeUtQuJ/2afOVjKxMPtxsIPzIg8Ro/PHh4KPcL3iiWPzQghNMlPmTugnd7vtj7DpXNaUeQ2ZmlQiqmZwb3p23xejsIUNSNZs4GgqcD+N/NcJi1bVtHJ3Kj7xxC4+g5GWdZ2dzS4ZKTca8SdQgHPiDjMRLvPUA8t/bylbqP0wIDAQAB"
  ]

  depends_on = [module.route53]
}

# ----------------------------------------------------------------------------
# 2. SPF MX Record - Email Sending
# ----------------------------------------------------------------------------
# Routes outbound emails through Resend's SMTP servers

resource "aws_route53_record" "resend_spf_mx" {
  count = local.resend_enabled ? 1 : 0

  zone_id = module.route53[0].zone_id
  name    = "send.aws.his4irness23.de"
  type    = "MX"
  ttl     = 600

  records = [
    "10 feedback-smtp.eu-west-1.amazonses.com"
  ]

  depends_on = [module.route53]
}

# ----------------------------------------------------------------------------
# 3. SPF TXT Record - Email Authentication
# ----------------------------------------------------------------------------
# Authorizes Resend (via Amazon SES) to send emails on behalf of domain

resource "aws_route53_record" "resend_spf_txt" {
  count = local.resend_enabled ? 1 : 0

  zone_id = module.route53[0].zone_id
  name    = "send.aws.his4irness23.de"
  type    = "TXT"
  ttl     = 600

  records = [
    "v=spf1 include:amazonses.com ~all"
  ]

  depends_on = [module.route53]
}

# ----------------------------------------------------------------------------
# Outputs
# ----------------------------------------------------------------------------

output "resend_dns_records" {
  description = "Resend DNS records status"
  value = local.resend_enabled ? {
    dkim_record = "resend._domainkey.aws.his4irness23.de"
    spf_mx      = "send.aws.his4irness23.de (MX)"
    spf_txt     = "send.aws.his4irness23.de (TXT)"
    status      = "Created via Terraform"
  } : null
}
