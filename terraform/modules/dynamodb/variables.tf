# ============================================================================
# DynamoDB Module Variables
# ============================================================================

variable "project_name" {
  description = "Name des Projekts (für Table-Naming)"
  type        = string
}

variable "environment" {
  description = "Umgebung (development, staging, production)"
  type        = string
}

variable "billing_mode" {
  description = "DynamoDB Billing Mode (PROVISIONED oder PAY_PER_REQUEST)"
  type        = string
  default     = "PROVISIONED"
}

variable "read_capacity" {
  description = "Read Capacity Units (nur bei PROVISIONED)"
  type        = number
  default     = 5
}

variable "write_capacity" {
  description = "Write Capacity Units (nur bei PROVISIONED)"
  type        = number
  default     = 5
}

variable "enable_point_in_time_recovery" {
  description = "Point-in-Time Recovery aktivieren (empfohlen für Production)"
  type        = bool
  default     = false
}

variable "tags" {
  description = "Tags für alle DynamoDB Tables"
  type        = map(string)
  default     = {}
}

variable "aws_profile" {
  description = "AWS Profile for seed script execution"
  type        = string
  default     = "personal"
}

variable "aws_region" {
  description = "AWS Region for seed script execution"
  type        = string
  default     = "eu-central-1"
}
