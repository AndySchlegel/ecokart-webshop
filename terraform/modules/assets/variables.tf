# ============================================================================
# Assets Module Variables
# ============================================================================

variable "project_name" {
  description = "Project name (used for resource naming)"
  type        = string
}

variable "environment" {
  description = "Environment (development, staging, production)"
  type        = string
}

variable "cloudfront_price_class" {
  description = "CloudFront price class (PriceClass_All, PriceClass_200, PriceClass_100)"
  type        = string
  default     = "PriceClass_100" # US, Canada, Europe only (cheapest)
}

variable "tags" {
  description = "Tags to apply to all resources"
  type        = map(string)
  default     = {}
}
