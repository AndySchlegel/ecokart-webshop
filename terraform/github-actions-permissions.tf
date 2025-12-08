# ============================================================================
# GitHub Actions IAM Policy - Custom Domain Permissions
# ============================================================================
# Fügt zusätzliche Permissions zur existierenden GitHub Actions Role hinzu
# (Role wurde via Bootstrap Workflow erstellt, hier nur Policy-Attachment)

# Data Source: Existierende GitHub Actions Role
data "aws_iam_role" "github_actions" {
  name = "ecokart-github-actions-role"
}

# IAM Policy für Custom Domain Support
resource "aws_iam_policy" "custom_domain_permissions" {
  name        = "ecokart-custom-domain-permissions"
  description = "Permissions für Amplify + API Gateway Custom Domains"

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid    = "AmplifyCustomDomain"
        Effect = "Allow"
        Action = [
          "amplify:CreateDomainAssociation",
          "amplify:UpdateDomainAssociation",
          "amplify:DeleteDomainAssociation",
          "amplify:GetDomainAssociation",
          "amplify:ListDomainAssociations"
        ]
        Resource = "arn:aws:amplify:${var.aws_region}:${data.aws_caller_identity.current.account_id}:apps/*/domains/*"
      },
      {
        Sid    = "ACMCertificateManagement"
        Effect = "Allow"
        Action = [
          "acm:RequestCertificate",
          "acm:DescribeCertificate",
          "acm:DeleteCertificate",
          "acm:AddTagsToCertificate",
          "acm:ListCertificates",
          "acm:GetCertificate"
        ]
        Resource = "*"
      }
    ]
  })

  tags = local.common_tags
}

# Attach Policy zur GitHub Actions Role
resource "aws_iam_role_policy_attachment" "custom_domain_permissions" {
  role       = data.aws_iam_role.github_actions.name
  policy_arn = aws_iam_policy.custom_domain_permissions.arn
}

# Data Source für Account ID (wird in Policy verwendet)
data "aws_caller_identity" "current" {}
