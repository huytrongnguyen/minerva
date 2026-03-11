# Modern UI Design Proposal — Nova Dashboard (Light Mode)

A premium, Notion-style light mode analytics dashboard and management console for Minerva — the Data-Informed Decision Platform for mobile game studios. The new client app will live at `DataManager/ClientApp/nova/` so it can coexist with the existing `minerva/` app during the migration period.

---

## Design Preview

![Minerva Dashboard Mockup](/Users/huynguyen/.gemini/antigravity/brain/edb95222-dfe7-44eb-b693-bd5068a228f8/minerva_dashboard_light_1773144288378.png)
*Proposed Notion-style light mode dashboard with clean KPI cards, LTV trend chart, revenue stacked bar, and data table.*

---

## Framework & Technology Recommendation

### ✅ Recommended Stack: React 19 + Vite + Recharts + Tailwind CSS v4

| Layer | Recommendation | Why |
|---|---|---|
| **Bundler** | **Vite** (replace esbuild scripts) | HMR, faster DX, plugin ecosystem |
| **Charts** | **Recharts** (replace C3.js) | React-native, composable, dark theme–friendly, well-maintained |
| **CSS** | **Tailwind CSS v4** | Utility-first, design tokens, great for dark modes, tiny output |
| **UI Primitives** | **shadcn/ui** (Radix UI) | Accessible, headless, fully customizable components |
| **Icons** | **Lucide React** | Lightweight, consistent icon set (already Radix-compatible) |
| **Tables** | **TanStack Table v8** | Headless, virtual scrolling, sorting/filtering built-in |
| **Routing** | **React Router v7** (same as now) | No change needed |
| **State** | Existing `Subject<T>` / `DataStore<T>` from `rosie/` | No external state lib needed |
| **Language** | TypeScript 5 (same as now) | No change |

> [!NOTE]
> The existing `DataManager/ClientApp/minerva/` app stays **untouched**. The new app lives in `DataManager/ClientApp/nova/` and gets its own esbuild/Vite entry point and Razor page. You can switch between them at your own pace and retire `minerva/` when ready.

> [!IMPORTANT]
> **Breaking change decision required**: Should `nova/` replace `minerva/` in `Program.cs` immediately, or run as a second SPA served at `/nova`? Recommend starting at `/nova` during development then cutting over.

---

## Proposed Folder Structure

```
DataManager/ClientApp/nova/
  ts/
    app.tsx                   — root: Router + layout wiring
    core/                     — domain + API layer (mirrors minerva/core)
      types.ts
      http.ts
      product/
        product-info.ts
        product-event.ts
        product-report.ts
        index.ts
      index.ts
    design/                   — design system tokens (CSS vars, Tailwind config)
      tokens.css              — --color-primary, --color-surface, etc.
    components/               — shared UI
      layout/
        AppShell.tsx          — sidebar + topbar + content slot
        Sidebar.tsx           — collapsible nav with icons
        Topbar.tsx            — product selector, breadcrumbs, avatar
      charts/
        KpiCard.tsx           — stat card with sparkline
        LineChart.tsx         — Recharts wrapper for LTV trend
        StackedBarChart.tsx   — Recharts wrapper for revenue breakdown
        ChartCard.tsx         — titled card container
      table/
        DataTable.tsx         — TanStack Table with search, pagination, sort
        TableToolbar.tsx
      ui/
        Badge.tsx             — status badges
        Button.tsx
        Dialog.tsx            — shadcn/ui modal wrapper
        Dropdown.tsx
    views/
      dashboard/
        DashboardView.tsx     — KPI cards + charts grid
        DashboardEditor.tsx   — drag-and-drop layout editor (Phase 2)
      products/
        ProductListView.tsx   — product management table
        ProductFormView.tsx   — create/edit product modal
      events/
        EventListView.tsx     — semantic event table list
        EventFieldView.tsx    — field mapping for a specific event
      reports/
        ReportListView.tsx    — saved report library
        ReportBuilderView.tsx — ad-hoc query + chart builder
  scss/                       — minimal global overrides (if Tailwind not used exclusively)
    app.scss
```

---

## Key UI Screens

### 1. Dashboard View
- **KPI row**: 4 glassmorphism stat cards (Total Revenue, Active Users, Avg LTV, D1 Retention) — each with a mini sparkline powered by Recharts `<AreaChart>`.
- **Chart row**: LTV Trend `<LineChart>` (left, 60% width) + Revenue by Media Source `<StackedBarChart>` (right, 40%).
- **Data table**: Player cohort table with columns: User ID, Country, Platform, Session Count, Total Spend, Status, D7 Retention. Sortable, filterable, paginated.
- Date-range picker in the topbar controls all charts simultaneously.

### 2. Products Management
- Card grid or table listing all products (`productId`, display name, data connection status).
- Actions: Add Product, Edit Settings, View Dashboard, Delete.

### 3. Events Management
- Two-level: Event Table List → Event Field Mapping.
- Shows `schema_type` badge (consistent / game_specific), `semantic_table` ID, physical table, column mappings.

### 4. Reports / Dashboards Management
- List all saved `dashboard.configs` entries (JSONB layout) from Postgres.
- Actions: Open, Clone, Edit Layout, Delete.
- Report Builder: select measures, dimensions, time range → live preview → save.

### 5. Fields Management
- Browse `catalog/raw_tables.yaml` queryable tables.
- Show columns, types, `schema_type`, semantic field mappings.

---

## Design System Tokens

```css
/* DataManager/ClientApp/nova/ts/design/tokens.css */
:root {
  --color-bg:        #0f1117;
  --color-surface:   #13161f;
  --color-surface-2: #1a1e2e;
  --color-border:    #2a2d3e;
  --color-primary:   #7c3aed;   /* violet */
  --color-teal:      #06b6d4;
  --color-amber:     #f59e0b;
  --color-blue:      #3b82f6;
  --color-text:      #e2e8f0;
  --color-muted:     #64748b;
  --radius-card:     12px;
  --shadow-card:     0 4px 24px rgba(0,0,0,0.4);
  --glow-primary:    0 0 16px rgba(124,58,237,0.35);
  --glow-teal:       0 0 16px rgba(6,182,212,0.35);
}
```

---

## Proposed Changes

### New Files (nova app)

#### [NEW] `DataManager/ClientApp/nova/ts/app.tsx`
Root component, Router setup, AppShell wiring, all routes.

#### [NEW] `DataManager/ClientApp/nova/ts/design/tokens.css`
Design system CSS custom properties.

#### [NEW] `DataManager/ClientApp/nova/ts/components/layout/AppShell.tsx`
Full-page layout: collapsible sidebar + topbar + `<Outlet />`.

#### [NEW] `DataManager/ClientApp/nova/ts/components/charts/KpiCard.tsx`
Stat card with title, value, delta badge, sparkline area chart.

#### [NEW] `DataManager/ClientApp/nova/ts/components/charts/LineChart.tsx`
Recharts `<ResponsiveContainer><LineChart>` wrapper, dark theme preset.

#### [NEW] `DataManager/ClientApp/nova/ts/components/charts/StackedBarChart.tsx`
Recharts stacked bar, color-coded by group.

#### [NEW] `DataManager/ClientApp/nova/ts/components/table/DataTable.tsx`
TanStack Table v8: sorting, global filter, pagination, row selection.

#### [NEW] `DataManager/ClientApp/nova/ts/views/dashboard/DashboardView.tsx`
Composes KpiCard row + chart row + DataTable. Calls existing backend APIs.

#### [NEW] `DataManager/ClientApp/nova/ts/views/products/ProductListView.tsx`
DataTable of products with action buttons.

#### [NEW] `DataManager/ClientApp/nova/ts/views/events/EventListView.tsx`
DataTable of event tables + field mapping sub-view.

#### [NEW] `DataManager/ClientApp/nova/ts/views/reports/ReportListView.tsx`
Saved dashboards/reports grid or table.

---

### Existing Files — Minor Modifications

#### [MODIFY] `DataManager/package.json`
Add `nova-js-watch`, `nova-js-build`, `nova-css-watch`, `nova-css-build` scripts (Vite or esbuild). Add Recharts, TanStack Table, Tailwind CSS, Lucide React as new dependencies.

#### [MODIFY] `DataManager/Pages/` (Razor)
Add a `Nova.cshtml` page to serve the new SPA at `/nova` route.

---

## Verification Plan

> [!NOTE]
> This is a UI-only change (no backend logic changes). Verification is primarily visual and functional.

### Build Verification
```bash
cd /Users/huynguyen/Documents/workspaces/minerva/DataManager
npm run nova-js-build
npm run nova-css-build
```
Expected: no TypeScript errors, output files generated in `wwwroot/`.

### Manual Visual Verification (Browser)
1. Run the ASP.NET app: `dotnet run --project DataManager.csproj`
2. Navigate to `http://localhost:5000/nova`
3. Verify:
   - Sidebar renders with correct nav items (Dashboard, Products, Events, Fields, Reports)
   - Dashboard shows KPI cards, LTV line chart, stacked bar chart
   - Data table loads with sorting and search working
   - Products/Events/Reports management pages CRUD flows work
4. Test responsiveness at 1280px, 1440px, 1920px widths.

### Existing Backend API Compatibility
All existing API endpoints remain unchanged:
- `GET /api/products/{productId}/dashboard/{dashboardId}` → DashboardDefinition
- `POST /api/products/{productId}/reports/execute` → ReportResult

The `nova` frontend will call the same endpoints.

---

## Phased Implementation

| Phase | Scope | Estimate |
|---|---|---|
| **Phase 1** | AppShell + design tokens + Dashboard view (KPI + charts + table) | ~3 days |
| **Phase 2** | Products + Events + Fields management views | ~2 days |
| **Phase 3** | Reports / Dashboard management + Report Builder | ~3 days |
| **Phase 4** | DashboardEditor (drag-and-drop layout) | ~2 days |
