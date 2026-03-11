import { useEffect, useState } from 'react';
import c3 from 'c3';
import { ProductDataColumn, ProductDataColumnStore, ProductDataTable, ProductDataTableStore, ReportDefinition, ReportResult, ReportResultModel } from 'minerva/core';
import { CartesianChart } from 'minerva/components';
import { Dialog } from 'rosie/components';
import { Rosie } from 'rosie/core';

// ── Local creation types ──────────────────────────────────────────────────────
// MeasureDraft holds all fields needed to build a full server-side MeasureDefinition.

type MeasureDraft = {
  id: string,
  tableName: string,
  fieldName: string,
  aggregation: string,
  name: string,
  chartType: string,
  stacked: boolean,
  secondaryAxis: boolean,
}

type ViewDraft = {
  timeField: string,
  breakdownField: string,
  startRollingDate: number,
  endRollingDate: number,
}

// ── Helpers ───────────────────────────────────────────────────────────────────

const NUMERIC_TYPES = ['int', 'bigint', 'float', 'double', 'decimal', 'real', 'numeric', 'integer', 'long'];
const DATE_TYPES    = ['date', 'timestamp', 'datetime'];
const isNumeric = (t = '') => NUMERIC_TYPES.some(k => t.toLowerCase().includes(k));
const isDate    = (t = '') => DATE_TYPES.some(k => t.toLowerCase().includes(k));
const aggsFor   = (t = '') => isNumeric(t) ? ['SUM', 'AVG', 'MIN', 'MAX', 'COUNT'] : ['COUNT'];
const defaultAgg = (t = '') => isNumeric(t) ? 'SUM' : 'COUNT';
const autoName   = (m: MeasureDraft) => m.fieldName ? `${m.aggregation}(${m.fieldName})` : '';

function newDraft(): MeasureDraft {
  return { id: Rosie.guid('m-'), tableName: '', fieldName: '', aggregation: '', name: '', chartType: 'bar', stacked: false, secondaryAxis: false };
}

// Builds the full server-side ReportDefinition (including server-only measure fields).
// Typed as `any` because MeasureDefinition TS type omits server-only fields by design.
function buildDefinition(reportName: string, measures: MeasureDraft[], view: ViewDraft): any {
  return {
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
      startRollingDate: view.startRollingDate,
      endRollingDate:   view.endRollingDate,
    }
  };
}

// Columnar [[field, v1, v2, ...], ...] → row-oriented for the preview table.
function toRows(data: any[][]): { headers: string[], rows: any[][] } {
  if (!data?.length) return { headers: [], rows: [] };
  const headers  = data.map(col => String(col[0]));
  const rowCount = (data[0]?.length ?? 1) - 1;
  const rows     = Array.from({ length: rowCount }, (_, i) => data.map(col => col[i + 1] ?? ''));
  return { headers, rows };
}

// ── ReportCreationComponent ───────────────────────────────────────────────────

function ReportCreationComponent(props: {
  productId: string,
  dashboardId: string,
  onCreateSuccess: (report: ReportDefinition) => void,
}) {
  const { productId } = props;

  const [reportName,     setReportName]     = useState('');
  const [measures,       setMeasures]       = useState<MeasureDraft[]>([newDraft()]);
  const [view,           setView]           = useState<ViewDraft>({ timeField: '', breakdownField: '', startRollingDate: 30, endRollingDate: 1 });
  const [tables,         setTables]         = useState<ProductDataTable[]>([]);
  const [columnsByTable, setColumnsByTable] = useState<Record<string, ProductDataColumn[]>>({});
  const [result,         setResult]         = useState<ReportResult | null>(null);
  const [isCalculating,  setIsCalculating]  = useState(false);
  const [error,          setError]          = useState('');

  useEffect(() => {
    ProductDataTableStore.fetch({ pathParams: { productId } }).then(setTables);
  }, [productId]);

  async function loadColumns(tableName: string) {
    if (!tableName || columnsByTable[tableName]) return;
    const cols = await ProductDataColumnStore.fetch({ pathParams: { productId, tableName } });
    setColumnsByTable(prev => ({ ...prev, [tableName]: cols ?? [] }));
  }

  const addMeasure    = () => setMeasures(prev => [...prev, newDraft()]);
  const removeMeasure = (id: string) => setMeasures(prev => prev.filter(m => m.id !== id));
  const updateMeasure = (id: string, patch: Partial<MeasureDraft>) =>
    setMeasures(prev => prev.map(m => m.id === id ? { ...m, ...patch } : m));

  async function onTableChange(id: string, tableName: string) {
    updateMeasure(id, { tableName, fieldName: '', aggregation: '', name: '' });
    await loadColumns(tableName);
  }

  function onFieldChange(id: string, fieldName: string) {
    const m   = measures.find(x => x.id === id)!;
    const col = columnsByTable[m.tableName]?.find(c => c.name === fieldName);
    const agg = defaultAgg(col?.type);
    updateMeasure(id, { fieldName, aggregation: agg, name: `${agg}(${fieldName})` });
  }

  async function calculate() {
    setIsCalculating(true);
    setError('');
    try {
      const definition = buildDefinition(reportName, measures, view);
      const res = await ReportResultModel.fetch({ pathParams: { productId }, body: { report: definition } });
      setResult(res ?? null);
    } catch (e) {
      setError(String(e));
    } finally {
      setIsCalculating(false);
    }
  }

  // Columns from the primary measure's table drive time field and breakdown options.
  const primaryCols = columnsByTable[measures[0]?.tableName ?? ''] ?? [];
  const dateCols    = primaryCols.filter(c => isDate(c.type));
  const dimCols     = primaryCols.filter(c => !isDate(c.type));

  // Same chart config derivation as ReportComponent.
  const primaryFields     = result?.groups ?? measures.filter(x => !x.secondaryAxis).map(x => x.name || autoName(x));
  const secondaryMeasures = measures.filter(x => x.secondaryAxis);
  const isStacked         = (result?.groups?.length ?? 0) > 0 || measures.some(x => x.stacked);

  const { headers, rows } = toRows(result?.data ?? []);
  const canCalculate      = !!measures[0]?.tableName && !!view.timeField && !isCalculating;

  return <div className="d-flex h-100 gap-3 p-3">

    {/* ── Left: Builder ────────────────────────────────── */}
    <div className="d-flex flex-column gap-3" style={{ width: 420, flexShrink: 0, overflowY: 'auto' }}>

      <div>
        <label className="form-label fw-semibold small mb-1">Report Name</label>
        <input className="form-control form-control-sm" placeholder="New Report"
            value={reportName} onChange={e => setReportName(e.target.value)} />
      </div>

      <div>
        <div className="d-flex justify-content-between align-items-center mb-2">
          <span className="fw-semibold small">Metrics</span>
          <button className="btn btn-link btn-sm p-0" onClick={addMeasure}>+ Add Metric</button>
        </div>
        {measures.map(m => (
          <MeasureRow key={m.id} measure={m} tables={tables}
              columns={columnsByTable[m.tableName] ?? []}
              onTableChange={t => onTableChange(m.id, t)}
              onFieldChange={f => onFieldChange(m.id, f)}
              onChange={patch => updateMeasure(m.id, patch)}
              onRemove={() => removeMeasure(m.id)} />
        ))}
      </div>

      <div>
        <label className="form-label fw-semibold small mb-1">
          Breakdown <span className="text-muted fw-normal">(optional)</span>
        </label>
        <select className="form-select form-select-sm" value={view.breakdownField}
            onChange={e => setView(v => ({ ...v, breakdownField: e.target.value }))}>
          <option value="">— None —</option>
          {dimCols.map(c => <option key={c.name} value={c.name}>{c.displayName || c.name}</option>)}
        </select>
      </div>

      <div className="d-flex flex-column gap-2">
        <span className="fw-semibold small">Time</span>
        <div>
          <label className="form-label small text-muted mb-1">Time Field</label>
          <select className="form-select form-select-sm" value={view.timeField}
              onChange={e => setView(v => ({ ...v, timeField: e.target.value }))}>
            <option value="">— Select —</option>
            {dateCols.map(c => <option key={c.name} value={c.name}>{c.displayName || c.name}</option>)}
          </select>
        </div>
        <div className="row g-2">
          <div className="col">
            <label className="form-label small text-muted mb-1">Last N days</label>
            <input type="number" min={1} className="form-control form-control-sm" value={view.startRollingDate}
                onChange={e => setView(v => ({ ...v, startRollingDate: +e.target.value }))} />
          </div>
          <div className="col">
            <label className="form-label small text-muted mb-1">End offset</label>
            <input type="number" min={0} className="form-control form-control-sm" value={view.endRollingDate}
                onChange={e => setView(v => ({ ...v, endRollingDate: +e.target.value }))} />
          </div>
        </div>
      </div>

      <div className="d-flex gap-2 mt-auto pt-2 border-top">
        <button className="btn btn-primary btn-sm flex-fill" onClick={calculate} disabled={!canCalculate}>
          {isCalculating
            ? <><span className="spinner-border spinner-border-sm me-1" />Calculating...</>
            : 'Calculate'}
        </button>
        {result && (
          <button className="btn btn-success btn-sm"
              onClick={() => props.onCreateSuccess(buildDefinition(reportName, measures, view))}>
            Add to Dashboard
          </button>
        )}
      </div>
      {error && <p className="text-danger small mb-0">{error}</p>}

    </div>

    {/* ── Right: Result ─────────────────────────────────── */}
    <div className="flex-fill d-flex flex-column gap-3 min-w-0" style={{ overflowY: 'auto' }}>
      {!result
        ? <div className="d-flex align-items-center justify-content-center h-100 text-muted small border rounded">
            Configure a metric and click Calculate to preview
          </div>
        : <>
            <CartesianChart dataOriented="columns" data={result.data as any[]}
                series={{ xField: view.timeField }}
                axes={{
                  x:  { type: 'timeseries', format: '%Y-%m-%d', rotate: -25 },
                  y:  { fields: primaryFields, stacked: isStacked },
                  y2: {
                    fields: secondaryMeasures.map(x => x.name || autoName(x)),
                    type:   secondaryMeasures[0]?.chartType as c3.ChartType ?? 'bar',
                  }
                }}
            />
            {headers.length > 0 && (
              <div style={{ overflowX: 'auto', maxHeight: 280 }}>
                <table className="table table-sm table-hover small mb-0">
                  <thead className="table-light sticky-top">
                    <tr>{headers.map((h, i) => <th key={i}>{h}</th>)}</tr>
                  </thead>
                  <tbody>
                    {rows.map((row, i) => (
                      <tr key={i}>{row.map((cell, j) => <td key={j}>{String(cell)}</td>)}</tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
      }
    </div>

  </div>;
}

// ── MeasureRow ────────────────────────────────────────────────────────────────

function MeasureRow(props: {
  measure: MeasureDraft,
  tables: ProductDataTable[],
  columns: ProductDataColumn[],
  onTableChange: (v: string) => void,
  onFieldChange: (v: string) => void,
  onChange: (patch: Partial<MeasureDraft>) => void,
  onRemove: () => void,
}) {
  const { measure: m, tables, columns } = props;
  const valueCols = columns.filter(c => !isDate(c.type));
  const colType   = columns.find(c => c.name === m.fieldName)?.type ?? '';
  const aggs      = m.fieldName ? aggsFor(colType) : [];

  return <div className="border rounded p-2 mb-2 bg-light">
    <div className="row g-1 mb-1">
      <div className="col-6">
        <select className="form-select form-select-sm" value={m.tableName}
            onChange={e => props.onTableChange(e.target.value)}>
          <option value="">Event / Table</option>
          {tables.map(t => <option key={t.name} value={t.name}>{t.displayName || t.name}</option>)}
        </select>
      </div>
      <div className="col-6">
        <select className="form-select form-select-sm" value={m.fieldName}
            onChange={e => props.onFieldChange(e.target.value)} disabled={!m.tableName}>
          <option value="">Field</option>
          {valueCols.map(c => <option key={c.name} value={c.name}>{c.displayName || c.name}</option>)}
        </select>
      </div>
    </div>
    <div className="row g-1 mb-1">
      <div className="col-4">
        <select className="form-select form-select-sm" value={m.aggregation}
            onChange={e => props.onChange({ aggregation: e.target.value })} disabled={!m.fieldName}>
          <option value="">Agg</option>
          {aggs.map(a => <option key={a} value={a}>{a}</option>)}
        </select>
      </div>
      <div className="col-8">
        <input className="form-control form-control-sm" placeholder="Metric name" value={m.name}
            onChange={e => props.onChange({ name: e.target.value })} />
      </div>
    </div>
    <div className="d-flex align-items-center gap-2">
      <div className="btn-group btn-group-sm">
        {(['bar', 'line'] as const).map(t => (
          <button key={t} className={`btn btn-outline-secondary ${m.chartType === t ? 'active' : ''}`}
              onClick={() => props.onChange({ chartType: t })}>
            <span className={`fa fa-chart-${t === 'bar' ? 'bar' : 'line'}`} />
          </button>
        ))}
      </div>
      <div className="form-check form-check-inline mb-0 small">
        <input type="checkbox" className="form-check-input" id={`sec-${m.id}`}
            checked={m.secondaryAxis} onChange={e => props.onChange({ secondaryAxis: e.target.checked })} />
        <label className="form-check-label" htmlFor={`sec-${m.id}`}>Y2</label>
      </div>
      <div className="form-check form-check-inline mb-0 small">
        <input type="checkbox" className="form-check-input" id={`stk-${m.id}`}
            checked={m.stacked} onChange={e => props.onChange({ stacked: e.target.checked })} />
        <label className="form-check-label" htmlFor={`stk-${m.id}`}>Stacked</label>
      </div>
      <button className="btn btn-link btn-sm ms-auto p-0 text-danger" onClick={props.onRemove}>
        <span className="fa fa-trash" />
      </button>
    </div>
  </div>;
}

// ── Exports ───────────────────────────────────────────────────────────────────

export function ReportCreationView() {
  return <ReportCreationComponent productId="0" dashboardId="0" onCreateSuccess={() => {}} />;
}

export function ReportCreationDialog(props: {
  productId: string,
  dashboardId: string,
  onCreateSuccess: (report: ReportDefinition) => void,
}) {
  return <Dialog fitScreen id="report-creation-dialog" title="Create Report" dialogClass="modal-xl">
    <div className="modal-body fullscreen">
      <ReportCreationComponent {...props} />
    </div>
  </Dialog>;
}
