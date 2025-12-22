# 📊 Admin Dashboard Implementation Plan (Option B)

**Status:** 📝 Geplant
**Geschätzter Aufwand:** 6-8 Stunden
**Komplexität:** Mittel
**Priority:** Medium

---

## 🎯 Ziel

Ein **Standard Dashboard** für das Admin Frontend mit:
- KPI Cards (Bestellungen, Umsatz, Kunden, AOV)
- Chart: Umsatz letzte 7 Tage (Bar Chart)
- Top 5 Produkte (nach Verkaufszahl)
- Niedrig Lagerbestand Alert (< 10 Stück)

**Showcase Value:**
- ✅ React Chart Integration (Recharts)
- ✅ Backend Analytics Endpoints
- ✅ Data Aggregation (DynamoDB)
- ✅ Business Metrics Visualization

---

## 📐 Dashboard Layout (Wireframe)

```
┌──────────────────────────────────────────────────────┐
│  🏠 AIR LEGACY ADMIN DASHBOARD          [Abmelden]   │
├──────────────────────────────────────────────────────┤
│                                                        │
│  ┌─────────────────────────────────────────────────┐ │
│  │ KPI CARDS (4 Metriken)                          │ │
│  ├──────────┬──────────┬──────────┬────────────────┤ │
│  │ 📦 Orders│ 💰 Umsatz│ 👥 Kunden│ 📊 Ø Warenkorb│ │
│  │  12      │ €1.234   │  23      │ €102,83       │ │
│  │  +20%    │  +15%    │  +5%     │  -3%          │ │
│  └──────────┴──────────┴──────────┴────────────────┘ │
│                                                        │
│  ┌─────────────────────────────────────────────────┐ │
│  │ UMSATZ LETZTE 7 TAGE                            │ │
│  │                                                  │ │
│  │  €                                               │ │
│  │  1500 │         █                                │ │
│  │  1000 │     █   █   █                            │ │
│  │   500 │ █   █   █   █   █   █   █               │ │
│  │     0 └─────────────────────────────             │ │
│  │       Mo  Di  Mi  Do  Fr  Sa  So                │ │
│  └─────────────────────────────────────────────────┘ │
│                                                        │
│  ┌──────────────────────┬──────────────────────────┐ │
│  │ TOP 5 PRODUKTE       │ NIEDRIG LAGERBESTAND     │ │
│  ├──────────────────────┼──────────────────────────┤ │
│  │ 1. Air Max 270       │ ⚠️ Urban Flight Pack (5) │ │
│  │    45x verkauft      │ ⚠️ Street Pulse (3)      │ │
│  │ 2. Court Legends     │ ⚠️ Velocity Runner (7)   │ │
│  │    32x verkauft      │                           │ │
│  │ 3. ...               │ [Zu Produkten →]         │ │
│  └──────────────────────┴──────────────────────────┘ │
│                                                        │
│  [Zu Produktverwaltung →]                            │
│                                                        │
└──────────────────────────────────────────────────────┘
```

---

## 🔌 Benötigte API Endpoints

### 1. `/api/admin/stats` (GET)

**Zweck:** Aggregierte KPI-Daten für Dashboard Cards

**Response:**
```json
{
  "ordersToday": 12,
  "ordersTrend": 20,  // Prozent vs. gestern
  "revenueToday": 1234.56,
  "revenueTrend": 15,
  "newCustomers7d": 23,
  "customersTrend": 5,
  "averageOrderValue": 102.83,
  "aovTrend": -3
}
```

**Backend Logik:**
- DynamoDB Scan auf `orders` table
- Filter: `createdAt` >= heute 00:00 UTC
- Sum: `order.total` für Revenue
- Count: distinct `order.userId` für Customers
- AOV: `totalRevenue / orderCount`
- Trend: Compare mit gestern

---

### 2. `/api/admin/analytics/revenue-7d` (GET)

**Zweck:** Umsatz-Daten für Bar Chart (letzte 7 Tage)

**Response:**
```json
{
  "data": [
    { "date": "2025-12-16", "revenue": 450.50 },
    { "date": "2025-12-17", "revenue": 680.20 },
    { "date": "2025-12-18", "revenue": 920.00 },
    { "date": "2025-12-19", "revenue": 550.75 },
    { "date": "2025-12-20", "revenue": 1100.30 },
    { "date": "2025-12-21", "revenue": 890.10 },
    { "date": "2025-12-22", "revenue": 1234.56 }
  ]
}
```

**Backend Logik:**
- DynamoDB Scan auf `orders` table
- Filter: `createdAt` >= vor 7 Tagen
- Group by: Day
- Sum: `order.total` per day

---

### 3. `/api/admin/analytics/top-products` (GET)

**Zweck:** Top 5 meistverkaufte Produkte

**Response:**
```json
{
  "products": [
    { "id": "air-max-270", "name": "Air Max 270 Urban", "salesCount": 45 },
    { "id": "court-legends", "name": "Court Legends Jersey", "salesCount": 32 },
    { "id": "urban-flight", "name": "Urban Flight Pack", "salesCount": 28 },
    { "id": "velocity-runner", "name": "Velocity Sprint Runner", "salesCount": 22 },
    { "id": "street-pulse", "name": "Street Pulse Neon", "salesCount": 18 }
  ]
}
```

**Backend Logik:**
- DynamoDB Scan auf `orders` table
- Extract: `order.items[]`
- Count: Wie oft jedes Product in Orders vorkommt
- Sort: By count DESC
- Limit: 5

---

### 4. `/api/admin/products/low-stock` (GET)

**Zweck:** Produkte mit niedrigem Lagerbestand

**Query Params:** `?threshold=10` (default)

**Response:**
```json
{
  "products": [
    { "id": "urban-flight-003", "name": "Urban Flight Pack", "stock": 5 },
    { "id": "street-pulse-004", "name": "Street Pulse Neon", "stock": 3 },
    { "id": "velocity-runner-005", "name": "Velocity Sprint Runner", "stock": 7 }
  ]
}
```

**Backend Logik:**
- DynamoDB Scan auf `products` table
- Filter: `stock < threshold`
- Sort: By stock ASC
- Return: All matches

---

## 🧩 Frontend Components

### 1. `app/dashboard/overview/page.tsx` (NEW)

**Purpose:** Dashboard Overview Page
**Route:** `/dashboard/overview`
**Auth:** Protected (redirect to login if not authenticated)

**Structure:**
```tsx
export default function DashboardOverviewPage() {
  const [stats, setStats] = useState(null);
  const [revenue7d, setRevenue7d] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [lowStock, setLowStock] = useState([]);

  useEffect(() => {
    // Fetch all 4 endpoints parallel
    Promise.all([
      fetch('/api/admin/stats'),
      fetch('/api/admin/analytics/revenue-7d'),
      fetch('/api/admin/analytics/top-products'),
      fetch('/api/admin/products/low-stock')
    ]).then(/* ... */);
  }, []);

  return (
    <main className="dashboard">
      <DashboardHeader />
      <KPICards stats={stats} />
      <RevenueChart data={revenue7d} />
      <div className="dashboard-grid">
        <TopProducts products={topProducts} />
        <LowStockAlert products={lowStock} />
      </div>
    </main>
  );
}
```

---

### 2. `components/dashboard/KPICards.tsx` (NEW)

**Purpose:** Display 4 KPI metrics with trend indicators

```tsx
interface KPICardsProps {
  stats: {
    ordersToday: number;
    ordersTrend: number;
    revenueToday: number;
    revenueTrend: number;
    newCustomers7d: number;
    customersTrend: number;
    averageOrderValue: number;
    aovTrend: number;
  };
}

export function KPICards({ stats }: KPICardsProps) {
  return (
    <div className="kpi-cards">
      <KPICard
        icon="📦"
        label="Bestellungen (Heute)"
        value={stats.ordersToday}
        trend={stats.ordersTrend}
      />
      <KPICard
        icon="💰"
        label="Umsatz (Heute)"
        value={`€${stats.revenueToday.toFixed(2)}`}
        trend={stats.revenueTrend}
      />
      <KPICard
        icon="👥"
        label="Neue Kunden (7d)"
        value={stats.newCustomers7d}
        trend={stats.customersTrend}
      />
      <KPICard
        icon="📊"
        label="Ø Warenkorb"
        value={`€${stats.averageOrderValue.toFixed(2)}`}
        trend={stats.aovTrend}
      />
    </div>
  );
}
```

**Styling:**
- Grid: 4 columns (responsive: 2 cols auf Mobile)
- Cards: White background, subtle shadow, rounded corners
- Trend: Green arrow ↑ for positive, Red arrow ↓ for negative

---

### 3. `components/dashboard/RevenueChart.tsx` (NEW)

**Purpose:** Bar Chart für Umsatz letzte 7 Tage

**Library:** Recharts

```tsx
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

interface RevenueChartProps {
  data: Array<{ date: string; revenue: number }>;
}

export function RevenueChart({ data }: RevenueChartProps) {
  return (
    <div className="chart-card">
      <h3>Umsatz letzte 7 Tage</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="revenue" fill="#ff6b35" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
```

---

### 4. `components/dashboard/TopProducts.tsx` (NEW)

**Purpose:** Liste der Top 5 meistverkauften Produkte

```tsx
interface TopProductsProps {
  products: Array<{
    id: string;
    name: string;
    salesCount: number;
  }>;
}

export function TopProducts({ products }: TopProductsProps) {
  return (
    <div className="dashboard-card">
      <h3>Top 5 Produkte</h3>
      <ol className="top-products-list">
        {products.map((product, index) => (
          <li key={product.id}>
            <span className="rank">#{index + 1}</span>
            <span className="name">{product.name}</span>
            <span className="sales">{product.salesCount}x verkauft</span>
          </li>
        ))}
      </ol>
    </div>
  );
}
```

---

### 5. `components/dashboard/LowStockAlert.tsx` (NEW)

**Purpose:** Warnung für Produkte mit niedrigem Lagerbestand

```tsx
interface LowStockAlertProps {
  products: Array<{
    id: string;
    name: string;
    stock: number;
  }>;
}

export function LowStockAlert({ products }: LowStockAlertProps) {
  return (
    <div className="dashboard-card dashboard-card--warning">
      <h3>⚠️ Niedriger Lagerbestand</h3>
      {products.length === 0 ? (
        <p>Alle Produkte ausreichend vorrätig ✅</p>
      ) : (
        <ul className="low-stock-list">
          {products.map(product => (
            <li key={product.id}>
              <span className="name">{product.name}</span>
              <span className="stock">{product.stock} auf Lager</span>
            </li>
          ))}
        </ul>
      )}
      <a href="/dashboard" className="button button--secondary">
        Zu Produkten →
      </a>
    </div>
  );
}
```

---

## 🗂️ Backend Services

### 1. `backend/src/services/analytics.service.ts` (NEW)

**Purpose:** Analytics & Stats Logic

```typescript
import database from '../config/database-adapter';
import { Order } from '../models/Order';

export async function getAdminStats() {
  // Get all orders
  const orders = await database.getAllOrders();

  // Filter orders from today
  const today = new Date().toISOString().split('T')[0];
  const ordersToday = orders.filter(o => o.createdAt.startsWith(today));

  // Calculate metrics
  const ordersCount = ordersToday.length;
  const revenueToday = ordersToday.reduce((sum, o) => sum + o.total, 0);

  // Get yesterday for trend
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
  const ordersYesterday = orders.filter(o => o.createdAt.startsWith(yesterday));
  const revenueYesterday = ordersYesterday.reduce((sum, o) => sum + o.total, 0);

  // Calculate trends
  const ordersTrend = calculateTrend(ordersCount, ordersYesterday.length);
  const revenueTrend = calculateTrend(revenueToday, revenueYesterday);

  // AOV (Average Order Value)
  const aov = ordersCount > 0 ? revenueToday / ordersCount : 0;

  return {
    ordersToday: ordersCount,
    ordersTrend,
    revenueToday,
    revenueTrend,
    averageOrderValue: aov,
    aovTrend: 0 // TODO: Calculate vs. yesterday
  };
}

function calculateTrend(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0;
  return Math.round(((current - previous) / previous) * 100);
}
```

---

### 2. `backend/src/controllers/analyticsController.ts` (NEW)

**Purpose:** API Endpoints für Dashboard

```typescript
import { Request, Response } from 'express';
import * as analyticsService from '../services/analytics.service';

export async function getAdminStats(req: Request, res: Response) {
  try {
    const stats = await analyticsService.getAdminStats();
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
}

export async function getRevenue7d(req: Request, res: Response) {
  try {
    const data = await analyticsService.getRevenue7d();
    res.json({ data });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch revenue data' });
  }
}

export async function getTopProducts(req: Request, res: Response) {
  try {
    const products = await analyticsService.getTopProducts();
    res.json({ products });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch top products' });
  }
}
```

---

## 📦 Dependencies

**Frontend (admin-frontend):**
```json
{
  "dependencies": {
    "recharts": "^2.10.0"  // React Charts Library
  }
}
```

**Backend:** Keine neuen Dependencies nötig!

---

## 🛠️ Implementierungs-Schritte

### Phase 1: Backend Analytics (3-4 Stunden)

1. ✅ **Analytics Service erstellen**
   - `backend/src/services/analytics.service.ts`
   - Functions: `getAdminStats()`, `getRevenue7d()`, `getTopProducts()`

2. ✅ **Analytics Controller erstellen**
   - `backend/src/controllers/analyticsController.ts`
   - Endpoints: `/api/admin/stats`, `/api/admin/analytics/*`

3. ✅ **Routes registrieren**
   - `backend/src/routes/adminRoutes.ts` (NEW or extend existing)
   - Protect with Auth Middleware

4. ✅ **Low Stock Endpoint erweitern**
   - `backend/src/controllers/productController.ts`
   - Add `getLowStockProducts()`

5. ✅ **Testen mit Postman/curl**
   - Verify all endpoints return correct data

---

### Phase 2: Frontend Dashboard (3-4 Stunden)

6. ✅ **Recharts installieren**
   ```bash
   cd admin-frontend
   npm install recharts
   ```

7. ✅ **Dashboard Components erstellen**
   - `components/dashboard/KPICards.tsx`
   - `components/dashboard/KPICard.tsx`
   - `components/dashboard/RevenueChart.tsx`
   - `components/dashboard/TopProducts.tsx`
   - `components/dashboard/LowStockAlert.tsx`

8. ✅ **Dashboard Overview Page erstellen**
   - `app/dashboard/overview/page.tsx`
   - Fetch all 4 endpoints parallel
   - Handle loading & error states

9. ✅ **Styling hinzufügen**
   - Dashboard grid layout
   - KPI card styles
   - Chart card styles
   - Responsive design (Mobile-friendly)

10. ✅ **Navigation anpassen**
    - Add "Dashboard" link in header
    - Redirect `/dashboard` → `/dashboard/overview`
    - Keep `/dashboard` route for Product Management (rename?)

---

### Phase 3: Testing & Polish (1-2 Stunden)

11. ✅ **Integration Testing**
    - Test Dashboard mit echten Bestellungen
    - Verify all metrics are correct
    - Check chart renders properly

12. ✅ **Error Handling**
    - Add error boundaries
    - Loading skeletons für bessere UX
    - Fallback wenn keine Daten

13. ✅ **Mobile Responsiveness**
    - KPI Cards: 2 columns on mobile
    - Chart: Scrollable on small screens
    - Test auf verschiedenen Devices

14. ✅ **Documentation**
    - Update README.md
    - Add screenshots to docs/
    - Update ACTION_PLAN.md

---

## 🎨 Design System

### Colors
```css
:root {
  --primary: #ff6b35;      /* Orange (AIR LEGACY brand) */
  --success: #00c853;      /* Green (positive trend) */
  --danger: #ff1744;       /* Red (negative trend) */
  --warning: #ffc107;      /* Yellow (low stock) */
  --text: #212121;
  --text-light: #757575;
  --bg-card: #ffffff;
  --bg-page: #f5f5f5;
}
```

### Typography
- Headers: `font-weight: 700`
- Body: `font-weight: 400`
- Numbers: `font-weight: 600` (tabular-nums)

---

## 📊 Success Metrics

**Dashboard ist erfolgreich wenn:**
- ✅ Alle 4 KPI Cards zeigen korrekte Live-Daten
- ✅ Revenue Chart rendert ohne Fehler
- ✅ Top Products zeigt Top 5 aus echten Orders
- ✅ Low Stock Alert funktioniert (threshold = 10)
- ✅ Dashboard lädt in < 2 Sekunden
- ✅ Mobile responsive (funktioniert auf Handy)

---

## 🚀 Deployment Checklist

- [ ] Backend: Analytics Service deployed zu Lambda
- [ ] Backend: Analytics Routes registriert
- [ ] Frontend: Recharts dependency in package.json
- [ ] Frontend: Dashboard Components gebaut
- [ ] Frontend: Amplify Build erfolgreich
- [ ] Testing: Dashboard auf dev environment getestet
- [ ] Documentation: Screenshots + README update
- [ ] Production: Feature-Flag (optional) falls schrittweises Rollout gewünscht

---

## 🔮 Future Enhancements (Option C)

**Nach Option B können wir erweitern:**
- 📈 Revenue Chart 30 Tage (statt 7)
- 🥧 Category Breakdown (Pie Chart)
- 📋 Recent Orders Table
- 📧 Stock Alert Notifications (Email via SES)
- 📊 Customer Lifetime Value
- 🔄 Real-time Updates (WebSocket)

---

**Ready to implement?** Follow the steps above in sequence! 🚀
