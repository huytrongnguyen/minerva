/* Shared Nova types */

export interface NavItem {
  label: string;
  path: string;
  icon: string;
}

export interface FilterState {
  dateFrom: string;
  dateTo: string;
  productId: string;
  platform: string;
  country: string;
}

export type SortDir = 'asc' | 'desc' | null;

export interface SortState {
  column: string;
  dir: SortDir;
}

export interface PageState {
  page: number;
  pageSize: number;
  total: number;
}
