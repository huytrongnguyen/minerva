import { Model, Store } from '../http';

//#region API: /api/products/{productId}/datasets
export type ProductDataSet = {
  name: string,
  tables: string[],
}

export const ProductDataSetsModel = Model<ProductDataSet[]>({
  proxy: { url: '/api/products/{productId}/datasets', method: 'get' }
});

export const UpdateProductDataSetModel = Model<ProductDataSet[]>({
  proxy: { url: '/api/products/{productId}/datasets', method: 'patch' }
});

export const ConnectionDataSetStore = Store<ProductDataSet>({
  proxy: { url: '/api/products/{productId}/connection/datasets', method: 'post' }
});

export const ConnectionDataSetModel = Model<ProductDataSet>({
  proxy: { url: '/api/products/{productId}/connection/datasets/{dataSetName}', method: 'post' }
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

export const ProductDataTableStore = Store<ProductDataTable>({
  proxy: { url: '/api/products/{productId}/tables' }
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

export const ProductDataColumnStore = Store<ProductDataColumn>({
  proxy: { url: '/api/products/{productId}/tables/{tableName}' }
});

export const UpdateProductDataColumnModel = Model<ProductDataColumn[]>({
  proxy: { url: '/api/products/{productId}/tables/{tableName}', method: 'patch' }
});
//#endregion
