# Scripts Directory

Utility scripts for Ecokart infrastructure management.

---

## 🔒 backup-before-nuclear.sh

**Purpose:** Create complete backup before Nuclear Cleanup

**Usage:**
```bash
# Using personal AWS profile (default)
./scripts/backup-before-nuclear.sh

# Using custom AWS profile
AWS_PROFILE=default ./scripts/backup-before-nuclear.sh
```

**What gets backed up:**
- ✅ Terraform State (from S3)
- ✅ Route53 Hosted Zone (aws.his4irness23.de)
- ✅ ACM SSL Certificates
- ✅ API Gateway Custom Domain
- ✅ Amplify Apps & Custom Domains
- ✅ All DNS Records

**Output:**
- Creates timestamped directory: `terraform-state-backup-YYYYMMDD-HHMMSS/`
- Contains all resource JSONs + RECOVERY.md instructions

**When to use:**
- **BEFORE** running Nuclear Cleanup workflow
- **BEFORE** any destructive infrastructure changes
- As part of regular backup strategy

---

## 🔄 Recovery

If something goes wrong after Nuclear Cleanup:

```bash
# 1. Navigate to backup directory
cd terraform-state-backup-YYYYMMDD-HHMMSS/

# 2. Read recovery instructions
cat RECOVERY.md

# 3. Restore Terraform State
aws s3 cp terraform.tfstate \
  s3://ecokart-terraform-state-805160323349/development-v2/terraform.tfstate \
  --profile personal \
  --region eu-central-1
```

---

## 📋 Best Practices

1. **Always backup before Nuclear Cleanup**
2. **Keep backups for at least 7 days**
3. **Verify backup completed successfully** (check ✅ messages)
4. **Test recovery procedure** once to ensure it works

---

## 🆘 Troubleshooting

### "Could not backup state"
- Check AWS credentials: `aws sts get-caller-identity --profile personal`
- Check S3 bucket exists: `aws s3 ls s3://ecokart-terraform-state-805160323349/ --profile personal`

### "No Route53 Zone found"
- This is OK if Custom Domains not yet deployed
- Warning is informational, not an error

### "State backup is INVALID JSON"
- STOP! Do not proceed with Nuclear Cleanup
- Check state file manually: `aws s3 cp s3://ecokart-terraform-state-805160323349/development-v2/terraform.tfstate - --profile personal | jq .`

---

**Pro Tip:** Add backup to your workflow:
```bash
# Before Nuclear Cleanup
./scripts/backup-before-nuclear.sh && echo "✅ Backup complete - safe to proceed!"
```
