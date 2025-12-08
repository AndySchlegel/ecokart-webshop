# ============================================================================
# Route53 Module - Variables
# ============================================================================
# Manages DNS via AWS Route53 for full automation (no manual Infomaniak steps)

# ----------------------------------------------------------------------------
# Domain Configuration
# ----------------------------------------------------------------------------

variable "domain_name" {
  description = "Root domain name (e.g., his4irness23.de)"
  type        = string

  validation {
    condition     = can(regex("^[a-z0-9][a-z0-9-]*\\.[a-z]{2,}$", var.domain_name))
    error_message = "domain_name must be a valid domain (e.g., example.com)"
  }
}

variable "create_hosted_zone" {
  description = "Whether to create a new Route53 Hosted Zone (set to false if zone already exists)"
  type        = bool
  default     = true
}

# ----------------------------------------------------------------------------
# DNS Records Configuration
# ----------------------------------------------------------------------------

variable "dns_records" {
  description = "Map of DNS records to create (key = subdomain, value = record config)"
  type = map(object({
    type    = string           # A, AAAA, CNAME, TXT, etc.
    ttl     = optional(number, 300)
    records = optional(list(string), [])
    alias = optional(object({
      name                   = string
      zone_id                = string
      evaluate_target_health = optional(bool, false)
    }), null)
  }))
  default = {}
}

# ----------------------------------------------------------------------------
# ACM Certificate Validation
# ----------------------------------------------------------------------------

variable "acm_certificate_validation_options" {
  description = "ACM certificate domain validation options for automatic DNS record creation"
  type = list(object({
    domain_name           = string
    resource_record_name  = string
    resource_record_type  = string
    resource_record_value = string
  }))
  default = []
}

# ----------------------------------------------------------------------------
# Metadata
# ----------------------------------------------------------------------------

variable "environment" {
  description = "Environment name (development, staging, production)"
  type        = string
}

variable "tags" {
  description = "Tags to apply to all resources"
  type        = map(string)
  default     = {}
}
