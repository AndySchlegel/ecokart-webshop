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
