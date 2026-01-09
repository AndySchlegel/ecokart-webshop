# 🎤 Speaker Script - Portfolio-Präsentation

**Projekt:** AIR LEGACY - Serverless E-Commerce Platform
**Zeitraum:** November 2025 - Januar 2026
**Gesamtdauer:** ~8-12 Minuten (je nach Detail-Tiefe)

---

## 📋 Präsentations-Übersicht

```
Tab 1: Architecture Diagram (2-3 Min)  → High-Level Overview
Tab 2: Technical Details   (3-4 Min)  → Deep Dive in Architektur
Tab 3: Top 10 Lessons      (3-5 Min)  → Learnings & Growth
```

---

# 🏗️ TAB 1: Architecture Diagram (2-3 Minuten)

## Opening Statement

> "Ich möchte euch heute mein Portfolio-Projekt **AIR LEGACY** vorstellen - eine vollständige serverless E-Commerce-Platform auf AWS, die ich in den letzten 3 Monaten von einem Tutorial-Projekt zu einer production-ready Anwendung entwickelt habe."

## Diagram Walkthrough

### 1. Frontend Layer (30 Sek)

> "Die Architektur besteht aus **drei Hauptschichten**. Beginnen wir mit dem Frontend:"
>
> - **Zwei Next.js 14 Applikationen** auf AWS Amplify
> - **Customer Shop** unter shop.aws.his4irness23.de - öffentlich zugänglich
> - **Admin Dashboard** unter admin.aws.his4irness23.de - geschützt mit Basic Auth
> - Beide deployen **automatisch** bei Git Push via GitHub Integration

### 2. API Layer (45 Sek)

> "Das Herzstück ist die API-Schicht:"
>
> - **AWS API Gateway** als REST API Endpoint
> - **Lambda Function** mit Node.js/Express.js - ein kompletter Monolith mit **16 Endpoints**
> - **Cognito User Pool** für JWT-basierte Authentifizierung
> - Wichtig: **API Gateway Authorizer** validiert JWTs **vor** Lambda-Invocation
>   - Spart Kosten (ungültige Tokens kommen gar nicht erst zur Lambda)
>   - Reduziert Latency
>   - Defense in Depth

### 3. Data Layer (30 Sek)

> "Für die Datenschicht nutzen wir DynamoDB:"
>
> - **4 NoSQL Tables**: Products, Users, Carts, Orders
> - **Global Secondary Indexes** für effiziente Queries
>   - Beispiel: UserOrdersIndex für Order History
> - **On-Demand Pricing** in Development (~2.50 EUR/Monat)
> - **CloudFront + S3** für Produktbilder via CDN

### 4. External Services (20 Sek)

> "Zwei kritische externe Integrationen:"
>
> - **Stripe** für Zahlungen - Webhook-basierter Flow
> - **Resend** für Emails - nach AWS SES Ablehnung (dazu später mehr!)

### 5. Infrastructure (25 Sek)

> "Das Besondere: **100% Infrastructure as Code**"
>
> - **15 Terraform Module** - komplette Infrastruktur reproduzierbar
> - **GitHub Actions CI/CD** mit OIDC (keine AWS Keys!)
> - **Multi-Environment Setup**: Development, Staging, Production
> - Ein `terraform apply` und die komplette Infrastruktur steht!

## Closing für Tab 1

> "Das ist der High-Level Überblick. Im nächsten Tab schauen wir uns die **technischen Details** jeder Komponente genauer an."

---

# 🔧 TAB 2: Technical Details (3-4 Minuten)

## Opening

> "Jetzt tauchen wir tiefer ein - ich zeige euch die **konkreten AWS Services**, **Konfigurationen** und **Design-Entscheidungen**."

## Frontend Layer (40 Sek)

> "**Customer Shop** - hover für Details:"
>
> - Next.js 14 mit **Server-Side Rendering**
> - TypeScript + Tailwind CSS
> - Features: Product Browsing, Cart Persistence, Stripe Checkout
> - **Performance**: < 2s Page Load durch Global CDN
>
> "**Admin Dashboard**:"
>
> - Real-time Analytics mit **dynamischen Trend-Berechnungen**
> - Product CRUD Operations
> - Order Management, Customer Overview
> - **Security**: Basic Auth (Amplify-Level) + Cognito JWT (App-Level)

## API Layer (60 Sek)

> "**API Gateway**:"
>
> - REST API mit Custom Domain: api.aws.his4irness23.de
> - **Cognito Authorizer** - JWT Validation vor Lambda
> - **Rate Limiting**: 10k requests/second
> - SSL/TLS via ACM Certificate
>
> "**Lambda Backend**:"
>
> - Node.js 20 Runtime, 512 MB Memory
> - **Express.js Monolith** - 16 Endpoints:
>   - Products: GET, POST, PUT, DELETE
>   - Orders: GET, POST, GET by User
>   - Carts: GET, PUT
>   - Checkout: POST (Stripe Integration)
> - **Warum Monolith?** Einfacher Start, weniger Overhead, später easy zu splitten
>
> "**Cognito User Pool**:"
>
> - Email/Password Auth mit Email Verification
> - **Custom Attributes**: role (customer/admin)
> - JWT Tokens mit 1h Lifetime
> - Password Policy: Min 8 Zeichen, Upper+Lower+Numbers

## Data Layer (50 Sek)

> "**DynamoDB Tables** - hover für Schema-Details:"
>
> - **Products Table**: id (PK), name, price, **stock**, **reserved**
>   - Reserved-Field für Stock Reservation während Checkout!
> - **Orders Table**: orderId (PK) + **UserOrdersIndex** (GSI on userId)
>   - Ermöglicht effiziente User Order History Queries
> - **Carts Table**: userId (PK) - ein Cart pro User
> - **Users Table**: Cognito als Primary Auth, Table für App-Metadata
>
> "**S3 + CloudFront**:"
>
> - Private S3 Bucket für Produktbilder
> - **CloudFront CDN** mit Origin Access Identity
> - **Lifecycle Policy**: Alte Versions nach 30 Tagen löschen
> - Cache TTL: 30 Tage für Images (Performance!)

## Security Monitoring (40 Sek)

> "**Komplettes Security Setup** - und das bei **$0 Kosten**:"
>
> - **5 CloudWatch Alarms**:
>   - Unauthorized API Calls
>   - Root Account Usage
>   - IAM Policy Changes
>   - Console Sign-In Failures
>   - MFA Deactivation
> - **IAM Access Analyzer**: Scannt täglich nach external resource exposure
> - **Lambda Security Monitor**: Tägliche Compliance-Scans um 8 Uhr UTC
> - **SNS Email Alerts**: Sofort-Benachrichtigung bei Security Events
> - **Alles im FREE Tier!**

## Infrastructure (30 Sek)

> "**15 Terraform Module** - komplett modular:"
>
> - dynamodb, lambda, api-gateway, cognito, amplify, s3, cloudfront, ...
> - Jedes Modul: Eigene Inputs/Outputs, testbar, wiederverwendbar
> - **GitHub Actions Workflows**:
>   - Deploy: Automatic auf develop/staging/main
>   - Destroy: Manual mit Confirmation
>   - Nuclear Cleanup: Notfall-Workflow bei State Corruption
>
> "**Terraform State Management**:"
>
> - Remote State in S3 Bucket
> - **DynamoDB Lock Table** - verhindert parallele Applies
> - Versionierung aktiviert

## External Services (30 Sek)

> "**Stripe Integration**:"
>
> - Checkout Session mit redirect zu Stripe
> - **Webhook Handler** in Lambda
> - Signature Validation (Security!)
> - Idempotent - handled duplicate webhooks
>
> "**Resend Email API**:"
>
> - Ersetzt AWS SES (nach Production-Ablehnung)
> - **3,000 Emails/Monat FREE**
> - Order Confirmation Emails mit HTML Templates

## Project Statistics (20 Sek)

> "Abschließend die **Projekt-Metriken** - hover für Details:"
>
> - **15 Terraform Modules** - komplette IaC
> - **16 API Endpoints** - vollständige E-Commerce API
> - **4 DynamoDB Tables** - optimiertes Schema mit GSIs
> - **2 Amplify Apps** - Customer + Admin
> - **100% Serverless** - keine Server zu managen
> - **~15 EUR/Monat** - extrem kosteneffizient!

## Closing für Tab 2

> "Das war der Deep Dive in die Architektur. Jetzt zum spannendsten Teil: **Was habe ich auf diesem Weg gelernt?**"

---

# 💡 TAB 3: Top 10 Lessons Learned (3-5 Minuten)

## Opening

> "Die letzten 3 Monate waren eine **intensive Lernreise** - von Tutorial-Code zu Production-Ready. Hier sind meine **Top 10 Learnings**, chronologisch sortiert."

## PHASE 1: Initial Setup & Crisis Management

### Lesson 1: GitHub Actions OIDC (20 Sek)

> "**Lesson 1 - Eine frühe Security-Entscheidung:**
>
> Statt AWS Access Keys in GitHub Secrets zu speichern, habe ich direkt **GitHub OIDC** implementiert:
> - Keine Secrets, nur **15-Minuten Tokens**
> - Automatische Rotation
> - Wenn GitHub gehackt wird, kein AWS-Zugriff möglich
>
> Das war eine der **besten frühen Entscheidungen** - Security von Anfang an!"

### Lesson 2: Git Branching (15 Sek)

> "**Lesson 2 - Professional Workflow:**
>
> Anfangs hab ich direkt in `main` gepusht - **super riskant!**
>
> Dann: develop → staging → main Workflow
> - Develop zum Experimentieren
> - Staging für finale Tests
> - Main nur für Production
>
> **Verhindert Production-Ausfälle** - Standard in jedem professionellen Team."

### Lesson 3: State Corruption (25 Sek)

> "**Lesson 3 - Der schwerste Debugging-Tag:**
>
> Nach Architektur-Änderung war mein **Terraform State korrupt**.
> Terraform konnte Ressourcen nicht mehr zuordnen.
> **8 Stunden Debugging!**
>
> Die Lösung: **Nuclear Cleanup Workflow**
> - Alle AWS Ressourcen manuell löschen (via CLI)
> - State komplett resetten
> - Fresh Deployment
>
> Jetzt als **automatisierter Workflow** - wenn Terraform versagt, habe ich einen Backup-Plan!"

### Lesson 4: Amplify Webhook Permissions (20 Sek)

> "**Lesson 4 - IAM ist granular:**
>
> **8 Iterationen** bis die IAM Policy korrekt war!
>
> Das Problem: CreateWebhook braucht Permissions auf **APP-Ressource**,
> GetWebhook braucht Permissions auf **WEBHOOK-Ressource**
>
> **Zwei separate Statements** nötig. AWS Dokumentation war unclear.
> Trial & Error - aber dokumentiert!"

### Lesson 5: Cost Optimization (20 Sek)

> "**Lesson 5 - Business Value:**
>
> 3 identische Environments = **360 EUR/Monat**. Zu teuer!
>
> Meine Strategie:
> - Dev: 256 MB Lambda, On-Demand → **25 EUR**
> - Staging: 512 MB, Low Provisioned → **50 EUR**
> - Prod: 1024 MB, High Provisioned → **120 EUR**
>
> **45% Kosteneinsparung** durch Environment-Sizing!"

### Lesson 6: Frontend Token Bug (20 Sek)

> "**Lesson 6 - Das unsichtbare Problem:**
>
> Login funktionierte, Console zeigte "User logged in", Lambda Logs: "JWT validated"
> ABER: Cart Requests → **401 Unauthorized**
>
> Das Problem: Token wurde empfangen aber **nicht in localStorage gespeichert!**
> **12 Stunden Debugging** - Silent Failure, schwer zu finden.
>
> Learning: **State Management ist kritisch** bei Auth!"

---

## PHASE 2: Features & Integration

### Lesson 7: Stripe Webhook Handler (25 Sek)

> "**Lesson 7 - Payment Integration als Katalysator:**
>
> Stripe Webhook Implementation war **komplex**:
> - Async Flow: Customer → Stripe → Webhook Callback
> - Signature Validation (Secret-Sync!)
> - Cart Clear Bug (cart.id vs userId!)
>
> Aber: Diese Integration war der **Auslöser für Custom Domains**!
> Wollte professionelle URLs → Komplette Domain-Setup implementiert.
>
> Learning: **Features triggern oft größere Architektur-Verbesserungen!**"

### Lesson 8: Terraform Seed Module (20 Sek)

> "**Lesson 8 - Das übersehene Modul:**
>
> Nach hunderten Nuclear Cleanups: Database kam **immer mit Daten zurück!**
>
> Das Geheimnis: **Terraform Seed Module** mit `null_resource`
> - `timestamp()` Trigger → läuft bei **jedem Apply**
> - `local-exec` provisioner → npm run migrate
> - **100% automatisch** - keine manuellen Schritte!
>
> Learning: **Terraform ist mächtiger als gedacht** - Infrastructure UND Data!"

---

## PHASE 3: Production Crisis + Security

### Lesson 9: AWS SES Saga (30 Sek)

> "**Lesson 9 - Production Crisis Management:**
>
> **Timeline:**
> - SES in Sandbox → Nur verified emails
> - Production Access Request → **AWS REJECTED** (Case 176720597300389)
> - SendGrid versucht → Failed
> - **1 Stunde vor Demo** - keine Production Emails!
>
> Die Rettung: **Resend API**
> - In **90 Minuten** migriert
> - Lambda Code updated, getestet, deployed
> - **Zero Downtime**
>
> Learning: **Backup-Pläne sind essentiell** - AWS sagt nicht immer Ja!"

### Lesson 10: Security Scanning (25 Sek)

> "**Lesson 10 - Security Overhaul ganz am Ende:**
>
> Phase 3: **tfsec + Checkov** Integration für Security Scanning
>
> Ergebnis: **Stripe Webhook Secret geleakt** in Git History!
>
> Komplette Reaktion:
> - Secret sofort rotiert
> - CloudWatch Alarms implementiert (unauthorized calls, root usage, IAM changes)
> - IAM Access Analyzer
> - Lambda Security Monitor (täglich 8 Uhr UTC)
> - **Kosten: $0** (alles FREE tier!)
>
> Learning: **Security Scanning ist nicht optional** - findet Issues die man übersieht!"

---

## Closing Statement (30 Sek)

> "**Das waren meine Top 10 Learnings.**
>
> Von den ersten Schritten (OIDC, Branching) über Krisen (State Corruption, Token Bug)
> bis zu Production-Incidents (SES Migration) und finaler Security-Excellence.
>
> **Was habe ich mitgenommen?**
> - Professional Software Engineering ist **mehr als Code schreiben**
> - **Strukturierte Workflows** verhindern Fehler
> - **Best Practices existieren aus einem Grund**
> - **Dokumentation ist für mein zukünftiges Ich**
> - **Cost Optimization beginnt beim Design**
>
> Von Tutorial zu Production-Ready - **Mission accomplished!** 🎉"

---

## 🎯 Präsentations-Tipps

### Timing-Management

**Kurz-Version (6-8 Min):**
- Tab 1: 2 Min (nur Main Points)
- Tab 2: 2 Min (nur Frontend, API, Data Layer)
- Tab 3: 3 Min (Lessons 1, 3, 7, 9, 10)

**Standard-Version (8-10 Min):**
- Tab 1: 2.5 Min (alles wie oben)
- Tab 2: 3 Min (alle Sections kurz)
- Tab 3: 4 Min (alle 10 Lessons kurz)

**Detail-Version (10-12 Min):**
- Tab 1: 3 Min (mit Diagram-Interaction)
- Tab 2: 4 Min (mit Hover-Tooltips)
- Tab 3: 5 Min (alle Lessons mit Details)

### Interaktion mit UI

**Tab 1 (Diagram):**
- Zeige mit Cursor den **Flow**: Customer → API Gateway → Lambda → DynamoDB
- Highlighte **Critical Paths**: Payment Flow, Auth Flow

**Tab 2 (Technical Details):**
- **Hover über Service Cards** für Tooltips
- Zeige **konkrete Zahlen**: 16 Endpoints, 4 Tables, etc.
- Scroll langsam durch Sections

**Tab 3 (Lessons):**
- Betone die **Phase-Kategorien** (Phase 1, 2, 3)
- Highlighte **Impact Badges** bei wichtigen Lessons
- Zeige **chronologische Progression**

### Storytelling-Elemente

**Emotionen einbauen:**
- Lesson 3: "8 Stunden Debugging - das war ein **schwarzer Tag**"
- Lesson 6: "12 Stunden für einen **unsichtbaren Bug**"
- Lesson 9: "1 Stunde vor Demo - **Panik-Modus**"

**Erfolge feiern:**
- Lesson 1: "Eine der **besten frühen Entscheidungen**"
- Lesson 8: "Das **übersehene Modul** - mind blown!"
- Lesson 10: "**$0 Kosten** für komplette Security!"

**Humor einstreuen:**
- "Hunderte Nuclear Cleanups - ich bin Experte im Zerstören geworden!"
- "AWS SES hat mich abgelehnt - wie ein Tinder-Date!"

### Fragen antizipieren

**Häufige Fragen:**

**Q: Warum Monolith statt Microservices?**
> "Gute Frage! Monolith war **bewusste Entscheidung**:
> - Einfacher Start, weniger Overhead
> - Für E-Commerce-Scope völlig ausreichend
> - Später easy zu splitten wenn nötig (z.B. Order Service separieren)
> - **Premature Optimization ist anti-pattern!**"

**Q: Warum DynamoDB statt RDS?**
> "Serverless-First Approach:
> - DynamoDB **skaliert automatisch**
> - **On-Demand Pricing** - nur zahlen was ich nutze
> - Keine Server zu managen
> - NoSQL passt gut für E-Commerce (flexible Schema)
> - Learning: **Wollte NoSQL Experience sammeln**"

**Q: Was waren die größten Herausforderungen?**
> "**Top 3:**
> 1. Terraform State Corruption (8h) - tiefes Terraform-Verständnis nötig
> 2. Frontend Token Bug (12h) - Silent Failures sind die schlimmsten
> 3. SES Migration unter Zeitdruck (90min) - Crisis Management!
>
> Alle drei haben mich am meisten wachsen lassen!"

**Q: Was würdest du anders machen?**
> "**Learnings für nächstes Mal:**
> - Security Scanning **von Anfang an** (nicht erst Phase 3)
> - Remote State **sofort** (nicht erst nach erstem State-Problem)
> - Mehr **Unit Tests** (hab mich zu sehr auf Integration Tests verlassen)
> - **Monitoring früher** (nicht erst am Ende)"

---

## 🎬 Übungs-Checkliste

Vor der Präsentation:

- [ ] Script 2-3x durchlesen
- [ ] Laut üben (Timing checken)
- [ ] Alle Links testen (shop.aws, admin.aws)
- [ ] Hover-Tooltips durchgehen
- [ ] Tab-Switching flüssig üben
- [ ] Backup: Screenshots falls Live-Demo crasht
- [ ] Fragen-Antworten vorbereiten
- [ ] Emotionale Highlights üben (Betonung!)

**Viel Erfolg! 🚀**
