import { Model } from '../http';

//#region API: /api/products/{productId}/dashboards/{dashboardId}
export type DashboardLayout = {
  name: string,
  reports: ReportDefinition[],
}

export const DashboardLayout = Model<DashboardLayout>({
  proxy: { url: '/api/products/{productId}/dashboards/{dashboardId}' }
});

export const UpdateDashboardLayoutModel = Model<DashboardLayout>({
  proxy: { url: '/api/products/{productId}/dashboards/{dashboardId}/reports', method: 'patch' }
});
//#endregion

//#region API: /api/products/{productId}/reports
export type ReportDefinition = {
  name: string,
  rowIndex: number,
  colIndex: number,
  colWidth: number,
  measures: MeasureDefinition[],
  view: ViewDefinition,
}

export type MeasureDefinition = {
  name: string,
//   eventName: string,
//   fieldName: string,
//   aggregation: string,
  chartType: string,
  stacked: boolean,
  secondaryAxis: boolean,
//   calculation: CalculationDefinition[],
}

// export type CalculationDefinition = {
//   type: string,
//   eventName: string,
//   fieldName: string,
//   aggregation: string,
// }

export type ViewDefinition = {
  timeField: string,
//   breakdown: { fieldName: string },
//   startRollingDate: number,
//   endRollingDate: number,
//   startExactDate: string,
//   endExactDate: string,
}

// export type ColumnInfo = {
//   field: string,
//   label: string,
// }

export type ReportResult = {
  // name: string,
  data: any[],
  groups?: string[], // breakdown column names — present when Breakdown is set, used for C3 stacking
}

export const ReportResultModel = Model<ReportResult>({
  proxy: { url: '/api/products/{productId}/reports/execute', method: 'post' }
});
//#endregion
