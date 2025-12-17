# Nuclear Cleanup + Redeploy Test Checkliste 🧪

**Datum für Test:** 2025-12-18 (Morgen)
**Dauer (geschätzt):** ~30-45 Minuten
**Ziel:** 100% Reproduzierbarkeit validieren - Custom Domains bleiben stabil!

---

## 🎯 Test-Ziel

**Validieren, dass nach Nuclear Cleanup + Redeploy:**
1. ✅ Infrastructure wird komplett neu erstellt
2. ✅ Custom Domains bleiben erhalten
3. ✅ Custom Domain URLs funktionieren sofort
4. ✅ E2E Checkout funktioniert
5. ✅ Keine manuellen Schritte nötig

---

## ⚠️ VOR dem Test - Preparation Checklist

### 1. Backup erstellen

```bash
# Terraform State Backup
aws s3 cp s3://ecokart-terraform-state-805160323349/development/terraform.tfstate \
  ~/backups/terraform-state-backup-$(date +%Y%m%d-%H%M%S).tfstate

# Oder via AWS Console:
# S3 → ecokart-terraform-state-805160323349 → development/terraform.tfstate → Download
```

**WARUM:** Falls etwas schiefgeht, können wir State wiederherstellen!

### 2. Custom Domains dokumentieren (VORHER)

```bash
# Route53 Hosted Zone ID
aws route53 list-hosted-zones --query "HostedZones[?Name=='aws.his4irness23.de.'].Id" --output text
# → Notieren: Z0682311EOPCZ7ZQMOFP

# ACM Certificate ARN
aws acm list-certificates --region eu-central-1 --query "CertificateSummaryList[?DomainName=='api.aws.his4irness23.de'].CertificateArn" --output text
# → Notieren: arn:aws:acm:eu-central-1:805160323349:certificate/...

# DNS Check
dig +short api.aws.his4irness23.de
dig +short shop.aws.his4irness23.de
dig +short admin.aws.his4irness23.de
# → Notieren: IPs/CNAMEs VORHER
```

### 3. Screenshots machen

- [ ] **Vor Nuclear:**
  - AWS Console: Route53 Hosted Zone Details
  - AWS Console: ACM Certificates
  - Browser: Shop Frontend (funktioniert)
  - Stripe Dashboard: Webhook Events (200 OK)

**WARUM:** Vergleich VORHER/NACHHER!

### 4. E2E Test VORHER durchführen

- [ ] Shop öffnen: `https://shop.aws.his4irness23.de`
- [ ] Produkt in Warenkorb legen
- [ ] Checkout durchführen (Stripe Test Mode)
- [ ] Webhook empfangen (Check in Stripe Dashboard)
- [ ] Lagerbestand prüfen (sollte sich verringern)

**Status dokumentieren:** Alles funktioniert? Ja/Nein

---

## 🗑️ Phase 1: Nuclear Cleanup

### 1. Nuclear Cleanup Workflow starten

**Via GitHub Actions UI:**

1. Gehe zu: https://github.com/AndySchlegel/Ecokart-Webshop/actions/workflows/nuclear-cleanup.yml
2. Klicke: **"Run workflow"**
3. Inputs:
   - `confirm_nuclear`: Tippe `NUCLEAR`
   - `environment`: Wähle `development`
4. Klicke: **"Run workflow"**

**Via GitHub CLI:**

```bash
gh workflow run "Nuclear Cleanup - Infrastructure Only" \
  --repo AndySchlegel/Ecokart-Webshop \
  --field confirm_nuclear=NUCLEAR \
  --field environment=development
```

### 2. Workflow Logs überwachen

```bash
# Letzte Runs anzeigen
gh run list --repo AndySchlegel/Ecokart-Webshop --workflow "Nuclear Cleanup" --limit 1

# Logs live ansehen
gh run watch <RUN_ID> --repo AndySchlegel/Ecokart-Webshop
```

**Was du sehen solltest:**

```
✅ Amplify Apps deleted
✅ Lambda Functions deleted
✅ API Gateway REST APIs deleted
✅ API Gateway Custom Domain Mappings deleted
✅ Cognito User Pools deleted
✅ DynamoDB Tables deleted
✅ IAM Roles deleted (Infrastructure)
✅ CloudWatch Logs deleted
✅ CloudWatch Alarms deleted
⚠️  Terraform State wird NICHT gelöscht (Custom Domains geschützt!)
🔒 Custom Domain Protection: Active
   → Route53 Hosted Zones: PRESERVED
   → ACM Certificates: PRESERVED
   → DNS Records: PRESERVED
```

**WICHTIG:** Custom Domain Protection Step muss folgendes zeigen:
```
✅ Route53 Zone exists (will be PRESERVED)
✅ Found X ACM Certificate(s) (will be PRESERVED)
```

### 3. Nach Nuclear Cleanup - Validierung

**Check 1: Infrastructure gelöscht?**

```bash
# Amplify Apps (sollte LEER sein)
aws amplify list-apps --region eu-central-1 --query 'apps[*].name'
# → []

# Lambda Functions (sollte LEER sein)
aws lambda list-functions --region eu-central-1 --query 'Functions[?starts_with(FunctionName, `ecokart`)].FunctionName'
# → []

# DynamoDB Tables (sollte LEER sein)
aws dynamodb list-tables --region eu-central-1 --query 'TableNames[?starts_with(@, `ecokart`)]'
# → []
```

**Check 2: Custom Domains noch da?**

```bash
# Route53 Hosted Zone (sollte EXISTIEREN)
aws route53 list-hosted-zones --query "HostedZones[?Name=='aws.his4irness23.de.'].{Name:Name,Id:Id}"
# → Zone existiert ✅

# ACM Certificates (sollte EXISTIEREN)
aws acm list-certificates --region eu-central-1 | grep "his4irness23.de"
# → Certificates existieren ✅

# DNS Resolution (sollte funktionieren, aber IPs können anders sein)
dig +short api.aws.his4irness23.de
dig +short shop.aws.his4irness23.de
dig +short admin.aws.his4irness23.de
# → DNS funktioniert ✅ (IPs können temporär leer sein)
```

**Check 3: Frontend URLs - Expected Behavior**

```bash
# Shop & Admin sollten NICHT erreichbar sein (Amplify Apps gelöscht!)
curl -I https://shop.aws.his4irness23.de
# → Timeout oder 503 (OK - Amplify Apps weg)

curl -I https://admin.aws.his4irness23.de
# → Timeout oder 503 (OK - Amplify Apps weg)

# API sollte NICHT erreichbar sein (API Gateway gelöscht!)
curl -I https://api.aws.his4irness23.de
# → Timeout oder 503 (OK - API Gateway weg)
```

**✅ Expected State nach Nuclear:**
- Infrastructure: ❌ Gelöscht
- Custom Domains: ✅ Existieren
- URLs: ⏳ DNS Records existieren, aber zeigen ins Leere (OK!)

---

## 🚀 Phase 2: Redeploy Infrastructure

### 1. Deploy Workflow starten

**Via GitHub Actions UI:**

1. Gehe zu: https://github.com/AndySchlegel/Ecokart-Webshop/actions/workflows/deploy.yml
2. Klicke: **"Run workflow"**
3. Inputs:
   - `environment`: Wähle `development`
   - `destroy`: Wähle `false`
4. Klicke: **"Run workflow"**

**Via GitHub CLI:**

```bash
gh workflow run "Deploy Ecokart Infrastructure" \
  --repo AndySchlegel/Ecokart-Webshop \
  --ref develop \
  --field environment=development \
  --field destroy=false
```

### 2. Deployment Logs überwachen

```bash
gh run list --repo AndySchlegel/Ecokart-Webshop --workflow "Deploy Ecokart Infrastructure" --limit 1

gh run watch <RUN_ID> --repo AndySchlegel/Ecokart-Webshop
```

**Erwartete Dauer:** ~10-15 Minuten

**Was du sehen solltest:**

```
🔐 AWS Authentication: ✅
🏗️  Terraform Init: ✅
📋 Terraform Plan: ✅
   → Custom Domains: No changes (bereits vorhanden!)
   → Infrastructure: Will create (neue Ressourcen)
🚀 Terraform Apply: ✅
   → Lambda deployed
   → API Gateway deployed
   → DynamoDB created
   → Cognito created
   → Amplify Apps created
   → Custom Domain Mappings created
📦 Backend Build: ✅
📦 Frontend Builds: ✅ (Shop + Admin)
```

**KRITISCH:** Terraform Plan sollte zeigen:
```
Plan: X to add, 0 to change, 0 to destroy

Custom Domain Ressourcen sollten NICHT geändert werden!
→ aws_route53_zone.main: No changes
→ aws_acm_certificate.api: No changes
→ aws_route53_record.*: No changes
```

### 3. Nach Deployment - Sofort-Checks

**Check 1: Infrastructure erstellt?**

```bash
# Amplify Apps
aws amplify list-apps --region eu-central-1 --query 'apps[*].name'
# → ["ecokart-development-frontend", "ecokart-development-admin-frontend"]

# Lambda Functions
aws lambda list-functions --region eu-central-1 --query 'Functions[?starts_with(FunctionName, `ecokart`)].FunctionName'
# → ["ecokart-development-api"]

# DynamoDB Tables
aws dynamodb list-tables --region eu-central-1 --query 'TableNames[?starts_with(@, `ecokart`)]'
# → ["ecokart-products", "ecokart-users", "ecokart-carts", "ecokart-orders"]
```

**Check 2: Custom Domain Mappings aktiv?**

```bash
# API Gateway Custom Domain
aws apigateway get-domain-name --domain-name api.aws.his4irness23.de --region eu-central-1
# → Sollte Custom Domain Details zeigen ✅

# DNS Check (sollte auf neue API Gateway IPs zeigen)
dig +short api.aws.his4irness23.de
# → d-XXXXXXX.execute-api.eu-central-1.amazonaws.com ✅
```

---

## ✅ Phase 3: Validation & E2E Tests

### 1. DNS & SSL Validation

```bash
# DNS Resolution Test
echo "Testing DNS Resolution..."
dig +short api.aws.his4irness23.de
dig +short shop.aws.his4irness23.de
dig +short admin.aws.his4irness23.de

# SSL Certificate Test
echo "Testing SSL Certificates..."
curl -I https://api.aws.his4irness23.de 2>&1 | grep -E "HTTP/2|SSL"
curl -I https://shop.aws.his4irness23.de 2>&1 | grep -E "HTTP/2|SSL"
curl -I https://admin.aws.his4irness23.de 2>&1 | grep -E "HTTP/2|SSL"
```

**Expected Results:**
- ✅ DNS resolves to CloudFront/API Gateway IPs
- ✅ HTTPS responds with HTTP/2
- ✅ SSL Certificates valid

### 2. Frontend Connectivity Test

```bash
# API Gateway (sollte 404 oder 403 sein - OK, kein Root Endpoint)
curl -I https://api.aws.his4irness23.de
# → HTTP/2 404 ✅

# Shop (sollte 401 sein - Basic Auth)
curl -I https://shop.aws.his4irness23.de
# → HTTP/2 401 ✅

# Admin (sollte 401 sein - Basic Auth)
curl -I https://admin.aws.his4irness23.de
# → HTTP/2 401 ✅
```

### 3. Browser Tests

- [ ] **Shop Frontend:** `https://shop.aws.his4irness23.de`
  - [ ] Seite lädt (Basic Auth Username/Password eingeben)
  - [ ] Produkte werden geladen
  - [ ] Warenkorb funktioniert
  - [ ] Checkout Button funktioniert

- [ ] **Admin Frontend:** `https://admin.aws.his4irness23.de`
  - [ ] Seite lädt (Basic Auth)
  - [ ] Login funktioniert (Cognito)
  - [ ] Product Management sichtbar

### 4. E2E Checkout Test (KRITISCH!)

1. **Shop öffnen:**
   - URL: `https://shop.aws.his4irness23.de`
   - Basic Auth eingeben

2. **Produkt auswählen:**
   - Produkt in Warenkorb legen
   - Checkout starten

3. **Stripe Payment:**
   - Stripe Checkout öffnet
   - Test Card: `4242 4242 4242 4242`
   - Expiry: Any future date
   - CVC: Any 3 digits
   - Payment abschließen

4. **Webhook Validation:**
   - Stripe Dashboard öffnen: https://dashboard.stripe.com/webhooks
   - Letzte Events checken
   - **KRITISCH:** `checkout.session.completed` sollte `200 OK` sein!

5. **Backend Validation:**
   - DynamoDB Table `ecokart-products` checken
   - Lagerbestand sollte sich verringert haben
   - Order sollte in `ecokart-orders` existieren

**Test Result:** ✅ / ❌

---

## 📊 Success Criteria

### ✅ Test ERFOLGREICH wenn:

1. **Nuclear Cleanup:**
   - ✅ Infrastructure komplett gelöscht
   - ✅ Custom Domains erhalten geblieben
   - ✅ Terraform State für Custom Domains erhalten

2. **Redeploy:**
   - ✅ Deployment erfolgreich (~10-15 Min)
   - ✅ Custom Domains automatisch wiederverwendet (NO CHANGES!)
   - ✅ Keine manuellen Terraform Import Schritte nötig

3. **Validation:**
   - ✅ Alle 3 URLs erreichbar (HTTPS/SSL funktioniert)
   - ✅ DNS Resolution funktioniert
   - ✅ Frontend lädt Produkte (API Calls funktionieren)
   - ✅ E2E Checkout funktioniert (Stripe 200 OK)

### ❌ Test FEHLGESCHLAGEN wenn:

- ❌ Custom Domains wurden gelöscht
- ❌ DNS Resolution funktioniert nicht
- ❌ SSL Certificates invalid oder fehlen
- ❌ Terraform versucht, Custom Domains NEU zu erstellen (Konflikt!)
- ❌ E2E Checkout schlägt fehl

---

## 🔧 Troubleshooting - Falls etwas schiefgeht

### Problem 1: Terraform versucht Custom Domains zu löschen

**Symptom:**
```
Error: Error deleting Route53 Hosted Zone: operation error Route53
```

**Lösung:**
```hcl
# Lifecycle Protection ist aktiv → Terraform kann nicht löschen ✅
# Falls Error: Check lifecycle.prevent_destroy in:
# - terraform/modules/route53/main.tf
# - terraform/modules/custom-domain/main.tf
```

### Problem 2: Terraform will Custom Domains NEU erstellen

**Symptom:**
```
Error: Route53 Hosted Zone already exists
```

**Lösung:**
```bash
# Terraform State Import (falls State verloren ging)
terraform import 'module.route53[0].aws_route53_zone.main[0]' Z0682311EOPCZ7ZQMOFP
terraform import 'module.custom_domain[0].aws_acm_certificate.api' arn:aws:acm:...
```

### Problem 3: DNS Resolution funktioniert nicht

**Symptom:**
```bash
dig +short api.aws.his4irness23.de
# → (empty)
```

**Diagnose:**
```bash
# Check Route53 Records
aws route53 list-resource-record-sets --hosted-zone-id Z0682311EOPCZ7ZQMOFP | grep -A5 "api.aws"

# Check API Gateway Domain
aws apigateway get-domain-name --domain-name api.aws.his4irness23.de
```

**Lösung:**
- Warte 2-5 Minuten (DNS Propagation)
- Falls länger: Check ob Route53 Records existieren
- Falls Records fehlen: Terraform Apply nochmal durchführen

### Problem 4: Stripe Webhook 404 Error

**Symptom:**
```
Stripe Event: checkout.session.completed → 404
```

**Diagnose:**
```bash
# Check API Gateway Endpoint
curl -v https://api.aws.his4irness23.de/api/webhooks/stripe

# Check Lambda Logs
aws logs tail /aws/lambda/ecokart-development-api --follow
```

**Lösung:**
- Check Stripe Webhook URL: `https://api.aws.his4irness23.de/api/webhooks/stripe` (OHNE `/dev`!)
- Check Backend CORS Config
- Check Lambda Function deployed

---

## 📝 Test Results Template

**Test Date:** ___________
**Tester:** ___________

### Phase 1: Nuclear Cleanup
- [ ] Workflow started successfully
- [ ] Infrastructure deleted (Amplify, Lambda, DynamoDB, etc.)
- [ ] Custom Domains preserved (Route53, ACM)
- [ ] Custom Domain Protection step passed
- [ ] Duration: ___ minutes

### Phase 2: Redeploy
- [ ] Workflow started successfully
- [ ] Terraform Plan: Custom Domains NO CHANGES
- [ ] Terraform Apply: Infrastructure created
- [ ] No manual Import steps required
- [ ] Duration: ___ minutes

### Phase 3: Validation
- [ ] DNS Resolution works (all 3 domains)
- [ ] SSL Certificates valid
- [ ] Frontend URLs accessible (HTTPS)
- [ ] API calls work (Products load)
- [ ] E2E Checkout successful (Stripe 200 OK)
- [ ] Lagerbestand updated

### Overall Result
- [ ] ✅ SUCCESS - 100% Reproduzierbar!
- [ ] ❌ FAILED - Issues found (document below)

**Issues/Notes:**
```
_______________________________________________
_______________________________________________
_______________________________________________
```

---

## 🎓 Lessons Learned (Nach dem Test)

**Fülle dies NACH dem Test aus:**

**Was hat gut funktioniert:**
- _______________________________
- _______________________________

**Was hätte besser sein können:**
- _______________________________
- _______________________________

**Verbesserungsvorschläge:**
- _______________________________
- _______________________________

**Nächste Schritte:**
- _______________________________
- _______________________________

---

**Viel Erfolg beim Test! 🚀**

Nach erfolgreichem Test: Dokumentation in LESSONS_LEARNED.md aktualisieren!
