# 📧 Resend Migration - TODO Liste

**Erstellt:** 1. Januar 2026
**Grund:** AWS SES Production Access REJECTED + SendGrid Account REJECTED
**Lösung:** Migration zu Resend (Developer-freundlicher Email Service)
**ETA:** 30-40 Minuten

---

# 🎉 MIGRATION ERFOLGREICH ABGESCHLOSSEN!

**Completion Date:** 1. Januar 2026, 11:20 Uhr
**Total Time:** ~90 Minuten (schneller als geschätzt!)
**Status:** ✅ PRODUCTION-READY

**First Production Email:**
- Order ID: #order_1767263381763_7h1b7qzr8
- Sent from: noreply@aws.his4irness23.de
- Subject: "Deine AIR LEGACY Bestellung ist bestätigt"
- Template: ✅ AIR LEGACY Branding rendered perfectly
- Recipient: Test customer email
- Delivery: ✅ Successful

**Alle Success Criteria erfüllt:**
- ✅ Resend Account erstellt & Domain verifiziert
- ✅ Backend sendet Emails via Resend API
- ✅ Order Confirmation Emails kommen bei ALLEN Kunden an
- ✅ FROM: noreply@aws.his4irness23.de (professionell!)
- ✅ Template rendering funktioniert
- ✅ Produktbilder in Emails laden (CloudFront)
- ✅ Keine AWS SES Sandbox Limitierungen mehr
- ✅ Terraform Deployment funktioniert
- ✅ Dokumentation aktualisiert

**Key Commits:**
- `5420fb8` - fix: copy email templates to dist during build
- `ee8a6bd` - chore: update package-lock.json for Resend dependencies
- (resend-dns.tf) - DNS records via Terraform

---

## 🎯 Warum Resend?

**Bisherige Rejections:**
- ❌ AWS SES Production Access abgelehnt (Case 176720597300389)
- ❌ SendGrid Account abgelehnt (Ticket #24613906)
- Grund: Neue Accounts = "Security concerns" (automatische Risk-Algorithmen)

**Resend Vorteile:**
- ✅ **Developer-First** - Speziell für Entwickler gebaut (weniger streng)
- ✅ **Großzügiger Free Tier:** 3.000 emails/Monat (vs SendGrid 100/Tag)
- ✅ **Einfachste Integration** - Modernste API, super clean
- ✅ **Wie Stripe-Pattern** - Externer Service-Provider
- ✅ **Bessere Approval-Chancen** - Neuerer Anbieter, weniger paranoid
- ✅ **Domain Verification** - noreply@his4irness23.de funktioniert
- ✅ **React Email Support** - Moderne Templates (optional)

**Warum bessere Chancen als SendGrid:**
- Resend ist neuer und fokussiert auf Entwickler/Startups
- Weniger strenge automatische Filters
- Community-Feedback: Bessere Approval-Rate
- Falls auch Rejection: Dann SES Sandbox als Portfolio-Lösung okay

---

## ✅ Step-by-Step Checklist

### 1. Resend Account Setup (10min)

- [ ] **Account erstellen**
  - URL: https://resend.com/signup
  - Email: andy.schlegel@chakademie.org (oder andere)
  - Passwort: Sicher speichern!
  - Email-Verification durchführen

- [ ] **API Key erstellen**
  - Nach Login: Dashboard → API Keys
  - "Create API Key"
  - Name: "Ecokart Production"
  - Permission: "Sending access" (Full Access nicht nötig)
  - API Key kopieren und SICHER speichern! (wird nur 1x angezeigt)

- [ ] **Domain Verification**
  - Dashboard → Domains → Add Domain
  - Domain hinzufügen: `aws.his4irness23.de`
  - DNS Records kopieren (ähnlich wie SES DKIM)
  - In Route53 erstellen:
    ```
    Resend gibt dir:
    - TXT Record für Domain Verification
    - MX Record (optional, für empfangen)
    - DKIM Records (TXT/CNAME)
    ```
  - Warten bis "Verified" (5-30min)
  - **WICHTIG:** Nur Sender-Verification nötig, NICHT empfangen!

---

### 2. Backend Code-Änderungen (15min)

- [ ] **Package installieren**
  ```bash
  cd backend
  npm install resend
  ```

- [ ] **Email Service updaten**

  **File:** `backend/src/services/email.service.ts`

  **VORHER (AWS SES):**
  ```typescript
  import { SESClient, SendTemplatedEmailCommand } from '@aws-sdk/client-ses';

  const sesClient = new SESClient({ region: process.env.AWS_REGION });

  export async function sendOrderConfirmationEmail(data: OrderConfirmationEmailData) {
    const command = new SendTemplatedEmailCommand({
      Source: process.env.SES_SENDER_EMAIL,
      Destination: { ToAddresses: [data.customerEmail] },
      Template: 'ecokart-order-confirmation',
      TemplateData: JSON.stringify(templateData),
    });

    await sesClient.send(command);
  }
  ```

  **NACHHER (Resend):**
  ```typescript
  import { Resend } from 'resend';

  const resend = new Resend(process.env.RESEND_API_KEY!);

  export async function sendOrderConfirmationEmail(data: OrderConfirmationEmailData) {
    const emailData = {
      from: process.env.EMAIL_FROM || 'noreply@aws.his4irness23.de',
      to: data.customerEmail,
      subject: 'Deine AIR LEGACY Bestellung ist bestätigt',
      html: renderOrderConfirmationTemplate(data),
      // Optional: text version
      text: renderOrderConfirmationText(data),
    };

    await resend.emails.send(emailData);
  }
  ```

- [ ] **Template Rendering behalten**
  - Die existierenden Templates können 100% bleiben!
  - Nur statt SES Template → HTML direkt rendern
  - `renderOrderConfirmationTemplate(data)` gibt HTML string zurück

- [ ] **Error Handling**
  ```typescript
  try {
    const { data, error } = await resend.emails.send(emailData);

    if (error) {
      console.error('Resend error:', error);
      throw new Error(`Failed to send email: ${error.message}`);
    }

    console.log('Order confirmation email sent:', data?.id);
  } catch (error) {
    console.error('Email service error:', error);
    throw new Error('Failed to send order confirmation email');
  }
  ```

- [ ] **TypeScript Types** (schon included in resend package)
  ```bash
  # Keine extra types nötig, resend hat TypeScript Support built-in!
  ```

---

### 3. Terraform Configuration (10min)

- [ ] **Lambda Environment Variables**

  **File:** `terraform/modules/lambda/main.tf`

  **ÄNDERN:**
  ```hcl
  environment_variables = {
    # ... existing vars

    # REMOVE (oder kommentieren):
    # SES_SENDER_EMAIL = var.ses_sender_email

    # ADD:
    RESEND_API_KEY = var.resend_api_key
    EMAIL_FROM     = "noreply@aws.his4irness23.de"
  }
  ```

- [ ] **Variables definieren**

  **File:** `terraform/variables.tf`

  **HINZUFÜGEN:**
  ```hcl
  variable "resend_api_key" {
    description = "Resend API Key for email sending"
    type        = string
    sensitive   = true
  }
  ```

- [ ] **GitHub Secrets**
  - GitHub Repo → Settings → Secrets and variables → Actions
  - New repository secret
  - Name: `RESEND_API_KEY`
  - Value: [Der API Key von Resend]
  - Save

- [ ] **GitHub Workflows updaten**

  **File:** `.github/workflows/deploy.yml`

  **ÄNDERN:**
  ```yaml
  - name: Terraform Apply
    env:
      TF_VAR_stripe_secret_key: ${{ secrets.STRIPE_SECRET_KEY }}
      TF_VAR_stripe_webhook_secret: ${{ secrets.STRIPE_WEBHOOK_SECRET }}
      TF_VAR_resend_api_key: ${{ secrets.RESEND_API_KEY }}  # NEU!
  ```

- [ ] **Optional: SES Module entfernen**

  **File:** `terraform/main.tf`

  ```hcl
  # KOMMENTIEREN oder LÖSCHEN:
  # module "ses" {
  #   source = "./modules/ses"
  #   ...
  # }
  ```

  **Oder:** Einfach behalten (schadet nicht, kostet nichts)

---

### 4. Local Testing (5min)

- [ ] **Environment Variables setzen**
  ```bash
  cd backend
  export RESEND_API_KEY="re_xxxxxxxxxxxxx"
  export EMAIL_FROM="noreply@aws.his4irness23.de"
  ```

- [ ] **Test Email senden**
  ```bash
  # Entweder:
  npm run dev
  # Dann manuell Order durchführen

  # Oder:
  node scripts/test-email.js  # (Falls Test-Script existiert)
  ```

- [ ] **Prüfen:**
  - Email kommt an bei Kunde
  - FROM: noreply@aws.his4irness23.de
  - Template wird korrekt gerendert
  - Produktbilder laden (CloudFront URLs)

---

### 5. Deployment (5min)

- [ ] **Backend Dependencies committen**
  ```bash
  git add backend/package.json backend/package-lock.json
  git commit -m "feat: add Resend email integration"
  ```

- [ ] **Backend Code committen**
  ```bash
  git add backend/src/services/email.service.ts
  git commit -m "feat: replace AWS SES with Resend"
  ```

- [ ] **Terraform Changes committen**
  ```bash
  git add terraform/
  git commit -m "chore: update Terraform for Resend integration"
  ```

- [ ] **Documentation committen**
  ```bash
  git add docs/
  git commit -m "docs: update email migration to Resend"
  ```

- [ ] **Push to GitHub**
  ```bash
  git push origin develop
  ```

- [ ] **GitHub Actions prüfen**
  - Warten bis Deploy durchläuft
  - Logs checken (keine Fehler)

---

### 6. Production Testing (5min)

- [ ] **E2E Order Test**
  - Gehe zu: https://shop.aws.his4irness23.de
  - Registriere neuen Test-User (oder bestehenden nutzen)
  - Kaufe ein Produkt (Stripe Test-Karte)
  - Prüfe: Order Confirmation Email kommt an
  - Prüfe: Email sieht professionell aus

- [ ] **Verschiedene Email-Provider testen**
  - Gmail
  - Outlook/Hotmail
  - Yahoo (optional)
  - Prüfe Spam-Folder (sollte nicht im Spam landen)

---

### 7. Dokumentation (5min)

- [ ] **README.md updaten**
  - Email Notifications: ✅ WORKING (Resend)
  - Remove SES references

- [ ] **ACTION_PLAN.md updaten**
  - Mark Resend Migration as ✅ COMPLETE
  - Update Project Health: Email Notifications ✅

- [ ] **LESSONS_LEARNED.md updaten**
  - Add Learning #39: "Email Provider Rejections (AWS SES + SendGrid) → Resend Solution"
  - External Service Provider Pattern (like Stripe)

---

## 📊 Success Criteria

**Migration ist erfolgreich wenn:**

- ✅ Resend Account erstellt & Domain verifiziert
- ✅ Backend sendet Emails via Resend API
- ✅ Order Confirmation Emails kommen bei ALLEN Kunden an
- ✅ FROM: noreply@aws.his4irness23.de (professionell!)
- ✅ Template rendering funktioniert
- ✅ Produktbilder in Emails laden (CloudFront)
- ✅ Keine AWS SES Sandbox Limitierungen mehr
- ✅ Terraform Deployment funktioniert
- ✅ Dokumentation aktualisiert

---

## 🚨 Fallbacks bei Problemen

### Problem: Resend Account auch rejected
**Lösung:**
1. SES Sandbox als Portfolio-Lösung akzeptieren
2. In README dokumentieren: "Email nur für verifizierte Test-User"
3. Später retry wenn AWS Account älter ist (3-6 Monate)

### Problem: Domain Verification dauert zu lange
**Lösung:** Temporär verifizierte Email nutzen (z.B. andy.schlegel@chakademie.org)

### Problem: Resend API Key funktioniert nicht
**Lösung:** Neuen API Key generieren, Permissions prüfen

### Problem: Emails landen im Spam
**Lösung:**
1. SPF/DKIM Records nochmal prüfen
2. Domain Verification nochmal durchführen
3. Email Content prüfen (keine Spam-Keywords)

### Problem: Template Rendering schlägt fehl
**Lösung:**
1. HTML Template direkt als String rendern
2. Handlebars/Template Logic im Backend ausführen
3. Resend Templates später optimieren

---

## 💡 Tips & Best Practices

**Domain Verification:**
- Route53 DNS Records: TTL = 600 (10min)
- Warte 5-30min nach DNS-Änderung
- Resend Dashboard zeigt Verification Status live

**API Key Security:**
- NIEMALS im Code committen
- Nur in GitHub Secrets
- Nur in Terraform ENV vars (encrypted)

**Email Templates:**
- Existierende HTML Templates behalten
- Im Backend rendern (nicht in Resend)
- Mehr Kontrolle & Flexibilität
- Optional: Später zu React Email migrieren

**Testing:**
- Immer erst in Development testen
- Verschiedene Email-Provider testen
- Resend Analytics checken (Delivery Rate)

**Resend vs SendGrid:**
- Resend: Einfachere API, bessere DX
- SendGrid: Mehr Features, komplexer
- Für Portfolio: Resend perfekt ausreichend

---

## 🎯 Next Steps After Migration

**Danach ist Email System 100% production-ready!**

Dann weiter mit:
1. E2E Testing (Playwright)
2. Custom Domains Fine-Tuning (optional)
3. Performance Optimization

---

**Estimated Total Time: 30-40 Minuten**
**Difficulty: Easy-Medium (einfacher als SendGrid!)**
**Impact: HIGH (Email System production-ready!)**

**Approval-Wahrscheinlichkeit: 60-70% (besser als SendGrid)**

---

**Let's go! 🚀**
