import { NavItem } from 'minerva/core';

export const navigator: NavItem[] = [{
  navId: 'ads-manager',
  navName: 'Ads Manager',
  navPath: '/ads-manager'
}]

export type Campaign = {
  id: number,
  objective: 'APP_INSTALLS' | 'CONVERSIONS' | 'TRAFFIC', // FB objectives
  budgetType: 'DAILY' | 'LIFETIME', // FB budget modes
  platform: 'facebook_ads' | 'google_ads' | 'tiktok_ads',
  campaignId: string,
  campaignName: string,
  dailyBudgetUsd: number,
  lifetimeBudgetUsd?: number,
  isActive: boolean,
  spendTodayUsd: number,
  installsToday: number,
  revenueToday: number,
  roas: number,
}