import { Model, NavItem, Store } from 'minerva/core';

//#region API: /api/products
export type ProductInfo = {
  productId: string,
  productName: string,
  dataOwner: string,
  startDate: string,
  sqlDialect: string,
}

export const ProductInfoStore = Store<ProductInfo>({ proxy: { url: '/api/products' } });

export const ProductNavigatorModel = Model<NavItem[]>({
  proxy: { url: '/api/products/{productId}/navigator', method: 'get' }
});

export const CurrentProductModel = Model<ProductInfo>({
  proxy: { url: '/api/products/{productId}', method: 'get' }
});

export const UpdateProductInfoModel = Model<ProductInfo>({
  proxy: { url: '/api/products/{productId}', method: 'patch' }
});
//#endregion

//#region API: /api/products/{productId}/tables
export type ProductDataTable = {
  dataSetName: string,
  name: string,
  displayName: string,
  semanticName: string,
  desc: string,
}

export const ProductDataTableStore = Store<ProductDataTable>({ proxy: { url: '/api/products/{productId}/tables' } });

export const ImportProductDataTableModel = Model<any>({
  proxy: { url: '/api/products/{productId}/tables/import', method: 'patch' }
});

export const UpdateProductDataTableModel = Model<any>({
  proxy: { url: '/api/products/{productId}/tables', method: 'patch' }
});
//#endregion

//#region API: /api/products/{productId}/tables/{tableName}
export type ProductDataColumn = {
  name: string,
  displayName: string,
  semanticName: string,
  type: string,
  desc: string,
}

export const ProductDataColumnStore = Store<ProductDataColumn>({ proxy: { url: '/api/products/{productId}/tables/{tableName}' } });

//#endregion

//#region API: /api/products/{productId}/connections/datasets
export type ProductDataSet = {
  name: string,
  tables: string[],
}

export const ConnectionDataSetStore = Store<ProductDataSet>({
  proxy: { url: '/api/products/{productId}/connections/datasets', method: 'post' }
});

export const ConnectionDataSetModel = Model<ProductDataSet>({
  proxy: { url: '/api/products/{productId}/connections/datasets/{dataSetName}', method: 'post' }
});
//#endregion
