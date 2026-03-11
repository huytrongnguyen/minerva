# Changelog

## vNext

**Breaking Changes**

- Restructure codebase

**Features**

- Add `Dashboard` screen
  - Add `ProductDashboardController`
    - Add GET `/api/products/{productId}/dashboards/{dashboardId}`
    - Add PATCH `/api/products/{productId}/dashboards/{dashboardId}`
    - Add POST `/api/products/{productId}/reports/execute`
  - Implement `CartesianChart` component
  - Implement `ReportQueryBuilder`

**Improvements**

- Update Product Navigation Sidebar
  - Add GET `/api/products/{productId}/dashboards`
- Update authentication flow
  - Update `AuthService`
  - Update `Login` screen
  - Add `Callback` screen

## v0.0.3
> 2026-03-07

**Features**

- Re-design layout
- Add `Settings` screen
  - Add `ProductController`
    - Add POST `/api/products/{productId}/test-connection`
    - Add PATCH `/api/products/{productId}`
    - Add GET `/api/products/{productId}/connection`
  - Add `ProductDataSetController`
    - Add GET `/api/products/{productId}/datasets`
    - Add PATCH `/api/products/{productId}/datasets`
  - Add POST `/api/products/{productId}/connections/datasets`
  - Add POST `/api/products/{productId}/connections/datasets/{dataSetName}`
- Add `Events` screen
  - Add GET `/api/products/{productId}/tables`
  - Add PATCH `/api/products/{productId}/tables`
- Add `Event Fields` screen
  - Add GET `/api/products/{productId}/tables/{tableName}`
  - Add PATCH `/api/products/{productId}/tables/{tableName}`
- Implement `TrinoStore`
- Implement `ProductStore`
- Implement `ProductDataSetStore`
- Implement `ProductDataTableStore`
- Implement `ProductDataColumnStore`
- Implement `ProductController`

## v0.0.2
> 2025-12-14

**Features**

- Build client app with bootstrap, react, rosie-ui
- Add OAuth2
- Add `Simulation` tab
  - Add `Ads Manager` screen to manage campaign
- Auto generate campaign and save to database

## v0.0.1
> 2025-12-07

**Features**

- Initial project