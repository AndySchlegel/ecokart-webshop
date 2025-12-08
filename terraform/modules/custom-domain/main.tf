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
  depends_on = [aws_acm_certificate.api]
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
