# ============================================================================
# Amplify IAM Service Role
# ============================================================================
# Amplify benötigt eine Service Role um Build-Operationen durchzuführen.
# Diese Role braucht SSM Write Permissions um Frontend URL zu speichern.

# ----------------------------------------------------------------------------
# Amplify Service Role
# ----------------------------------------------------------------------------

resource "aws_iam_role" "amplify_service_role" {
  name = "${var.app_name}-amplify-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Principal = {
          Service = "amplify.amazonaws.com"
        }
        Action = "sts:AssumeRole"
      }
    ]
  })

  tags = var.tags
}

# ----------------------------------------------------------------------------
# Basic Amplify Backend Deployment Policy
# ----------------------------------------------------------------------------
# Managed Policy für standard Amplify Operations

resource "aws_iam_role_policy_attachment" "amplify_backend_deploy" {
  role       = aws_iam_role.amplify_service_role.name
  policy_arn = "arn:aws:iam::aws:policy/AdministratorAccess-Amplify"
}

# ----------------------------------------------------------------------------
# SSM Parameter Write Access (für Frontend URL)
# ----------------------------------------------------------------------------
# Custom Policy um Frontend URL in SSM zu schreiben

resource "aws_iam_role_policy" "amplify_ssm_write" {
  name = "${var.app_name}-ssm-write-policy"
  role = aws_iam_role.amplify_service_role.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "ssm:PutParameter",
          "ssm:AddTagsToResource"
        ]
        Resource = [
          "arn:aws:ssm:${var.aws_region}:${data.aws_caller_identity.current.account_id}:parameter/ecokart/*"
        ]
      }
    ]
  })
}

# ----------------------------------------------------------------------------
# Route53 + ACM Access (für Custom Domain Validation)
# ----------------------------------------------------------------------------
# Amplify benötigt Route53 + ACM Permissions für automatische Custom Domain Setup

resource "aws_iam_role_policy" "amplify_route53_acm" {
  name = "${var.app_name}-route53-acm-policy"
  role = aws_iam_role.amplify_service_role.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "route53:ListHostedZones",
          "route53:ListResourceRecordSets",
          "route53:ChangeResourceRecordSets",
          "route53:GetChange"
        ]
        Resource = "*"
      },
      {
        Effect = "Allow"
        Action = [
          "acm:RequestCertificate",
          "acm:DescribeCertificate",
          "acm:ListCertificates",
          "acm:AddTagsToCertificate"
        ]
        Resource = "*"
      }
    ]
  })
}

# Data Source für Account ID
data "aws_caller_identity" "current" {}
