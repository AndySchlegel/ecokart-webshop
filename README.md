# AIR LEGACY - Serverless E-Commerce Platform

> **Production-ready serverless e-commerce platform showcasing modern AWS architecture, Infrastructure as Code, and full-stack development skills.**

[![Deploy](https://github.com/AndySchlegel/ecokart-webshop/actions/workflows/deploy.yml/badge.svg?branch=develop)](https://github.com/AndySchlegel/ecokart-webshop/actions/workflows/deploy.yml)
[![Tests](https://github.com/AndySchlegel/ecokart-webshop/actions/workflows/backend-tests.yml/badge.svg?branch=develop)](https://github.com/AndySchlegel/ecokart-webshop/actions/workflows/backend-tests.yml)
[![Security Scan](https://github.com/AndySchlegel/ecokart-webshop/actions/workflows/security-scan.yml/badge.svg?branch=develop)](https://github.com/AndySchlegel/ecokart-webshop/actions/workflows/security-scan.yml)
[![AWS](https://img.shields.io/badge/AWS-12%20Services-orange)](https://aws.amazon.com/)
[![Terraform](https://img.shields.io/badge/Terraform-15%20Modules%20IaC-blue)](https://www.terraform.io/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.4-blue)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/License-MIT-yellow)](LICENSE)

**Live Demo:** [Customer Shop](https://shop.aws.his4irness23.de) | [Admin Dashboard](https://admin.aws.his4irness23.de)

![Shop Homepage](docs/screenshots/01-shop-homepage.jpg)

---

## Table of Contents

- [Overview](#overview)
- [Key Features](#key-features)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Live Demo](#live-demo)
- [Security](#security)
- [Getting Started](#getting-started)
- [Deployment](#deployment)
- [Project Health](#project-health)
- [Cost Analysis](#cost-analysis)
- [Documentation](#documentation)
- [Lessons Learned](#lessons-learned)
- [Contributing](#contributing)

---

## Overview

AIR LEGACY is a full-stack e-commerce platform built to demonstrate:

- **Serverless Architecture**: 100% AWS Lambda + DynamoDB, no EC2 instances
- **Infrastructure as Code**: Complete Terraform automation (15 modules, 100% reproducible)
- **Modern Frontend**: Next.js 14 with Server-Side Rendering + TypeScript
- **Production-Ready**: Cognito auth, Stripe payments, Resend emails, automated testing
- **Cost-Optimized**: ~$10-15/month for complete e-commerce stack
- **CI/CD Excellence**: GitHub Actions with OIDC, branch-based deployments

### Project Goals

1. ✅ Build production-ready e-commerce platform on AWS
2. ✅ Demonstrate Infrastructure as Code mastery (Terraform)
3. ✅ Showcase full-stack development skills (Next.js + Express.js + TypeScript)
4. ✅ Implement modern DevOps practices (CI/CD, automated testing, monitoring)
5. ✅ Document architectural decisions and learnings (39 documented learnings)

### Why This Project Stands Out

**Portfolio Differentiators:**
- ✅ **100% Reproducible** - Complete infrastructure in Terraform, auto-seeding included
- ✅ **Multi-Environment** - Dev, Staging, Production with branch-based deployments
- ✅ **Real Payments** - Stripe integration with webhooks (not a mock)
- ✅ **Email Integration** - Resend for transactional emails (production-ready)
- ✅ **Automated Testing** - 63 unit tests, 60-69% coverage
- ✅ **CloudWatch Monitoring** - 9 alarms for proactive issue detection
- ✅ **Documented Journey** - 39 learnings from real implementation challenges

---

## Key Features

### Customer Experience
- 🛍️ **Product Browsing** with real-time stock levels (green/orange/red indicators)
- 🔢 **Quantity Selector** - Choose quantity before adding to cart (stock-aware with warnings)
- 🛒 **Shopping Cart** with persistent storage (DynamoDB-backed)
- 💳 **Secure Checkout** via Stripe (PCI-compliant payment processing)
- 📧 **Order Confirmations** via Resend email service (beautiful HTML templates)
- 👤 **User Authentication** with AWS Cognito (email verification, JWT tokens)
- 👤 **User Profile** - Personal information, order statistics, favorites management
- 📦 **Order History** - Track past orders with detailed information
- 🌍 **Global CDN** - CloudFront for product images (fast worldwide delivery)

### Admin Dashboard
- 📊 **Real-time Analytics** - 7d and 30d views with revenue, orders, customer trends
- 📦 **Product Management** - Card-based grid layout with CRUD operations
- 🎨 **Modern UI Design** - iOS-style top navigation with responsive grid layout
- 🖼️ **Image Management** - Upload product images via Terraform
- 👥 **Customer Overview** with registration trends
- 📈 **Order Management** - Complete order history with status tracking
- 🔒 **Basic Auth Protection** - Optional HTTP Basic Auth for staging

### Technical Excellence
- ⚡ **Serverless**: Auto-scaling, pay-per-use, zero infrastructure management
- 🔒 **Security**: Cognito JWT validation, HTTPS everywhere, encrypted data at rest
- 🛡️ **Security Monitoring**: 5 CloudWatch Alarms + Daily compliance scans ($0/month)
- 🚨 **Real-time Detection**: Unauthorized calls, root usage, policy changes (<5min response)
- 🚀 **CI/CD**: GitHub Actions with OIDC (no long-lived credentials)
- 📊 **Monitoring**: CloudWatch Logs + 9 Alarms (Lambda errors, API 5xx, DynamoDB throttling)
- 🌍 **CDN**: CloudFront for global asset delivery
- 🧪 **Testing**: 63 unit tests with Jest, 30-40% coverage (realistic for portfolio)
- 📝 **Documentation**: 39 documented learnings, architecture guides

---

## Architecture

> **💡 Interactive Architecture Diagram Available!**
> Explore the full architecture with interactive tooltips, AWS service details, and cost breakdown:
> **[View Interactive Architecture Presentation](docs/architecture-tabs.html)**
> _(3-tab presentation: Architecture Diagram, Technical Details, Top 10 Lessons Learned - Open locally in browser)_

### High-Level Architecture

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
│  ├─ Amplify (2x)      └─ Database Seeding                   │
│  └─ SES/Resend                                              │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                       CI/CD PIPELINE                        │
├─────────────────────────────────────────────────────────────┤
│  GitHub Actions (OIDC - no long-lived credentials)         │
│  ├─ Backend Tests (Jest)      ├─ Terraform Apply           │
│  ├─ Code Quality (ESLint)     ├─ Lambda Deploy             │
│  ├─ Terraform Plan            └─ Nuclear Cleanup (manual)  │
│  └─ Branch-based Deployment (develop → dev, main → prod)   │
└─────────────────────────────────────────────────────────────┘
```

### Infrastructure Breakdown

**Frontend Layer:**
- AWS Amplify (2 apps: customer shop + admin dashboard)
- Next.js 14 with Server-Side Rendering
- Custom domains via Route53 + ACM certificates
- Automatic deployments on git push

**API Layer:**
- API Gateway REST API with CORS
- Lambda (Node.js 20) with Express.js + serverless-http
- Cognito JWT Authorizer for authentication
- CloudWatch Logs for debugging

**Data Layer:**
- DynamoDB (4 tables): products, users, carts, orders
- Global Secondary Indexes for efficient queries
- Provisioned capacity (5 RCU/WCU) for cost optimization
- S3 + CloudFront for product images

**External Services:**
- **Resend** for transactional emails (order confirmations)
- **Stripe** for payment processing (checkout + webhooks)
- **Route53** for DNS management
- **ACM** for SSL/TLS certificates

**Infrastructure:**
- **Terraform**: 15 modules, 100% Infrastructure as Code
- **GitHub Actions**: CI/CD with OIDC authentication
- **CloudWatch**: 9 alarms for proactive monitoring


---

## Tech Stack

### Frontend
- **Framework**: Next.js 14 (React 18)
- **Language**: TypeScript 5.4
- **Styling**: Custom CSS (no framework dependencies)
- **Auth**: AWS Amplify Auth (Cognito integration)
- **State**: React Context API
- **Hosting**: AWS Amplify (auto-deployment, CDN, SSL)

### Backend
- **Runtime**: Node.js 20 (AWS Lambda)
- **Framework**: Express.js + serverless-http
- **Language**: TypeScript 5.3
- **Database**: DynamoDB (NoSQL)
- **Auth**: AWS Cognito JWT validation
- **Email**: Resend API (3,000 emails/month free)
- **Payments**: Stripe (checkout + webhooks)

### Infrastructure
- **IaC**: Terraform 1.5+
- **Cloud**: AWS
  - Lambda (compute)
  - DynamoDB (database)
  - Cognito (authentication)
  - Amplify (frontend hosting)
  - Route53 (DNS)
  - CloudFront + S3 (CDN + storage)
  - API Gateway (REST API)
  - CloudWatch (monitoring + alarms)
- **CI/CD**: GitHub Actions with OIDC
- **Secrets**: GitHub Secrets + AWS Systems Manager Parameter Store

### DevOps
- **Version Control**: Git + GitHub
- **Deployment**: Automated via GitHub Actions
- **Monitoring**: CloudWatch Logs + 9 Alarms
- **Testing**: Jest (63 unit tests, 60-69% coverage)
- **Code Quality**: ESLint + Prettier

### External Services
- **Stripe**: Payment processing (test + live modes)
- **Resend**: Transactional emails (developer-friendly API)

---

## Live Demo

### Customer Shop
**URL:** https://shop.aws.his4irness23.de

**Features:**
- Browse premium streetwear products
- Real-time stock indicators (green/orange/red)
- Add products to cart with quantity selector
- Secure checkout via Stripe
- Order confirmation emails

**Test Credentials:**
```
Email: demo@example.com
Password: [Create your own account via registration]
```

**Stripe Test Card:**
```
Card Number: 4242 4242 4242 4242
Expiry Date: 12/34 (any future date)
CVC: 123 (any 3 digits)
ZIP Code: 12345 (any 5 digits)
```

### Admin Dashboard
**URL:** https://admin.aws.his4irness23.de

**Features:**
- Real-time analytics dashboard (revenue, orders, customers)
- Product management (CRUD operations)
- Customer overview
- Order history
- Sales reports

**Basic Auth (if enabled):**
```
Username: admin
Password: [Contact for access or set via Terraform variables]
```

**Admin Test Credentials:**
```
Email: admin@example.com
Password: [Create admin user via Cognito or contact]
```

---

## Screenshots

### Customer Shop

#### Homepage
![Shop Homepage](docs/screenshots/01-shop-homepage.jpg)
*Modern product catalog with real-time stock levels, clean design, and featured products*

#### Product Tagging System
![Product Tagging](docs/screenshots/02-tagging.jpg)
*Smart product categorization and tagging for better discovery*

#### Product Overview
![Products Main](docs/screenshots/03-products-main.jpg)
*Complete product catalog with filtering and search capabilities*

#### Product with Cart Integration
![Product Cart](docs/screenshots/04-product-cart.jpg)
*Product detail view with integrated add-to-cart functionality*

#### Quick Select Modal
![Product Modal](docs/screenshots/05-product-modal.jpg)
*Fast product selection modal with size/color options and quantity selector*

#### Shopping Cart Sidebar
![Shopping Cart Side](docs/screenshots/06-shopping-cart-side.jpg)
*Slide-out cart sidebar for quick cart review and management*

#### Checkout Page
![Checkout](docs/screenshots/07-checkout.jpg)
*Streamlined checkout process with shipping and billing information*

#### Shopping Cart Full View
![Shopping Cart](docs/screenshots/08-shopping-cart.jpg)
*Complete cart overview with item management and quantity adjustments*

#### Stripe Checkout
![Stripe Checkout](docs/screenshots/09-stripe-checkout.jpg)
*Secure Stripe payment processing with card details*

#### Payment Success
![Success Payment](docs/screenshots/10-success-payment.jpg)
*Order confirmation page after successful payment*

#### Email Confirmation - Desktop View
![Email Confirmation Desktop](docs/screenshots/11-email-confirmation.jpg)
*Professional HTML email confirmation with order details and tracking link*

#### Email Confirmation - Mobile View
![Email Confirmation Mobile](docs/screenshots/13-email-confirmation.jpg)
*Responsive email template optimized for mobile devices*

#### Email Confirmation - Details
![Email Confirmation Details](docs/screenshots/14-email-confirmation.jpg)
*Order summary with product details and shipping information*

### User Account

#### User Profile
![User Profile](docs/screenshots/18-user-profile.jpg)
*Personal user profile with order statistics, account info, and quick actions*

#### My Orders
![My Orders](docs/screenshots/19-my-orders.jpg)
*Complete order history with tracking and detailed information*

### Admin Dashboard

#### Order Management
![Admin Orders](docs/screenshots/15-admin-orders.jpg)
*Admin order management with status tracking and customer details*

#### Create New Product
![Admin New Product](docs/screenshots/16-admin-new-product.jpg)
*Product creation interface with image upload and inventory management*

#### Analytics - 7 Day View
![Analytics 7d](docs/screenshots/17-analytics-7d.jpg)
*Real-time analytics dashboard with 7-day revenue, orders, and customer trends*

#### Analytics - 30 Day View
![Analytics 30d](docs/screenshots/12-Analytics 30d.jpg)
*Extended analytics view showing 30-day business performance and trends*


---

## Security

### DevSecOps Pipeline

This project implements **automated security scanning** on every pull request and push to ensure code quality and security compliance.

#### Automated Security Scanners

**🔍 tfsec** - Terraform Security Scanner
- Scans Terraform code for security misconfigurations
- Checks for AWS best practices violations
- Identifies potential security risks before deployment
- **Minimum Severity:** MEDIUM

**🛡️ Checkov** - Policy Compliance Validation
- Infrastructure as Code security analysis
- Policy-as-Code compliance checks
- Multi-framework support (Terraform, CloudFormation, etc.)
- Validates against CIS benchmarks

**🔐 Trufflehog** - Secret Detection
- Scans git history for accidentally committed secrets
- Detects API keys, passwords, tokens
- Prevents credential leaks
- **Only verified secrets** trigger failures

#### Security Workflow

```yaml
Trigger: PR/Push to develop, staging, main
│
├─ tfsec scan → SARIF upload → GitHub Security Tab
├─ Checkov scan → SARIF upload → GitHub Security Tab
└─ Trufflehog scan → Secret detection report
```

#### GitHub Security Integration

All security findings are automatically uploaded to the **GitHub Security Tab** using SARIF format:
- 📊 Centralized security dashboard
- 🔍 Code scanning alerts
- 📈 Security trend tracking
- ✅ PR blocking on critical findings (configurable)

#### Security Configuration

**Soft Fail Mode:** Currently enabled for gradual security improvement
- Scans run on every PR but don't block merges
- Allows incremental security fixes
- **Future:** Switch to hard fail for critical issues

**Skipped Checks (Checkov):**
- `CKV_AWS_33` - ECR image scanning (not using ECR)
- `CKV_AWS_144` - Lambda environment encryption (managed by AWS)
- `CKV2_AWS_5` - Security group description (non-critical)

#### View Security Results

- **GitHub Security Tab**: `https://github.com/AndySchlegel/Ecokart-Webshop/security`
- **Workflow Runs**: Actions → Security Scanning
- **PR Checks**: Automated comments on pull requests

#### Security Best Practices Implemented

- ✅ No secrets in git history (verified by Trufflehog)
- ✅ Terraform security best practices (tfsec validated)
- ✅ Infrastructure policy compliance (Checkov validated)
- ✅ HTTPS everywhere (ACM certificates)
- ✅ Encryption at rest (DynamoDB, S3)
- ✅ Least privilege IAM (minimal permissions)
- ✅ VPC isolation (future enhancement planned)

**Cost:** $0.00/month (GitHub Actions free tier)

### Runtime Security Monitoring

This project implements **24/7 automated security monitoring** for the production AWS environment.

#### Real-Time CloudWatch Alarms (<5 min detection)

**🚨 Critical Security Events:**
- **Unauthorized API Calls** - Detects 403/401 errors
- **Root Account Usage** - Alerts when root user is used (should NEVER happen)
- **IAM Policy Changes** - Monitors privilege escalation attempts
- **Security Group Changes** - Detects firewall rule modifications
- **S3 Bucket Policy Changes** - Prevents accidental public data exposure

**Alert Method:** Email via SNS Topic
**Response Time:** <5 minutes from event to alert

#### Daily Security Compliance Scan (8 AM UTC)

**Lambda Security Monitor** performs automated daily checks:
- ✅ **Public S3 Buckets** - Ensures no buckets are publicly accessible
- ✅ **Security Groups with 0.0.0.0/0** - Detects overly permissive firewall rules
- ✅ **IAM Users without MFA** - Enforces multi-factor authentication
- ✅ **IAM Access Analyzer** - Detects resources shared outside account

**Email Reports:** Daily summary (only sends if issues found)

#### AWS Services Used

| Service | Purpose | Cost |
|---------|---------|------|
| **CloudWatch Alarms** (5) | Real-time security event detection | $0.00 (first 10 free) |
| **IAM Access Analyzer** | Detect exposed resources | $0.00 |
| **EventBridge Rule** | Trigger daily scan | $0.00 (first 1M free) |
| **Lambda Function** | Security compliance checker | $0.00 (FREE tier) |
| **SNS Topic** | Email notifications | $0.00 (first 1,000 free) |
| **CloudWatch Logs** | Security logs (7 days) | $0.00 (FREE tier) |
| **Total** | | **$0.00/month** |

#### Security Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                   Security Monitoring Stack                  │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ Real-Time Detection (<5 min)                         │   │
│  ├──────────────────────────────────────────────────────┤   │
│  │ CloudTrail → CloudWatch Metrics → Alarms → SNS      │   │
│  │   • Unauthorized API Calls                           │   │
│  │   • Root Account Usage                               │   │
│  │   • Policy Changes (IAM/SG/S3)                       │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                               │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ Daily Compliance Scan (8 AM UTC)                     │   │
│  ├──────────────────────────────────────────────────────┤   │
│  │ EventBridge → Lambda → SNS                           │   │
│  │   • Public S3 Buckets                                │   │
│  │   • Security Group 0.0.0.0/0                         │   │
│  │   • IAM Users without MFA                            │   │
│  │   • Access Analyzer Findings                         │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                               │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ IAM Access Analyzer (Continuous)                     │   │
│  ├──────────────────────────────────────────────────────┤   │
│  │ Detects: Resources shared outside AWS account       │   │
│  │   • Public S3 buckets                                │   │
│  │   • Lambda with external access                      │   │
│  │   • IAM roles assumable externally                   │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

#### Security Documentation

**[Complete Security Architecture Guide →](docs/SECURITY.md)**

Topics covered:
- Security Layers (Defense in Depth)
- Incident Response Procedures
- Security Best Practices
- Compliance & Audit
- Monthly Security Checklist

**Cost:** $0.00/month (100% FREE-tier security stack)

---

## Getting Started

### Prerequisites

**Required Software:**
- **Terraform**: 1.5.0 or higher ([Download](https://www.terraform.io/downloads))
- **AWS CLI**: v2 ([Installation Guide](https://docs.aws.amazon.com/cli/latest/userguide/install-cliv2.html))
- **Node.js**: 20.x ([Download](https://nodejs.org/))
- **Git**: For version control

**AWS Account Requirements:**
- Personal AWS account (Free Tier eligible)
- AWS CLI configured with credentials:
  ```bash
  aws configure
  # Enter: Access Key ID, Secret Access Key, Region (eu-north-1 recommended)
  ```

**External Services (Optional but Recommended):**
- **Stripe Account** - For payment processing ([Sign up](https://stripe.com))
- **Resend Account** - For transactional emails ([Sign up](https://resend.com))
- **GitHub Account** - For CI/CD automation

### Quick Start (Local Development)

#### 1. Clone Repository

```bash
git clone https://github.com/AndySchlegel/Ecokart-Webshop.git
cd Ecokart-Webshop
```

#### 2. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your AWS credentials and configuration

# Run local development server
npm run dev

# Run tests
npm test

# Run tests with coverage
npm run test:coverage
```

#### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Set up environment variables
cp .env.local.example .env.local
# Edit .env.local with your API URL and Cognito configuration

# Run local development server
npm run dev
```

#### 4. Admin Frontend Setup

```bash
cd admin-frontend

# Install dependencies
npm install

# Set up environment variables
cp .env.local.example .env.local
# Edit .env.local with your API URL and Cognito configuration

# Run local development server
npm run dev
```

---

## Deployment

### Option A: Automated Deployment (Recommended)

**Prerequisites:**
- GitHub repository forked/cloned
- AWS OIDC provider configured (see [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md))
- GitHub Secrets configured

**Steps:**

1. **Configure GitHub Secrets** (Settings → Secrets and variables → Actions):
   ```
   Required Secrets:
   - STRIPE_SECRET_KEY (sk_test_... or sk_live_...)
   - STRIPE_WEBHOOK_SECRET (whsec_...)
   - JWT_SECRET (min. 32 characters)
   - RESEND_API_KEY (re_...)
   - GITHUB_ACCESS_TOKEN (for Amplify)
   ```

2. **Configure Terraform Variables**:
   - Edit `terraform/terraform.tfvars` with your configuration
   - Or use GitHub Actions variables

3. **Push to GitHub**:
   ```bash
   git add .
   git commit -m "feat: initial deployment"
   git push origin develop
   ```

4. **Monitor Deployment**:
   - Go to GitHub → Actions
   - Watch "Backend Tests", "Terraform Plan", "Terraform Apply"
   - Deployment takes ~15 minutes for full stack

5. **Verify Deployment**:
   - Check Terraform outputs for URLs
   - Visit customer shop: `https://shop.aws.his4irness23.de`
   - Visit admin dashboard: `https://admin.aws.his4irness23.de`

### Option B: Manual Deployment (Local)

**Steps:**

1. **Navigate to Terraform directory**:
   ```bash
   cd terraform
   ```

2. **Initialize Terraform**:
   ```bash
   terraform init
   ```

3. **Create terraform.tfvars**:
   ```hcl
   # terraform/terraform.tfvars
   aws_region   = "eu-north-1"
   project_name = "ecokart"
   environment  = "development"

   # Required secrets (use your actual values)
   jwt_secret             = "your-jwt-secret-min-32-chars"
   stripe_secret_key      = "sk_test_..."
   stripe_webhook_secret  = "whsec_..."
   resend_api_key         = "re_..."
   ses_sender_email       = "noreply@aws.his4irness23.de"

   # Amplify (optional)
   enable_amplify         = true
   github_repository      = "https://github.com/AndySchlegel/Ecokart-Webshop"
   github_access_token    = "ghp_..."

   # Custom Domains (optional)
   enable_custom_domain   = true
   domain_name            = "his4irness23.de"
   enable_route53         = true
   ```

4. **Plan Deployment**:
   ```bash
   terraform plan
   # Review planned changes
   ```

5. **Apply Infrastructure**:
   ```bash
   terraform apply
   # Type 'yes' to confirm
   # Wait ~15 minutes for complete deployment
   ```

6. **Note Outputs**:
   ```bash
   terraform output
   # Save URLs, IDs, etc.
   ```

### Post-Deployment Steps

1. **Configure Stripe Webhook**:
   ```bash
   # Get API Gateway URL from Terraform output
   terraform output api_gateway_url

   # In Stripe Dashboard → Developers → Webhooks:
   # - Add endpoint: https://your-api-url/api/webhooks/stripe
   # - Select events: checkout.session.completed
   # - Copy webhook signing secret to GitHub Secrets
   ```

2. **Verify Email Configuration** (Resend):
   - Check Resend Dashboard → Domains
   - Ensure domain is verified
   - Test email sending

3. **Create Admin User** (Cognito):
   ```bash
   aws cognito-idp admin-create-user \
     --user-pool-id <your-pool-id> \
     --username admin@example.com \
     --user-attributes Name=email,Value=admin@example.com Name=custom:role,Value=admin \
     --message-action SUPPRESS

   # Set password
   aws cognito-idp admin-set-user-password \
     --user-pool-id <your-pool-id> \
     --username admin@example.com \
     --password <your-password> \
     --permanent
   ```

4. **Test Complete Flow**:
   - Register as customer
   - Browse products
   - Add to cart
   - Checkout (use Stripe test card)
   - Verify order confirmation email
   - Login to admin dashboard
   - Verify order appears in admin panel

---

## Project Health

### Current Status

| Metric | Status | Details |
|--------|--------|---------|
| **Deployment** | ✅ Automated | GitHub Actions CI/CD |
| **Authentication** | ✅ Production-Ready | AWS Cognito JWT |
| **Payments** | ✅ Complete | Stripe Checkout + Webhooks |
| **Email Notifications** | ✅ Production-Ready | Resend (3k emails/month) |
| **Inventory Management** | ✅ Working | Reserved/Available stock tracking |
| **CloudWatch Monitoring** | ✅ Active | 9 alarms configured |
| **Unit Tests** | ✅ 63 passing | 60-69% coverage |
| **E2E Tests** | ✅ 63 passing | Jest + integration tests |
| **AWS Monthly Cost** | ✅ <$15 | Cost-optimized architecture |
| **Documentation** | ✅ Excellent | 39 documented learnings |
| **Last Deploy** | ✅ 2. Jan 2026 | Develop branch |

### Feature Completeness

**Core Features (100% Complete):**
- ✅ User Registration & Authentication (Cognito)
- ✅ Product Catalog with Stock Management
- ✅ Shopping Cart (persistent, DynamoDB-backed)
- ✅ Quantity Selector (stock-aware with warnings at 80% stock)
- ✅ Secure Checkout (Stripe integration)
- ✅ Order Management (webhook-driven)
- ✅ Email Notifications (Resend API with professional HTML templates)
- ✅ User Profile (personal info, order stats, favorites)
- ✅ Order History (complete order tracking for customers)
- ✅ Admin Dashboard (modern card-based UI with iOS-style navigation)
- ✅ Admin Analytics (7-day and 30-day views with trends)
- ✅ Stock Reservation System (prevent overselling)
- ✅ Security Monitoring (5 CloudWatch Alarms + daily compliance scans)
- ✅ CloudWatch Monitoring (9 alarms)

**Phase 2 Features (Completed):**
- ✅ Security Scanning (tfsec, Checkov, Trufflehog)
- ✅ Runtime Security Monitoring (CloudWatch + Lambda)
- ✅ Real-time Dashboard Analytics (7d and 30d views)
- ✅ Order History for Customers (My Orders page)
- ✅ User Profile Management
- ✅ Admin UI Redesign (modern card-based layout)
- ✅ Quantity Selector (pre-cart quantity selection)

**Future Enhancements (Nice-to-Have):**
- ⏳ E2E Testing (Playwright)
- ⏳ Product Search & Filtering (advanced)
- ⏳ PWA Features (Progressive Web App)
- ⏳ Product Reviews & Ratings
- ⏳ Wishlist Feature

---

## Cost Analysis

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
| **Cognito** | <50K MAUs | **FREE** |
| **Resend** | <3K emails/month | **FREE** |
| **Stripe** | Payment processing | Pay-per-transaction |
| **CloudWatch** | Logs + Alarms (9) | ~$1.00 |
| **Total** | | **~$10-15/month** |

### Free Tier Benefits (First 12 Months)

- **Lambda**: 1M requests/month FREE
- **DynamoDB**: 25 GB storage + 25 RCU/WCU FREE
- **S3**: 5 GB storage + 20K GET/2K PUT FREE
- **CloudFront**: 50 GB data transfer FREE
- **Cognito**: 50K MAUs FREE
- **API Gateway**: 1M API calls FREE

### Cost Optimization Strategies

- ✅ **Serverless** = Pay-per-use (no idle costs)
- ✅ **DynamoDB Provisioned** mode (cheaper than on-demand for steady traffic)
- ✅ **CloudFront Caching** (reduces origin requests)
- ✅ **S3 Lifecycle Policies** (delete old versions after 30 days)
- ✅ **No NAT Gateway** or EC2 instances
- ✅ **Resend Free Tier** (3K emails vs. SendGrid 100/day)

### Cost Monitoring

**CloudWatch Budget Alarm** (recommended):
```bash
# Set up a $20 budget alert
aws budgets create-budget \
  --account-id YOUR-ACCOUNT-ID \
  --budget file://budget.json \
  --notifications-with-subscribers file://notifications.json
```

**Pro Tip:** Use AWS Cost Explorer to track actual spending.

---

## Documentation

- **[Lessons Learned](docs/LESSONS_LEARNED.md)** - 39 documented learnings from implementation
- **[Development Guide](docs/DEVELOPMENT.md)** - Local development setup
- **[Security Policy](docs/SECURITY.md)** - Security architecture & vulnerability reporting
- **[DevSecOps Analysis](docs/DEVSECOPS_ANALYSIS.md)** - Security integration plan
- **[Mobile Readiness](docs/MOBILE_READINESS.md)** - PWA implementation guide
- **[Contributing Guidelines](CONTRIBUTING.md)** - How to contribute

---

## Lessons Learned

This project documents **39 real-world implementation challenges** and their solutions. Here are some highlights:

### Technical Insights

#### 1. Email Provider Rejections → Resend Migration

**Challenge:** AWS SES Production Access rejected, SendGrid account rejected

**Journey:**
- Submitted AWS SES Production Access Request (Case 176720597300389) - **REJECTED**
- Created SendGrid account - **REJECTED** (Ticket #24613906)
- User concern: "Mit negativer Schufa hat das nicht zu tun oder?" (Credit score concern)
- **Answer:** NO! Email providers check account age/reputation, NOT personal credit

**Solution:** Migrated to Resend (developer-friendly email service)

**Result:** Migration completed in **90 minutes** with zero downtime

**Learning:** Always have fallback options for critical external services. Email provider approvals are NOT guaranteed for new accounts.

[Full Story →](docs/LESSONS_LEARNED.md#learning-39)

---

#### 2. Lambda Template Loading Issue

**Challenge:** Lambda crashed on cold start with `ENOENT: no such file or directory`

**Root Cause:**
```
Error: Cannot find /var/task/templates/order-confirmation.html
```

TypeScript build (`tsc`) only compiles `.ts` → `.js`, doesn't copy `.html` templates.

**Solution:** Updated build script:
```json
{
  "scripts": {
    "build": "tsc && cp -r src/templates dist/"
  }
}
```

**Impact:** Lambda was crashing on init, causing ALL API requests to fail (shop showed no products).

**Learning:** Always verify non-code assets (templates, images, configs) are included in Lambda deployment packages.

---

#### 3. Terraform State Management

**Challenge:** Managing multi-environment infrastructure without state conflicts

**Solution:**
- Remote state in S3 with DynamoDB locking
- Branch-based deployments (develop → dev, main → prod)
- Terraform workspaces for environment isolation

**Learning:** Remote state is essential for team collaboration and prevents state corruption. Always use S3 + DynamoDB locking for production.

---

#### 4. Stripe Webhook Signature Verification

**Challenge:** Orders not being created after successful Stripe checkout

**Root Cause:**
```javascript
ERROR: Webhook signature verification failed
Error: No signatures found matching the expected signature
```

**Cause:** `STRIPE_WEBHOOK_SECRET` in Lambda didn't match secret in Stripe Dashboard (old vs. new).

**Solution:** Synchronized secrets in GitHub Secrets and redeployed.

**Learning:** Webhook secrets MUST match exactly. Always verify secrets after rotating them.

---

### DevOps Insights

#### 5. GitHub Actions OIDC > Long-Lived Credentials

**Challenge:** Storing AWS credentials in GitHub Secrets is a security risk

**Solution:** Implemented OpenID Connect (OIDC) for GitHub Actions
- No long-lived AWS credentials in GitHub
- Temporary credentials via IAM role assumption
- More secure, follows AWS best practices

**Learning:** OIDC is the modern way to authenticate CI/CD pipelines to cloud providers.

---

#### 6. Terraform Auto-Seeding for Reproducibility

**Challenge:** Manual database seeding breaks "100% Infrastructure as Code" promise

**Solution:** Created Terraform `null_resource` with `local-exec` provisioner:
```hcl
resource "null_resource" "seed_database" {
  provisioner "local-exec" {
    command = "node scripts/seed-database.js"
  }

  depends_on = [aws_dynamodb_table.products]
}
```

**Result:** Fresh AWS account → `terraform apply` → Fully functional shop with products!

**Learning:** Infrastructure as Code means EVERYTHING, including data seeding, should be automated.

---

[View All 39 Documented Learnings →](docs/LESSONS_LEARNED.md)

---

## Project Statistics

- **Development Duration**: 3 months (October 2025 - January 2026)
- **Lines of Code**: ~15,000 (TypeScript)
- **Terraform Modules**: 15
- **AWS Services Used**: 12 (Lambda, DynamoDB, Cognito, Amplify, Route53, CloudFront, S3, API Gateway, ACM, SES, CloudWatch, IAM)
- **Deployment Time**: ~15 minutes (full stack from scratch)
- **Documented Learnings**: 39
- **Unit Tests**: 63 (60-69% coverage)
- **Monthly Cost**: ~$10-15
- **Git Commits**: 200+
- **GitHub Actions Workflows**: 3 (backend tests, Terraform plan/apply, nuclear cleanup)

---

## Contributing

This is a portfolio project, but feedback and suggestions are welcome!

**Ways to Contribute:**
- 🐛 Report bugs or issues
- 💡 Suggest improvements
- 📝 Improve documentation
- ✨ Propose new features

**Contributing Process:**
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/your-feature`)
3. Make your changes
4. Commit with clear messages (`git commit -m "feat: add X"`)
5. Push to your fork (`git push origin feature/your-feature`)
6. Open a Pull Request

[📝 Full Contributing Guidelines →](CONTRIBUTING.md)

---

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## Author

**Andy Schlegel**
Cloud Engineer | Full-Stack Developer | DevOps Enthusiast

- 🌐 Blog: [blog.his4irness23.de](https://blog.his4irness23.de) *(launching March 2026)*
- 💼 LinkedIn: [Andy Schlegel](https://linkedin.com/in/andy-schlegel-4874852bb)
- 🐙 GitHub: [@AndySchlegel](https://github.com/AndySchlegel)
- ✉️ Email: andy.schlegel@chakademie.org

---

## Acknowledgments

- **AWS** for Free Tier program enabling learning
- **Terraform** by HashiCorp for Infrastructure as Code
- **Next.js** team for amazing React framework
- **Stripe** for developer-friendly payment API
- **Resend** for reliable email delivery
- **Carl-Frederic Nickell** for DevSecOps inspiration
- **Cloud Academy** for training and support

---

## Related Resources

### Official Documentation
- [AWS Lambda](https://docs.aws.amazon.com/lambda/)
- [AWS DynamoDB](https://docs.aws.amazon.com/dynamodb/)
- [Terraform AWS Provider](https://registry.terraform.io/providers/hashicorp/aws/latest/docs)
- [Next.js Documentation](https://nextjs.org/docs)
- [Stripe API](https://stripe.com/docs/api)

### Learning Resources
- [AWS Well-Architected Framework](https://aws.amazon.com/architecture/well-architected/)
- [Terraform Best Practices](https://www.terraform-best-practices.com/)
- [Next.js Best Practices](https://nextjs.org/docs/app/building-your-application/routing)

---

**Project Status:** ✅ Production-Ready (Phase 2 Complete!)
**Last Updated:** 21. Januar 2026
**Environment:** Development (Deployed)
**AWS Region:** eu-central-1 (Frankfurt)

**If this project helped you learn serverless architecture, Terraform, or full-stack development, consider starring the repository!**

---

### What's Next?

**Phase 2: Portfolio & Showcase Excellence** ✅ **COMPLETED!**

Completed Features:
- ✅ Security Scanning Integration (tfsec, Checkov, Trufflehog)
- ✅ Runtime Security Monitoring (CloudWatch + Lambda)
- ✅ Real-time Dashboard Analytics (7d and 30d views)
- ✅ Quantity Selector Implementation (stock-aware)
- ✅ Interactive Architecture Diagram (3-Tab Presentation)
- ✅ User Profile & Order History
- ✅ Admin UI Redesign (modern card-based layout)
- ✅ Resend Email Integration (professional HTML templates)

**Future Enhancements (Optional):**
- E2E Testing with Playwright
- PWA Implementation
- Advanced Product Search & Filtering

---

**Ready to deploy your own serverless e-commerce platform? Start with the [Getting Started](#getting-started) section!**
