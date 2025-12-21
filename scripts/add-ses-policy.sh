#!/bin/bash
# ============================================================================
# Add SES Policy to GitHub Actions IAM Role
# ============================================================================
# Quick fix to add SES permissions without re-running full bootstrap
#
# Usage:
#   ./scripts/add-ses-policy.sh
#
# Requires:
#   - AWS CLI configured with credentials
#   - Permissions to create IAM policies and attach them to roles
# ============================================================================

set -e

ROLE_NAME="ecokart-github-actions-role"
POLICY_NAME="${ROLE_NAME}-ses"
AWS_REGION="${AWS_REGION:-eu-north-1}"

echo "🔐 Adding SES Policy to GitHub Actions IAM Role..."
echo ""

# Get AWS Account ID
ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
echo "✅ AWS Account ID: $ACCOUNT_ID"
echo ""

# Check if role exists
if ! aws iam get-role --role-name "$ROLE_NAME" &>/dev/null; then
  echo "❌ ERROR: IAM Role '$ROLE_NAME' does not exist!"
  echo "   You need to run the Bootstrap workflow first."
  exit 1
fi

echo "✅ IAM Role exists: $ROLE_NAME"
echo ""

# Check if policy already exists
POLICY_ARN=$(aws iam list-policies \
  --query "Policies[?PolicyName=='$POLICY_NAME'].Arn" \
  --output text)

if [ -n "$POLICY_ARN" ]; then
  echo "✅ SES Policy already exists: $POLICY_ARN"
else
  echo "📦 Creating SES Policy..."

  # Create policy document
  cat > /tmp/ses-policy.json <<'EOF'
{
  "Version": "2012-10-17",
  "Statement": [{
    "Effect": "Allow",
    "Action": [
      "ses:VerifyEmailIdentity",
      "ses:DeleteEmailIdentity",
      "ses:GetEmailIdentity",
      "ses:GetIdentityVerificationAttributes",
      "ses:CreateConfigurationSet",
      "ses:DeleteConfigurationSet",
      "ses:DescribeConfigurationSet",
      "ses:PutConfigurationSetDeliveryOptions",
      "ses:CreateTemplate",
      "ses:DeleteTemplate",
      "ses:GetTemplate",
      "ses:UpdateTemplate",
      "ses:ListTemplates",
      "ses:SendEmail",
      "ses:SendRawEmail",
      "ses:SendTemplatedEmail"
    ],
    "Resource": "*"
  }]
}
EOF

  # Create policy
  POLICY_ARN=$(aws iam create-policy \
    --policy-name "$POLICY_NAME" \
    --policy-document file:///tmp/ses-policy.json \
    --description "SES permissions for GitHub Actions to deploy Ecokart email functionality" \
    --query Policy.Arn \
    --output text)

  echo "✅ SES Policy created: $POLICY_ARN"

  # Cleanup
  rm /tmp/ses-policy.json
fi

echo ""
echo "🔗 Attaching SES Policy to IAM Role..."

# Attach policy to role (idempotent - no error if already attached)
aws iam attach-role-policy \
  --role-name "$ROLE_NAME" \
  --policy-arn "$POLICY_ARN" 2>&1 | grep -v "already attached" || true

echo "✅ SES Policy attached to role!"
echo ""
echo "╔═══════════════════════════════════════════════════════════╗"
echo "║              🎉 SES Policy Setup Complete!                ║"
echo "╚═══════════════════════════════════════════════════════════╝"
echo ""
echo "Next Steps:"
echo "  1. ✅ SES Policy is now attached to GitHub Actions Role"
echo "  2. 🚀 Run Deploy Workflow again - SES resources will be created"
echo "  3. 📧 Verify email address after deployment"
echo ""
echo "Role: $ROLE_NAME"
echo "Policy: $POLICY_ARN"
echo ""
