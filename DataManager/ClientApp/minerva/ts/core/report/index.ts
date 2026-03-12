import { Rosie } from 'rosie/core';
import { ReportDefinition } from '../product';

// ── Local creation types ──────────────────────────────────────────────────────
// MeasureDraft holds all fields needed to build a full server-side MeasureDefinition.

export type MeasureDraft = {
  id: string,
  tableName: string,
  fieldName: string,
  aggregation: string,
  name: string,
  chartType: string,
  stacked: boolean,
  secondaryAxis: boolean,
}

export type ViewDraft = {
  timeField:         string,
  breakdownField:    string,
  startRollingDate?: number,
  endRollingDate?:   number,
  startExactDate?:   string,  // YYYY-MM-DD; takes precedence over rolling when set
  endExactDate?:     string,  // YYYY-MM-DD; takes precedence over rolling when set
}

// ── Helpers ───────────────────────────────────────────────────────────────────

export const NUMERIC_TYPES = ['int', 'bigint', 'float', 'double', 'decimal', 'real', 'numeric', 'integer', 'long'];
export const DATE_TYPES    = ['date', 'timestamp', 'datetime'];
export const isNumeric = (t = '') => NUMERIC_TYPES.some(k => t.toLowerCase().includes(k));
export const isDate    = (t = '') => DATE_TYPES.some(k => t.toLowerCase().includes(k));
export const aggsFor   = (t = '') => isNumeric(t) ? ['SUM', 'AVG', 'MIN', 'MAX', 'COUNT'] : ['COUNT'];
export const defaultAgg = (t = '') => isNumeric(t) ? 'SUM' : 'COUNT';
export const autoName   = (m: MeasureDraft) => m.fieldName ? `${m.aggregation}(${m.fieldName})` : '';
export const newDraft = () => ({
  id: Rosie.guid('m-'),
  tableName: '',
  fieldName: '',
  aggregation: '',
  name: '',
  chartType: 'bar',
  stacked: false,
  secondaryAxis: false
} as MeasureDraft)

// Builds the full server-side ReportDefinition (including server-only measure fields).
// Typed as `any` because MeasureDefinition TS type omits server-only fields by design.
export const buildReportDefinition = (reportName: string, measures: MeasureDraft[], view: ViewDraft) => ({
  name: reportName || 'New Report',
  rowIndex: 0, colIndex: 0, colWidth: 6,
  measures: measures.map(m => ({
    name:          m.name || autoName(m),
    eventName:     m.tableName,
    fieldName:     m.fieldName,
    aggregation:   m.aggregation,
    chartType:     m.chartType,
    stacked:       m.stacked,
    secondaryAxis: m.secondaryAxis,
    calculation:   [],
  })),
  view: {
    timeField:        view.timeField,
    breakdown:        view.breakdownField ? { fieldName: view.breakdownField } : null,
    startRollingDate: view.startExactDate ? null : (view.startRollingDate ?? 7),
    endRollingDate:   view.endExactDate   ? null : (view.endRollingDate   ?? 1),
    startExactDate:   view.startExactDate ?? null,
    endExactDate:     view.endExactDate   ?? null,
  }
} as ReportDefinition);

// Columnar [[field, v1, v2, ...], ...] → row-oriented for the preview table.
export const toRows = (data: any[][]): { headers: string[], rows: any[][] } => {
  if (!data?.length) return { headers: [], rows: [] };
  const headers  = data.map(col => String(col[0]));
  const rowCount = (data[0]?.length ?? 1) - 1;
  const rows     = Array.from({ length: rowCount }, (_, i) => data.map(col => col[i + 1] ?? ''));
  return { headers, rows };
}
