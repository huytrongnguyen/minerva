import { Model } from '../http';

export type DashboardDefinition = {
  name: string,
  reports: ReportDefinition[],
}

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

export const DashboardDefinitionModel = Model<DashboardDefinition>({
  proxy: { url: '/api/products/{productId}/dashboard/{dashboardId}' }
});

export const ReportResultModel = Model<ReportResult>({
  proxy: { url: '/api/products/{productId}/reports/execute', method: 'post' }
});
