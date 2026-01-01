# 📧 SendGrid Migration - TODO Liste

**Erstellt:** 31. Dezember 2025 (Spätabend)
**Grund:** AWS SES Production Access REJECTED (Case 176720597300389)
**Lösung:** Migration zu SendGrid (wie Stripe für Payments)
**ETA:** 45 Minuten

---

## 🎯 Warum SendGrid?

**AWS SES Rejection:**
- AWS lehnte Production Access ab
- Grund: "Security reasons" (neue Accounts werden oft abgelehnt)
- Sandbox Mode = nur verifizierte Emails
- Nicht production-ready

**SendGrid Vorteile:**
- ✅ Funktioniert SOFORT (kein Approval nötig)
- ✅ Free Tier: 100 emails/day (genug für Portfolio)
- ✅ Einfachere Integration als SES
- ✅ Wie Stripe-Pattern (externer Service-Provider)
- ✅ Production-ready von Tag 1
- ✅ noreply@his4irness23.de funktioniert (nach Domain Verify)

---

## ✅ Step-by-Step Checklist

### 1. SendGrid Account Setup (10min)

- [ ] **Account erstellen**
  - URL: https://signup.sendgrid.com
  - Email: andy.schlegel@chakademie.org (oder andere)
  - Passwort: Sicher speichern!
  - Email-Verification durchführen

- [ ] **Domain Verification**
  - In SendGrid Dashboard → Settings → Sender Authentication
  - Domain hinzufügen: `his4irness23.de`
  - DNS Records kopieren (ähnlich wie SES DKIM)
  - In Route53 erstellen:
    ```
    SendGrid gibt dir:
    - CNAME Record für Domain Verification
    - CNAME Records für DKIM (3 Stück)
    - Optional: SPF TXT Record
    ```
  - Warten bis "Verified" (5-30min)

- [ ] **API Key erstellen**
  - Settings → API Keys → Create API Key
  - Name: "Ecokart Production"
  - Permissions: "Full Access" (oder "Mail Send" only)
  - API Key kopieren und SICHER speichern! (wird nur 1x angezeigt)

---

### 2. Backend Code-Änderungen (20min)

- [ ] **Package installieren**
  ```bash
  cd backend
  npm install @sendgrid/mail
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

  **NACHHER (SendGrid):**
  ```typescript
  import sgMail from '@sendgrid/mail';

  sgMail.setApiKey(process.env.SENDGRID_API_KEY!);

  export async function sendOrderConfirmationEmail(data: OrderConfirmationEmailData) {
    const msg = {
      to: data.customerEmail,
      from: process.env.EMAIL_FROM || 'noreply@his4irness23.de',
      subject: 'Deine AIR LEGACY Bestellung ist bestätigt',
      html: renderOrderConfirmationTemplate(data),
      // Optional: text version
      text: renderOrderConfirmationText(data),
    };

    await sgMail.send(msg);
  }
  ```

- [ ] **Template Rendering behalten**
  - Die existierenden Templates können bleiben!
  - Nur statt SES Template → HTML direkt rendern
  - `renderOrderConfirmationTemplate(data)` gibt HTML string zurück

- [ ] **Error Handling**
  ```typescript
  try {
    await sgMail.send(msg);
    console.log('Order confirmation email sent:', data.customerEmail);
  } catch (error) {
    console.error('SendGrid error:', error);
    throw new Error('Failed to send order confirmation email');
  }
  ```

- [ ] **TypeScript Types**
  ```bash
  npm install --save-dev @types/sendgrid__mail
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
    SENDGRID_API_KEY = var.sendgrid_api_key
    EMAIL_FROM       = "noreply@his4irness23.de"
  }
  ```

- [ ] **Variables definieren**

  **File:** `terraform/variables.tf`

  **HINZUFÜGEN:**
  ```hcl
  variable "sendgrid_api_key" {
    description = "SendGrid API Key for email sending"
    type        = string
    sensitive   = true
  }
  ```

- [ ] **GitHub Secrets**
  - GitHub Repo → Settings → Secrets and variables → Actions
  - New repository secret
  - Name: `SENDGRID_API_KEY`
  - Value: [Der API Key von SendGrid]
  - Save

- [ ] **GitHub Workflows updaten**

  **File:** `.github/workflows/deploy.yml`

  **ÄNDERN:**
  ```yaml
  - name: Terraform Apply
    env:
      TF_VAR_stripe_secret_key: ${{ secrets.STRIPE_SECRET_KEY }}
      TF_VAR_stripe_webhook_secret: ${{ secrets.STRIPE_WEBHOOK_SECRET }}
      TF_VAR_sendgrid_api_key: ${{ secrets.SENDGRID_API_KEY }}  # NEU!
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
  export SENDGRID_API_KEY="SG.xxxxxxxxxxxxx"
  export EMAIL_FROM="noreply@his4irness23.de"
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
  - FROM: noreply@his4irness23.de
  - Template wird korrekt gerendert
  - Produktbilder laden (CloudFront URLs)

---

### 5. Deployment (5min)

- [ ] **Backend Dependencies committen**
  ```bash
  git add package.json package-lock.json
  git commit -m "feat: add SendGrid email integration"
  ```

- [ ] **Backend Code committen**
  ```bash
  git add backend/src/services/email.service.ts
  git commit -m "feat: replace AWS SES with SendGrid"
  ```

- [ ] **Terraform Changes committen**
  ```bash
  git add terraform/
  git commit -m "chore: update Terraform for SendGrid integration"
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
  - Email Notifications: ✅ WORKING (SendGrid)
  - Remove SES references

- [ ] **ACTION_PLAN.md updaten**
  - Mark SendGrid Migration as ✅ COMPLETE
  - Update Project Health: Email Notifications ✅

- [ ] **LESSONS_LEARNED.md updaten**
  - Add Learning #39: "AWS SES Rejection + SendGrid Migration"
  - External Service Provider Pattern (like Stripe)

---

## 📊 Success Criteria

**Migration ist erfolgreich wenn:**

- ✅ SendGrid Account erstellt & Domain verifiziert
- ✅ Backend sendet Emails via SendGrid API
- ✅ Order Confirmation Emails kommen bei ALLEN Kunden an
- ✅ FROM: noreply@his4irness23.de (professionell!)
- ✅ Template rendering funktioniert
- ✅ Produktbilder in Emails laden (CloudFront)
- ✅ Keine AWS SES Sandbox Limitierungen mehr
- ✅ Terraform Deployment funktioniert
- ✅ Dokumentation aktualisiert

---

## 🚨 Fallbacks bei Problemen

### Problem: Domain Verification dauert zu lange
**Lösung:** Temporär verifizierte Email nutzen (z.B. andy.schlegel@chakademie.org)

### Problem: SendGrid API Key funktioniert nicht
**Lösung:** Neuen API Key generieren, Full Access Permissions prüfen

### Problem: Emails landen im Spam
**Lösung:**
1. SPF/DKIM Records nochmal prüfen
2. SendGrid Sender Verification nochmal durchführen
3. Email Content prüfen (keine Spam-Keywords)

### Problem: Template Rendering schlägt fehl
**Lösung:**
1. HTML Template direkt als String rendern
2. Handlebars/Template Logic im Backend ausführen
3. Nicht SendGrid Templates nutzen (zu kompliziert)

---

## 💡 Tips & Best Practices

**Domain Verification:**
- Route53 DNS Records: TTL = 600 (10min)
- Warte 5-30min nach DNS-Änderung
- SendGrid Dashboard zeigt Verification Status

**API Key Security:**
- NIEMALS im Code committen
- Nur in GitHub Secrets
- Nur in Terraform ENV vars (encrypted)

**Email Templates:**
- Existierende HTML Templates behalten
- Im Backend rendern (nicht in SendGrid)
- Mehr Kontrolle & Flexibilität

**Testing:**
- Immer erst in Development testen
- Verschiedene Email-Provider testen
- Spam-Score checken (SendGrid Analytics)

---

## 🎯 Next Steps After Migration

**Danach ist Email System 100% production-ready!**

Dann weiter mit:
1. E2E Testing (Playwright)
2. Admin Dashboard Enhancements
3. Custom Domains (optional polish)

---

**Estimated Total Time: 45 Minuten**
**Difficulty: Medium (ähnlich wie Stripe Integration)**
**Impact: HIGH (Email System production-ready!)**

---

**Viel Erfolg morgen! 🚀**
