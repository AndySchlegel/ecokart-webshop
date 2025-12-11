# Ecokart E-Commerce Platform - Master Documentation

**Vollständige Referenz für Vortrag und Entwicklung**

Letzte Aktualisierung: 2025-11-03

---

## Inhaltsverzeichnis

1. [Projekt-Übersicht](#projekt-übersicht)
2. [Repository-Struktur](#repository-struktur)
3. [Architektur](#architektur)
4. [Deployment-Workflow](#deployment-workflow)
5. [Code-Highlights für Präsentation](#code-highlights-für-präsentation)
6. [Wichtige Konfigurationen](#wichtige-konfigurationen)
7. [Troubleshooting](#troubleshooting)
8. [Live-Demo Checkliste](#live-demo-checkliste)

---

## Projekt-Übersicht

### Was ist Ecokart?

Ecokart ist eine **vollständig serverlose E-Commerce-Plattform** auf AWS, die folgende Features bietet:

- **Customer Frontend**: Next.js 15 E-Commerce Shop (Amplify Hosting)
- **Admin Frontend**: Next.js 15 Admin-Panel (Amplify Hosting)
- **Backend API**: Express.js auf AWS Lambda (Serverless)
- **Datenbank**: DynamoDB (NoSQL)
- **Infrastructure as Code**: Terraform
- **CI/CD**: Vollständig automatisiert

### Technologie-Stack

| Komponente | Technologie | Hosting |
|------------|-------------|---------|
| Customer Frontend | Next.js 15 (SSR), TypeScript | AWS Amplify |
| Admin Frontend | Next.js 15 (SSR), TypeScript | AWS Amplify |
| Backend API | Express.js, TypeScript | AWS Lambda |
| API Gateway | REST API | AWS API Gateway |
| Datenbank | NoSQL | AWS DynamoDB |
| Authentifizierung | JWT | Lambda + DynamoDB |
| Infrastructure | Terraform | - |
| Node.js Runtime | v20.x | - |

### Projekt-Besonderheiten

✅ **ONE-CLICK Deployment**: `./deploy.sh` deployt alles
✅ **Automatisches DB Seeding**: 31 Produkte + Test-User werden automatisch erstellt
✅ **Zero Configuration**: GitHub Token wird in AWS Parameter Store gespeichert
✅ **Destroy & Rebuild**: Komplette Infrastruktur kann gelöscht und neu aufgebaut werden

---

## Repository-Struktur

```
Ecokart Webshop/
│
├── frontend/                      # Customer Shop (Next.js 15)
│   ├── src/
│   │   ├── app/                  # App Router (Next.js 15)
│   │   ├── components/           # React Components
│   │   ├── lib/                  # API Client, Utils
│   │   └── types/                # TypeScript Interfaces
│   ├── public/                   # Static Assets
│   ├── package.json
│   └── next.config.js
│
├── admin-frontend/               # Admin Panel (Next.js 15)
│   ├── src/
│   │   ├── app/                  # App Router (Next.js 15)
│   │   ├── components/           # Admin Components
│   │   └── lib/                  # API Client
│   ├── package.json
│   └── next.config.js
│
├── backend/                      # Express.js Backend (Lambda)
│   ├── src/
│   │   ├── index.ts             # Express App Entry Point
│   │   ├── lambda.ts            # Lambda Handler (serverless-http)
│   │   ├── routes/              # API Routes
│   │   │   ├── auth.ts          # /auth/*
│   │   │   ├── products.ts      # /products/*
│   │   │   ├── cart.ts          # /cart/*
│   │   │   ├── orders.ts        # /orders/*
│   │   │   └── users.ts         # /users/*
│   │   ├── services/            # Business Logic
│   │   │   ├── dynamodb/        # DynamoDB Client
│   │   │   ├── auth.ts          # JWT Auth Service
│   │   │   └── *.service.ts     # Domain Services
│   │   └── types/               # TypeScript Types
│   ├── scripts/
│   │   ├── migrate-to-dynamodb-single.js  # Product Migration
│   │   ├── create-test-user.js           # Demo User
│   │   └── create-admin-user.js          # Admin User
│   ├── dist/                    # Compiled TypeScript (tsc output)
│   ├── package.json
│   └── tsconfig.json
│
├── terraform/                    # Infrastructure as Code
│   ├── main.tf                  # Root Module (orchestriert alles)
│   ├── variables.tf             # Input Variables
│   ├── outputs.tf               # Output Values
│   │
│   ├── modules/                 # Wiederverwendbare Module
│   │   ├── dynamodb/            # DynamoDB Tabellen
│   │   │   ├── main.tf         # 4 Tabellen: products, users, carts, orders
│   │   │   ├── variables.tf
│   │   │   └── outputs.tf
│   │   │
│   │   ├── lambda/              # Lambda + API Gateway
│   │   │   ├── main.tf         # Lambda Function, Build, API Gateway
│   │   │   ├── iam.tf          # IAM Roles & Policies
│   │   │   ├── variables.tf
│   │   │   └── outputs.tf
│   │   │
│   │   ├── amplify/             # Amplify Hosting
│   │   │   ├── main.tf         # Amplify App, Branch, Basic Auth
│   │   │   ├── variables.tf
│   │   │   └── outputs.tf
│   │   │
│   │   └── seed/                # Database Seeding
│   │       ├── main.tf         # Auto-Seeding via local-exec
│   │       ├── variables.tf
│   │       └── README.md
│   │
│   └── examples/
│       └── basic/               # Deployment-Konfiguration
│           ├── main.tf          # Ruft Root Module auf
│           ├── terraform.tfvars.example  # Beispiel-Werte
│           └── connect-github.sh         # GitHub OAuth Helper
│
├── scripts/                      # Automation Scripts
│   ├── setup-automation.sh      # GitHub Token Setup
│   └── connect-github.sh        # GitHub OAuth Reconnect
│
├── docs/                         # Dokumentation
│   ├── CI_CD_AUTOMATION.md      # Automation-Konzept
│   ├── AMPLIFY_GITHUB_TOKEN.md  # GitHub Token Anleitung
│   ├── NEXT_STEPS.md            # Nach Deployment
│   └── SESSION_SUMMARY_2025-10-30.md  # Session-Notizen
│
├── deploy.sh                     # ONE-CLICK Deployment Script
├── DEPLOYMENT_QUICK_REFERENCE.md # Quick Reference
└── README.md                     # Projekt-README

```

### Wichtigste Dateien

| Datei | Beschreibung | Zeilen |
|-------|--------------|--------|
| `deploy.sh` | ONE-CLICK Deployment | 216 |
| `terraform/main.tf` | Root Terraform Modul | 209 |
| `terraform/modules/lambda/main.tf` | Lambda + API Gateway | 238 |
| `terraform/modules/seed/main.tf` | Database Seeding | 89 |
| `backend/src/lambda.ts` | Lambda Handler | ~30 |
| `backend/src/index.ts` | Express App | ~100 |

---

## Architektur

### High-Level Architektur

```
┌─────────────────────────────────────────────────────────────────┐
│                         AWS Cloud                                │
│                                                                   │
│  ┌────────────────┐          ┌────────────────┐                 │
│  │   Amplify      │          │   Amplify      │                 │
│  │   Customer     │          │   Admin        │                 │
│  │   Frontend     │          │   Frontend     │                 │
│  │  (Next.js 15)  │          │  (Next.js 15)  │                 │
│  └────────┬───────┘          └────────┬───────┘                 │
│           │                           │                          │
│           └───────────┬───────────────┘                          │
│                       │                                          │
│                       ▼                                          │
│           ┌───────────────────────┐                             │
│           │   API Gateway         │                             │
│           │   (REST API)          │                             │
│           └───────────┬───────────┘                             │
│                       │                                          │
│                       ▼                                          │
│           ┌───────────────────────┐                             │
│           │   Lambda Function     │                             │
│           │   (Express.js)        │                             │
│           │   Runtime: Node 20.x  │                             │
│           └───────────┬───────────┘                             │
│                       │                                          │
│                       ▼                                          │
│           ┌───────────────────────┐                             │
│           │   DynamoDB            │                             │
│           │   - products          │                             │
│           │   - users             │                             │
│           │   - carts             │                             │
│           │   - orders            │                             │
│           └───────────────────────┘                             │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘

                         ▲
                         │
                         │ Deploy via
                    Terraform CLI
                         │
                         │
                  ┌──────┴──────┐
                  │  Developer  │
                  │  Machine    │
                  └─────────────┘
```

### Request Flow

```
User Browser
    │
    ▼
Amplify Frontend (Next.js SSR)
    │
    ▼
API Gateway
    │
    ▼
Lambda (Express.js)
    │
    ▼
DynamoDB
```

### DynamoDB Schema

#### Products Table
```json
{
  "id": "string (UUID)",
  "name": "string",
  "price": "number",
  "category": "string",
  "imageUrl": "string",
  "description": "string"
}
```

#### Users Table
```json
{
  "id": "string (UUID)",
  "email": "string",
  "password": "string (bcrypt hashed)",
  "role": "user | admin",
  "createdAt": "string (ISO)"
}
```

#### Carts Table
```json
{
  "userId": "string (UUID)",
  "items": [
    {
      "productId": "string",
      "quantity": "number"
    }
  ]
}
```

#### Orders Table
```json
{
  "orderId": "string (UUID)",
  "userId": "string",
  "items": "array",
  "total": "number",
  "status": "pending | completed",
  "createdAt": "string (ISO)"
}
```

---

## Deployment-Workflow

### 1. Einmalige Vorbereitung (5 Minuten)

```bash
# 1. GitHub Token in AWS Parameter Store speichern
./scripts/setup-automation.sh

# Folge den Anweisungen:
# - Erstelle GitHub Token: https://github.com/settings/tokens
# - Permissions: repo (full)
# - Token wird in AWS Parameter Store gespeichert
```

### 2. Deployment (8-10 Minuten)

```bash
# ONE-CLICK Deployment
./deploy.sh
```

**Was passiert automatisch:**

1. ✅ **Token laden** (aus AWS Parameter Store)
2. ✅ **Terraform init** (Module laden)
3. ✅ **Dependencies bereinigen** (`rm -rf backend/node_modules`)
4. ✅ **DynamoDB erstellen** (4 Tabellen)
5. ✅ **Lambda bauen** (TypeScript kompilieren, npm ci)
6. ✅ **API Gateway konfigurieren** (REST API + Proxy Integration)
7. ✅ **Amplify Apps erstellen** (Customer + Admin Frontend)
8. ✅ **Basic Auth setzen** (`demo:<configured via Terraform>`, `admin:<configured via Terraform>`)
9. ✅ **DB Seeding** (31 Produkte, Demo-User, Admin-User)

### 3. GitHub OAuth verbinden (2 Minuten, nur beim ersten Mal)

```bash
# Automatisch nach Deployment:
# - AWS Console URLs werden angezeigt
# - Für jede App: "Reconnect repository" klicken
# - GitHub autorisieren
```

### 4. Destroy (für Live-Demo im Vortrag)

```bash
# Alles löschen
./deploy.sh destroy

# Danach: Neu deployen
./deploy.sh
```

---

## Code-Highlights für Präsentation

### 1. Lambda Handler - Serverless Express.js

**Datei:** `backend/src/lambda.ts`

```typescript
// Zeile 1-15
import serverless from 'serverless-http';
import app from './index';

// Lambda Handler: Konvertiert Express.js App zu Lambda Function
export const handler = serverless(app);
```

**Erklärung für Vortrag:**
- `serverless-http` macht Express.js Lambda-kompatibel
- Keine Änderungen am Express-Code nötig
- Handler nimmt API Gateway Events entgegen

---

### 2. Express.js App - Backend Entry Point

**Datei:** `backend/src/index.ts`

```typescript
// Zeile 1-30 (vereinfacht)
import express from 'express';
import cors from 'cors';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/auth', authRouter);
app.use('/products', productsRouter);
app.use('/cart', cartRouter);
app.use('/orders', ordersRouter);
app.use('/users', usersRouter);

// Health Check
app.get('/health', (req, res) => {
  res.json({ status: 'healthy' });
});

export default app;
```

**Erklärung für Vortrag:**
- Standard Express.js App
- Funktioniert lokal UND auf Lambda
- RESTful API mit klaren Routes

---

### 3. Terraform Root Module - Infrastruktur Orchestration

**Datei:** `terraform/main.tf` (Zeilen 44-87)

```hcl
# DynamoDB Module
module "dynamodb" {
  source = "./modules/dynamodb"

  project_name = var.project_name
  environment  = var.environment

  # DynamoDB Settings
  billing_mode              = var.dynamodb_billing_mode
  read_capacity             = var.dynamodb_read_capacity
  write_capacity            = var.dynamodb_write_capacity
  enable_point_in_time_recovery = var.enable_point_in_time_recovery

  tags = local.common_tags
}

# Lambda + API Gateway Module
module "lambda" {
  source = "./modules/lambda"

  project_name = var.project_name
  environment  = var.environment
  function_name = "${local.name_prefix}-api"

  # Lambda Configuration
  runtime     = var.lambda_runtime
  memory_size = var.lambda_memory_size
  timeout     = var.lambda_timeout
  source_path = "${path.module}/../backend"

  # Environment Variables
  environment_variables = {
    NODE_ENV   = "production"
    DB_TYPE    = "dynamodb"
    JWT_SECRET = var.jwt_secret
  }

  # API Gateway
  api_stage_name     = var.api_gateway_stage_name
  enable_access_logs = var.enable_api_gateway_access_logs

  tags = local.common_tags

  depends_on = [module.dynamodb]
}
```

**Erklärung für Vortrag:**
- **Modularer Aufbau**: Jede Komponente ist ein eigenes Modul
- **Abhängigkeiten**: Lambda wartet auf DynamoDB (`depends_on`)
- **Environment Variables**: JWT Secret wird sicher übergeben

---

### 4. Lambda Module - Build & Deploy

**Datei:** `terraform/modules/lambda/main.tf` (Zeilen 12-43)

```hcl
# TypeScript Build
resource "null_resource" "build_lambda" {
  triggers = {
    source_hash = sha256(join("", [
      for f in fileset(var.source_path, "src/**/*.ts") :
        filesha256("${var.source_path}/${f}")
    ]))
  }

  provisioner "local-exec" {
    command     = "npm ci && npm run build"
    working_dir = var.source_path
  }
}

# ZIP Package erstellen
data "archive_file" "lambda_zip" {
  type        = "zip"
  output_path = "${path.module}/builds/${var.function_name}.zip"
  source_dir  = var.source_path

  excludes = [
    ".git",
    "src",          # Nur dist/ wird deployed
    "*.md",
    "scripts"
  ]

  depends_on = [null_resource.build_lambda]
}
```

**Erklärung für Vortrag:**
- **Automatischer Build**: TypeScript → JavaScript kompiliert
- **Trigger**: Re-build nur bei Code-Änderungen (SHA256 Hash)
- **ZIP Package**: Nur Production Code + node_modules

---

### 5. API Gateway Proxy Integration

**Datei:** `terraform/modules/lambda/main.tf` (Zeilen 129-151)

```hcl
# Proxy Resource (/{proxy+})
resource "aws_api_gateway_resource" "proxy" {
  rest_api_id = aws_api_gateway_rest_api.api.id
  parent_id   = aws_api_gateway_rest_api.api.root_resource_id
  path_part   = "{proxy+}"
}

resource "aws_api_gateway_method" "proxy_method" {
  rest_api_id   = aws_api_gateway_rest_api.api.id
  resource_id   = aws_api_gateway_resource.proxy.id
  http_method   = "ANY"
  authorization = "NONE"
}

resource "aws_api_gateway_integration" "proxy_integration" {
  rest_api_id = aws_api_gateway_rest_api.api.id
  resource_id = aws_api_gateway_resource.proxy.id
  http_method = aws_api_gateway_method.proxy_method.http_method

  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = aws_lambda_function.api.invoke_arn
}
```

**Erklärung für Vortrag:**
- **{proxy+}**: Alle Pfade werden an Lambda weitergeleitet
- **ANY Method**: Alle HTTP-Methoden (GET, POST, PUT, DELETE)
- **AWS_PROXY**: Lambda übernimmt komplettes Request/Response Handling

---

### 6. Database Seeding - Automatische Test-Daten

**Datei:** `terraform/modules/seed/main.tf` (Zeilen 38-79)

```hcl
resource "null_resource" "seed_database" {
  count = var.enable_seeding ? 1 : 0

  depends_on = [var.depends_on_resources]

  provisioner "local-exec" {
    command = <<EOF
      set -e
      echo "🌱 Starting database seeding..."
      cd ${var.backend_path}

      # Install dependencies
      npm ci

      # Migrate products (31 Produkte)
      npm run dynamodb:migrate:single -- --region ${var.aws_region}

      # Create test user (<removed - use Cognito signup>)
      node scripts/create-test-user.js

      # Create admin user (<ADMIN_EMAIL from ENV>)
      node scripts/create-admin-user.js

      echo "✅ Database seeding completed!"
    EOF

    environment = {
      AWS_REGION = var.aws_region
    }
  }

  triggers = {
    timestamp = timestamp()  # Läuft bei jedem apply
  }
}
```

**Erklärung für Vortrag:**
- **Automatisch**: Nach jedem Deployment
- **31 Produkte**: Aus JSON-Datei importiert
- **Test-User**: `<removed - use Cognito signup> / <removed - use Cognito signup>`
- **Admin-User**: `<ADMIN_EMAIL from ENV> / <ADMIN_PASSWORD from ENV>`

---

### 7. Amplify Hosting - Next.js SSR

**Datei:** `terraform/modules/amplify/main.tf` (Zeilen 1-50)

```hcl
resource "aws_amplify_app" "frontend" {
  name        = var.app_name
  repository  = var.repository
  platform    = "WEB_COMPUTE"  # Next.js SSR Support!

  access_token = var.github_access_token

  # Build Specification
  build_spec = <<-EOT
    version: 1
    applications:
      - appRoot: ${var.monorepo_app_root}
        frontend:
          phases:
            preBuild:
              commands:
                - npm ci
            build:
              commands:
                - npm run build
          artifacts:
            baseDirectory: .next
            files:
              - '**/*'
          cache:
            paths:
              - node_modules/**/*
              - .next/cache/**/*
  EOT

  # Environment Variables
  environment_variables = var.environment_variables

  tags = var.tags
}

# Branch Configuration
resource "aws_amplify_branch" "main" {
  app_id      = aws_amplify_app.frontend.id
  branch_name = var.branch_name
  framework   = var.framework

  enable_auto_build = true

  # Basic Authentication
  enable_basic_auth     = var.basic_auth_enabled
  basic_auth_credentials = base64encode("${var.basic_auth_user}:${var.basic_auth_password}")
}
```

**Erklärung für Vortrag:**
- **WEB_COMPUTE**: Unterstützt Next.js 15 SSR (nicht nur SSG!)
- **Monorepo**: `appRoot` zeigt auf `frontend/` bzw `admin-frontend/`
- **Basic Auth**: Schutz für Demo-Umgebung
- **Auto-Deploy**: Bei jedem Git Push

---

### 8. ONE-CLICK Deploy Script

**Datei:** `deploy.sh` (Zeilen 72-100)

```bash
# Clean Backend Dependencies (prevent race condition)
echo -e "${YELLOW}🧹 Lösche alte Backend Dependencies...${NC}"
cd ../../..
rm -rf backend/node_modules
cd terraform/examples/basic
echo -e "${GREEN}✅ Dependencies bereinigt${NC}"

# Deploy
echo -e "${YELLOW}🚀 Deploye Infrastruktur...${NC}"
echo ""
echo "Das dauert ca. 8-10 Minuten. Folgendes wird automatisch gemacht:"
echo "  ✅ DynamoDB Tabellen erstellen"
echo "  ✅ Lambda Backend deployen"
echo "  ✅ API Gateway konfigurieren"
echo "  ✅ Amplify Apps erstellen"
echo "  ✅ Basic Auth setzen"
echo "  ✅ DynamoDB mit Produkten befüllen (31 Stück)"
echo "  ✅ Test-User erstellen (<removed - use Cognito signup>)"
echo "  ✅ Admin-User erstellen (<ADMIN_EMAIL from ENV>)"
echo ""

terraform apply -auto-approve
```

**Erklärung für Vortrag:**
- **Race Condition Fix**: `node_modules` MUSS vor Terraform gelöscht werden
- **Auto-Approve**: Keine manuelle Bestätigung nötig
- **Progress Feedback**: User sieht was passiert

---

## Wichtige Konfigurationen

### Environment Variables - Lambda

**Wo definiert:** `terraform/main.tf` (Zeile 76-80)

```hcl
environment_variables = {
  NODE_ENV   = "production"
  DB_TYPE    = "dynamodb"
  JWT_SECRET = var.jwt_secret
}
```

**JWT Secret setzen:**
```bash
# In terraform/examples/basic/terraform.tfvars
jwt_secret = "dein-super-sicheres-secret-mindestens-32-zeichen-lang"
```

### Environment Variables - Amplify Frontend

**Wo definiert:** `terraform/main.tf` (Zeile 126-128)

```hcl
environment_variables = {
  NEXT_PUBLIC_API_URL = module.lambda.api_gateway_url
}
```

### Basic Auth Credentials

**Customer Frontend:**
- User: `demo`
- Password: `<configured via Terraform>`

**Admin Frontend:**
- User: `admin`
- Password: `<configured via Terraform>`

**Wo definiert:** `terraform/examples/basic/main.tf` (Zeilen 13-16, 39-42)

---

## Troubleshooting

### Problem: "tsc: command not found"

**Ursache:** DevDependencies wurden nicht installiert

**Lösung:**
```bash
# In terraform/modules/lambda/main.tf
command = "npm ci && npm run build"  # RICHTIG (ohne --production=false)
```

### Problem: "esbuild binary corrupted"

**Ursache:** Race Condition - Lambda Build + DB Seeding laufen parallel

**Lösung 1:** `node_modules` vor Terraform löschen
```bash
# In deploy.sh (Zeile 77-78)
rm -rf backend/node_modules
```

**Lösung 2:** DB Seeding wartet auf Lambda Build
```bash
# In terraform/main.tf (Zeile 208)
depends_on_resources = [module.dynamodb, module.lambda]
```

### Problem: "GitHub OAuth not connected"

**Ursache:** GitHub Integration muss manuell autorisiert werden (AWS Platform-Limitation)

**Lösung:**
```bash
# Nach erstem Deployment:
./terraform/examples/basic/connect-github.sh

# Oder manuell in AWS Console:
# Amplify → App → Hosting environments → Reconnect repository
```

### Problem: "API Gateway 502 Bad Gateway"

**Ursache:** Lambda kann nicht mit DynamoDB kommunizieren

**Prüfen:**
1. IAM Role hat DynamoDB Permissions? → `terraform/modules/lambda/iam.tf`
2. Lambda Environment Variables gesetzt? → `terraform/main.tf` Zeile 76-80
3. DynamoDB Tabellen existieren? → AWS Console

---

## Live-Demo Checkliste

### Vor dem Vortrag

- [ ] AWS Credentials konfiguriert
- [ ] GitHub Token im Parameter Store gespeichert (`./scripts/setup-automation.sh`)
- [ ] Repository sauber (keine lokalen Änderungen)
- [ ] `./deploy.sh destroy` ausgeführt (Start von Null-Zustand)

### Während des Vortrags

**1. Repository-Struktur zeigen (2 Minuten)**
```bash
tree -L 2 -I 'node_modules|.next|dist'
```

**Highlights:**
- Monorepo: frontend, admin-frontend, backend
- Terraform Modules: modular, wiederverwendbar
- ONE-CLICK Script: `deploy.sh`

**2. Terraform Code zeigen (5 Minuten)**

Zeige:
- `terraform/main.tf`: Orchestriert alle Module
- `terraform/modules/lambda/main.tf`: Lambda Build Prozess
- `terraform/modules/seed/main.tf`: Database Seeding

**3. Live Deployment (8-10 Minuten)**
```bash
# ONE-CLICK Deployment
./deploy.sh

# Während es läuft, erklären:
# - Token wird aus Parameter Store geladen
# - node_modules wird bereinigt (Race Condition vermeiden)
# - Terraform baut Lambda (npm ci + tsc)
# - DynamoDB wird mit Daten befüllt
# - Amplify Apps werden erstellt
```

**4. GitHub OAuth verbinden (2 Minuten)**
```bash
# URLs werden vom Script angezeigt
# In AWS Console: "Reconnect repository" klicken
# GitHub autorisieren
```

**5. Ergebnis zeigen (3 Minuten)**

Zeige:
- Customer Frontend URL (Login: `<removed - use Cognito signup> / <removed - use Cognito signup>`)
- Admin Frontend URL (Login: `<ADMIN_EMAIL from ENV> / <ADMIN_PASSWORD from ENV>`)
- API Gateway URL (`/health` Endpoint testen)
- DynamoDB Tabellen in AWS Console

**6. Destroy demonstrieren (1 Minute)**
```bash
# Alles löschen
./deploy.sh destroy

# Erklären: Perfekt für Cleanup nach Demo/Testing
```

### Nach dem Vortrag

- [ ] `./deploy.sh destroy` ausführen (Kosten sparen)
- [ ] Feedback dokumentieren

---

## Anhang: Nützliche Commands

### Terraform

```bash
# Plan anzeigen (ohne Apply)
cd terraform/examples/basic
terraform plan

# Outputs anzeigen
terraform output

# Einzelne Resource neu erstellen
terraform taint module.ecokart.module.lambda.null_resource.build_lambda
terraform apply

# State anzeigen
terraform state list
```

### AWS CLI

```bash
# Lambda Logs anzeigen
aws logs tail /aws/lambda/ecokart-development-api --follow --region eu-north-1

# DynamoDB Scan
aws dynamodb scan --table-name ecokart-products --region eu-north-1

# Amplify Build Status
aws amplify list-jobs \
  --app-id <APP_ID> \
  --branch-name main \
  --region eu-north-1 \
  --max-items 1
```

### Backend Lokal testen

```bash
cd backend

# Dependencies installieren
npm ci

# TypeScript kompilieren
npm run build

# Lokal starten
npm run dev

# API testen
curl http://localhost:3000/health
```

---

## Wichtige Links

- **AWS Amplify Docs**: https://docs.aws.amazon.com/amplify/
- **Terraform AWS Provider**: https://registry.terraform.io/providers/hashicorp/aws/latest/docs
- **Next.js 15 Docs**: https://nextjs.org/docs
- **Express.js Docs**: https://expressjs.com/
- **DynamoDB Guide**: https://docs.aws.amazon.com/dynamodb/

---

**Ende der Master-Dokumentation**

Bei Fragen oder Problemen: Siehe `docs/` Ordner für detaillierte Einzelthemen.
