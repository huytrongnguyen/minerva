import { Model, Store } from 'minerva/core';

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
