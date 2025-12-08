# ============================================================================
# Route53 Module - DNS Management
# ============================================================================
# Manages DNS via AWS Route53 for 100% reproducible infrastructure
# Eliminates manual DNS configuration in external providers (Infomaniak)

# ----------------------------------------------------------------------------
# Route53 Hosted Zone
# ----------------------------------------------------------------------------
# Creates or uses existing Hosted Zone for domain

resource "aws_route53_zone" "main" {
  count = var.create_hosted_zone ? 1 : 0

  name    = var.domain_name
  comment = "Managed by Terraform - Ecokart ${var.environment}"

  tags = merge(
    var.tags,
    {
      Name = var.domain_name
    }
  )
}

# Data Source für existierende Hosted Zone (falls create_hosted_zone=false)
data "aws_route53_zone" "existing" {
  count = var.create_hosted_zone ? 0 : 1

  name         = var.domain_name
  private_zone = false
}

# Lokale Variable für Zone ID (egal ob neu erstellt oder existierend)
locals {
  zone_id = var.create_hosted_zone ? aws_route53_zone.main[0].zone_id : data.aws_route53_zone.existing[0].zone_id
}

# ----------------------------------------------------------------------------
# ACM Certificate Validation Records
# ----------------------------------------------------------------------------
# Automatische DNS Records für ACM Certificate Validation
# Diese werden von Custom Domain und Amplify Modulen übergeben

resource "aws_route53_record" "acm_validation" {
  for_each = {
    for dvo in var.acm_certificate_validation_options : dvo.domain_name => {
      name  = dvo.resource_record_name
      type  = dvo.resource_record_type
      value = dvo.resource_record_value
    }
  }

  zone_id = local.zone_id
  name    = each.value.name
  type    = each.value.type
  ttl     = 60
  records = [each.value.value]

  allow_overwrite = true
}

# ----------------------------------------------------------------------------
# Custom DNS Records
# ----------------------------------------------------------------------------
# Flexible DNS Records für API, Shop, Admin, etc.
# Unterstützt sowohl normale Records als auch Alias Records

resource "aws_route53_record" "custom" {
  for_each = var.dns_records

  zone_id = local.zone_id
  name    = each.key == "@" ? var.domain_name : "${each.key}.${var.domain_name}"
  type    = each.value.type

  # Regular Records (CNAME, A, TXT, etc.)
  ttl     = each.value.alias == null ? each.value.ttl : null
  records = each.value.alias == null ? each.value.records : null

  # Alias Records (für CloudFront, API Gateway, Amplify, etc.)
  dynamic "alias" {
    for_each = each.value.alias != null ? [each.value.alias] : []
    content {
      name                   = alias.value.name
      zone_id                = alias.value.zone_id
      evaluate_target_health = alias.value.evaluate_target_health
    }
  }

  allow_overwrite = true
}

# ----------------------------------------------------------------------------
# Outputs für andere Module
# ----------------------------------------------------------------------------
# Diese Outputs werden von Custom Domain und Amplify Modulen genutzt
