import { Dictionary } from 'rosie/core';
import { Model } from '../http';

export const ProductDashboardModel = Model<Dictionary<any[]>>({
  proxy: { url: '/api/products/{productId}/dashboard/{dashboardId}' }
});