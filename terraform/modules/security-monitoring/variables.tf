variable "project_name" {
  description = "Project name for resource naming"
  type        = string
}

variable "environment" {
  description = "Environment (dev, staging, prod)"
  type        = string
}

variable "security_email" {
  description = "Email address for security alert notifications"
  type        = string
}
