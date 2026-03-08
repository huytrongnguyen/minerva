import { Model, Store } from '../http';
import { NavItem } from '../types';

export type ProductInfo = {
  productId: string,
  productName: string,
  dataOwner: string,
  startDate: string,
  sqlDialect: string,
}

export const ProductInfoStore = Store<ProductInfo>({
  proxy: { url: '/api/products' }
});

export const CurrentProductModel = Model<ProductInfo>({
  proxy: { url: '/api/products/{productId}' }
});

export const UpdateProductInfoModel = Model<ProductInfo>({
  proxy: { url: '/api/products/{productId}', method: 'patch' }
});

export type ProductConnection = {
  sqlDialect: string,
  endpoint: string,
  clientId: string,
  clientSecret: string,
}

export const ProductConnectionModel = Model<ProductConnection>({
  proxy: { url: '/api/products/{productId}/connection' }
});

export const ProductNavigatorModel = Model<NavItem[]>({
  proxy: { url: '/api/products/{productId}/navigator' }
});