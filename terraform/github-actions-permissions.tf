# ============================================================================
# GitHub Actions IAM Policy - Custom Domain Permissions
# ============================================================================
# Fügt zusätzliche Permissions zur existierenden GitHub Actions Role hinzu
# (Role wurde via Bootstrap Workflow erstellt, hier nur Policy-Attachment)

# Data Source: Existierende GitHub Actions Role
data "aws_iam_role" "github_actions" {
  name = "GitHubActionsRole-EcokartDeploy"
}

# Inline Policy für Custom Domain Support (umgeht 10-Policy-Limit)
resource "aws_iam_role_policy" "custom_domain_permissions" {
  name = "ecokart-custom-domain-permissions"
  role = data.aws_iam_role.github_actions.name

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
          "acm:GetCertificate",
          "acm:ListTagsForCertificate"
        ]
        Resource = "*"
      },
      {
        Sid    = "Route53Management"
        Effect = "Allow"
        Action = [
          # Hosted Zone Management
          "route53:CreateHostedZone",
          "route53:DeleteHostedZone",
          "route53:GetHostedZone",
          "route53:GetHostedZoneCount",
          "route53:ListHostedZones",
          "route53:UpdateHostedZoneComment",
          # DNS Records Management
          "route53:ChangeResourceRecordSets",
          "route53:GetChange",
          "route53:ListResourceRecordSets",
          # Tagging
          "route53:ChangeTagsForResource",
          "route53:ListTagsForResource"
        ]
        Resource = "*"
      }
    ]
  })
}

# Data Source für Account ID (wird in Policy verwendet)
data "aws_caller_identity" "current" {}
