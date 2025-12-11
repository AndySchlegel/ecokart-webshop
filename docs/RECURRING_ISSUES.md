# 🔄 Wiederkehrende Probleme & Prevention

**Datum:** 11. Dezember 2025
**Zweck:** Dokumentation wiederkehrender Issues + Prevention-Strategien
**Status:** WICHTIG - MUSS in zukünftigen Sessions beachtet werden!

---

## ⚠️ KRITISCH: Wiederkehrende Probleme

Diese Probleme sind **mehrfach** aufgetreten und müssen strukturell gelöst werden!

### 1. 🔧 Terraform Version Mismatch

**Problem:**
- Lokale Terraform Version != GitHub Actions Version
- Führt zu: "unsupported checkable object kind 'var'" Errors
- **Aufgetreten:** Mindestens 2x (Dezember 2025)

**Root Cause:**
- GitHub Actions Workflow nutzt veraltete/andere Terraform Version
- Kein Version Pinning zwischen lokal und CI/CD
- State File Inkompatibilität

**Impact:**
- ❌ Deployment schlägt fehl
- ❌ Zeit verschwendet beim Debuggen
- ❌ Frustration beim User (graue Haare!)

**Prevention-Strategie:**
1. **Version Pinning File** erstellen (`.tool-versions` oder `versions.txt`)
2. **GitHub Actions Workflow** MUSS diese Version nutzen
3. **Pre-commit Hook** warnt bei .tf File Änderungen
4. **CI Check** validiert Version Consistency

**Action für nächste Session:**
- [ ] `.tool-versions` erstellen mit aktueller Terraform Version
- [ ] `.github/workflows/deploy.yml` auf diese Version pinnen
- [ ] Validation Job in CI/CD hinzufügen

---

### 2. 📦 package-lock.json nicht synchronisiert

**Problem:**
- Dependencies zu package.json hinzugefügt
- package-lock.json NICHT aktualisiert
- Führt zu: Amplify Build Fehler mit `npm ci`

**Aufgetreten:**
- 11. Dezember 2025 (Admin Frontend - Cognito Migration)

**Root Cause:**
- Manuelle Änderungen an package.json ohne `npm install`
- Vergessen package-lock.json zu committen
- `npm ci` in Production verlangt exakte Übereinstimmung

**Impact:**
- ❌ Amplify Build schlägt fehl
- ❌ Debugging Zeit verschwendet
- ❌ Multiple Deploy-Zyklen nötig

**Prevention-Strategie:**
1. **Pre-commit Hook:** Auto-update package-lock.json wenn package.json geändert
2. **CI Validation:** Check package-lock.json Sync
3. **Dokumentation:** Checkliste für Dependency-Änderungen
4. **Automation:** Script das alle package.json/lock.json paare checkt

**Action für nächste Session:**
- [ ] Pre-commit Hook implementieren
- [ ] CI Check für lock file sync hinzufügen
- [ ] Checkliste in CONTRIBUTING.md

---

### 3. 🔐 ENV Variables verschwinden nach Redeploy

**Problem:**
- Manuell gesetzte ENV Vars in Amplify verschwinden nach terraform apply
- Führt zu: Runtime Errors in deployed App

**Aufgetreten:**
- Vorherige Session (Admin Login Credentials)

**Root Cause:**
- ENV Vars wurden manuell in Amplify Console gesetzt
- NICHT in Terraform Modul definiert
- Terraform überschreibt bei Apply

**Impact:**
- ❌ App funktioniert nicht nach Deploy
- ❌ Nicht reproduzierbar
- ❌ Infrastructure as Code wird umgangen

**Prevention-Strategie:**
1. **Alle ENV Vars in Terraform** definieren (Amplify Module)
2. **SSM Parameter Store** für Secrets nutzen
3. **Dokumentation:** Klare Regel - KEINE manuellen Änderungen
4. **Validation:** CI Check für fehlende ENV Vars

**Action für nächste Session:**
- [ ] Alle ENV Vars aus Terraform modules auslesen
- [ ] Dokumentieren welche ENV Vars wo definiert sind
- [ ] Script zum Validieren von ENV Vars

---

## 🎯 Übergreifende Prevention-Strategie

### Prinzipien:

1. **Automation over Manual**
   - Pre-commit Hooks für automatische Checks
   - CI/CD Validation vor Deployment
   - Scripts für wiederkehrende Tasks

2. **Documentation First**
   - Checklisten für kritische Änderungen
   - Root Cause Analysis bei jedem Issue
   - Lessons Learned dokumentieren

3. **Fail Early**
   - Probleme VOR Commit erkennen (Pre-commit)
   - Probleme VOR Deployment erkennen (CI)
   - Klare Error Messages

4. **Reproducibility**
   - Alles in Code (IaC, Dependencies, Configs)
   - KEINE manuellen Änderungen in AWS Console
   - Version Pinning überall

### Quick Wins für nächste Session:

**Priorität 1 (Must Have):**
- [ ] Terraform Version Pinning in GitHub Actions fixen
- [ ] Pre-commit Hook für package-lock.json

**Priorität 2 (Should Have):**
- [ ] CI Validation Job (Terraform Version, Lock Files)
- [ ] Checkliste in CONTRIBUTING.md

**Priorität 3 (Nice to Have):**
- [ ] Automation Scripts für Pre-Deploy Checks
- [ ] ENV Var Validation Script

---

## 📋 Checkliste für Changes

### Bei Terraform Änderungen:
- [ ] Lokale Terraform Version checken (`terraform version`)
- [ ] GitHub Actions Workflow Version checken
- [ ] State File Backup vor größeren Änderungen
- [ ] Plan Review vor Apply

### Bei Dependency Änderungen:
- [ ] `npm install` (NICHT nur package.json editieren!)
- [ ] package-lock.json committen
- [ ] Lokalen Build testen
- [ ] Amplify Build beobachten

### Bei ENV Variable Änderungen:
- [ ] In Terraform Modul definieren (NICHT manuell!)
- [ ] Secrets in SSM Parameter Store
- [ ] Nach Deploy validieren

---

## 🔄 Learning Loop

**Nach jedem wiederkehrenden Problem:**
1. Root Cause Analysis in diesem Dokument
2. Prevention-Strategie definieren
3. Action Items für nächste Session
4. Implementierung in nächster Session
5. Validation dass Problem gelöst ist

**Ziel:** Jedes Problem nur **EINMAL** erleben, dann präventiv lösen!

---

## 💭 Wichtige Notizen

**Für Claude (KI Assistant):**
- ⚠️ **IMMER** dieses Dokument am Anfang jeder Session lesen!
- ⚠️ **BEVOR** du Terraform/Dependencies änderst, Checkliste checken!
- ⚠️ **KEINE** Quick & Dirty Fixes - strukturelle Lösungen!
- ⚠️ **LERNEN** aus Fehlern - nicht wiederholen!

**Für User:**
- Dieses Dokument ist "Living Document" - bei jedem Issue updaten
- Prevention > Fixing
- Zeit in Automation investieren = Langfristig Zeit sparen
- Graue Haare vermeiden! 😄

---

**Last Updated:** 11. Dezember 2025
**Next Review:** Bei nächster Session / Bei neuem wiederkehrenden Problem
