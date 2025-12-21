# ============================================================================
# SES Module - Variables
# ============================================================================

variable "project_name" {
  description = "Name of the project (e.g., ecokart)"
  type        = string
}

variable "environment" {
  description = "Environment (development, staging, production)"
  type        = string
}

variable "sender_email" {
  description = "E-Mail address to send from (must be verified in SES)"
  type        = string
}

variable "brand_name" {
  description = "Brand name for e-mail templates (e.g., Ecokart)"
  type        = string
  default     = "Ecokart"
}

variable "enable_welcome_email" {
  description = "Enable welcome e-mail template"
  type        = bool
  default     = false
}

variable "tags" {
  description = "Tags to apply to resources"
  type        = map(string)
  default     = {}
}
