# ============================================================================
# Custom Domain Module - Variables
# ============================================================================
# Dieses Modul erstellt Custom Domains für API Gateway
# mit SSL Zertifikat (AWS Certificate Manager)

variable "domain_name" {
  description = "Base domain name (e.g., his4irness23.de)"
  type        = string
}

variable "api_subdomain" {
  description = "Subdomain for API (e.g., 'api' → api.his4irness23.de)"
  type        = string
  default     = "api"
}

variable "api_gateway_id" {
  description = "ID of the API Gateway REST API"
  type        = string
}

variable "api_gateway_stage_name" {
  description = "API Gateway stage name (e.g., 'dev', 'prod')"
  type        = string
}

variable "aws_region" {
  description = "AWS region"
  type        = string
}

variable "environment" {
  description = "Environment (development, staging, production)"
  type        = string
}

variable "tags" {
  description = "Tags to apply to resources"
  type        = map(string)
  default     = {}
}

# ----------------------------------------------------------------------------
# Route53 Integration (Optional)
# ----------------------------------------------------------------------------

variable "route53_zone_id" {
  description = "Route53 Hosted Zone ID for automatic DNS record creation (optional)"
  type        = string
  default     = null
}

variable "enable_route53_records" {
  description = "Whether to automatically create Route53 DNS records (requires route53_zone_id)"
  type        = bool
  default     = true
}
