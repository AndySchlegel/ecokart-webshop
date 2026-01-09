# Architecture Decision Record: Address Validation Strategy

**Status:** ✅ Accepted
**Date:** 9. Januar 2026
**Decision Makers:** Andy Schlegel
**Context:** Phase 3 - Production Polish & UX Improvements

---

## 📋 Context

Im Checkout-Prozess müssen Lieferadressen validiert werden, um:
- Fehlerhafte Bestellungen zu vermeiden
- User Experience zu verbessern
- Datenqualität zu gewährleisten

**Problem:** Wie umfassend soll die Adressvalidierung sein?

---

## 🎯 Decision

**Wir implementieren Level 1: Format-Validierung (aktueller Stand)**

### Was ist implementiert:

**Frontend (Real-time):**
- Postleitzahl: Nur Zahlen, maximal 5 Ziffern
- HTML5 Pattern Validation: `pattern="[0-9]{5}"`
- Input Filter: `replace(/\D/g, '').slice(0, 5)`
- User-Feedback: "Bitte gib eine 5-stellige Postleitzahl ein"

**Backend (API-Level):**
- Validation Utility: `isValidGermanZipCode()` (Regex: `^[0-9]{5}$`)
- Checkout Controller: Validierung vor Stripe Session Creation
- Webhook Controller: Validierung nach Stripe Payment
- Test-PLZ erlaubt: 99999, 12345 (für Demo-Zwecke)

**Testing:**
- 17 Unit Tests (alle bestanden)
- Validiert: Format, Länge, Zeichen-Typ, Pflichtfelder

---

## 🤔 Considered Alternatives

### Level 2: PLZ-Datenbank-Validierung
**Was es tut:**
- Prüft ob PLZ existiert (z.B. 99999 → ungültig)
- Prüft ob Stadt zu PLZ passt (z.B. "10115 München" → Fehler)
- Offline-Datenbank mit ~16.000 deutschen PLZ

**Warum nicht implementiert:**
- **Aufwand:** 4-6 Stunden
- **Datenbank-Größe:** ~2-3 MB (PLZ → Stadt Mapping)
- **Wartung:** Datenbank muss aktualisiert werden
- **Komplexität:** Unnötig für Portfolio-Demo
- **Kosten:** €0 (aber Zeit-Investment)

### Level 3: Straßen-Validierung (OSM API)
**Was es tut:**
- Prüft ob "Musterstraße 123" in "10115 Berlin" existiert
- API-Calls zu OpenStreetMap Nominatim

**Warum nicht implementiert:**
- **Aufwand:** 8-12 Stunden
- **Rate Limits:** 1 Request/Sekunde (ungeeignet für Production)
- **Datenschutz:** IP-Tracking, DSGVO-Bedenken
- **Komplexität:** Error-Handling für API-Ausfälle
- **Overkill:** Zu komplex für Demo-Projekt

### Level 4: Production-Grade Service (HERE/Google API)
**Was es tut:**
- Echtzeit-Validierung mit kommerzieller API
- Adress-Autocomplete, Geo-Koordinaten, Zustellbarkeits-Check
- 99% Genauigkeit

**Warum nicht implementiert:**
- **Kosten:** €1-3 pro 1000 Requests (laufend)
- **API-Key Management:** Security-Overhead
- **Vendor Lock-in:** Abhängigkeit von externem Service
- **Unnötig:** Demo-Projekt braucht keine 99% Genauigkeit

---

## ✅ Rationale

**Warum Level 1 ausreichend ist:**

### 1. **Portfolio-Kontext**
- Ziel: Konzept-Verständnis zeigen, nicht Production-Perfect
- Recruiter/Interviewer sehen: "Versteht Validierung, kennt Trade-offs"
- Kostenlos, keine laufenden Dependencies

### 2. **Demo-Zweck**
- Test-PLZ (99999, 12345) erlaubt → Demo funktioniert immer
- Echte Adressen nicht erforderlich für Stripe Test-Modus
- Fokus auf Payment Flow, nicht auf Address Services

### 3. **Pragmatismus**
- 2 Stunden Investment statt 8-12 Stunden
- Keine laufenden Kosten oder Wartung
- Keine Rate Limits oder API-Ausfälle
- 100% reproduzierbar (keine External Dependencies)

### 4. **Erweiterbarkeit dokumentiert**
- Alternatives bekannt und dokumentiert
- Interview-Ready: "Für Production würde ich..."
- Zeigt: Kann Production vs. Demo unterscheiden

---

## 📊 Impact

**Vorteile:**
- ✅ Verhindert offensichtliche Fehler (Buchstaben, zu viele Ziffern)
- ✅ User Experience: Sofortiges Feedback beim Tippen
- ✅ Datenqualität: Nur gültiges Format in Datenbank
- ✅ Kosten: €0/Monat (keine API-Calls)
- ✅ Latency: Keine externe API-Calls → schnell
- ✅ Privacy: Keine Drittanbieter tracken User-Adressen

**Akzeptierte Limitierungen:**
- ⚠️ Ungültige PLZ (z.B. "00000") werden akzeptiert
- ⚠️ Falsche Stadt-PLZ-Kombination wird nicht erkannt
- ⚠️ Nicht-existente Straßen werden nicht erkannt

**Für Production würden wir erwägen:**
- Level 2 (PLZ-DB) für bessere Datenqualität
- Level 4 (HERE API) für kritische Use-Cases (z.B. Same-Day Delivery)

---

## 🎓 Lessons Learned

**Interview-Antwort vorbereitet:**
> "Ich habe bewusst Format-Validierung gewählt, nicht eine komplexe Address API. Für ein Portfolio-Projekt zeigt das Konzept-Verständnis ohne Over-Engineering. In Production würde ich je nach Budget entweder eine PLZ-Datenbank (€0, offline) oder einen Service wie HERE API (€10-50/Monat, 99% Genauigkeit) verwenden. Die Entscheidung hängt von den Business-Requirements ab: Wie kritisch ist exakte Adress-Validierung vs. Kosten?"

**Das demonstriert:**
- ✅ Pragmatisches Denken (kein Over-Engineering)
- ✅ Kosten-Nutzen-Abwägung
- ✅ Production vs. Demo Unterscheidung
- ✅ Kenntnis von Production-Grade Lösungen
- ✅ Trade-off Analyse (Genauigkeit vs. Kosten vs. Komplexität)

---

## 🔗 References

**Implementierung:**
- Frontend: `frontend/app/checkout/page.tsx` (Zeile 130-145)
- Backend: `backend/src/utils/validation.ts`
- Tests: `backend/src/utils/__tests__/validation.test.ts` (17 Tests)

**Alternative Lösungen:**
- OpenPLZ API: https://openplzapi.org (kostenlos, ~16k deutsche PLZ)
- HERE Geocoding API: https://developer.here.com/documentation/geocoding-search-api/dev_guide/index.html
- Google Address Validation: https://developers.google.com/maps/documentation/address-validation
- Deutsche Post Direkt: https://www.deutschepost.de/de/d/deutsche-post-direkt/datafactory.html

**Commit:** `19f3cb4` - feat: implement German zip code validation (5-digit PLZ)

---

## 📝 Notes

**Mögliche Erweiterungen (falls später benötigt):**

```typescript
// Level 2: PLZ-Datenbank Integration
import plzData from './data/plz-database.json';

function validateZipCodeAndCity(zipCode: string, city: string): boolean {
  const plzInfo = plzData[zipCode];
  if (!plzInfo) return false; // PLZ existiert nicht
  return plzInfo.city.toLowerCase() === city.toLowerCase();
}

// Level 4: HERE API Integration
async function validateAddressWithAPI(address: ShippingAddress): Promise<boolean> {
  const response = await fetch(
    `https://geocode.search.hereapi.com/v1/geocode?` +
    `q=${address.street},${address.zipCode}+${address.city}&apiKey=${HERE_API_KEY}`
  );
  const data = await response.json();
  return data.items.length > 0 && data.items[0].scoring.queryScore > 0.8;
}
```

**Geschätzte Upgrade-Zeiten:**
- Level 1 → Level 2: 4-6 Stunden
- Level 1 → Level 4: 2-3 Stunden (API Integration einfacher als DB-Pflege)

---

**Status:** ✅ Implemented & Documented
**Review Date:** Bei Production-Migration
