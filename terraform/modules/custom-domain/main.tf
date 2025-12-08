# ============================================================================
# Custom Domain Module - Main Configuration
# ============================================================================
# Erstellt Custom Domain für API Gateway mit SSL Zertifikat

# ----------------------------------------------------------------------------
# Locals
# ----------------------------------------------------------------------------

locals {
  api_domain_name = "${var.api_subdomain}.${var.domain_name}"
}

# ----------------------------------------------------------------------------
# SSL Certificate (AWS Certificate Manager)
# ----------------------------------------------------------------------------
# Für REGIONAL API Gateway: Certificate in gleicher Region (eu-north-1)
# Für EDGE-OPTIMIZED: Certificate in us-east-1

resource "aws_acm_certificate" "api" {
  # REGIONAL endpoint → Certificate in gleicher Region!
  # provider = aws.us-east-1  # Only for EDGE-OPTIMIZED

  domain_name       = local.api_domain_name
  validation_method = "DNS"

  tags = merge(
    var.tags,
    {
      Name = "${var.environment}-api-certificate"
    }
  )

  lifecycle {
    create_before_destroy = true
  }
}

# ----------------------------------------------------------------------------
# ACM Certificate Validation via Route53 (Optional)
# ----------------------------------------------------------------------------
# Automatische DNS Validation Records für SSL Zertifikat

resource "aws_route53_record" "cert_validation" {
  for_each = var.route53_zone_id != null && var.enable_route53_records ? {
    for dvo in aws_acm_certificate.api.domain_validation_options : dvo.domain_name => {
      name   = dvo.resource_record_name
      record = dvo.resource_record_value
      type   = dvo.resource_record_type
    }
  } : {}

  zone_id = var.route53_zone_id
  name    = each.value.name
  type    = each.value.type
  ttl     = 60
  records = [each.value.record]

  allow_overwrite = true
}

# ACM Certificate Validation Completion
resource "aws_acm_certificate_validation" "api" {
  count = var.route53_zone_id != null && var.enable_route53_records ? 1 : 0

  certificate_arn         = aws_acm_certificate.api.arn
  validation_record_fqdns = [for record in aws_route53_record.cert_validation : record.fqdn]
}

# ----------------------------------------------------------------------------
# API Gateway Custom Domain
# ----------------------------------------------------------------------------

resource "aws_api_gateway_domain_name" "api" {
  domain_name              = local.api_domain_name
  regional_certificate_arn = aws_acm_certificate.api.arn

  endpoint_configuration {
    types = ["REGIONAL"]
  }

  tags = merge(
    var.tags,
    {
      Name = "${var.environment}-api-domain"
    }
  )

  # Wait for certificate validation
  depends_on = [
    aws_acm_certificate.api,
    aws_acm_certificate_validation.api
  ]
}

# ----------------------------------------------------------------------------
# API Gateway Base Path Mapping
# ----------------------------------------------------------------------------
# Maps the custom domain to the API Gateway stage

resource "aws_api_gateway_base_path_mapping" "api" {
  api_id      = var.api_gateway_id
  stage_name  = var.api_gateway_stage_name
  domain_name = aws_api_gateway_domain_name.api.domain_name

  # Map root path
  base_path = ""
}

# ----------------------------------------------------------------------------
# Route53 DNS Record for API Custom Domain (Optional)
# ----------------------------------------------------------------------------
# CNAME Record: api.his4irness23.de → API Gateway Regional Domain

resource "aws_route53_record" "api_domain" {
  count = var.route53_zone_id != null && var.enable_route53_records ? 1 : 0

  zone_id = var.route53_zone_id
  name    = local.api_domain_name
  type    = "CNAME"
  ttl     = 300
  records = [aws_api_gateway_domain_name.api.regional_domain_name]

  depends_on = [aws_api_gateway_domain_name.api]
}
