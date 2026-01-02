# 🚀 ACTION PLAN PHASE 2 - Portfolio & Showcase Excellence

**Created:** 1. Januar 2026
**Purpose:** Post-Development Phase - Transform working product into world-class portfolio showcase
**Status:** 🟢 READY TO START
**Timeline:** 2-3 Wochen (flexibel)

---

## 🎯 Mission Statement

> **"From Production-Ready to Portfolio-Perfect"**
>
> Phase 1 hat einen **funktionierenden E-Commerce Shop** gebaut.
> Phase 2 macht daraus ein **Portfolio-Projekt das Bewerbungsgespräche gewinnt**.

### Was macht ein Portfolio-Projekt "excellent"?

1. ✅ **Funktioniert perfekt** (haben wir!)
2. ✅ **Sieht professionell aus** → README, Diagramme, Screenshots
3. ✅ **Zeigt Technical Excellence** → Tests, Security, Monitoring
4. ✅ **Ist gut dokumentiert** → Architecture, Decisions, Learnings
5. ✅ **Demonstriert Best Practices** → Code Quality, IaC, CI/CD

---

## 📊 Übersicht - Die 4 Säulen

```
┌────────────────────────────────────────────────────────────────┐
│                    PHASE 2 STRUCTURE                           │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│  🔒 SÄULE 1: Security & DevSecOps (PRIORITY 1)                │
│  ├─ Security Scanning Integration (tfsec, Checkov)            │
│  ├─ Runtime Security Monitoring (CloudWatch Alarms)           │
│  └─ Security Documentation & Badges                           │
│                                                                │
│  📐 SÄULE 2: Architecture & Documentation (PRIORITY 1)        │
│  ├─ Interactive Architecture Diagram (Draw.io/Excalidraw)     │
│  ├─ Professional README (Badges, Screenshots, TOC)            │
│  ├─ Video Demo (30-60s Showcase)                              │
│  └─ Blog Post / Case Study                                    │
│                                                                │
│  💪 SÄULE 3: Feature Enhancement (PRIORITY 2)                 │
│  ├─ ✅ Real-time Dashboard Analytics (COMPLETED)              │
│  ├─ ✅ Quantity Selector (COMPLETED)                          │
│  ├─ Order History & Tracking                                  │
│  └─ Product Search & Filtering                                │
│                                                                │
│  🧪 SÄULE 4: Quality Assurance (PRIORITY 2)                   │
│  ├─ E2E Testing (Playwright)                                  │
│  ├─ Performance Monitoring                                    │
│  └─ Error Tracking (CloudWatch/Sentry)                        │
│                                                                │
└────────────────────────────────────────────────────────────────┘
```

---

## 🔥 SÄULE 1: Security & DevSecOps Integration

### Warum wichtig?
- **Portfolio-Differentiator:** Zeigt dass du Security ernst nimmst
- **Job-Market Relevanz:** DevSecOps ist in JEDER Job-Description
- **Carl's Expertise nutzen:** Dein Freund hat exzellentes DevSecOps-Setup

### 🎯 Goals
- [ ] **Security Scanning in CI/CD** - tfsec + Checkov wie bei Carl
- [ ] **Runtime Security Monitoring** - CloudWatch Alarms für kritische Events
- [ ] **Security Documentation** - Dedicated Security Section in README
- [ ] **Security Badges** - Show security posture in README

---

### Task 1.1: Security Scanning Integration (tfsec + Checkov)

**Priority:** 🔴 CRITICAL
**Effort:** 4-6 Stunden
**Impact:** ⭐⭐⭐⭐⭐

**What:**
Integriere **tfsec** und **Checkov** Security Scanner in GitHub Actions Pipeline.

**Inspiration:** Carl's `.gitlab-ci.yml` Security Stage (Lines 98-165)

**Implementation Plan:**

```yaml
# .github/workflows/security-scan.yml (NEW FILE)
name: Security Scanning

on:
  pull_request:
    branches: [develop, staging, main]
  push:
    branches: [develop, staging, main]

jobs:
  tfsec:
    name: tfsec Security Scan
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Run tfsec
        uses: aquasecurity/tfsec-action@v1.0.0
        with:
          working_directory: terraform
          format: sarif
          soft_fail: false

      - name: Upload SARIF file
        uses: github/codeql-action/upload-sarif@v2
        with:
          sarif_file: tfsec.sarif

  checkov:
    name: Checkov Security Scan
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Run Checkov
        uses: bridgecrewio/checkov-action@master
        with:
          directory: terraform
          framework: terraform
          output_format: sarif
          soft_fail: false

  trufflehog:
    name: Secret Scanning
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
        with:
          fetch-depth: 0

      - name: Trufflehog Secret Scan
        uses: trufflesecurity/trufflehog@main
        with:
          path: ./
          base: ${{ github.event.repository.default_branch }}
          head: HEAD
```

**Success Criteria:**
- ✅ Security scans run on every PR/Push
- ✅ tfsec finds <5 critical issues (document intentional exceptions)
- ✅ Checkov validates policy compliance
- ✅ Trufflehog finds 0 secrets
- ✅ GitHub Security tab shows scan results

**Documentation:**
```markdown
# In README.md
## Security

### Automated Security Scanning
- **tfsec**: Terraform-specific security checks
- **Checkov**: Policy compliance validation
- **Trufflehog**: Secret detection

All security scans run automatically on every pull request.

[View Security Results →](../../security)
```

---

### Task 1.2: Runtime Security Monitoring

**Priority:** 🔴 CRITICAL
**Effort:** 6-8 Stunden
**Impact:** ⭐⭐⭐⭐⭐

**What:**
Deploy Carl's FREE-tier Runtime Security Monitoring Stack:
- CloudWatch Alarms (unauthorized API calls, root usage, policy changes)
- EventBridge Daily Security Scan (Lambda)
- IAM Access Analyzer
- SNS Email Notifications

**Inspiration:** Carl's `docs/security-monitoring/` Struktur

**Implementation Plan:**

**NEW Terraform Module:** `terraform/modules/security-monitoring/`

```hcl
# terraform/modules/security-monitoring/main.tf
# Based on Carl's security monitoring setup

# CloudWatch Log Group for CloudTrail
resource "aws_cloudwatch_log_group" "security_logs" {
  name              = "/aws/cloudtrail/${var.project_name}-security"
  retention_in_days = 7
}

# CloudWatch Metric Filters + Alarms
resource "aws_cloudwatch_metric_alarm" "unauthorized_api_calls" {
  alarm_name          = "${var.project_name}-unauthorized-api-calls"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 1
  metric_name         = "UnauthorizedAPICalls"
  namespace           = "CloudTrailMetrics"
  period              = 300
  statistic           = "Sum"
  threshold           = 1
  alarm_description   = "Triggers when unauthorized API calls are detected"
  alarm_actions       = [aws_sns_topic.security_alerts.arn]
}

# More alarms: Root account usage, IAM changes, S3 policy changes, etc.
# ... (see Carl's implementation)

# SNS Topic for Security Alerts
resource "aws_sns_topic" "security_alerts" {
  name = "${var.project_name}-security-alerts"
}

resource "aws_sns_topic_subscription" "security_email" {
  topic_arn = aws_sns_topic.security_alerts.arn
  protocol  = "email"
  endpoint  = var.security_email
}

# IAM Access Analyzer
resource "aws_accessanalyzer_analyzer" "main" {
  analyzer_name = "${var.project_name}-access-analyzer"
  type          = "ACCOUNT"
}

# EventBridge Rule: Daily Security Scan (8 AM)
resource "aws_cloudwatch_event_rule" "daily_security_scan" {
  name                = "${var.project_name}-daily-security-scan"
  description         = "Triggers daily security compliance check"
  schedule_expression = "cron(0 8 * * ? *)"  # 8 AM UTC daily
}

# Lambda Function: Security Monitor
resource "aws_lambda_function" "security_monitor" {
  filename      = "security-monitor.zip"
  function_name = "${var.project_name}-security-monitor"
  role          = aws_iam_role.lambda_security.arn
  handler       = "index.handler"
  runtime       = "python3.11"
  timeout       = 60

  environment {
    variables = {
      SNS_TOPIC_ARN = aws_sns_topic.security_alerts.arn
    }
  }
}

# Lambda checks:
# - Public S3 buckets
# - Security groups with 0.0.0.0/0
# - IAM users without MFA
# - IAM Access Analyzer findings
```

**Lambda Function Code:** `terraform/modules/security-monitoring/lambda/security-monitor.py`

```python
import boto3
import os

def handler(event, context):
    """
    Daily security compliance check
    Checks:
    1. Public S3 buckets
    2. Security groups allowing 0.0.0.0/0
    3. IAM users without MFA
    4. IAM Access Analyzer findings
    """
    findings = []

    # Check S3 buckets
    s3 = boto3.client('s3')
    buckets = s3.list_buckets()['Buckets']
    for bucket in buckets:
        try:
            acl = s3.get_bucket_acl(Bucket=bucket['Name'])
            for grant in acl['Grants']:
                if 'AllUsers' in str(grant):
                    findings.append(f"⚠️ PUBLIC S3 Bucket: {bucket['Name']}")
        except:
            pass

    # Check IAM Access Analyzer
    analyzer = boto3.client('accessanalyzer')
    # ... implementation

    # Send findings to SNS
    if findings:
        sns = boto3.client('sns')
        sns.publish(
            TopicArn=os.environ['SNS_TOPIC_ARN'],
            Subject='Security Findings Detected',
            Message='\n'.join(findings)
        )

    return {'statusCode': 200, 'findings': len(findings)}
```

**Success Criteria:**
- ✅ 19 FREE-tier Security Resources deployed
- ✅ Email notifications für Security Events
- ✅ Daily automated security scan (8 AM)
- ✅ Real-time alarms (<5 min response time)
- ✅ $0.00/month cost

**Documentation:**
```markdown
# docs/SECURITY.md (NEW FILE)

# Security Architecture

## Runtime Security Monitoring

### Real-Time Detection (<5 minutes)
- Unauthorized API calls
- Root account usage
- IAM/Security Group/S3 policy changes

### Daily Security Scans (8 AM UTC)
- Public S3 buckets
- Security groups with 0.0.0.0/0
- IAM users without MFA
- IAM Access Analyzer findings

### Notifications
All security findings sent via SNS to: security@example.com

### Cost: $0.00/month (FREE Tier)
19 resources, all within AWS Free Tier limits
```

---

### Task 1.3: Security Documentation & Badges

**Priority:** 🟡 HIGH
**Effort:** 2-3 Stunden
**Impact:** ⭐⭐⭐⭐

**What:**
Add Security section to README with badges showing security posture.

**Implementation:**

```markdown
# In README.md (after title)

[![Security: tfsec](https://img.shields.io/badge/Security-tfsec-green)](https://github.com/aquasecurity/tfsec)
[![Security: Checkov](https://img.shields.io/badge/Security-Checkov-green)](https://www.checkov.io/)
[![Security: Trufflehog](https://img.shields.io/badge/Secrets-Trufflehog-green)](https://github.com/trufflesecurity/trufflehog)
[![AWS Security](https://img.shields.io/badge/AWS-Security%20Monitoring-orange)](docs/SECURITY.md)

## Security

### DevSecOps Pipeline
- **Automated Security Scanning**: tfsec, Checkov, Trufflehog on every PR
- **Runtime Monitoring**: CloudWatch Alarms + Daily Security Scans
- **Zero-Cost Security**: 19 FREE-tier security resources

[📚 Full Security Documentation →](docs/SECURITY.md)
```

---

## 📐 SÄULE 2: Architecture & Documentation

### Warum wichtig?
- **First Impression zählt:** README ist das erste was Recruiter sehen
- **Technical Communication:** Zeigt dass du komplexe Systeme erklären kannst
- **Showcase-Material:** Für Präsentationen und Blog

---

### Task 2.1: Interactive Architecture Diagram

**Priority:** 🔴 CRITICAL
**Effort:** 4-6 Stunden
**Impact:** ⭐⭐⭐⭐⭐

**What:**
Erstelle ein **interaktives, granulares Architecture Diagram** mit echten AWS Icons.

**Tools:**
- **Draw.io** (empfohlen - kostenlos, exportiert als SVG/PNG/XML)
- **Excalidraw** (modern, sketch-style, aber weniger AWS Icons)
- **Cloudcraft** (beste AWS Diagrams, aber paid für Export)

**Granularität:**
```
┌─────────────────────────────────────────────────────────────┐
│                         USER                                │
└─────────────────────────────────────────────────────────────┘
                            │
        ┌───────────────────┼───────────────────┐
        │                   │                   │
        ▼                   ▼                   ▼
┌───────────────┐   ┌───────────────┐   ┌──────────────┐
│  CUSTOMER     │   │  ADMIN        │   │  MOBILE APP  │
│  FRONTEND     │   │  FRONTEND     │   │  (Future)    │
│  (Next.js)    │   │  (Next.js)    │   │              │
└───────────────┘   └───────────────┘   └──────────────┘
│  Amplify App  │   │  Amplify App  │
│  - Auto Build │   │  - Auto Build │
│  - CDN        │   │  - Basic Auth │
│  - SSL/TLS    │   │  - SSL/TLS    │
└───────────────┘   └───────────────┘
        │                   │
        │                   │
        └───────────────────┼───────────────────┘
                            │
                            ▼
                    ┌───────────────┐
                    │  Route53      │
                    │  DNS          │
                    │  - shop.aws.* │
                    │  - admin.aws.*│
                    │  - api.aws.*  │
                    └───────────────┘
                            │
        ┌───────────────────┼───────────────────┐
        │                   │                   │
        ▼                   ▼                   ▼
┌───────────────┐   ┌───────────────┐   ┌──────────────┐
│  ACM          │   │  CloudFront   │   │  API Gateway │
│  Certificate  │   │  (Assets CDN) │   │  REST API    │
│  - SSL/TLS    │   │  - Images     │   │  - CORS      │
│  - us-east-1  │   │  - Global     │   │  - Cognito   │
└───────────────┘   └───────────────┘   │    Authorizer│
                            │           └──────────────┘
                            │                   │
                            ▼                   ▼
                    ┌───────────────┐   ┌──────────────┐
                    │  S3 Assets    │   │  Lambda      │
                    │  - Private    │   │  (Node.js 20)│
                    │  - Encrypted  │   │  - Express.js│
                    └───────────────┘   │  - 512 MB    │
                                        │  - 30s timeout│
                                        └──────────────┘
                                                │
            ┌───────────────────────────────────┼─────────────────┐
            │                                   │                 │
            ▼                                   ▼                 ▼
    ┌───────────────┐                  ┌───────────────┐  ┌─────────────┐
    │  DynamoDB     │                  │  Cognito      │  │  Resend     │
    │  4 Tables:    │                  │  User Pool    │  │  Email API  │
    │  - Products   │                  │  - Email Auth │  │  - 3k/month │
    │  - Users      │                  │  - Custom     │  └─────────────┘
    │  - Carts      │                  │    Attributes │
    │  - Orders     │                  │  - MFA Ready  │  ┌─────────────┐
    │               │                  └───────────────┘  │  Stripe     │
    │  GSI:         │                                     │  Payments   │
    │  - Category   │                                     │  - Checkout │
    │  - Email      │                                     │  - Webhooks │
    │  - UserOrders │                                     └─────────────┘
    └───────────────┘

┌─────────────────────────────────────────────────────────────┐
│                  INFRASTRUCTURE AS CODE                     │
├─────────────────────────────────────────────────────────────┤
│  Terraform (15 Modules)                                     │
│  ├─ DynamoDB          ├─ Assets (S3+CloudFront)             │
│  ├─ Lambda            ├─ Custom Domain                      │
│  ├─ Cognito           ├─ Route53                            │
│  ├─ Amplify (2x)      └─ Security Monitoring                │
│  └─ SES/Resend                                              │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                       CI/CD PIPELINE                        │
├─────────────────────────────────────────────────────────────┤
│  GitHub Actions                                             │
│  ├─ Backend Tests (Jest)      ├─ Terraform Apply           │
│  ├─ Security Scanning         ├─ Lambda Deploy             │
│  ├─ Terraform Plan            └─ Nuclear Cleanup           │
│  └─ Manual Approval Gates                                  │
└─────────────────────────────────────────────────────────────┘
```

**Interaktivität:**
- Exportiere als **SVG** mit verlinkten Bereichen
- Jedes AWS Service Icon verlinkt zu offiziellem AWS Docs
- Oder: Nutze **draw.io embedded viewer** in GitHub README

**AWS Icons:**
- Download: https://aws.amazon.com/architecture/icons/
- Draw.io hat AWS Library integriert

**Success Criteria:**
- ✅ Alle 15+ AWS Services dargestellt
- ✅ Echte AWS Icons verwendet
- ✅ Data Flow sichtbar (Pfeile, Beschriftung)
- ✅ Interaktiv (SVG mit Links ODER Excalidraw embed)
- ✅ In README prominent platziert

---

### Task 2.2: Professional README Transformation

**Priority:** 🔴 CRITICAL
**Effort:** 6-8 Stunden
**Impact:** ⭐⭐⭐⭐⭐

**What:**
Transform README von "functional" zu "portfolio-perfect".

**Inspiration:** Carl's README Structure

**NEW README Structure:**

```markdown
# 🛒 AIR LEGACY - E-Commerce Platform

> Production-ready serverless e-commerce platform showcasing modern AWS architecture, DevSecOps practices, and full-stack development skills.

[![AWS](https://img.shields.io/badge/AWS-Lambda%20%7C%20DynamoDB%20%7C%20Cognito-orange)](https://aws.amazon.com/)
[![Terraform](https://img.shields.io/badge/Terraform-100%25%20IaC-blue)](https://www.terraform.io/)
[![Next.js](https://img.shields.io/badge/Next.js-14-black)](https://nextjs.org/)
[![Security](https://img.shields.io/badge/Security-tfsec%20%7C%20Checkov-green)](docs/SECURITY.md)
[![License](https://img.shields.io/badge/License-MIT-yellow)](LICENSE)

**Live Demo:** [🛍️ Shop](https://shop.aws.his4irness23.de) | [⚙️ Admin](https://admin.aws.his4irness23.de)

![Shop Homepage](docs/screenshots/shop-homepage.png)

---

## 📋 Table of Contents

- [Overview](#overview)
- [Key Features](#key-features)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Live Demo](#live-demo)
- [Getting Started](#getting-started)
- [Deployment](#deployment)
- [Security](#security)
- [Cost Analysis](#cost-analysis)
- [Lessons Learned](#lessons-learned)
- [Contributing](#contributing)

---

## 🎯 Overview

AIR LEGACY is a full-stack e-commerce platform built to demonstrate:

- **Serverless Architecture**: 100% AWS Lambda, DynamoDB, no EC2 instances
- **Infrastructure as Code**: Complete Terraform automation (15 modules)
- **DevSecOps**: Automated security scanning + runtime monitoring
- **Modern Frontend**: Next.js 14 with SSR + TypeScript
- **Production-Ready**: Cognito auth, Stripe payments, Resend emails
- **Cost-Optimized**: ~$15/month for complete e-commerce stack

### Project Goals

1. ✅ Build production-ready e-commerce platform on AWS
2. ✅ Demonstrate Infrastructure as Code mastery (Terraform)
3. ✅ Implement DevSecOps best practices
4. ✅ Showcase full-stack development skills
5. ✅ Document architectural decisions and learnings

---

## 🔑 Key Features

### Customer Experience
- 🛍️ **Product Browsing** with real-time stock levels
- 🛒 **Shopping Cart** with persistent storage
- 💳 **Secure Checkout** via Stripe
- 📧 **Order Confirmations** via Resend email service
- 👤 **User Authentication** with AWS Cognito

### Admin Dashboard
- 📊 **Real-time Analytics** (revenue, orders, customers)
- 📦 **Product Management** (CRUD operations)
- 👥 **Customer Overview** with registration trends
- 📈 **Sales Reports** with time-series data

### Technical Excellence
- ⚡ **Serverless**: Auto-scaling, pay-per-use
- 🔒 **Security**: Automated scanning + runtime monitoring
- 🚀 **CI/CD**: GitHub Actions with automated deployments
- 📊 **Monitoring**: CloudWatch Logs + Alarms
- 🌍 **CDN**: CloudFront for global asset delivery

---

## 🏗️ Architecture

### High-Level Architecture

![Architecture Diagram](docs/architecture-diagram.svg)

### Infrastructure Breakdown

**Frontend Layer:**
- AWS Amplify (2x apps: customer + admin)
- Next.js 14 with SSR
- Custom domains via Route53 + ACM

**API Layer:**
- API Gateway REST API
- Lambda (Node.js 20) with Express.js
- Cognito Authorizer

**Data Layer:**
- DynamoDB (4 tables: products, users, carts, orders)
- S3 + CloudFront for assets

**External Services:**
- Resend for transactional emails
- Stripe for payment processing

**Infrastructure:**
- 100% Terraform (15 modules)
- GitHub Actions CI/CD
- Route53 for DNS

[📚 Detailed Architecture Documentation →](docs/ARCHITECTURE.md)

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: Next.js 14 (React 18)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Auth**: AWS Amplify Auth (Cognito)
- **State**: React Context API
- **Hosting**: AWS Amplify

### Backend
- **Runtime**: Node.js 20 (Lambda)
- **Framework**: Express.js + serverless-http
- **Language**: TypeScript
- **Database**: DynamoDB (NoSQL)
- **Auth**: AWS Cognito JWT validation
- **Email**: Resend API
- **Payments**: Stripe

### Infrastructure
- **IaC**: Terraform 1.5+
- **Cloud**: AWS (Lambda, DynamoDB, Cognito, Amplify, Route53, CloudFront, S3)
- **CI/CD**: GitHub Actions
- **Security**: tfsec, Checkov, Trufflehog

### DevOps
- **Version Control**: Git + GitHub
- **Deployment**: Automated via GitHub Actions
- **Monitoring**: CloudWatch Logs + Alarms
- **Secrets**: GitHub Secrets + AWS Parameter Store

---

## 🚀 Live Demo

### Customer Shop
**URL:** https://shop.aws.his4irness23.de

**Test Credentials:**
```
Email: demo@example.com
Password: DemoPassword123!
```

**Stripe Test Card:**
```
Card: 4242 4242 4242 4242
Expiry: 12/34
CVC: 123
```

### Admin Dashboard
**URL:** https://admin.aws.his4irness23.de

**Basic Auth:**
```
Username: admin
Password: [Contact for access]
```

**Features:**
- Real-time analytics dashboard
- Product management (CRUD)
- Customer overview
- Sales reports

---

## 📸 Screenshots

### Customer Shop
![Shop Homepage](docs/screenshots/shop-homepage.png)
*Modern product catalog with real-time stock levels*

![Product Detail](docs/screenshots/product-detail.png)
*Detailed product view with color/size selection*

![Checkout](docs/screenshots/checkout.png)
*Secure checkout flow with Stripe integration*

### Admin Dashboard
![Dashboard](docs/screenshots/admin-dashboard.png)
*Real-time analytics and KPIs*

![Product Management](docs/screenshots/admin-products.png)
*Product CRUD operations*

### Email Confirmation
![Order Email](docs/screenshots/order-confirmation-email.png)
*Professional order confirmation email*

---

## 🔒 Security

### DevSecOps Pipeline
- **Automated Security Scanning**: tfsec, Checkov, Trufflehog on every PR
- **Manual Approval Gates**: Production deployments require review
- **Secret Detection**: Prevents credential leaks

### Runtime Security
- **Real-time Monitoring**: CloudWatch Alarms (<5 min detection)
- **Daily Security Scans**: Lambda function checking compliance
- **IAM Access Analyzer**: Continuous policy validation
- **Email Alerts**: SNS notifications for security findings

### Infrastructure Security
- **Encryption at Rest**: All DynamoDB tables + S3 buckets
- **HTTPS Only**: All traffic encrypted in transit
- **Least Privilege IAM**: Minimal permissions per service
- **VPC Isolation**: Future enhancement

**Cost:** $0.00/month (19 FREE-tier security resources)

[📚 Full Security Documentation →](docs/SECURITY.md)

---

## 💰 Cost Analysis

### Monthly Cost Breakdown

| Service | Usage | Monthly Cost |
|---------|-------|--------------|
| **Lambda** | ~10K invocations | ~$0.20 |
| **DynamoDB** | Provisioned (5 RCU, 5 WCU) | ~$2.50 |
| **Amplify** | 2 apps, low traffic | ~$5.00 |
| **CloudFront** | Assets CDN | ~$1.00 |
| **Route53** | Hosted Zone + queries | ~$0.50 |
| **API Gateway** | REST API calls | ~$1.00 |
| **S3** | Storage + requests | ~$0.50 |
| **Cognito** | <50K MAUs | FREE |
| **Resend** | <3K emails/month | FREE |
| **Stripe** | Payment processing | Pay-per-transaction |
| **Security Stack** | CloudWatch + Lambda | FREE (tier) |
| **Total** | | **~$10-15/month** |

### Cost Optimization
- ✅ Serverless = Pay-per-use (no idle costs)
- ✅ DynamoDB Provisioned mode (cheaper than on-demand for steady traffic)
- ✅ CloudFront caching reduces origin requests
- ✅ S3 lifecycle policies for old data
- ✅ No NAT Gateway or EC2 instances

---

## 🎓 Lessons Learned

### Technical Insights

#### 1. Email Provider Rejections → Resend Migration
**Challenge:** AWS SES Production Access rejected, SendGrid account rejected

**Solution:** Migrated to Resend (developer-friendly email service)

**Learning:** Always have fallback options for critical services. Email provider approvals are NOT guaranteed for new accounts.

**Timeline:** Completed migration in 90 minutes with zero downtime.

[📚 Full Story →](docs/LESSONS_LEARNED.md#learning-39)

---

#### 2. Lambda Template Loading Issue
**Challenge:** Lambda crashed on cold start - template files not in deployment package

**Root Cause:** TypeScript build (`tsc`) only compiles .ts files, doesn't copy .html templates

**Solution:** Updated build script: `"build": "tsc && cp -r src/templates dist/"`

**Learning:** Always verify non-code assets are included in Lambda deployment packages.

---

#### 3. Terraform State Management
**Challenge:** Managing multi-environment infrastructure (dev, staging, prod)

**Solution:** Terraform workspaces + branch-based deployments

**Learning:** Remote state (S3 + DynamoDB locking) is essential for team collaboration and prevents state corruption.

---

[📚 All 39 Documented Learnings →](docs/LESSONS_LEARNED.md)

---

## 📚 Documentation

- [Architecture Guide](docs/ARCHITECTURE.md) - System design and component interaction
- [Deployment Guide](docs/DEPLOYMENT.md) - Step-by-step deployment instructions
- [Security Documentation](docs/SECURITY.md) - Security architecture and monitoring
- [API Documentation](docs/API.md) - REST API endpoints and schemas
- [Development Guide](docs/DEVELOPMENT.md) - Local development setup
- [Lessons Learned](docs/LESSONS_LEARNED.md) - 39 documented learnings
- [Action Plan](docs/ACTION_PLAN.md) - Project roadmap and priorities

---

## 🤝 Contributing

This is a portfolio project, but suggestions and feedback are welcome!

[📝 Contributing Guidelines →](CONTRIBUTING.md)

---

## 📊 Project Statistics

- **Lines of Code**: ~15,000 (TypeScript)
- **Terraform Modules**: 15
- **AWS Services Used**: 12
- **Deployment Time**: ~15 minutes (full stack)
- **Documented Learnings**: 39
- **Development Duration**: 3 months
- **Cost**: ~$15/month

---

## 📝 License

MIT License - see [LICENSE](LICENSE) file

---

## 👤 Author

**Andy Schlegel**
Cloud Engineer | Full-Stack Developer | DevOps Enthusiast

- 🌐 Website: [coming soon]
- 💼 LinkedIn: [Andy Schlegel](https://linkedin.com/in/andy-schlegel)
- 🐙 GitHub: [@AndySchlegel](https://github.com/AndySchlegel)
- ✉️ Email: andy.schlegel@chakademie.org

---

## 🙏 Acknowledgments

- **AWS** for Free Tier program
- **Terraform** for Infrastructure as Code
- **Next.js** team for amazing framework
- **Stripe** for developer-friendly payments
- **Resend** for reliable email delivery
- **Carl-Frederic Nickell** for DevSecOps inspiration

---

**Project Status:** ✅ Production-Ready
**Last Updated:** Januar 2026

⭐ If this project helped you learn serverless architecture or Terraform, please consider starring the repository!
```

**Success Criteria:**
- ✅ Professional first impression
- ✅ All key features highlighted with screenshots
- ✅ Architecture diagram prominent
- ✅ Live demo links working
- ✅ Badges showing tech stack
- ✅ Clear documentation structure
- ✅ Lessons learned documented
- ✅ Cost transparency

---

### Task 2.3: Demo Video (30-60 Sekunden)

**Priority:** 🟡 HIGH
**Effort:** 2-3 Stunden
**Impact:** ⭐⭐⭐⭐

**What:**
Screen Recording showcasing the complete user flow.

**Script:**
```
0:00-0:05 - Shop Homepage (hero shot)
0:05-0:10 - Browse products, click on product
0:10-0:15 - Product detail, select color/size
0:15-0:20 - Add to cart
0:20-0:30 - Checkout flow (Stripe test card)
0:30-0:35 - Order confirmation page
0:35-0:40 - Email arrives (show inbox)
0:40-0:50 - Admin dashboard (analytics)
0:50-0:60 - Admin adds new product → appears in shop
```

**Tools:**
- **OBS Studio** (free, professional)
- **QuickTime** (Mac, simple screen recording)
- **Loom** (browser-based, auto-upload)

**Post-Production:**
- Add title cards (tool, music)
- Background music (YouTube Audio Library - copyright-free)
- Export as MP4 (1080p)
- Upload to YouTube (unlisted) + embed in README

**Success Criteria:**
- ✅ 30-60 Sekunden Länge
- ✅ Zeigt complete E2E flow
- ✅ Professional quality (no shaky mouse, clear)
- ✅ Background music
- ✅ Embedded in README

---

### Task 2.4: Blog Post / Case Study

**Priority:** 🟢 MEDIUM
**Effort:** 4-6 Stunden
**Impact:** ⭐⭐⭐⭐

**What:**
Schreibe einen technischen Blog Post über ein spannendes Problem/Learning.

**Mögliche Topics:**
1. "Building a $15/month Serverless E-Commerce Platform on AWS"
2. "Email Provider Rejections: From AWS SES to Resend in 90 Minutes"
3. "Terraform Multi-Environment Setup: Dev, Staging, Production"
4. "Real-time Analytics Dashboard with DynamoDB Time-Series Data"

**Struktur:**
```markdown
# [Catchy Title]

## The Challenge
[Problem statement, context]

## The Journey
[What we tried, what failed, lessons learned]

## The Solution
[Final approach, code examples]

## Results
[Metrics, screenshots, wins]

## Lessons Learned
[Key takeaways for readers]

## Conclusion
[Summary, next steps]
```

**Platform:**
- Medium (große Reichweite)
- Dev.to (Developer-Community)
- Eigener Blog (wenn vorhanden)
- LinkedIn Article (Professional Network)

**Success Criteria:**
- ✅ 1000-1500 Wörter
- ✅ Code Examples included
- ✅ Screenshots/Diagrams
- ✅ Published auf mindestens einer Platform
- ✅ Verlinkung zu GitHub Repo

---

## 💪 SÄULE 3: Feature Enhancement

### Task 3.1: Real-time Dashboard Analytics

**Priority:** 🟡 HIGH
**Effort:** 6-8 Stunden
**Impact:** ⭐⭐⭐⭐

**What:**
Replace dummy trend data with real calculations based on DynamoDB orders.

**Current State (Dummy):**
```typescript
const stats = {
  revenue: 125000,
  revenueChange: +12.5,  // Hardcoded!
  orders: 523,
  ordersChange: +8.2,    // Hardcoded!
}
```

**Target State (Real):**
```typescript
// Calculate trends based on time periods
const now = Date.now();
const last7Days = await getOrdersByDateRange(now - 7*24*60*60*1000, now);
const previous7Days = await getOrdersByDateRange(now - 14*24*60*60*1000, now - 7*24*60*60*1000);

const revenue = last7Days.reduce((sum, order) => sum + order.total, 0);
const previousRevenue = previous7Days.reduce((sum, order) => sum + order.total, 0);

const revenueChange = previousRevenue > 0
  ? ((revenue - previousRevenue) / previousRevenue) * 100
  : 0;

const stats = {
  revenue,
  revenueChange,  // Real calculation!
  orders: last7Days.length,
  ordersChange: ((last7Days.length - previous7Days.length) / previous7Days.length) * 100,
}
```

**Implementation:**

**NEW API Endpoint:** `GET /api/admin/analytics/trends`

Query parameters:
- `period`: "7d" | "30d" | "90d"

**Backend:** `backend/src/routes/admin.ts`

```typescript
router.get('/analytics/trends', async (req, res) => {
  const period = req.query.period || '7d';

  const periodMs = {
    '7d': 7 * 24 * 60 * 60 * 1000,
    '30d': 30 * 24 * 60 * 60 * 1000,
    '90d': 90 * 24 * 60 * 60 * 1000,
  }[period];

  const now = Date.now();
  const currentPeriodStart = now - periodMs;
  const previousPeriodStart = now - 2 * periodMs;

  // Get orders for current period
  const currentOrders = await database.getOrdersByDateRange(
    currentPeriodStart,
    now
  );

  // Get orders for previous period
  const previousOrders = await database.getOrdersByDateRange(
    previousPeriodStart,
    currentPeriodStart
  );

  // Calculate metrics
  const currentRevenue = currentOrders.reduce((sum, o) => sum + o.total, 0);
  const previousRevenue = previousOrders.reduce((sum, o) => sum + o.total, 0);

  const revenueChange = previousRevenue > 0
    ? ((currentRevenue - previousRevenue) / previousRevenue) * 100
    : 0;

  const ordersChange = previousOrders.length > 0
    ? ((currentOrders.length - previousOrders.length) / previousOrders.length) * 100
    : 0;

  // Calculate unique customers
  const currentCustomers = new Set(currentOrders.map(o => o.userId)).size;
  const previousCustomers = new Set(previousOrders.map(o => o.userId)).size;

  const customersChange = previousCustomers > 0
    ? ((currentCustomers - previousCustomers) / previousCustomers) * 100
    : 0;

  res.json({
    period,
    revenue: currentRevenue,
    revenueChange,
    orders: currentOrders.length,
    ordersChange,
    customers: currentCustomers,
    customersChange,
  });
});
```

**DynamoDB Query:** `backend/src/database/dynamodb.ts`

```typescript
export async function getOrdersByDateRange(
  startTimestamp: number,
  endTimestamp: number
): Promise<Order[]> {
  const params = {
    TableName: 'ecokart-orders',
    FilterExpression: 'createdAt BETWEEN :start AND :end',
    ExpressionAttributeValues: {
      ':start': startTimestamp,
      ':end': endTimestamp,
    },
  };

  const result = await dynamodb.scan(params);
  return result.Items as Order[];
}
```

**Frontend:** `admin-frontend/app/dashboard/page.tsx`

```typescript
// Add time period selector
const [period, setPeriod] = useState<'7d' | '30d' | '90d'>('7d');

// Fetch real trends
useEffect(() => {
  const fetchTrends = async () => {
    const response = await fetch(`/api/admin/analytics/trends?period=${period}`);
    const data = await response.json();
    setStats(data);
  };

  fetchTrends();
}, [period]);

// UI
<div className="flex gap-4 mb-6">
  <button onClick={() => setPeriod('7d')}>Last 7 Days</button>
  <button onClick={() => setPeriod('30d')}>Last 30 Days</button>
  <button onClick={() => setPeriod('90d')}>Last 90 Days</button>
</div>
```

**Success Criteria:**
- ✅ Trends basieren auf echten DynamoDB Daten
- ✅ Zeit-Period-Selection (7d, 30d, 90d)
- ✅ Korrekte Prozent-Berechnungen
- ✅ Handles edge cases (no previous data)
- ✅ Performance optimiert (cached queries)

---

### Task 3.2: Quantity Selector Implementation ✅ COMPLETED

**Priority:** 🟡 HIGH
**Effort:** 2-3 Stunden
**Impact:** ⭐⭐⭐
**Status:** ✅ COMPLETED

**What:**
Implement quantity selector BEFORE "Add to Cart" button.

**Implementation:**
- ✅ Implemented size selection buttons (7, 7.5, 8, 8.5, 9, 9.5, 10, 10.5, 11, 11.5, 12, 13)
- ✅ Implemented quantity selector with +/- buttons
- ✅ Quick Select Modal with both size and quantity selection
- ✅ Product Detail Page with full functionality
- ✅ Stock validation integrated
- ✅ Mobile-optimized touch targets

**Success Criteria:**
- ✅ Quantity selector on Product Detail Page
- ✅ Quantity selector in Quick Select Modal
- ✅ Respects available stock
- ✅ Mobile-friendly touch targets

---

### Task 3.3: Order History & Tracking

**Priority:** 🟢 MEDIUM
**Effort:** 3-4 Stunden
**Impact:** ⭐⭐⭐

**What:**
Add "My Orders" page for customers to see past orders.

**NEW Page:** `frontend/app/orders/page.tsx`

**API Endpoint:** `GET /api/orders?userId={userId}`

**UI:**
```
┌────────────────────────────────────────────┐
│  MY ORDERS                                 │
├────────────────────────────────────────────┤
│  ┌──────────────────────────────────────┐ │
│  │ Order #12345 - 15. Dez 2025          │ │
│  │ Status: Delivered ✅                  │ │
│  │ Total: €125.99                        │ │
│  │ Items: 3                              │ │
│  │ [View Details]                        │ │
│  └──────────────────────────────────────┘ │
│                                            │
│  ┌──────────────────────────────────────┐ │
│  │ Order #12344 - 10. Dez 2025          │ │
│  │ Status: Shipped 🚚                    │ │
│  │ Total: €89.99                         │ │
│  │ Items: 2                              │ │
│  │ [View Details] [Track Shipment]      │ │
│  └──────────────────────────────────────┘ │
└────────────────────────────────────────────┘
```

**Success Criteria:**
- ✅ User sees all their orders
- ✅ Order status displayed
- ✅ Click to see order details
- ✅ Sorted by date (newest first)

---

### Task 3.4: Product Search & Filtering

**Priority:** 🟢 MEDIUM
**Effort:** 3-4 Stunden
**Impact:** ⭐⭐⭐

**What:**
Add search bar + category/price filters to shop.

**UI:**
```
┌────────────────────────────────────────────┐
│  [Search products...]  [🔍]                │
│                                            │
│  Categories:  [All] [Shoes] [Apparel]     │
│  Price:  [€0 - €50] [€50-€100] [€100+]    │
└────────────────────────────────────────────┘
```

**DynamoDB Query:**
Uses existing `CategoryIndex` GSI

**Success Criteria:**
- ✅ Search by product name
- ✅ Filter by category
- ✅ Filter by price range
- ✅ Clear filters button

---

## 🧪 SÄULE 4: Quality Assurance

### Task 4.1: E2E Testing with Playwright

**Priority:** 🟢 MEDIUM
**Effort:** 6-8 Stunden
**Impact:** ⭐⭐⭐⭐

**What:**
Automated E2E tests for critical user flows.

**Test Cases:**
```typescript
// tests/e2e/customer-flow.spec.ts
import { test, expect } from '@playwright/test';

test('Complete purchase flow', async ({ page }) => {
  // 1. Navigate to shop
  await page.goto('https://shop.aws.his4irness23.de');

  // 2. Click on first product
  await page.click('[data-testid="product-card"]:first-child');

  // 3. Add to cart
  await page.click('[data-testid="add-to-cart"]');

  // 4. Go to cart
  await page.click('[data-testid="cart-icon"]');

  // 5. Proceed to checkout
  await page.click('[data-testid="checkout-button"]');

  // 6. Fill Stripe test card
  await page.fill('[data-testid="card-number"]', '4242 4242 4242 4242');
  await page.fill('[data-testid="card-expiry"]', '12/34');
  await page.fill('[data-testid="card-cvc"]', '123');

  // 7. Submit payment
  await page.click('[data-testid="submit-payment"]');

  // 8. Verify success
  await expect(page.locator('[data-testid="order-confirmation"]')).toBeVisible();
});
```

**Setup:**
```bash
npm install --save-dev @playwright/test
npx playwright install
```

**Success Criteria:**
- ✅ 5+ E2E test cases
- ✅ Tests run in CI/CD
- ✅ >80% critical path coverage

---

### Task 4.2: Error Monitoring

**Priority:** 🟢 MEDIUM
**Effort:** 2-3 Stunden
**Impact:** ⭐⭐⭐

**What:**
CloudWatch Alarms for Lambda errors.

**Implementation:**
```hcl
# terraform/modules/monitoring/main.tf
resource "aws_cloudwatch_metric_alarm" "lambda_errors" {
  alarm_name          = "${var.project_name}-lambda-errors"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 1
  metric_name         = "Errors"
  namespace           = "AWS/Lambda"
  period              = 300
  statistic           = "Sum"
  threshold           = 5
  alarm_description   = "Lambda error rate too high"
  alarm_actions       = [aws_sns_topic.alerts.arn]

  dimensions = {
    FunctionName = var.lambda_function_name
  }
}
```

**Success Criteria:**
- ✅ Email alerts for Lambda errors
- ✅ API Gateway 5xx errors monitored
- ✅ DynamoDB throttling alerts

---

## 📅 Recommended Timeline

### Week 1: Security & Architecture (Foundation)
**Days 1-2:**
- Task 1.1: Security Scanning Integration ✅
- Task 1.2: Runtime Security Monitoring ✅

**Days 3-5:**
- Task 2.1: Architecture Diagram ✅
- Task 2.2: README Transformation ✅
- Task 1.3: Security Documentation ✅

**Day 6-7:**
- Task 2.3: Demo Video ✅
- Buffer / Polish

### Week 2: Features & Quality (Enhancement)
**Days 1-2:**
- Task 3.1: Real-time Dashboard Analytics ✅

**Days 3-4:**
- Task 3.2: Quantity Selector ✅
- Task 3.3: Order History ✅

**Days 5-6:**
- Task 3.4: Product Search ✅
- Task 4.2: Error Monitoring ✅

**Day 7:**
- Buffer / Testing

### Week 3: Testing & Content (Polish)
**Days 1-3:**
- Task 4.1: E2E Testing ✅

**Days 4-5:**
- Task 2.4: Blog Post ✅

**Days 6-7:**
- Final polish, screenshots, testing
- Presentation preparation

---

## 🎯 Success Metrics

### Portfolio Readiness Checklist

**Visual Presentation:**
- [ ] Professional README with badges
- [ ] Interactive architecture diagram
- [ ] 10+ high-quality screenshots
- [ ] 30-60s demo video
- [ ] Live demo links working

**Technical Excellence:**
- [ ] Security scanning integrated
- [ ] Runtime monitoring active
- [ ] E2E tests passing
- [ ] <5 critical security findings
- [ ] All features documented

**Content:**
- [ ] Blog post published
- [ ] Architecture docs complete
- [ ] All learnings documented
- [ ] Cost analysis transparent

**Presentation-Ready:**
- [ ] Slide deck prepared (optional)
- [ ] Key talking points identified
- [ ] Demo rehearsed
- [ ] Q&A prep done

---

## 🔄 Continuous Improvement

**After completing Phase 2:**
- Gather feedback from Kurs-Präsentation
- Iterate based on Recruiter feedback
- Add testimonials/reviews (if applicable)
- Keep docs updated with new learnings

---

## 📞 Support & Questions

Bei Fragen oder Problemen während Phase 2:
1. Check existing documentation
2. Review Carl's DevSecOps repo
3. Ask in Kurs-Slack
4. Consult with Carl (Security topics)

---

**Estimated Total Effort:** 60-80 Stunden (2-3 Wochen, flexibel)
**Impact:** Portfolio transformation from "working" to "world-class"
**ROI:** Significant - better interviews, higher confidence in presentations

**Let's make this portfolio SHINE! 🌟**
