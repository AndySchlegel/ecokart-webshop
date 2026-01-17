# 🚀 ACTION PLAN PHASE 3 - Final Polish & Feature Enhancements

**Created:** 6. Januar 2026
**Purpose:** Portfolio Excellence + User Feedback Integration
**Status:** 🟢 READY TO START
**Timeline:** 1-2 Wochen

---

## 🎯 Mission Statement

> **"Portfolio-Perfect + Production-Grade UX"**
>
> Basierend auf User-Feedback und Portfolio-Anforderungen:
> - ✅ Architektur-Diagramm mit echten AWS Icons
> - ✅ Feature-Enhancements aus Freund-Feedback
> - ✅ Kompletter Repo-Cleanup
> - ✅ DSGVO-Compliance (Impressum/Datenschutz)

---

## 📊 Die 4 Themen-Bereiche

```
┌────────────────────────────────────────────────────────────────┐
│                    PHASE 3 STRUCTURE                           │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│  📐 BEREICH 1: Architecture Visualization (PRIORITY 1)        │
│  └─ AWS Flow-Diagramm mit echten Icons (Stephane-Style)       │
│                                                                │
│  🎨 BEREICH 2: UX/Feature Enhancements (PRIORITY 1)           │
│  ├─ Produkt-Tagging & Intelligente Suche                      │
│  ├─ User Profile & Bestellhistorie                            │
│  ├─ Favoriten/Wishlist                                        │
│  ├─ Adress-Validierung (PLZ 5 Stellen)                        │
│  └─ Impressum & Datenschutz                                   │
│                                                                │
│  🧹 BEREICH 3: Repository Cleanup (PRIORITY 2)                │
│  └─ Dead Code, Unused Files, Dokumentation                    │
│                                                                │
│  📚 BEREICH 4: Documentation Polish (PRIORITY 3)              │
│  └─ README Final Review, Screenshots Update                   │
│                                                                │
└────────────────────────────────────────────────────────────────┘
```

---

# 📐 BEREICH 1: Architecture Visualization

## Task 1.1: AWS Flow-Diagramm (Stephane Maarek Style)

**Priority:** 🔴 CRITICAL (Portfolio-Differentiator!)
**Effort:** 2-3 Stunden
**Impact:** ⭐⭐⭐⭐⭐

### Was genau?

Erstelle ein **kompaktes Flow-Diagramm** ähnlich wie in AWS Kursen:
- **Echte AWS Icons** (die bunten, quadratischen)
- **Pfeile mit Beschriftungen** (REST API, invoke, query, etc.)
- **Horizontaler Flow** (links → rechts)
- **Für Präsentationen geeignet**

### Inspiration (Screenshots vom User):

**Layout-Typ 1:** Vertikaler Flow mit Branching
```
         Users
       /   |   \
      /    |    \
Static  REST   Login
Content  API   (Cognito)
   |      |      |
  S3    API GW  Auth
         |
       Lambda
         |
     DynamoDB
```

**Layout-Typ 2:** Horizontaler Data Flow
```
Client → API Gateway → Lambda → DynamoDB
            ↓
         Cognito (Verify Auth)
```

**Layout-Typ 3:** Service Grid
```
API Gateway    Kinesis    DynamoDB    S3    CloudFront
CloudWatch     Logs       SNS         SQS   Cognito
```

### Implementierungs-Optionen:

#### **Option A: PowerPoint + AWS Icons** ⭐ EMPFOHLEN
- Download AWS Architecture Icons (haben wir schon!)
- Erstelle simple PPT/Keynote Slides
- Export als PNG/SVG
- Vorteil: Schnell, flexibel, präsentationsfertig

#### **Option B: Draw.io mit AWS Icons**
- Import AWS Icon Library in Draw.io
- Professionelles Flow-Diagramm erstellen
- Export als SVG
- Vorteil: Versionierbar, wiederverwendbar

#### **Option C: HTML/CSS Flow-Diagramm**
- Ähnlich wie infrastructure-overview.html
- Aber horizontaler Flow statt vertikal
- Echte AWS Icons als SVG
- Vorteil: Interaktiv, im Repo versioniert

### Deliverables:

```
docs/
├── architecture-flow.png         # Haupt-Diagramm (für README)
├── architecture-flow.svg         # Vector-Version
├── architecture-flow.pptx        # Source (editierbar)
└── architecture-flow-detailed.png # Mit allen Services
```

### Success Criteria:

- ✅ Zeigt **kompletten Request-Flow** (User → Response)
- ✅ **Alle 12 AWS Services** sichtbar
- ✅ **Echte AWS Icons** (bunten, quadratischen)
- ✅ **Beschriftete Pfeile** (REST API, invoke, query, etc.)
- ✅ **Präsentationsfertig** (sauber, professionell)
- ✅ **Im README eingebunden**

---

# 🎨 BEREICH 2: UX/Feature Enhancements

## Task 2.1: Produkt-Tagging & Intelligente Suche

**Priority:** 🟡 MEDIUM
**Effort:** 4-6 Stunden
**Impact:** ⭐⭐⭐⭐

### Problem:
- Kein Produkt-Filtering außer Kategorien
- Keine Tag-basierte Suche
- Keine intelligente Suche (Fuzzy, Partial Match)

### Solution:

**Backend (DynamoDB):**
```typescript
// Extend Product Schema
interface Product {
  id: string;
  name: string;
  category: string;
  tags: string[];        // NEW: ["bio", "vegan", "regional"]
  searchTerms: string[]; // NEW: ["apfel", "äpfel", "apple"]
}

// DynamoDB GSI for Tag-Based Search
GSI: TagIndex
  PK: tag
  SK: productId
```

**Frontend (Search Component):**
```typescript
// Intelligent Search Features:
1. Multi-Tag Filter (AND/OR logic)
2. Fuzzy Search (Fuse.js)
3. Auto-Suggest
4. Recent Searches
```

**Example Tags:**
- Eigenschaften: `bio`, `vegan`, `regional`, `fair-trade`
- Allergene: `glutenfrei`, `laktosefrei`, `nussfrei`
- Saison: `winter`, `sommer`, `ganzjährig`
- Herkunft: `deutschland`, `spanien`, `lokal`

### Implementation:

```
1. Database Migration (Terraform Seed Module)
   - Add tags to existing products
   - Create TagIndex GSI

2. Backend (Lambda)
   - /products/search endpoint
   - Tag-based filtering
   - Fuzzy search logic

3. Frontend (Next.js)
   - Search Bar Component
   - Tag Filter UI
   - Auto-Suggest
```

### Success Criteria:

- ✅ Products haben `tags` Feld
- ✅ Tag-Filter UI in Product List
- ✅ Intelligente Suche (Fuzzy, Partial)
- ✅ Min. 3-5 Tags pro Produkt
- ✅ Performance: <200ms Search Response

---

## Task 2.2: User Profile & Bestellhistorie

**Priority:** 🟡 MEDIUM
**Effort:** 6-8 Stunden
**Impact:** ⭐⭐⭐⭐⭐

### Problem:
- Kein User Profile/Dashboard
- Keine Bestellhistorie sichtbar
- User weiß nicht, ob er eingeloggt ist

### Solution:

**Frontend Changes:**

```typescript
// New Pages:
/profile          → User Dashboard
/profile/orders   → Order History
/profile/settings → Account Settings

// New Components:
<UserProfileCard />     → Name, Email, Member Since
<OrderHistoryList />    → Past Orders mit Status
<LoginStatusBadge />    → Header: "Eingeloggt als X"
```

**Backend (Lambda):**
```typescript
// New Endpoints:
GET  /users/me          → Current User Info
GET  /users/me/orders   → User's Order History
PUT  /users/me          → Update Profile
```

**Features:**

1. **Profile Dashboard**
   - Name, Email anzeigen
   - Member Since
   - Order Count
   - Quick Links (Orders, Settings, Logout)

2. **Order History**
   - Liste aller Bestellungen
   - Status (Pending, Completed, Cancelled)
   - Order Details (Produkte, Preis, Datum)
   - Re-Order Button

3. **Login Status Indicator**
   - Header: Avatar + Name
   - Dropdown: Profile, Orders, Logout
   - Mobile: Hamburger Menu

### UI Layout:

```
┌────────────────────────────────────┐
│  Header: [Avatar] Max Mustermann ▼ │
│  ├─ Mein Profil                    │
│  ├─ Bestellungen                   │
│  ├─ Einstellungen                  │
│  └─ Abmelden                       │
├────────────────────────────────────┤
│  Dashboard                         │
│  ┌────────────┬──────────────────┐ │
│  │ Profile    │ Recent Orders    │ │
│  │ Info       │ - Order #123     │ │
│  │            │ - Order #122     │ │
│  └────────────┴──────────────────┘ │
└────────────────────────────────────┘
```

### Success Criteria:

- ✅ User Dashboard Page
- ✅ Order History mit Details
- ✅ Login Status in Header
- ✅ Responsive Design
- ✅ Cognito-Integration

---

## Task 2.3: Favoriten/Wishlist

**Priority:** 🟢 LOW (Nice-to-Have)
**Effort:** 4-6 Stunden
**Impact:** ⭐⭐⭐

### Problem:
- Keine Möglichkeit, Produkte zu speichern
- User muss Produkte jedes Mal suchen

### Solution:

**DynamoDB Schema:**
```typescript
// New Table: Favorites
{
  userId: string;      // PK
  productId: string;   // SK
  addedAt: string;
  notes?: string;      // Optional: "Für Geburtstag"
}
```

**Backend:**
```typescript
POST   /favorites/:productId   → Add to Favorites
DELETE /favorites/:productId   → Remove from Favorites
GET    /favorites              → Get User's Favorites
```

**Frontend:**
```typescript
// Product Card
<HeartIcon
  onClick={toggleFavorite}
  filled={isFavorite}
/>

// Favorites Page
/favorites → Grid of Favorite Products
```

### Success Criteria:

- ✅ Heart Icon on Product Cards
- ✅ Favorites Page (/favorites)
- ✅ Add/Remove funktioniert
- ✅ Persistiert in DynamoDB
- ✅ Responsive Design

---

## Task 2.4: Adress-Validierung (PLZ 5 Stellen)

**Priority:** 🔴 CRITICAL (Bugfix!)
**Effort:** 1-2 Stunden
**Impact:** ⭐⭐⭐⭐

### Problem:
- PLZ kann 6+ Zahlen haben
- Keine Input-Validierung
- Uncool für Demo/Production

### Solution:

**Frontend Validation:**
```typescript
// Checkout Form
<input
  type="text"
  pattern="[0-9]{5}"
  maxLength={5}
  placeholder="12345"
  required
/>

// React Hook Form Schema
const checkoutSchema = z.object({
  zipCode: z.string()
    .regex(/^[0-9]{5}$/, "PLZ muss 5 Ziffern haben")
    .or(z.literal("99999")) // Test-PLZ erlauben
});
```

**Backend Validation (Lambda):**
```typescript
function validateAddress(address) {
  // Allow test addresses
  const testZipCodes = ["99999", "12345"];

  if (testZipCodes.includes(address.zipCode)) {
    return { valid: true, test: true };
  }

  // Real validation
  if (!/^[0-9]{5}$/.test(address.zipCode)) {
    throw new Error("Invalid PLZ format");
  }

  return { valid: true, test: false };
}
```

### Success Criteria:

- ✅ PLZ max 5 Ziffern
- ✅ Frontend Validation (Real-time)
- ✅ Backend Validation (Lambda)
- ✅ Test-PLZ weiterhin erlaubt (99999, 12345)
- ✅ Error Messages klar & hilfreich

---

## Task 2.5: Impressum & Datenschutz (DSGVO)

**Priority:** 🔴 CRITICAL (Legal!)
**Effort:** 2-3 Stunden
**Impact:** ⭐⭐⭐⭐⭐

### Problem:
- Kein Impressum
- Keine Datenschutzerklärung
- DSGVO-Verstoß (auch für Demo!)

### Solution:

**New Pages:**
```
/impressum      → Impressum (Legal Notice)
/datenschutz    → Datenschutzerklärung (Privacy Policy)
/agb            → AGB (Terms of Service) - Optional
```

**Content:**

#### Impressum Template:
```markdown
# Impressum

**Angaben gemäß § 5 TMG:**

AIR LEGACY E-Commerce Demonstration
Max Mustermann (Portfolio Project)
Musterstraße 123
12345 Musterstadt

**Kontakt:**
E-Mail: demo@air-legacy.de
Telefon: +49 (0) 123 456789

**Hinweis:**
Dies ist ein Portfolio-Projekt zu Demonstrationszwecken.
Es werden keine echten Produkte verkauft.

**Haftungsausschluss:**
Trotz sorgfältiger inhaltlicher Kontrolle übernehmen wir keine Haftung.
```

#### Datenschutz Template:
```markdown
# Datenschutzerklärung

**1. Datenschutz auf einen Blick**

Dies ist ein Demo-Projekt. Folgende Daten werden verarbeitet:
- E-Mail-Adresse (für Registrierung)
- Name und Adresse (für Demo-Bestellungen)
- Bestellhistorie

**2. Hosting & AWS Services**

Diese Anwendung nutzt AWS Services:
- AWS Cognito (Authentifizierung)
- AWS DynamoDB (Datenspeicherung)
- AWS Lambda (Backend-Logik)

**3. Cookies**

Wir verwenden nur technisch notwendige Cookies:
- Session-Token (Authentifizierung)
- Shopping Cart State

**4. Ihre Rechte**

- Auskunft über gespeicherte Daten
- Löschung Ihrer Daten
- Widerruf der Einwilligung

**Kontakt:** demo@air-legacy.de
```

**Footer Links:**
```html
<footer>
  <a href="/impressum">Impressum</a>
  <a href="/datenschutz">Datenschutz</a>
  <a href="/agb">AGB</a>
</footer>
```

### Success Criteria:

- ✅ /impressum Page vorhanden
- ✅ /datenschutz Page vorhanden
- ✅ Footer Links auf allen Seiten
- ✅ DSGVO-konform (für Demo-Zwecke)
- ✅ Responsive Design

---

# 🧹 BEREICH 3: Repository Cleanup

## Task 3.1: Dead Code & Unused Files Removal

**Priority:** 🟡 MEDIUM
**Effort:** 3-4 Stunden
**Impact:** ⭐⭐⭐⭐

### What to Clean:

**1. Unused Files:**
```bash
# Find & Remove:
- Old screenshots (docs/screenshots/Bildschirmfoto*.png)
- Duplicate docs (architecture-diagram.drawio, architecture-diagram.html)
- Test files ohne Tests
- Commented-out code blocks
- .DS_Store, .env.example duplicates
```

**2. Dead Code:**
```typescript
// Backend:
- Unused Lambda functions
- Deprecated API endpoints
- Old migration scripts

// Frontend:
- Unused components
- Old CSS files
- Commented imports
```

**3. Documentation:**
```markdown
# Update/Remove:
- Outdated setup guides
- Old session docs (consolidate)
- Duplicate README sections
```

### Cleanup Checklist:

```bash
# 1. Git History Cleanup (Optional)
- Remove large files from history
- BFG Repo-Cleaner für alte commits

# 2. File Structure
docs/
├── screenshots/          → Keep only final 10-15
├── sessions/             → Archive old, keep recent
├── guides/               → Consolidate duplicates
└── archive/              → Move obsolete files

# 3. Code Quality
- ESLint: Fix all warnings
- Remove console.logs (Production)
- Remove TODO comments (or create Issues)
```

### Tools:

```bash
# Find unused exports
npx ts-prune

# Find dead CSS
npx purgecss

# Analyze bundle size
npx webpack-bundle-analyzer

# Find large files
git ls-files -z | xargs -0 du -h | sort -hr | head -20
```

### Success Criteria:

- ✅ Repo size < 50 MB
- ✅ No duplicate files
- ✅ No commented code blocks
- ✅ ESLint warnings = 0
- ✅ Clear folder structure

---

# 📚 BEREICH 4: Documentation Polish

## Task 4.1: README Final Review

**Priority:** 🟢 LOW
**Effort:** 2-3 Stunden
**Impact:** ⭐⭐⭐

### Checklist:

**1. Architecture Section:**
- [ ] Update ASCII diagram
- [ ] Add link to Flow-Diagramm (Task 1.1)
- [ ] Update service count (if changed)

**2. Screenshots:**
- [ ] Update with new features (Profile, Search)
- [ ] Rename to descriptive names
- [ ] Compress images (<500 KB each)

**3. Getting Started:**
- [ ] Test setup instructions
- [ ] Update prerequisites
- [ ] Add troubleshooting section

**4. Features List:**
- [ ] Add new features (Tags, Profile, Wishlist)
- [ ] Update demo credentials
- [ ] Add feature screenshots

**5. Badges:**
- [ ] Update test coverage
- [ ] Add security badges
- [ ] Update deployment status

### Success Criteria:

- ✅ README is up-to-date
- ✅ All links work
- ✅ Screenshots current
- ✅ Setup instructions tested

---

# 🎯 Implementierungs-Strategie

## Empfohlene Reihenfolge:

### **Sprint 1: Quick Wins (1-2 Tage)** ✅ COMPLETED (9. Jan 2026)
1. ✅ Task 2.4: Adress-Validierung (1-2h) - BUGFIX! **[DONE]**
   - Frontend: Real-time validation (5-digit only)
   - Backend: Validation utility + 17 unit tests
   - ADR dokumentiert (docs/ADR_ADDRESS_VALIDATION.md)
   - Commits: 19f3cb4, 0757475

2. ✅ Task 2.5: Impressum & Datenschutz (2-3h) - LEGAL! **[DONE]**
   - /impressum Page (§5 TMG konform)
   - /datenschutz Page (DSGVO Art. 13/14)
   - Footer Component (4-column responsive)
   - Commits: af3bd3a, c07bc9e

3. ✅ Task 1.1: AWS Flow-Diagramm (2-3h) - PORTFOLIO! **[DONE - früher]**
   - 3-Tab Architecture Presentation
   - Top 10 Lessons Learned integriert

**Status:** Alle Sprint 1 Tasks abgeschlossen! 🎉

### **Sprint 2: Navbar Redesign & Filter UX (11. Jan 2026)** 🟡 IN PROGRESS
4. ✅ Task 2.1: Produkt-Tagging (Backend + Frontend) **[DONE]**
   - Backend: targetGroup, tags, searchTerms Felder
   - Frontend: CategoryTabs (Alle/Kinder/Männer/Frauen)
   - Frontend: TagFilter Component (39 Tags)
   - Database re-seeded mit neuen Feldern
   - Commits: Sprint 2 - Tag System

5. ✅ Task 2.6: Sale Visualization **[DONE]**
   - originalPrice Feld im Backend
   - Durchgestrichener Preis + Markanter Sale-Preis
   - Sale Badge auf Product Cards + Detail Pages
   - Discount Percentage Calculation
   - Commits: 832df21, 08320e7

6. ✅ Task 2.7: Mini-Cart Dropdown **[DONE]**
   - Product Preview (max 5 items) mit Thumbnails
   - Subtotal Calculation
   - "Zum Warenkorb" + "Zur Kasse" Buttons
   - Commits: 08320e7

7. 🟡 Task 2.8: Navbar Complete Redesign **[PARTIALLY DONE]**
   - ✅ Burger-Menü komplett entfernt
   - ✅ Alle Filter in Navbar integriert
   - ✅ 2-Row Layout (Logo/Icons + Filter-Bar)
   - ✅ Logo Orange-Grün Gradient (Inline-Styles)
   - ✅ Icons rechts gruppiert (Suche + User + Cart)
   - ✅ Tag-Dropdown funktioniert (position: fixed Lösung)
   - ❌ **OFFEN:** Preis-Dropdown funktioniert nicht (gleiches overflow Problem)
   - ❌ **OFFEN:** Tag-Dropdown UX/Design muss optimiert werden
   - Commits: 85da46a, 7a8cb37, 1e1885b, 2634f6b, 6f8e686, 81843bf, 70ab827

**Status:** Grundlegende Funktionalität erreicht, aber UX-Polish fehlt noch

**OFFENE THEMEN für nächste Session:**
1. **Preis-Dropdown:** Funktioniert nicht - wahrscheinlich gleiches overflow Problem wie Tag-Dropdown hatte
   - **Lösung:** position: fixed Technik anwenden wie beim Tag-Dropdown
2. **Tag-Dropdown Design:** "+ 33 mehr" Button passt nicht zum Layout
   - **Problem:** Zu viele Tags (39 total), Button wirkt überladen
   - **Optionen:**
     - A) Icon-Based: "⋯ Mehr Filter" oder "︙" Icon
     - B) Kompakter: "Mehr" ohne Zahl
     - C) Sidebar: Separate Filter-Sidebar wie bei großen E-Commerce Sites
     - D) Sticky Filter-Bar: Filter bleibt beim Scrollen sichtbar mit Collapse-Option
3. **Filter-Bar Overflow:** flex-wrap wurde hinzugefügt, aber könnte bei vielen aktiven Filtern noch Probleme geben

### **Sprint 3: User Profile, Orders & Wishlist (14-15. Jan 2026)** ✅ COMPLETED
8. ✅ Task 2.2: User Profile & Bestellhistorie (6-8h) **[DONE]**
   - Backend: userController.ts + wishlistController.ts
   - Backend: User Routes (/api/users/profile)
   - Backend: Wishlist Routes (/api/wishlist)
   - Frontend: WishlistContext (state management)
   - Frontend: /profile Page (User Dashboard)
   - Frontend: /orders Page (Order History)
   - Frontend: /wishlist Page (Favorites)
   - Frontend: User Dropdown Menu (Navigation)
   - Frontend: FavoriteButton Component
   - Commits: Multiple commits on 14-15. Jan

9. ✅ Task 2.3: Favoriten/Wishlist (4-6h) **[DONE - Teil von Task 2.2]**
   - DynamoDB: Wishlists Table (userId + productId)
   - Backend: Wishlist CRUD operations
   - Frontend: Heart Icon auf Product Cards
   - Frontend: Wishlist Page mit Product Grid

**Status:** Backend + Frontend komplett implementiert und deployed! 🎉

### **Sprint 4: Post-Launch Bug Fixes & UX Improvements (15. Jan 2026)** 🔴 CRITICAL - DISCOVERED LIVE

**User Feedback vom 15. Januar 2026 - 6 identifizierte Issues:**

#### **Issue 4.1: User Dropdown - Größe & Toggle-Funktionalität** 🔴 HIGH PRIORITY
**Screen:** Screenshot #1 (User Dropdown klein)
**Problem:**
- User Dropdown ist zu klein, schwer lesbar
- Icons zeigen jetzt korrekt (viewBox fix deployed)
- Toggle funktioniert nicht richtig: Sollte beim ersten Klick öffnen, beim zweiten Klick schließen

**Expected Behavior:**
- Dropdown größer (mehr Padding, größere Font-Size)
- Click-Toggle:
  - Klick 1: Dropdown öffnet sich
  - Klick 2: Dropdown schließt sich
  - Click-Outside: Dropdown schließt sich (bereits implementiert)

**Files to Fix:**
- `frontend/components/Navigation.tsx` (Line ~315-377)
- `frontend/components/navigation.css` (User Dropdown Styles)

**Solution Approach:**
```typescript
// Toggle State richtig implementieren:
const [userMenuOpen, setUserMenuOpen] = useState(false);

<button onClick={() => setUserMenuOpen(!userMenuOpen)}>
  {/* Toggle on every click */}
</button>
```

---

#### **Issue 4.2: User Profil - Fehlende Bestellungen & Navigation** 🔴 CRITICAL
**Screen:** Screenshot #2 (Profil zeigt 0 Bestellungen)
**Problem:**
- User hat GERADE eine Bestellung abgeschlossen
- Profil zeigt: "0 BESTELLUNGEN" + "€0.00 GESAMT" + "€0.00 DURCHSCHNITT"
- **Root Cause:** Kein Sync zwischen Orders Table und Profile Statistics
- Fehlt: "Zurück zum Shop" Button

**Expected Behavior:**
- Nach erfolgreicher Bestellung: Profil-Stats aktualisieren
- Bestellungen Count sollte >0 sein
- Total Spent sollte Bestellsumme zeigen
- "Zurück zum Shop" Link/Button prominent platziert

**Files to Check:**
- `frontend/app/profile/page.tsx` (Profile Statistics Calculation)
- Backend: GET /api/users/profile endpoint
- Backend: GET /api/orders endpoint (verify returns orders)

**Debug Steps:**
1. Check if order was created in DynamoDB Orders table
2. Verify /api/orders returns the order
3. Check if profile fetches orders for statistics
4. Add real-time refresh after order creation

**Solution Approach:**
```typescript
// profile/page.tsx
useEffect(() => {
  const fetchOrders = async () => {
    const response = await fetch('/api/orders', {
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await response.json();
    setOrders(data.orders || []);
    // Calculate stats from orders
  };
  fetchOrders();
}, [user]);
```

---

#### **Issue 4.3: Bestellungen Page - Order nicht sichtbar** 🔴 CRITICAL
**Screen:** Screenshot #3 (Empty State trotz Bestellung)
**Problem:**
- Bestellungen Page zeigt Empty State: "Noch keine Bestellungen"
- User hat GERADE eine Bestellung abgeschlossen
- **Root Cause:** Order wird nicht in DynamoDB persistiert ODER fetch schlägt fehl

**Expected Behavior:**
- Nach Checkout: Order sichtbar in /orders
- Order Card mit Status, Datum, Produkten, Preis

**Files to Check:**
- `backend/src/controllers/orderController.ts` (createOrder function)
- `backend/src/services/dynamodb/orders.service.ts` (saveOrder)
- `frontend/app/orders/page.tsx` (fetch orders)
- `frontend/app/checkout/page.tsx` (order creation)

**Debug Steps:**
1. Check DynamoDB Orders table - ist Order dort?
2. Check API logs - wurde createOrder aufgerufen?
3. Check frontend console - 404 oder andere Errors?
4. Verify JWT token valid beim /api/orders fetch

**Hypothesis:**
- Wahrscheinlich: Order wird nicht korrekt in DynamoDB gespeichert
- Oder: userId Mismatch zwischen createOrder und getOrders

---

#### **Issue 4.4: Product Card - Favoriten & Sale Badge Overlap** 🟡 MEDIUM PRIORITY
**Screen:** Screenshot #4 (Heart + Sale Badge überschneiden sich)
**Problem:**
- Heart-Icon (Favoriten) top-right
- Sale Badge "-30%" top-right
- Beide überschneiden sich, nicht lesbar

**Expected Behavior:**
- Beide Elemente sichtbar ohne Overlap
- Clear visual hierarchy

**Files to Fix:**
- `frontend/components/ArticleCard.tsx` (Position Adjustments)
- `frontend/components/articlecard.css` (z-index, positioning)
- `frontend/components/wishlist/FavoriteButton.tsx` (Position)

**Solution Options:**
- **Option A:** Heart links, Sale Badge rechts
- **Option B:** Heart top-right, Sale Badge top-left
- **Option C:** Heart kleiner + inset, Sale Badge prominent
- **Option D:** Heart bottom-right (wie Instagram), Sale top-right

**Recommendation:** Option B (Heart rechts, Sale links) - beste Symmetrie

```css
.favorite-button {
  position: absolute;
  top: 1rem;
  right: 1rem;
  z-index: 2;
}

.sale-badge {
  position: absolute;
  top: 1rem;
  left: 1rem;  /* Moved to left */
  z-index: 1;
}
```

---

#### **Issue 4.5: Favoriten Page - Navigation & Darstellung** 🟡 MEDIUM PRIORITY
**Screen:** Screenshot #5 (Favoriten Page)
**Problem:**
- Fehlt "Zurück zum Shop" Button/Link
- Favoriten-Funktion FUNKTIONIERT (2 Produkte sichtbar)
- Darstellung nicht 100% konsistent mit Shop Home Page:
  - Card-Größe scheint kleiner/abgeschnitten
  - Grid-Layout unterschiedlich
  - Styling nicht identisch mit Home Page Grid

**Expected Behavior:**
- Prominent "← Zurück zum Shop" Link (wie auf Produktdetails)
- Product Cards identisch zu Home Page
- Gleicher Grid-Layout (3 cols → 2 → 1 responsive)
- Konsistente Card-Größe, Image-Ratio, Button-Styles

**Files to Fix:**
- `frontend/app/wishlist/page.tsx` (Add Back Button + Fix Grid)
- `frontend/app/wishlist/wishlist.css` (Match Home Page Grid)
- `frontend/components/wishlist/WishlistGrid.tsx` (Consistency)

**Solution Approach:**
```tsx
// wishlist/page.tsx
<div className="wishlist-header">
  <Link href="/" className="back-to-shop">
    ← Zurück zum Shop
  </Link>
  <h1>MEINE FAVORITEN</h1>
</div>

// Reuse Home Page Grid CSS:
<div className="grid">  {/* Same class as home page */}
  {wishlistProducts.map(product => (
    <ArticleCard product={product} />  {/* Reuse same component */}
  ))}
</div>
```

---

#### **Issue 4.6: Produktdetailseite - Fehlender Favoriten Button** 🟡 MEDIUM PRIORITY
**Screen:** Screenshot #6 (Product Detail ohne Heart)
**Problem:**
- Produktdetailseite hat KEINEN Favoriten/Heart Button
- User kann Produkt nicht als Favorit markieren von Detailseite
- Nur von Grid/Card View möglich

**Expected Behavior:**
- Prominent Heart Button auf Produktdetailseite
- Position: Neben "IN DEN WARENKORB" Button ODER
- Position: Top-right bei Produktbild

**Files to Fix:**
- `frontend/app/products/[id]/page.tsx` (Add FavoriteButton)
- `frontend/app/products/[id]/products.css` (Position + Styling)

**Solution Approach:**
```tsx
// products/[id]/page.tsx
import { FavoriteButton } from '@/components/wishlist/FavoriteButton';

<div className="product-actions">
  <button onClick={handleAddToCart} className="btn-add-to-cart">
    IN DEN WARENKORB
  </button>
  <FavoriteButton productId={product.id} size="large" />
</div>

// Alternative: Above product image
<div className="product-image-container">
  <img src={product.imageUrl} alt={product.name} />
  <FavoriteButton productId={product.id} className="product-favorite" />
</div>
```

---

### **Sprint 4 Summary - Bug Fix Priority Matrix:**

| Issue | Screen | Priority | Effort | Impact | Status |
|-------|--------|----------|--------|--------|--------|
| 4.2 - Profil Statistiken | 2 | 🔴 CRITICAL | 2-3h | ⭐⭐⭐⭐⭐ | ⏳ TODO |
| 4.3 - Orders nicht sichtbar | 3 | 🔴 CRITICAL | 2-4h | ⭐⭐⭐⭐⭐ | ⏳ TODO |
| 4.1 - Dropdown Toggle/Größe | 1 | 🟡 HIGH | 1-2h | ⭐⭐⭐⭐ | ⏳ TODO |
| 4.4 - Favorit/Sale Overlap | 4 | 🟡 MEDIUM | 1h | ⭐⭐⭐ | ⏳ TODO |
| 4.5 - Favoriten Navigation | 5 | 🟡 MEDIUM | 1-2h | ⭐⭐⭐ | ⏳ TODO |
| 4.6 - Detail Favorit Button | 6 | 🟡 MEDIUM | 1h | ⭐⭐⭐ | ⏳ TODO |

**Total Estimated Effort:** 8-13 Stunden
**Critical Path:** Issues 4.2 + 4.3 müssen ZUERST gelöst werden (Orders System)

---

### **Sprint 5: Repository Cleanup & Final Polish (1-2 Tage)** ⏳ NEXT
10. ⏳ Task 3.1: Repository Cleanup (3-4h) - EMPFOHLEN
11. ⏳ Task 4.1: README Final Review (2-3h) - EMPFOHLEN

**Status:** Nach Bug Fixes durchführen

---

## ⏱️ Zeitaufwand Total

**Minimum (Nur Critical):** ~10 Stunden
- Task 1.1: Flow-Diagramm (2h)
- Task 2.4: PLZ-Validierung (1h)
- Task 2.5: Impressum/Datenschutz (2h)
- Task 3.1: Cleanup (3h)
- Task 4.1: README (2h)

**Empfohlen (mit Features):** ~25 Stunden
- Alle Tasks ohne Wishlist

**Maximum (Alles):** ~35 Stunden
- Alle Tasks inklusive Wishlist

---

## 🚀 Quick Start

```bash
# 1. Read this plan
cat docs/ACTION_PLAN_PHASE3.md

# 2. Start with Task 2.4 (Bugfix!)
# PLZ-Validierung implementieren

# 3. Then Task 2.5 (Legal!)
# Impressum & Datenschutz Pages

# 4. Then Task 1.1 (Portfolio!)
# AWS Flow-Diagramm erstellen

# 5. Commit & Deploy
git add .
git commit -m "feat: Phase 3 Quick Wins"
git push
```

---

## 📝 Success Criteria (Stand: 9. Jan 2026)

**Phase 3 - Sprint 1 Quick Wins:** ✅ ABGESCHLOSSEN

- ✅ **Diagramm:** 3-Tab Architecture Presentation (interactive)
- ✅ **Legal:** Impressum & Datenschutz (DSGVO-konform)
- ✅ **Quality:** PLZ-Validierung (5-stellig, 17 tests)
- ⏳ **Features:** Profile, Bestellhistorie - OPTIONAL (nicht kritisch)
- ⏳ **Cleanup:** Repo aufgeräumt - EMPFOHLEN (nächster Schritt)
- ⏳ **Docs:** README final review - EMPFOHLEN (nächster Schritt)

**Portfolio-Ready Status:**

- ✅ Kann in 30 Sekunden erklärt werden
- ✅ Diagramm zeigt Architektur auf einen Blick
- ✅ Features sind modern & professionell
- ✅ Code ist dokumentiert (ADR, README, Architecture Tabs)
- ✅ DSGVO-konform (Impressum, Datenschutz, Footer)
- ⏳ Code Cleanup empfohlen (aber nicht kritisch)

---

## 🐛 CRITICAL BUGS - Nach Fresh Deploy (16. Jan 2026)

**Status:** 🔴 BLOCKING - Must fix before next session
**Detected:** Nach Nuclear Cleanup + Deploy Workflow

### ✅ Was funktioniert:
- ✅ E2E Tests laufen durch
- ✅ Stripe Integration funktioniert sauber
- ✅ Resend Email funktioniert sauber
- ✅ Wishlist Tabelle wird korrekt deployed (Terraform fix erfolgreich)

### ❌ Kritische Bugs:

#### Bug 1: User Dropdown Spacing kommt nicht an 🔴 HIGH
**Problem:**
- 3rem gap Spacing-Änderung deployed, aber nicht sichtbar
- Amplify Build erfolgreich (Commit 70761ca)
- Getestet in Chrome + Safari Private → kein Unterschied
- Styles scheinen geblockt/überschrieben zu werden

**Symptome:**
- Navigation.tsx hat `gap: 3rem` (verified im Code)
- Frontend zeigt weiterhin enges Spacing
- Cache-Issue ausgeschlossen (multiple Browser, Private Mode)

**Next Steps:**
- styled-jsx Cache-Problem untersuchen
- Prüfen ob globale CSS-Overrides existieren
- Eventuell auf CSS Module umstellen
- Browser DevTools: Computed Styles checken

**Files:**
- `/frontend/components/Navigation.tsx` (Zeile 897)

---

#### Bug 2: Wishlist "+ Warenkorb" Button ohne Funktion 🔴 HIGH
**Problem:**
- Button auf `/wishlist` Page ist sichtbar, aber Click macht nichts
- Sollte Produkt in den Warenkorb legen (wie ProductDetailClient)

**Expected Behavior:**
- Click auf "+ Warenkorb" → `addToCart(productId, 1)`
- Toast Notification bei Erfolg/Fehler
- Button disabled wenn ausverkauft

**Actual Behavior:**
- Button ist clickable, aber keine Reaktion
- Keine Netzwerk-Requests sichtbar
- Keine Fehler in Console

**Fix:**
- Implementierung in `/frontend/app/wishlist/page.tsx` prüfen
- `handleAddToCart` Funktion existiert (Zeile 33-40)
- Eventuell Event-Handler nicht korrekt gebunden?
- Button onClick wird aufgerufen? (Zeile 188)

**Files:**
- `/frontend/app/wishlist/page.tsx` (Zeile 33-40, 186-192)

---

#### Bug 3: Profile Name Update schlägt fehl 🔴 HIGH
**Problem:**
- Name ändern auf `/profile` Page wirft Fehler
- Alert: "Name konnte nicht aktualisiert werden"
- DevTools zeigen: `PATCH /api/users/profile` → 404 Not Found
- CORS Preflight geblockt

**Error Messages:**
```
Failed to load resource: the server responded with a status of 404
Access to fetch at 'https://api.aws.his4irness23.de/api/users/profile'
from origin 'https://shop.aws.his4irness23.de' has been blocked by CORS policy:
Method PATCH is not allowed by Access-Control-Allow-Methods in preflight response.

ERROR Failed to update name
GET https://api.aws.his4irness23.de/api/users/profile 404 (Not Found)
```

**Root Cause:**
- Endpoint `/api/users/profile` (PATCH) existiert nicht oder
- API Gateway CORS Config fehlt PATCH Method oder
- Lambda Route fehlt

**Fix Required:**
1. Prüfen ob `userController.updateProfile()` existiert
2. Prüfen ob Route in `userRoutes.ts` registriert ist
3. API Gateway CORS für PATCH Method aktivieren
4. Testen ob Cognito Attribute Update funktioniert

**Files:**
- `/backend/src/controllers/userController.ts`
- `/backend/src/routes/userRoutes.ts`
- Terraform API Gateway CORS Config

---

#### Bug 4: Admin Dashboard Chart defekt 🟡 MEDIUM
**Problem:**
- "Umsatz (letzte 7 Tage)" Chart zeigt nur leere Achsen
- Kein Datenpunkte, nur gestrichelte Grid-Linien
- "Analytics 30d" hat gleiches Problem

**Symptome:**
- Chart-Container rendert
- Achsen-Labels vorhanden (Datum)
- Keine Datenpunkte/Kurven sichtbar
- Andere Dashboard-Stats funktionieren (Bestellungen Heute: 4, etc.)

**Mögliche Ursachen:**
- Chart Library (Recharts?) fehlt nach Deploy?
- Data Format stimmt nicht
- Orders Aggregation defekt
- Frontend Build-Issue (Chunk nicht geladen)

**Next Steps:**
- Console Errors checken
- Network Tab: API Call erfolgreich?
- Chart Component Code prüfen
- Recharts Version/Import prüfen

**Files:**
- `/admin-frontend/app/dashboard/overview/page.tsx` (oder ähnlich)
- Chart Component

---

#### Bug 5: Datenseeding nach Deploy fehlt 🟡 MEDIUM
**Problem:**
- Nach frischem Deploy sind DynamoDB Tabellen LEER
- Früher hatte Deploy Workflow automatisches Seeding
- Jetzt muss manuell `reseed-database.yml` gestartet werden

**Expected Behavior:**
- Deploy Workflow erstellt Tabellen (✅ funktioniert)
- Deploy Workflow befüllt Tabellen mit Demo-Daten (❌ fehlt)
- Produkte, Test-User, etc. sofort verfügbar

**Actual Behavior:**
- Tabellen existieren, aber leer
- Manueller Reseed-Workflow nötig
- Umständlich für frische Deploys

**Fix:**
- Deploy Workflow (.github/workflows/deploy.yml) erweitern
- Nach Terraform Apply: Seed-Script aufrufen
- Oder: `terraform/modules/dynamodb/seed.tf` reaktivieren
- Sicherstellen dass Seeding idempotent ist

**Files:**
- `.github/workflows/deploy.yml`
- `terraform/modules/dynamodb/seed.tf`
- `terraform/scripts/seed-data.js`

---

### 🎯 Fix Priority:

**Sprint 1 - Blocking Bugs (SOFORT):**
1. 🔴 Bug 3: Profile Name Update (Backend/CORS)
2. 🔴 Bug 2: Wishlist Warenkorb Button
3. 🔴 Bug 1: User Dropdown Spacing

**Sprint 2 - Quality Bugs (Diese Woche):**
4. 🟡 Bug 5: Datenseeding Integration
5. 🟡 Bug 4: Admin Dashboard Charts

---

**Let's go! 🚀**
