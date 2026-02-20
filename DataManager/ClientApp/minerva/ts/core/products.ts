import { Model, NavItem, Store } from 'minerva/core';

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

export type ConnectionStats = {
  catalogs: string[],
  schemas: string[],
  tables: string[],
}

export const TestConnectionModel = Model<ConnectionStats>({
  proxy: { url: '/api/products/{productId}/test-connection', method: 'post' }
});

export type ProductEvent = {
  eventName: string,
}

export const ProductEventStore = Store<ProductEvent>({ proxy: { url: '/api/products/{productId}/events' } });

export const TrackedEventStore = Store<ProductEvent>({ proxy: { url: '/api/products/{productId}/tracked-events' } });

export type CampaignInfo = {
  id: number,
  objective: 'APP_INSTALLS' | 'CONVERSIONS' | 'TRAFFIC', // FB objectives
  budgetType: 'DAILY' | 'LIFETIME', // FB budget modes
  platform: 'facebook_ads' | 'google_ads' | 'tiktok_ads',
  campaignId: string,
  campaignName: string,
  // dailyBudgetUsd: number,
  // lifetimeBudgetUsd?: number,
  // isActive: boolean,
  // spendTodayUsd: number,
  // installsToday: number,
  // revenueToday: number,
  // roas: number,
  startTime: string,
  endTime: string,
}

export const CampaignInfoStore = Store<CampaignInfo>({ proxy: { url: '/api/campaigns' } });

export const CampaignGenerationModel = Model<CampaignInfo[]>({
  proxy: { url: '/api/campaigns/generate', method: 'post' }
});
