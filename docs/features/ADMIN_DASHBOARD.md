# Admin Dashboard - Analytics & Insights

**Status:** ✅ Implementiert & Getestet
**Datum:** 23. Dezember 2025
**Version:** 1.0

---

## Übersicht

Das Admin Dashboard bietet eine zentrale Übersicht über wichtige Business-Metriken für den EcoKart E-Commerce Shop. Es visualisiert KPIs, Umsatzentwicklung, Top-Produkte und Lagerbestandswarnungen in Echtzeit.

---

## Features

### 1. KPI Cards (4 Metriken)

Zentrale Kennzahlen mit Trend-Indikatoren:

- **Bestellungen Heute**
  - Anzahl der Bestellungen des aktuellen Tages
  - Trend: Vergleich mit gestern (%)

- **Umsatz Heute**
  - Gesamtumsatz des aktuellen Tages in EUR
  - Trend: Vergleich mit gestern (%)

- **Neue Kunden (7 Tage)**
  - Anzahl unique Kunden der letzten 7 Tage
  - Trend: Vergleich mit vorheriger 7-Tages-Periode (%)

- **Durchschnittlicher Bestellwert**
  - Average Order Value (AOV) heute
  - Trend: Vergleich mit gestern (%)

**Features:**
- Farbcodierte Trends (grün = positiv, rot = negativ)
- Icons für visuelle Orientierung
- Responsive Grid Layout (1/2/4 Spalten)

### 2. Umsatz-Chart (7 Tage)

Balkendiagramm zur Visualisierung der Umsatzentwicklung:

- Zeigt Umsatz der letzten 7 Tage
- Interaktives Recharts Bar Chart
- Currency-formatierte Tooltips
- Responsive Design

**Datenquelle:** `/api/admin/analytics/revenue-7d`

### 3. Top 5 Produkte

Ranking der meistverkauften Produkte:

- Top 5 Produkte nach Verkaufszahl (Quantity)
- Medaillen für Top 3 (🥇🥈🥉)
- Farbcodierte Rank Badges
- Verkaufszahl-Badge

**Datenquelle:** `/api/admin/analytics/top-products?limit=5`

**Berechnung:**
- Iteriert durch alle Orders
- Summiert `item.quantity` pro `productId`
- Sortiert absteigend nach Sales Count

### 4. Low Stock Alert

Warnung für Produkte mit niedrigem Lagerbestand:

- Zeigt Produkte mit `stock < 10`
- Sortiert nach Stock (niedrigster zuerst)
- Farbcodierte Warnungen:
  - Rot: 0-3 Stück (kritisch)
  - Orange: 4-5 Stück (Warnung)
  - Gelb: 6-9 Stück (niedrig)
- Warning-Icons je nach Severity

**Datenquelle:** `/api/admin/products/low-stock?threshold=10`

---

## Technische Implementierung

### Backend

#### 1. Analytics Service
**Datei:** `backend/src/services/analytics.service.ts`

**Funktionen:**
```typescript
getAdminStats(): Promise<AdminStats>
  - Liefert alle 4 KPI-Metriken mit Trends

getRevenue7d(): Promise<RevenueDataPoint[]>
  - Liefert Revenue-Daten für letzte 7 Tage

getTopProducts(limit: number): Promise<TopProduct[]>
  - Liefert Top N Produkte nach Sales Count
```

**Datenquellen:**
- Orders: `database.getAllOrders()`
- Products: `database.getAllProducts()`

**Trend-Berechnung:**
```typescript
trend = ((current - previous) / previous) * 100
```

#### 2. Analytics Controller
**Datei:** `backend/src/controllers/analyticsController.ts`

**Endpoints:**
```
GET /api/admin/stats
GET /api/admin/analytics/revenue-7d
GET /api/admin/analytics/top-products?limit=5
```

#### 3. Product Controller (erweitert)
**Datei:** `backend/src/controllers/productController.ts`

**Neuer Endpoint:**
```
GET /api/admin/products/low-stock?threshold=10
```

#### 4. Admin Routes
**Datei:** `backend/src/routes/adminRoutes.ts`

Zentralisierte Admin-Routen unter `/api/admin/*`

**Registriert in:** `backend/src/index.ts` (Zeile 152)

---

### Frontend

#### 1. Dashboard Components

**Verzeichnis:** `admin-frontend/components/dashboard/`

**Komponenten:**

1. **KPICard.tsx** - Einzelne Metrik-Karte
   - Props: `title`, `value`, `trend`, `icon`, `formatter`
   - Trend-Indikator mit Farbcodierung
   - Reusable Component

2. **KPICards.tsx** - Container für alle 4 KPIs
   - Verwendet KPICard 4x
   - Responsive Grid Layout
   - Currency Formatter für Geldwerte

3. **RevenueChart.tsx** - Umsatz-Balkendiagramm
   - Recharts BarChart
   - Custom Tooltip mit Currency-Formatierung
   - Datum-Formatierung (DD.MM)

4. **TopProducts.tsx** - Top-Produkte-Liste
   - Ranking mit Medaillen (Top 3)
   - Farbcodierte Badges
   - Sales Count anzeigen

5. **LowStockAlert.tsx** - Lagerbestandswarnung
   - Severity-basierte Icons
   - Farbcodierte Stock-Badges
   - Empty State wenn alles OK

#### 2. Dashboard Page

**Datei:** `admin-frontend/app/dashboard/overview/page.tsx`

**Features:**
- Fetcht alle 4 API-Endpoints parallel
- Loading State (Spinner)
- Error State (mit Retry-Button)
- Auto-Refresh alle 60 Sekunden
- Manueller Refresh-Button
- Letzte Aktualisierung anzeigen

**API Integration:**
```typescript
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

// Parallel fetching
Promise.all([
  fetch(`${API_URL}/api/admin/stats`),
  fetch(`${API_URL}/api/admin/analytics/revenue-7d`),
  fetch(`${API_URL}/api/admin/analytics/top-products?limit=5`),
  fetch(`${API_URL}/api/admin/products/low-stock?threshold=10`)
])
```

---

## Dependencies

**Neue Dependencies:**

```json
{
  "recharts": "^2.x.x"  // Chart-Library für Revenue Chart
}
```

**Installation:**
```bash
cd admin-frontend
npm install recharts
```

---

## API Reference

### GET /api/admin/stats

**Response:**
```json
{
  "ordersToday": 12,
  "ordersTrend": 20,
  "revenueToday": 1234.56,
  "revenueTrend": 15,
  "newCustomers7d": 45,
  "customersTrend": -5,
  "averageOrderValue": 102.88,
  "aovTrend": 8
}
```

### GET /api/admin/analytics/revenue-7d

**Response:**
```json
{
  "data": [
    { "date": "2025-12-17", "revenue": 234.50 },
    { "date": "2025-12-18", "revenue": 456.78 },
    ...
  ]
}
```

### GET /api/admin/analytics/top-products

**Query Params:**
- `limit` (optional, default: 5) - Anzahl der Produkte

**Response:**
```json
{
  "products": [
    { "id": "prod-123", "name": "Product A", "salesCount": 45 },
    { "id": "prod-456", "name": "Product B", "salesCount": 32 },
    ...
  ]
}
```

### GET /api/admin/products/low-stock

**Query Params:**
- `threshold` (optional, default: 10) - Stock-Schwellenwert

**Response:**
```json
{
  "products": [
    { "id": "prod-789", "name": "Product C", "stock": 3 },
    { "id": "prod-012", "name": "Product D", "stock": 7 },
    ...
  ]
}
```

---

## Deployment

### Lokale Entwicklung

1. **Backend starten:**
```bash
cd backend
npm start
# Läuft auf http://localhost:4000
```

2. **Frontend starten:**
```bash
cd admin-frontend
npm run dev
# Läuft auf http://localhost:3000
```

3. **Dashboard aufrufen:**
```
http://localhost:3000/dashboard/overview
```

### Production

Das Dashboard funktioniert automatisch mit den deployed Backends:

**Environment Variables:**
```bash
NEXT_PUBLIC_API_URL=https://api.ecokart.aws.his4irness23.de
```

**Amplify Build:**
- Dashboard wird als statische Seite pre-rendered
- API-Calls erfolgen client-side zur Runtime

---

## Testing

### API Testing

Alle Endpoints getestet mit `curl`:

```bash
# Health Check
curl http://localhost:4000/api/health

# Admin Stats
curl http://localhost:4000/api/admin/stats

# Revenue 7d
curl http://localhost:4000/api/admin/analytics/revenue-7d

# Top Products
curl http://localhost:4000/api/admin/analytics/top-products?limit=5

# Low Stock
curl http://localhost:4000/api/admin/products/low-stock?threshold=10
```

**Ergebnis:** Alle Endpoints funktionieren korrekt ✅

### Frontend Testing

**Build Test:**
```bash
cd admin-frontend
npm run build
```

**Ergebnis:**
- Build erfolgreich ✅
- Page pre-rendered: `/dashboard/overview`
- Bundle Size: 104 kB (page), 199 kB First Load JS

---

## Performance

### Backend

- **Datenquelle:** DynamoDB (via database adapter)
- **Caching:** Noch nicht implementiert
- **Optimierung:**
  - Parallel fetching aller Endpoints im Frontend
  - Effiziente Array-Operationen (filter, map, reduce)

**Potentielle Optimierungen:**
- Redis Cache für Stats (TTL: 60s)
- DynamoDB GSI für schnellere Aggregationen
- API Response Compression

### Frontend

- **Chart Library:** Recharts (70 packages, ~40kb gzipped)
- **Auto-Refresh:** 60 Sekunden Intervall
- **Loading States:** Verhindert Layout Shift
- **Error Handling:** Graceful degradation mit Retry

**Bundle Size:**
- Dashboard Page: 104 kB
- First Load JS: 199 kB
- Shared Chunks: 87.3 kB

---

## Nächste Schritte

### Potentielle Erweiterungen

1. **Weitere Metriken**
   - Conversion Rate
   - Cart Abandonment Rate
   - Customer Lifetime Value

2. **Zeitraum-Filter**
   - Letzte 7/30/90 Tage auswählbar
   - Custom Date Range Picker

3. **Export-Funktionen**
   - CSV Export für Reports
   - PDF Report Generation

4. **Real-Time Updates**
   - WebSocket für Live-Updates
   - Server-Sent Events für Notifications

5. **Caching & Performance**
   - Redis Cache für Stats
   - Stale-While-Revalidate Pattern

6. **Permissions**
   - Admin-only Access Control
   - Role-based Dashboard Views

---

## Lessons Learned

### TypeScript Issues

**Problem:** Recharts `TooltipProps` Type-Kompatibilität

**Lösung:** Verwendung von `any` für Tooltip-Props (common workaround)

```typescript
// Statt:
function CustomTooltip({ active, payload }: TooltipProps<number, string>) {

// Nutzen:
function CustomTooltip({ active, payload }: any) {
```

### Nullish Coalescing

**Problem:** `product.stock` ist optional (`stock?: number`)

**Lösung:** Type Guards + Nullish Coalescing Operator

```typescript
.filter(product => typeof product.stock === 'number' && product.stock < threshold)
.sort((a, b) => (a.stock ?? 0) - (b.stock ?? 0))
.map(product => ({ stock: product.stock ?? 0 }))
```

### Date Filtering

**Problem:** Effiziente Filterung nach Datum

**Lösung:** ISO String Prefix Matching

```typescript
const today = new Date().toISOString().split('T')[0];
orders.filter(o => o.createdAt.startsWith(today))
```

---

## Maintainer

**Erstellt von:** Claude Code + Andy (User)
**Datum:** 23. Dezember 2025
**Review:** Pending
