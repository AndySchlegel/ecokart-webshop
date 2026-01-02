#!/bin/bash
# ============================================================================
# Add Security Monitoring Permissions to GitHub Actions IAM Role
# ============================================================================
# This script adds missing IAM permissions for the security-monitoring module:
# - SNS (for security alerts)
# - IAM Access Analyzer (for external access detection)
# - EventBridge (for daily security scans)
# - CloudWatch Alarms (for real-time monitoring)
# ============================================================================

set -e  # Exit on error

AWS_REGION="eu-central-1"
AWS_PROFILE="personal"
ROLE_NAME="GitHubActionsRole-EcokartDeploy"
ACCOUNT_ID=$(aws sts get-caller-identity --profile "$AWS_PROFILE" --query Account --output text)

echo "============================================================================"
echo "Adding Security Monitoring Permissions"
echo "============================================================================"
echo "AWS Region: $AWS_REGION"
echo "Role Name: $ROLE_NAME"
echo "Account ID: $ACCOUNT_ID"
echo ""

# ============================================================================
# Function to create and attach policy
# ============================================================================
create_and_attach_policy() {
  local POLICY_NAME=$1
  local POLICY_FILE=$2

  echo "📜 Processing policy: $POLICY_NAME"

  # Check if policy exists
  POLICY_ARN=$(aws iam list-policies \
    --profile "$AWS_PROFILE" \
    --region "$AWS_REGION" \
    --query "Policies[?PolicyName=='$POLICY_NAME'].Arn" \
    --output text)

  if [ -n "$POLICY_ARN" ]; then
    echo "  ✅ Policy already exists: $POLICY_NAME"
  else
    echo "  📦 Creating policy: $POLICY_NAME"
    POLICY_ARN=$(aws iam create-policy \
      --profile "$AWS_PROFILE" \
      --region "$AWS_REGION" \
      --policy-name "$POLICY_NAME" \
      --policy-document "file://$POLICY_FILE" \
      --query Policy.Arn \
      --output text)
    echo "  ✅ Policy created: $POLICY_ARN"
  fi

  # Attach to role
  echo "  🔗 Attaching policy to role..."
  aws iam attach-role-policy \
    --profile "$AWS_PROFILE" \
    --region "$AWS_REGION" \
    --role-name "$ROLE_NAME" \
    --policy-arn "$POLICY_ARN" 2>/dev/null && echo "  ✅ Attached" || echo "  ℹ️  Already attached"

  echo ""
}

# ============================================================================
# 1. SNS Policy (for Security Alerts)
# ============================================================================
cat > /tmp/sns-policy.json <<'EOF'
{
  "Version": "2012-10-17",
  "Statement": [{
    "Effect": "Allow",
    "Action": [
      "sns:CreateTopic",
      "sns:DeleteTopic",
      "sns:GetTopicAttributes",
      "sns:SetTopicAttributes",
      "sns:Subscribe",
      "sns:Unsubscribe",
      "sns:GetSubscriptionAttributes",
      "sns:SetSubscriptionAttributes",
      "sns:ListSubscriptionsByTopic",
      "sns:ListTopics",
      "sns:Publish",
      "sns:TagResource",
      "sns:UntagResource",
      "sns:ListTagsForResource"
    ],
    "Resource": "*"
  }]
}
EOF
create_and_attach_policy "${ROLE_NAME}-sns" /tmp/sns-policy.json

# ============================================================================
# 2. Access Analyzer Policy (for External Access Detection)
# ============================================================================
cat > /tmp/access-analyzer-policy.json <<'EOF'
{
  "Version": "2012-10-17",
  "Statement": [{
    "Effect": "Allow",
    "Action": [
      "access-analyzer:CreateAnalyzer",
      "access-analyzer:DeleteAnalyzer",
      "access-analyzer:GetAnalyzer",
      "access-analyzer:ListAnalyzers",
      "access-analyzer:TagResource",
      "access-analyzer:UntagResource",
      "access-analyzer:ListTagsForResource"
    ],
    "Resource": "*"
  }]
}
EOF
create_and_attach_policy "${ROLE_NAME}-access-analyzer" /tmp/access-analyzer-policy.json

# ============================================================================
# 3. EventBridge Policy (for Daily Security Scans)
# ============================================================================
cat > /tmp/events-policy.json <<'EOF'
{
  "Version": "2012-10-17",
  "Statement": [{
    "Effect": "Allow",
    "Action": [
      "events:PutRule",
      "events:DeleteRule",
      "events:DescribeRule",
      "events:EnableRule",
      "events:DisableRule",
      "events:PutTargets",
      "events:RemoveTargets",
      "events:ListTargetsByRule",
      "events:TagResource",
      "events:UntagResource",
      "events:ListTagsForResource"
    ],
    "Resource": "*"
  }]
}
EOF
create_and_attach_policy "${ROLE_NAME}-events" /tmp/events-policy.json

# ============================================================================
# 4. Update CloudWatch Policy (add Alarms)
# ============================================================================
# NOTE: CloudWatch Logs policy already exists from bootstrap
# We need to add CloudWatch Alarms permissions
cat > /tmp/cloudwatch-alarms-policy.json <<'EOF'
{
  "Version": "2012-10-17",
  "Statement": [{
    "Effect": "Allow",
    "Action": [
      "cloudwatch:PutMetricAlarm",
      "cloudwatch:DeleteAlarms",
      "cloudwatch:DescribeAlarms",
      "cloudwatch:TagResource",
      "cloudwatch:UntagResource",
      "cloudwatch:ListTagsForResource"
    ],
    "Resource": "*"
  }]
}
EOF
create_and_attach_policy "${ROLE_NAME}-cloudwatch-alarms" /tmp/cloudwatch-alarms-policy.json

# ============================================================================
# Summary
# ============================================================================
echo "============================================================================"
echo "✅ Security Monitoring Permissions Added Successfully!"
echo "============================================================================"
echo ""
echo "Added Policies:"
echo "  1. ✅ SNS (Security Alerts)"
echo "  2. ✅ IAM Access Analyzer (External Access Detection)"
echo "  3. ✅ EventBridge (Daily Security Scans)"
echo "  4. ✅ CloudWatch Alarms (Real-time Monitoring)"
echo ""
echo "Next: Run Deploy Workflow to deploy Security Monitoring Module"
echo "============================================================================"

# Cleanup
rm -f /tmp/sns-policy.json /tmp/access-analyzer-policy.json /tmp/events-policy.json /tmp/cloudwatch-alarms-policy.json
