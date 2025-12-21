#!/bin/bash
# ============================================================================
# Nuclear Cleanup - Backup & Recovery Plan
# ============================================================================
#
# Purpose: Create safety backup before Nuclear Cleanup
# Usage:   ./scripts/backup-before-nuclear.sh
#
# What gets backed up:
#   - Terraform State (from S3)
#   - Route53 Hosted Zone info
#   - ACM Certificates info
#   - API Gateway Custom Domain info
#   - Amplify Apps & Custom Domains info
# ============================================================================

set -e  # Exit on error

# Configuration
BACKUP_DIR="./terraform-state-backup-$(date +%Y%m%d-%H%M%S)"
S3_BUCKET="ecokart-terraform-state-805160323349"
STATE_KEY="development-v2/terraform.tfstate"
REGION="eu-central-1"
PROFILE="${AWS_PROFILE:-personal}"

echo ""
echo "╔═══════════════════════════════════════════════════════════════════╗"
echo "║        🔒 BACKUP PLAN - Nuclear Cleanup Safety Net               ║"
echo "╚═══════════════════════════════════════════════════════════════════╝"
echo ""
echo "📋 Configuration:"
echo "   Region:        $REGION"
echo "   AWS Profile:   $PROFILE"
echo "   S3 Bucket:     $S3_BUCKET"
echo "   State Key:     $STATE_KEY"
echo "   Backup Dir:    $BACKUP_DIR"
echo ""

# Create backup directory
mkdir -p "$BACKUP_DIR"

# ============================================================================
# 1. Backup Terraform State
# ============================================================================
echo "1️⃣  Backing up Terraform State..."
if aws s3 cp "s3://$S3_BUCKET/$STATE_KEY" "$BACKUP_DIR/terraform.tfstate" \
    --profile "$PROFILE" --region "$REGION" 2>/dev/null; then
    echo "   ✅ State backed up: $BACKUP_DIR/terraform.tfstate"

    # Verify state is valid JSON
    if jq -e '.version' "$BACKUP_DIR/terraform.tfstate" > /dev/null 2>&1; then
        STATE_VERSION=$(jq -r '.version' "$BACKUP_DIR/terraform.tfstate")
        RESOURCE_COUNT=$(jq '.resources | length' "$BACKUP_DIR/terraform.tfstate")
        echo "   ✅ State is valid (version: $STATE_VERSION, resources: $RESOURCE_COUNT)"
    else
        echo "   ❌ State backup is INVALID JSON!"
        exit 1
    fi
else
    echo "   ⚠️  Could not backup state (might not exist yet)"
fi
echo ""

# ============================================================================
# 2. Backup Route53 Hosted Zone
# ============================================================================
echo "2️⃣  Backing up Route53 Hosted Zone..."
if aws route53 list-hosted-zones --region "$REGION" --profile "$PROFILE" \
    | jq '.HostedZones[] | select(.Name | contains("his4irness23.de"))' \
    > "$BACKUP_DIR/route53-zone.json" 2>/dev/null; then

    ZONE_ID=$(jq -r '.Id' "$BACKUP_DIR/route53-zone.json" 2>/dev/null || echo "")
    if [ -n "$ZONE_ID" ]; then
        echo "   ✅ Route53 Zone backed up: $ZONE_ID"

        # Also backup all DNS records
        ZONE_ID_CLEAN=$(echo "$ZONE_ID" | sed 's|/hostedzone/||')
        aws route53 list-resource-record-sets \
            --hosted-zone-id "$ZONE_ID_CLEAN" \
            --profile "$PROFILE" \
            > "$BACKUP_DIR/route53-records.json" 2>/dev/null || true
        echo "   ✅ DNS Records backed up"
    else
        echo "   ⚠️  No Route53 Zone found"
    fi
else
    echo "   ⚠️  Could not backup Route53 Zone"
fi
echo ""

# ============================================================================
# 3. Backup ACM Certificates
# ============================================================================
echo "3️⃣  Backing up ACM Certificates..."
if aws acm list-certificates --region "$REGION" --profile "$PROFILE" \
    | jq '.CertificateSummaryList[] | select(.DomainName | contains("his4irness23.de"))' \
    > "$BACKUP_DIR/acm-certificates.json" 2>/dev/null; then

    CERT_COUNT=$(jq -s 'length' "$BACKUP_DIR/acm-certificates.json" 2>/dev/null || echo "0")
    if [ "$CERT_COUNT" -gt 0 ]; then
        echo "   ✅ ACM Certificates backed up: $CERT_COUNT certificate(s)"

        # Backup detailed cert info
        jq -r '.CertificateArn' "$BACKUP_DIR/acm-certificates.json" 2>/dev/null | while read -r cert_arn; do
            if [ -n "$cert_arn" ]; then
                CERT_FILE="$BACKUP_DIR/acm-cert-$(basename "$cert_arn").json"
                aws acm describe-certificate \
                    --certificate-arn "$cert_arn" \
                    --region "$REGION" \
                    --profile "$PROFILE" \
                    > "$CERT_FILE" 2>/dev/null || true
            fi
        done
    else
        echo "   ⚠️  No ACM Certificates found"
    fi
else
    echo "   ⚠️  Could not backup ACM Certificates"
fi
echo ""

# ============================================================================
# 4. Backup API Gateway Custom Domain
# ============================================================================
echo "4️⃣  Backing up API Gateway Custom Domain..."
if aws apigateway get-domain-names --region "$REGION" --profile "$PROFILE" \
    | jq '.items[] | select(.domainName | contains("his4irness23.de"))' \
    > "$BACKUP_DIR/api-gateway-domain.json" 2>/dev/null; then

    DOMAIN_NAME=$(jq -r '.domainName' "$BACKUP_DIR/api-gateway-domain.json" 2>/dev/null || echo "")
    if [ -n "$DOMAIN_NAME" ]; then
        echo "   ✅ API Gateway Custom Domain backed up: $DOMAIN_NAME"

        # Backup base path mappings
        aws apigateway get-base-path-mappings \
            --domain-name "$DOMAIN_NAME" \
            --region "$REGION" \
            --profile "$PROFILE" \
            > "$BACKUP_DIR/api-gateway-base-path-mappings.json" 2>/dev/null || true
        echo "   ✅ Base Path Mappings backed up"
    else
        echo "   ⚠️  No API Gateway Custom Domain found"
    fi
else
    echo "   ⚠️  Could not backup API Gateway Custom Domain"
fi
echo ""

# ============================================================================
# 5. Backup Amplify Apps & Custom Domains
# ============================================================================
echo "5️⃣  Backing up Amplify Apps..."
if aws amplify list-apps --region "$REGION" --profile "$PROFILE" \
    | jq '.apps[]' > "$BACKUP_DIR/amplify-apps.json" 2>/dev/null; then

    APP_COUNT=$(jq -s 'length' "$BACKUP_DIR/amplify-apps.json" 2>/dev/null || echo "0")
    if [ "$APP_COUNT" -gt 0 ]; then
        echo "   ✅ Amplify Apps backed up: $APP_COUNT app(s)"

        # Backup custom domains for each app
        jq -r '.appId' "$BACKUP_DIR/amplify-apps.json" 2>/dev/null | while read -r app_id; do
            if [ -n "$app_id" ]; then
                DOMAIN_FILE="$BACKUP_DIR/amplify-domains-$app_id.json"
                aws amplify list-domain-associations \
                    --app-id "$app_id" \
                    --region "$REGION" \
                    --profile "$PROFILE" \
                    > "$DOMAIN_FILE" 2>/dev/null || true
            fi
        done
        echo "   ✅ Amplify Custom Domains backed up"
    else
        echo "   ⚠️  No Amplify Apps found"
    fi
else
    echo "   ⚠️  Could not backup Amplify Apps"
fi
echo ""

# ============================================================================
# 6. Create Recovery Instructions
# ============================================================================
echo "6️⃣  Creating recovery instructions..."
cat > "$BACKUP_DIR/RECOVERY.md" << EOF
# Recovery Instructions

**Backup Created:** $(date)
**Backup Directory:** $BACKUP_DIR

---

## 🔄 How to Restore Terraform State

\`\`\`bash
# Restore state to S3
aws s3 cp $BACKUP_DIR/terraform.tfstate \\
  s3://$S3_BUCKET/$STATE_KEY \\
  --profile $PROFILE \\
  --region $REGION

# Verify restoration
aws s3 ls s3://$S3_BUCKET/$STATE_KEY --profile $PROFILE
\`\`\`

---

## 📋 Backed Up Resources

### Route53 Hosted Zone
- Zone ID: \$(jq -r '.Id' route53-zone.json 2>/dev/null)
- Zone Name: \$(jq -r '.Name' route53-zone.json 2>/dev/null)
- File: \`route53-zone.json\`

### ACM Certificates
- Count: \$(jq -s 'length' acm-certificates.json 2>/dev/null)
- File: \`acm-certificates.json\`

### API Gateway Custom Domain
- Domain: \$(jq -r '.domainName' api-gateway-domain.json 2>/dev/null)
- File: \`api-gateway-domain.json\`

### Amplify Apps
- Count: \$(jq -s 'length' amplify-apps.json 2>/dev/null)
- File: \`amplify-apps.json\`

---

## ⚠️ Important Notes

1. **Route53 Zone & ACM Certificates** should still exist (prevent_destroy = true)
2. **API Gateway Custom Domain** will be recreated by Terraform
3. **Amplify Apps** will be recreated by Terraform (15-30 min for Custom Domains)

---

## 🆘 Emergency Contacts

If recovery fails, check:
1. Terraform State in S3 is valid JSON
2. Route53 Zone still exists in AWS
3. ACM Certificates still exist in AWS

EOF

echo "   ✅ Recovery instructions created: $BACKUP_DIR/RECOVERY.md"
echo ""

# ============================================================================
# 7. Summary
# ============================================================================
echo "╔═══════════════════════════════════════════════════════════════════╗"
echo "║                    ✅ BACKUP COMPLETE!                            ║"
echo "╚═══════════════════════════════════════════════════════════════════╝"
echo ""
echo "📁 Backup Location: $BACKUP_DIR"
echo ""
echo "📋 Backed Up Files:"
ls -lh "$BACKUP_DIR" | tail -n +2 | awk '{printf "   - %-40s %s\n", $9, $5}'
echo ""
echo "✅ You are now safe to run Nuclear Cleanup!"
echo ""
echo "🔄 To restore state if needed:"
echo "   aws s3 cp $BACKUP_DIR/terraform.tfstate s3://$S3_BUCKET/$STATE_KEY --profile $PROFILE --region $REGION"
echo ""
