# Minerva — DataManager Architecture Patterns

## Project Context
`minerva/DataManager` — ASP.NET 10 + React 19 SPA. Dashboard Builder for game analytics.
Tech: C# backend + React/TypeScript frontend, Bootstrap 5, C3 charts, Trino (Iceberg) as data source.

---

## Backend DDD Structure (C#)

```
DataManager/
  Auth/               — AuthFilterAttribute, AuthMiddleware, AuthService
  Controllers/        — thin HTTP layer; delegates to services only
  Infrastructure/     — EF Core entities (UPPER_SNAKE class names), Store implementations, TrinoStore
  Product/            — domain models, interfaces, partial ProductService
  Shared/             — IDataStore, ITrinoStore, utils (no domain logic)
  Program.cs
```

### Key Patterns
- **Interface-in-domain, implementation-in-infrastructure**: `IProductStore` in `Product/`, implemented in `Infrastructure/`
- **`DataStore<TEntity, T>` base class**: EF entity (PRODUCT_INFO) → domain record (ProductInfo) via abstract `ToValue()`
- **`UPPER_CASE` EF entities**: distinguishes EF entities from domain records at a glance
- **`partial class ProductService`** split into logical files:
  - `ProductService.cs` — core (List, Get, Update, GetDataConnection, GetNavigator)
  - `ProductEventService.cs` — semantic event / data table management
  - `ProductReportService.cs` — dashboard queries + pivot transforms
- **Controllers are pure HTTP routers**: one line per endpoint, all logic in service

### Infrastructure Rules
- `BatchUpdate` = `ExecuteDelete()` + `AddRange()` + `SaveChanges()` always wrapped in `BeginTransaction()`
- `HttpClient` injected via `services.AddHttpClient<ITrinoStore, TrinoStore>()` — never `new HttpClient()`
- Per-request auth header set on `HttpRequestMessage`, NOT on `httpClient.DefaultRequestHeaders` (thread-safe)
- `JsonElement` values from Trino: use `.GetString()` / `.GetDouble()` — direct cast `(string)` fails

---

## QueryBuilder Pattern

`QueryDefinition` → `QueryBuilder.Build()` → Trino SQL

Key design decisions:
- `Measure.Event = null` → base table alias `"t"`; non-null → secondary table `"t1"`, `"t2"` (auto-JOIN)
- `Measure.Filters` → `CASE WHEN` inside aggregation (not WHERE) — supports multi-metric on raw event tables
- `Measure.Visible = false` → computed for formula substitution only, excluded from SELECT
- `Measure.Formula = "{alias1} / NULLIF({alias2}, 0)"` → resolved via regex substitution against `measureSql` dict
- `COUNT_EVENTS` → `COUNT(*)` or `COUNT(CASE WHEN ... THEN 1 END)`
- `COUNT_DISTINCT` with filter → `COUNT(DISTINCT CASE WHEN ... THEN field END)`
- `TimeRange.FieldType = "timestamp"` → `TIMESTAMP '...'` literals; `"date"` → `DATE '...'`
- `Filter.Value`: numeric → unquoted; string → single-quoted (via `Literal(object v)` helper)

### Stacked chart pivot pattern
For stacked bar by dimension (e.g. cost by media_source over time):
- Query: `GROUP BY report_date, media_source` → rows `[{report_date, media_source, cost}]`
- Pivot in service: `GroupBy(r => r["report_date"]).Select(g => { row["media_source_value"] = cost })`
- Frontend receives chart-ready rows `[{report_date, "Facebook Ads": 100, "Google Ads": 50}]`
- `JsonElement` cast: `((JsonElement)r["media_source"]).GetString()` as pivot key

---

## Frontend DDD Structure (TypeScript / React)

```
ClientApp/
  auth/ts/            — OAuth callback page (separate Razor entry)
  minerva/ts/
    core/             — domain + application layer
      types.ts        — shared types (NavItem) — NO imports from core
      shared.ts       — jQuery/toastr utilities only
      http.ts         — AuthDataModel, AuthDataStore, Model/Store factories
      user.ts         — user domain
      product/        — product sub-domain
        product-info.ts   — ProductInfo + API models (import from '../http', '../types')
        product-event.ts  — DataSet/Table/Column + API models
        product-report.ts — Dashboard model
        index.ts          — re-exports all three
      index.ts        — barrel re-export (no definitions)
    components/       — shared presentation
      app-layout/     — AppLayout, RequireAuth
      product-layout/ — ProductLayout, ProductSelector
      chart/          — CartesianChart, types (includes d3Format, d3Pattern, chartConfig)
    views/            — feature sub-domains
      products/       — product list, settings, connector
      events/         — semantic event mapping
      reports/        — dashboard, complete-view
  rosie/              — UI framework (own .git — sub-repo)
    ts/core/          — ajax (axios), Subject/observable, DataModel/DataStore
    ts/components/    — grid, dialog, dropdown, datepicker, query-builder
```

### Key Patterns
- **`rosie/` = framework layer** (infrastructure + UI primitives); knows nothing about minerva domain
- **`minerva/` = application layer** — extends rosie, adds auth, domain models
- **`Subject<T>` → `DataModel<T>` → `DataStore<T>`**: lightweight reactive state without external library
- **`AuthDataModel` / `AuthDataStore`** extend base classes, inject auth headers in `fetch()`
- **`Model()` / `Store()` factory functions** in `http.ts` — concise API model declarations
- **View sub-domains** match backend service sub-domains: `products/` ↔ `ProductService`, `events/` ↔ `ProductEventService`, `reports/` ↔ `ProductReportService`

### Circular Import Rule (critical)
Files inside `core/product/*.ts` must use **relative imports**, not the barrel:
```ts
// ✅ correct
import { Model, Store } from '../http';
import { NavItem } from '../types';

// ❌ circular — causes runtime undefined
import { Model, Store } from 'minerva/core';
```
`types.ts` must have zero imports from `core/` to remain a safe leaf node.

### d3 formatting location
`d3Format` and `d3Pattern` live in `components/chart/types.ts`.
- Chart components: import from `'./types'`
- View components: import from `'minerva/components'`
- Never import from `'minerva/core'`

---

## Bootstrap Modal Lifecycle (useDialog pattern)

```ts
// showModal: use getOrCreateInstance (not new Modal — accumulates orphaned instances)
Modal.getOrCreateInstance(dialogEl).show();

// hide(): call Rosie.hideModal(id) — NOT setState(false)
// Bootstrap fires 'hide.bs.modal' → setState(false) → unmounts DOM
// Direct setState(false) unmounts DOM first, Bootstrap can't clean up backdrop
hide: () => Rosie.hideModal(id)

// hideModal: use getInstance (returns null if not shown, avoids no-op)
Modal.getInstance(dialogEl)?.hide();
```

---

## Code Review Checklist (DDD)

**Backend:**
- Controllers: one line per endpoint, no logic?
- Domain interfaces in domain folder, implementations in Infrastructure?
- BatchUpdate: wrapped in transaction?
- HttpClient: registered via AddHttpClient, not AddScoped?
- JsonElement values: cast via .GetString() not (string)?
- Filter values: Literal() helper — numeric unquoted, strings quoted?

**Frontend:**
- `core/product/*.ts`: relative imports only (no `'minerva/core'` barrel)?
- `core/types.ts`: zero imports from core?
- `d3Format`/`d3Pattern`: imported from `'minerva/components'` in views, `'./types'` in chart?
- Dead domain code (commented-out backends): removed from frontend core?
- Store object mutations in React: spread (`{...obj, field: value}`) not direct assignment?
