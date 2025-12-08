# ============================================================================
# Custom Domain Module - Outputs
# ============================================================================

output "api_domain_name" {
  description = "Custom domain name for API (e.g., api.his4irness23.de)"
  value       = aws_api_gateway_domain_name.api.domain_name
}

output "api_regional_domain_name" {
  description = "Regional domain name for DNS CNAME record"
  value       = aws_api_gateway_domain_name.api.regional_domain_name
}

output "api_regional_zone_id" {
  description = "Regional hosted zone ID for DNS alias record"
  value       = aws_api_gateway_domain_name.api.regional_zone_id
}

output "certificate_arn" {
  description = "ARN of the ACM certificate"
  value       = aws_acm_certificate.api.arn
}

output "certificate_domain_validation_options" {
  description = "Certificate domain validation options (for DNS validation)"
  value       = aws_acm_certificate.api.domain_validation_options
}

output "dns_record_for_infomaniak" {
  description = "DNS record to create in Infomaniak (CNAME)"
  value = {
    name  = local.api_domain_name
    type  = "CNAME"
    value = aws_api_gateway_domain_name.api.regional_domain_name
  }
}
