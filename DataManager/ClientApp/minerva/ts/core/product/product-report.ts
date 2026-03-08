import { Model } from '../http';

export type DashboardLayout = {
  name: string,
  reports: ReportStub[],
}

export type ReportStub = {
  id: string,
  name: string,
}

export type ColumnInfo = {
  field: string,
  label: string,
}

export type ReportResult = {
  name: string,
  columns: ColumnInfo[],
  data: unknown[][], // columnar: [[field, v1, v2, ...], ...] — maps directly to C3 data.columns
}

// Layout endpoint — fast, no Trino.
export const DashboardLayoutModel = Model<DashboardLayout>({
  proxy: { url: '/api/products/{productId}/dashboard/{dashboardId}' }
});

// Factory — creates a fresh isolated model instance per report so parallel
// loads don't overwrite each other.
export const ReportModel = () => Model<ReportResult>({
  proxy: { url: '/api/products/{productId}/dashboard/{dashboardId}/reports/{reportId}' }
});
