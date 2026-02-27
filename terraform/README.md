# Ecokart AWS Infrastructure - Terraform Module

Dieses Terraform-Modul deployt die komplette AWS-Infrastruktur für den Ecokart E-Commerce Webshop.

## 📋 Inhaltsverzeichnis

- [Übersicht](#übersicht)
- [Architektur](#architektur)
- [Voraussetzungen](#voraussetzungen)
- [Schnellstart](#schnellstart)
- [Module](#module)
- [Troubleshooting](#troubleshooting)
- [Weiterführende Dokumentation](#weiterführende-dokumentation)

---

## 🎯 Übersicht

Das Terraform-Modul erstellt automatisch folgende AWS-Ressourcen:

### Backend (Serverless)
- **4 DynamoDB Tabellen** für Products, Users, Carts, Orders
- **Lambda Function** mit Node.js 20.x für die Backend-API
- **API Gateway** (REST) als öffentlicher Endpoint
- **IAM Rollen** mit Least-Privilege Permissions

### Frontend (SSR)
- **AWS Amplify (Customer Frontend)** für Next.js Server-Side Rendering
- **AWS Amplify (Admin Frontend)** - Separate App für Admin-Dashboard
- **Automatisches Deployment** bei Git Push
- **Automatischer Initial Build** - KEIN manuelles Klicken mehr!
- **CloudFront CDN** (managed by Amplify)
- **Basic Authentication** (optional, für Demo-Umgebungen)

---

## 🏗️ Architektur

```
┌─────────────────────────────────────────────────────────────────┐
│                         AWS Cloud                               │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  CloudFront (CDN)                                        │  │
│  │  ↓                                                       │  │
│  │  AWS Amplify (Next.js SSR)                              │  │
│  │  • Platform: WEB_COMPUTE                                │  │
│  │  • Auto-Deploy von GitHub                               │  │
│  │  • Environment: NEXT_PUBLIC_API_URL                     │  │
│  └──────────────────────────────────────────────────────────┘  │
│                          ↓                                      │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  API Gateway (REST)                                      │  │
│  │  • Stage: Prod                                           │  │
│  │  • CORS enabled                                          │  │
│  └──────────────────────────────────────────────────────────┘  │
│                          ↓                                      │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Lambda Function (Node.js 20.x)                          │  │
│  │  • Express.js via serverless-http                        │  │
│  │  • 512 MB Memory, 30s Timeout                            │  │
│  │  • Environment: JWT_SECRET, DB_TYPE                      │  │
│  └──────────────────────────────────────────────────────────┘  │
│                          ↓                                      │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  DynamoDB Tables                                         │  │
│  │  ┌────────────────┬────────────────────────────────────┐ │  │
│  │  │ Products       │ PK: id, GSI: CategoryIndex        │ │  │
│  │  │ Users          │ PK: id, GSI: EmailIndex           │ │  │
│  │  │ Carts          │ PK: userId                        │ │  │
│  │  │ Orders         │ PK: id, GSI: UserOrdersIndex      │ │  │
│  │  └────────────────┴────────────────────────────────────┘ │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

---

## ✅ Voraussetzungen

### 1. Software installiert
- **Terraform** >= 1.5.0 ([Download](https://www.terraform.io/downloads))
- **AWS CLI** >= 2.0 ([Download](https://aws.amazon.com/cli/))
- **Node.js** >= 20.x ([Download](https://nodejs.org/))
- **Git** ([Download](https://git-scm.com/))

### 2. AWS Account Setup
- AWS Account mit Administrator-Rechten
- AWS SSO konfiguriert (oder Access Keys)
- Region: `eu-north-1` (Stockholm) empfohlen

### 3. GitHub Personal Access Token
- Token mit `repo` Scope erstellt
- Siehe: [docs/AMPLIFY_GITHUB_TOKEN.md](../docs/AMPLIFY_GITHUB_TOKEN.md)

### 4. Backend Dependencies
```bash
cd backend
npm install
npm run build
```

---

## 🚀 Schnellstart

> **NEU:** Vollautomatisches Deployment ohne manuelles Klicken!
> Siehe detaillierte Anleitung: **[docs/AUTOMATED_DEPLOYMENT.md](../docs/AUTOMATED_DEPLOYMENT.md)**

### Komplettes Deployment in 5 Schritten (~5-8 Minuten)

```bash
# 1. AWS SSO Login
aws sso login --profile Teilnehmer-805160323349

# 2. Terraform initialisieren
cd terraform/examples/basic
terraform init

# 3. Konfiguration anpassen
cp terraform.tfvars.example terraform.tfvars
nano terraform.tfvars
# → jwt_secret und github_access_token eintragen

# 4. Infrastruktur deployen (5-8 Minuten, VOLLAUTOMATISCH!)
terraform apply -auto-approve

# 5. Daten migrieren (30 Sekunden)
cd ../../../backend
npm run dynamodb:migrate:single -- --region eu-north-1
node scripts/create-test-user.js

# ✅ FERTIG! Frontend läuft auf Amplify URL
```

**Test:**
```bash
# API testen
curl https://YOUR_API_ID.execute-api.eu-north-1.amazonaws.com/Prod/api/products

# Frontend öffnen
open https://main.YOUR_APP_ID.amplifyapp.com
# Login: <removed - use Cognito signup> / <removed - use Cognito signup>
```

---

## 🔄 Destroy & Re-Deploy (Reproduzierbarkeit)

```bash
# Alles löschen (2-3 Minuten)
cd terraform/examples/basic
terraform destroy -auto-approve

# Neu deployen (5-7 Minuten)
terraform apply -auto-approve

# Daten wiederherstellen (30 Sekunden)
cd ../../../backend
npm run dynamodb:migrate:single -- --region eu-north-1
node scripts/create-test-user.js

# ✅ Identischer Stand wiederhergestellt!
```

**Zeitaufwand:** 8-12 Minuten total

---

## 📦 Module

### Root Module (`terraform/`)
Orchestriert alle Sub-Module und erstellt die komplette Infrastruktur.

**Hauptdateien:**
- `main.tf` - Module-Orchestrierung
- `variables.tf` - Eingabe-Variablen (30+)
- `outputs.tf` - Ausgabe-Werte (URLs, Namen, etc.)
- `versions.tf` - Provider-Versionen

### DynamoDB Module (`modules/dynamodb/`)
Erstellt 4 DynamoDB-Tabellen mit korrekten Schemas und Indizes.

**Tabellen:**
```
ecokart-products:
  - Partition Key: id (String)
  - GSI: CategoryIndex (category)

ecokart-users:
  - Partition Key: id (String)
  - GSI: EmailIndex (email)

ecokart-carts:
  - Partition Key: userId (String)

ecokart-orders:
  - Partition Key: id (String)
  - GSI: UserOrdersIndex (userId + createdAt)
```

### Lambda Module (`modules/lambda/`)
Deployt Backend-API als Lambda Function mit API Gateway.

**Features:**
- Automatischer TypeScript-Build via `null_resource`
- ZIP-Packaging mit korrekten Dependencies
- API Gateway mit Proxy-Integration (`/{proxy+}`)
- CloudWatch Logs (Retention: 7 Tage)
- IAM-Rolle mit DynamoDB CRUD-Permissions

### Amplify Module (`modules/amplify/`)
Deployt Next.js Frontends mit Server-Side Rendering.

**Wird zweimal verwendet:**
1. Customer Frontend (`frontend/`)
2. Admin Frontend (`admin-frontend/`)

**Konfiguration:**
- Platform: `WEB_COMPUTE` (für SSR, nicht Static)
- Monorepo: `AMPLIFY_MONOREPO_APP_ROOT` Variable
- Build Spec: Applications-Array Format
- Auto-Deploy bei Git Push auf `main`
- **NEU:** Automatischer Initial Build via `null_resource`

**Wichtige Features:**
- ✅ **Automatische GitHub-Verbindung** via Access Token
- ✅ **Automatischer Initial Build** - kein manuelles Klicken!
- ✅ Separate Apps für Customer + Admin Frontend
- ✅ Environment Variables via Terraform gesetzt
- ✅ Basic Auth via base64-encoded credentials

**Wichtige Learnings:**
- ⚠️ **KEINE Custom Rules** bei SSR (würde Routing brechen)
- ⚠️ Custom Headers auskommentiert (verursacht Save-Error)
- ✅ `null_resource` mit `local-exec` für Build-Trigger
- ✅ `depends_on` für korrekte Reihenfolge

---

## 🐛 Troubleshooting

### DynamoDB: BatchWriteItem denied

**Problem:** SCP (Service Control Policy) blockiert BatchWriteItem

**Lösung:** Verwende `migrate:single` Skript mit PutCommand
```bash
npm run dynamodb:migrate:single -- --region eu-north-1
```

### Amplify: Monorepo Build Error

**Problem:** "Monorepo spec provided without 'applications' key"

**Lösung:** ✅ Bereits im Terraform gefixt
- Build Spec nutzt `applications` Array
- `AMPLIFY_MONOREPO_APP_ROOT` Environment Variable gesetzt

### Amplify: 404 auf Homepage

**Problem:** Custom Rules redirecten zu `/index.html`

**Lösung:** ✅ Bereits im Terraform gefixt
- Custom Rules wurden entfernt
- Next.js SSR handled Routing selbst

---

## 📚 Weiterführende Dokumentation

- **[../docs/AUTOMATED_DEPLOYMENT.md](../docs/AUTOMATED_DEPLOYMENT.md)** - ⭐ **NEU:** Vollautomatisches Deployment
- **[../docs/DEPLOYMENT.md](../docs/DEPLOYMENT.md)** - Detaillierte Deployment-Dokumentation
- **[../docs/AMPLIFY_GITHUB_TOKEN.md](../docs/AMPLIFY_GITHUB_TOKEN.md)** - GitHub Token erstellen
- **[./DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)** - Legacy Deployment Guide

---

**Letzte Aktualisierung:** 31. Oktober 2025
**Terraform Version:** >= 1.5.0
**AWS Provider Version:** ~> 5.0

## ⭐ Was ist neu?

### Version 2.0 (31. Oktober 2025)

**Vollautomatisches Deployment:**
- ✅ Automatischer Initial Build für Amplify (kein Klicken mehr!)
- ✅ Admin Frontend als separate Amplify App
- ✅ `null_resource` mit `local-exec` für Build-Trigger
- ✅ Beide Frontends werden automatisch deployed und gebaut

**Neue Features:**
- Admin Frontend Deployment (`enable_admin_amplify`)
- Automatische GitHub-Verbindung via Token
- Zero-Click Deployment - nur `terraform apply` nötig
- Verbesserte Outputs mit Admin-URLs
