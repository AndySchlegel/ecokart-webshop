# 🔒 Security Architecture

**Project:** Ecokart E-Commerce Platform
**Last Updated:** 1. Januar 2026
**Status:** Production-Ready Security Stack

---

## 📋 Table of Contents

- [Overview](#overview)
- [Security Layers](#security-layers)
- [Runtime Security Monitoring](#runtime-security-monitoring)
- [Automated Security Scanning](#automated-security-scanning)
- [Security Best Practices](#security-best-practices)
- [Incident Response](#incident-response)
- [Compliance & Audit](#compliance--audit)

---

## Overview

Ecokart implements a **multi-layered security architecture** with both **preventive** (scanning, policies) and **detective** (monitoring, alarms) controls.

### Security Principles

1. **Defense in Depth**: Multiple security layers
2. **Least Privilege**: Minimal IAM permissions
3. **Encryption Everywhere**: At rest and in transit
4. **Automated Detection**: Real-time monitoring
5. **Continuous Compliance**: Daily security scans
6. **FREE-tier First**: $0.00/month security stack

### Cost Overview

| Component | Monthly Cost |
|-----------|--------------|
| IAM Access Analyzer | $0.00 |
| CloudWatch Alarms (5) | $0.00 (first 10 free) |
| EventBridge Rules | $0.00 (first 1M free) |
| Lambda Security Monitor | $0.00 (FREE tier) |
| SNS Email Notifications | $0.00 (first 1,000 free) |
| tfsec/Checkov/Trufflehog | $0.00 (GitHub Actions) |
| **Total** | **$0.00/month** |

---

## Security Layers

### Layer 1: Infrastructure as Code Security

**Tool:** tfsec + Checkov (GitHub Actions)
**Trigger:** Every PR/Push to develop, staging, main
**Detection Time:** <2 minutes

Prevents insecure infrastructure from being deployed.

#### What it checks:
- ✅ S3 bucket encryption
- ✅ IAM overly permissive policies
- ✅ DynamoDB encryption at rest
- ✅ Lambda function permissions
- ✅ CloudFront TLS configuration
- ✅ Missing security groups
- ✅ Public access configurations

#### Configuration:
```yaml
# .github/workflows/security-scan.yml
- tfsec: Terraform-specific security checks
- Checkov: Policy compliance validation
- SARIF upload: GitHub Security Tab integration
```

#### Results Location:
- GitHub Security Tab → Code scanning alerts
- PR Comments (if configured)
- Workflow run logs

---

### Layer 2: Secret Detection

**Tool:** Trufflehog (GitHub Actions)
**Trigger:** Every PR/Push to develop, staging, main
**Detection Time:** <2 minutes

Prevents secrets from being committed to git history.

#### What it detects:
- ✅ API keys (AWS, Stripe, etc.)
- ✅ Private keys (SSH, TLS, etc.)
- ✅ Database credentials
- ✅ OAuth tokens
- ✅ Webhook secrets
- ✅ JWT secrets

#### Configuration:
```yaml
# .github/workflows/security-scan.yml
trufflehog:
  extra_args: --only-verified  # Only verified secrets trigger failures
  fetch-depth: 0               # Scan full git history
```

#### Best Practices:
- ❌ **NEVER** commit secrets to git
- ✅ Use AWS Parameter Store / Secrets Manager
- ✅ Use `.env.example` without real values
- ✅ Rotate secrets if accidentally committed (even if redacted later!)

---

### Layer 3: Runtime Security Monitoring

**Tool:** CloudWatch Alarms + IAM Access Analyzer
**Trigger:** Real-time (<5 minutes)
**Detection Time:** <5 minutes
**Cost:** $0.00/month

Detects security events in production AWS environment.

#### CloudWatch Alarms (5 Real-Time Detectors)

##### 1. Unauthorized API Calls
- **Severity:** HIGH
- **Trigger:** Any API call returning 403/401 error
- **Why it matters:** Could indicate compromise or misconfiguration
- **Action:** Investigate immediately

##### 2. Root Account Usage
- **Severity:** CRITICAL
- **Trigger:** Root user performs ANY action
- **Why it matters:** Root should NEVER be used (use IAM users!)
- **Action:** Disable root access keys immediately

##### 3. IAM Policy Changes
- **Severity:** HIGH
- **Trigger:** Any IAM policy create/update/delete
- **Why it matters:** Could indicate privilege escalation attempt
- **Action:** Review change, ensure authorized

##### 4. Security Group Changes
- **Severity:** MEDIUM
- **Trigger:** Any security group rule modification
- **Why it matters:** Could open unauthorized network access
- **Action:** Review firewall rules, ensure no 0.0.0.0/0 on sensitive ports

##### 5. S3 Bucket Policy Changes
- **Severity:** HIGH
- **Trigger:** Any S3 bucket policy modification
- **Why it matters:** Could expose private data publicly
- **Action:** Review bucket policies, ensure private data stays private

#### IAM Access Analyzer

- **Purpose:** Detects resources shared outside your AWS account
- **Checks:** S3 buckets, Lambda functions, IAM roles, etc.
- **Alert:** Real-time when external access detected

#### Configuration:

```hcl
# terraform/modules/security-monitoring/main.tf
resource "aws_cloudwatch_metric_alarm" "unauthorized_api_calls" {
  alarm_name          = "ecokart-unauthorized-api-calls"
  comparison_operator = "GreaterThanThreshold"
  threshold           = 1
  alarm_actions       = [aws_sns_topic.security_alerts.arn]
}
```

---

### Layer 4: Daily Security Compliance Scan

**Tool:** Lambda Security Monitor (Python)
**Trigger:** Daily at 8 AM UTC (EventBridge)
**Detection Time:** Daily
**Cost:** $0.00/month

Performs daily compliance checks for common misconfigurations.

#### What it checks:

##### 1. Public S3 Buckets
- Scans all S3 buckets
- Checks Public Access Block settings
- Alerts if any bucket allows public access

##### 2. Security Groups with 0.0.0.0/0
- Scans all security groups
- Checks for overly permissive ingress rules
- Alerts if SSH (22), RDP (3389), or database ports open to internet

##### 3. IAM Users without MFA
- Lists all IAM users
- Checks MFA device enrollment
- Alerts if users lack MFA (especially admins!)

##### 4. IAM Access Analyzer Findings
- Queries Access Analyzer for active findings
- Reports any resources exposed externally

#### Lambda Function Code:

```python
# terraform/modules/security-monitoring/lambda/index.py
def handler(event, context):
    """Daily security compliance check"""

    findings = []

    # Check 1: Public S3 buckets
    findings.extend(check_s3_buckets())

    # Check 2: Security groups with 0.0.0.0/0
    findings.extend(check_security_groups())

    # Check 3: IAM users without MFA
    findings.extend(check_iam_users())

    # Check 4: Access Analyzer findings
    findings.extend(check_access_analyzer())

    if findings:
        send_sns_notification(findings)
```

#### Email Notifications:

Two types of emails:

**1. Issues Found (Daily 8 AM UTC)**
```
🚨 SECURITY SCAN REPORT - ecokart

Total Findings: 3
  🚨 Critical: 0
  ⚠️  High:     2
  ⚠️  Medium:   1

FINDINGS:
1. ⚠️ [HIGH] S3 Bucket 'ecokart-assets' has public access enabled
2. ⚠️ [HIGH] IAM User 'admin' does not have MFA enabled
3. ⚠️ [MEDIUM] Security Group 'default' allows 0.0.0.0/0 on tcp:22
```

**2. No Issues (Daily 8 AM UTC)**
```
✅ SECURITY SCAN REPORT - ecokart

STATUS: ALL CLEAR

✅ S3 Bucket Public Access: OK
✅ Security Group Rules: OK
✅ IAM User MFA Status: OK
✅ IAM Access Analyzer: OK
```

---

## Security Best Practices

### 1. Encryption

**At Rest:**
- ✅ DynamoDB: Server-side encryption enabled (default)
- ✅ S3: AES-256 encryption enabled
- ✅ Lambda environment variables: Encrypted with AWS KMS (optional)

**In Transit:**
- ✅ API Gateway: HTTPS only (TLS 1.2+)
- ✅ CloudFront: HTTPS only
- ✅ Custom domains: ACM certificates (SSL/TLS)

### 2. IAM Least Privilege

**Principle:** Grant minimum permissions needed

**Example - Lambda Execution Role:**
```json
{
  "Effect": "Allow",
  "Action": [
    "dynamodb:GetItem",
    "dynamodb:PutItem",
    "dynamodb:Query"
  ],
  "Resource": "arn:aws:dynamodb:*:*:table/ecokart-*"
}
```

**Avoid:**
- ❌ `"Action": "*"` (wildcard all actions)
- ❌ `"Resource": "*"` (wildcard all resources)
- ❌ Admin policies for application roles

### 3. Authentication & Authorization

**Cognito User Pool:**
- ✅ Email verification required
- ✅ Password policy: Min 8 chars, uppercase, lowercase, number, special
- ✅ MFA: Optional (can be enforced per-user)

**JWT Token Validation:**
- ✅ API Gateway Cognito Authorizer
- ✅ Lambda backend validates JWT signature
- ✅ Short token expiration (1 hour recommended)

**Role-Based Access Control (RBAC):**
```javascript
// Backend: middleware/authMiddleware.js
const requireAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
};
```

### 4. Secrets Management

**NEVER commit secrets to git:**
- ❌ API keys
- ❌ Database passwords
- ❌ Private keys
- ❌ OAuth tokens

**Use AWS Parameter Store (FREE):**
```bash
# Store secret
aws ssm put-parameter \
  --name "/ecokart/prod/stripe-secret-key" \
  --value "sk_live_..." \
  --type "SecureString"

# Retrieve in Lambda (automatic decryption)
const stripeKey = process.env.STRIPE_SECRET_KEY;
```

**Terraform Sensitive Variables:**
```hcl
variable "stripe_secret_key" {
  type      = string
  sensitive = true  # Won't show in logs/output
}
```

### 5. API Security

**Rate Limiting:**
```javascript
// Backend: middleware/rateLimiter.js
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // max 100 requests per window
});
```

**CORS Configuration:**
```javascript
// Backend: server.js
app.use(cors({
  origin: process.env.FRONTEND_URL, // Only allow known frontend
  credentials: true
}));
```

**Input Validation:**
```javascript
// Backend: routes/products.js
const { body, validationResult } = require('express-validator');

router.post('/products', [
  body('name').isLength({ min: 3, max: 100 }),
  body('price').isFloat({ min: 0.01 }),
  body('categoryId').isUUID()
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  // ...
});
```

### 6. Logging & Monitoring

**CloudWatch Logs:**
- ✅ Lambda function logs (7 days retention)
- ✅ API Gateway access logs (optional)
- ✅ Security monitoring logs

**What to log:**
- ✅ Authentication attempts (success/failure)
- ✅ Authorization failures (403 errors)
- ✅ Data access (who accessed what, when)
- ✅ Configuration changes

**What NOT to log:**
- ❌ Passwords
- ❌ Credit card numbers
- ❌ API keys
- ❌ Personal data (GDPR compliance)

---

## Incident Response

### Real-Time Alert Response

**When you receive a security alert email:**

#### 1. Unauthorized API Calls Alert

**Steps:**
1. Check CloudWatch Logs for details
2. Identify source IP and user
3. Review what resource was accessed
4. If malicious: Rotate credentials, block IP
5. If misconfiguration: Fix IAM permissions

#### 2. Root Account Usage Alert

**Steps:**
1. **IMMEDIATE:** Disable root access keys
2. Investigate who used root (CloudTrail)
3. Verify action was authorized
4. If unauthorized: Assume compromise, escalate
5. Enable MFA on root account

#### 3. IAM Policy Changes Alert

**Steps:**
1. Review CloudTrail for change details
2. Verify change was authorized
3. Check for privilege escalation
4. If unauthorized: Revert change, rotate credentials
5. Audit other IAM changes in last 24 hours

#### 4. Security Group Changes Alert

**Steps:**
1. Review security group rules
2. Check for 0.0.0.0/0 on sensitive ports
3. Verify change was authorized
4. If unauthorized: Revert change immediately
5. Check for unusual network activity

#### 5. S3 Bucket Policy Changes Alert

**Steps:**
1. Review bucket policy
2. Check for public access grants
3. Verify change was authorized
4. If public data exposure: Revoke policy, assess impact
5. Scan bucket for sensitive data

### Daily Compliance Scan Response

**When you receive a compliance scan with findings:**

#### High Priority (Fix within 24 hours):
- Public S3 buckets
- IAM users without MFA
- External access via Access Analyzer

#### Medium Priority (Fix within 7 days):
- Security groups with 0.0.0.0/0 on non-web ports

#### Low Priority (Review in sprint):
- Informational findings

---

## Compliance & Audit

### CloudTrail (Optional - Not included in FREE tier)

For production environments, enable CloudTrail:

```hcl
resource "aws_cloudtrail" "main" {
  name           = "ecokart-cloudtrail"
  s3_bucket_name = aws_s3_bucket.cloudtrail.id

  event_selector {
    read_write_type = "All"
  }
}
```

**Benefits:**
- Full audit trail of API calls
- Who did what, when, from where
- Compliance (SOC 2, ISO 27001, etc.)
- Forensics for incident response

**Cost:** ~$2/month (1M API calls)

### Security Checklist

**Before Production Deployment:**

- [ ] Enable Point-in-Time Recovery (DynamoDB)
- [ ] Configure CloudTrail (optional)
- [ ] Enable API Gateway access logs (optional)
- [ ] Rotate all secrets (JWT, Stripe, etc.)
- [ ] Confirm SNS email subscription
- [ ] Test security alarms (simulate unauthorized call)
- [ ] Review IAM permissions (least privilege)
- [ ] Enable MFA for all IAM users
- [ ] Configure CloudFront security headers
- [ ] Set up AWS Backup (optional)

**Monthly Security Review:**

- [ ] Review CloudWatch Logs for anomalies
- [ ] Audit IAM users and permissions
- [ ] Check for unused resources
- [ ] Review security group rules
- [ ] Scan dependencies for vulnerabilities (npm audit)
- [ ] Review Terraform security scan results
- [ ] Test disaster recovery procedures

---

## Security Resources

### AWS Security Best Practices
- [AWS Well-Architected Security Pillar](https://docs.aws.amazon.com/wellarchitected/latest/security-pillar/)
- [AWS Security Best Practices](https://aws.amazon.com/security/best-practices/)
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)

### Terraform Security
- [tfsec Documentation](https://aquasecurity.github.io/tfsec/)
- [Checkov Policies](https://www.checkov.io/5.Policy%20Index/all.html)

### Tools
- [Trufflehog Secret Scanner](https://github.com/trufflesecurity/trufflehog)
- [AWS IAM Access Analyzer](https://aws.amazon.com/iam/features/analyze-access/)
- [OWASP Dependency-Check](https://owasp.org/www-project-dependency-check/)

---

**Last Updated:** 1. Januar 2026
**Maintainer:** Andy Schlegel
**Review Cycle:** Monthly
**Contact:** security@ecokart.com (fictional)
