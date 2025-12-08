# ============================================================================
# Route53 Module - Outputs
# ============================================================================

# ----------------------------------------------------------------------------
# Hosted Zone Outputs
# ----------------------------------------------------------------------------

output "zone_id" {
  description = "Route53 Hosted Zone ID (for DNS records)"
  value       = local.zone_id
}

output "zone_name" {
  description = "Route53 Hosted Zone Name"
  value       = var.domain_name
}

output "name_servers" {
  description = "Route53 Name Servers (must be configured at domain registrar)"
  value       = var.create_hosted_zone ? aws_route53_zone.main[0].name_servers : data.aws_route53_zone.existing[0].name_servers
}

output "zone_arn" {
  description = "Route53 Hosted Zone ARN"
  value       = var.create_hosted_zone ? aws_route53_zone.main[0].arn : data.aws_route53_zone.existing[0].arn
}

# ----------------------------------------------------------------------------
# DNS Records Outputs
# ----------------------------------------------------------------------------

output "acm_validation_records" {
  description = "ACM validation DNS records created"
  value = {
    for k, v in aws_route53_record.acm_validation : k => {
      name  = v.name
      type  = v.type
      value = v.records[0]
    }
  }
}

output "custom_records" {
  description = "Custom DNS records created"
  value = {
    for k, v in aws_route53_record.custom : k => {
      name    = v.name
      type    = v.type
      records = v.records
    }
  }
}

# ----------------------------------------------------------------------------
# Setup Instructions (only if new zone created)
# ----------------------------------------------------------------------------

output "registrar_setup_instructions" {
  description = "Instructions for updating name servers at domain registrar (Infomaniak)"
  value = var.create_hosted_zone ? <<-EOT

    ╔═══════════════════════════════════════════════════════════════════╗
    ║          Route53 Hosted Zone Created - Action Required!          ║
    ╚═══════════════════════════════════════════════════════════════════╝

    📋 Domain: ${var.domain_name}

    🔧 WICHTIG: Name Server bei Domain-Registrar (Infomaniak) ändern!

    Schritte:
    ────────────────────────────────────────────────────────────────────
    1. Login bei Infomaniak (manager.infomaniak.com)

    2. Domain "${var.domain_name}" auswählen

    3. DNS/Nameserver Einstellungen öffnen

    4. Diese AWS Route53 Name Server eintragen:
       ${join("\n       ", var.create_hosted_zone ? aws_route53_zone.main[0].name_servers : [])}

    5. Speichern & DNS Propagation abwarten (5-60 Minuten)

    ⚠️  ACHTUNG: Alle existierenden DNS-Records in Infomaniak werden
       ungültig sobald Name Server geändert sind! Alle Records müssen
       in Terraform/Route53 konfiguriert werden.

    ✅ Nach Name Server Änderung: DNS wird vollständig von AWS verwaltet

  EOT : null
}
