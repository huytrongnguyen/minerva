# Changelog

## vNext

**Features**

- Re-design layout
- Add `Dashboard > Smart View > Overview` screen
- Add `Settings` screen
  - Add POST `/api/products/{productId}/test-connection`
  - Add PATCH `/api/products/{productId}`
  - Add PATCH `/api/products/{productId}/tables`
  - Add POST `/api/products/{productId}/connections/datasets`
  - Add POST `/api/products/{productId}/connections/datasets/{dataSetName}`
- Add `Events` screen
  - Add GET `/api/products/{productId}/events`
- Add `Event Fields` screen
  - Add GET `/api/products/{productId}/events/{eventName}`
- Implement `TrinoStore`
- Implement `ProductStore`
- Implement `ProductDataTableStore`
- Implement `ProductDataColumnStore`
- Implement `ProductService`
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