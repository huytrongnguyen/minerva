import { useEffect, useState } from 'react';
import c3 from 'c3';
import { Dialog } from 'rosie/components';
import { afterProcessing, beforeProcessing, toRows } from 'minerva/core';
import { MeasureDraft, ProductDataColumn, ProductDataColumnStore, ProductDataTable, ProductDataTableStore, ReportDefinition, ReportResult, ReportResultModel, ViewDraft } from 'minerva/core';
import { autoName, buildReportDefinition, defaultAgg, isDate, newDraft } from 'minerva/core';
import { CartesianChart, ProductLayout, ProductSelector } from 'minerva/components';
import { MeasureRowComponent } from './mesure-row.component';
import { DateRangePicker } from './date-range-picker.component';
import { useParams } from 'react-router-dom';

// ── ReportEditingComponent ───────────────────────────────────────────────────

type ReportEditingComponentProps = {
  productId: string,
  dashboardId: string,
  reportId: string,
  onUpdateSuccess: (report: ReportDefinition) => void,
}

function ReportEditingComponent(props: ReportEditingComponentProps) {
  const { productId } = props;

  const [reportName,     setReportName]     = useState('');
  const [measures,       setMeasures]       = useState<MeasureDraft[]>([newDraft()]);
  const [view,           setView]           = useState<ViewDraft>({ timeField: '', breakdownField: '', startRollingDate: 30, endRollingDate: 1 });
  const [events,         setEvents]         = useState<ProductDataTable[]>([]);
  const [fieldsByEvent,  setFieldsByEvent] = useState<Record<string, ProductDataColumn[]>>({});
  const [result,         setResult]         = useState<ReportResult | null>(null);
  const [isCalculating,  setIsCalculating]  = useState(false);

  useEffect(() => {
    const reportResult$ = ReportResultModel.subscribe(setResult)
    return () => { reportResult$.unsubscribe(); }
  }, [])

  useEffect(() => {console.log({props});
    ProductDataTableStore.fetch({ pathParams: { productId } }).then(setEvents);
  }, [productId]);

  async function loadColumns(tableName: string) {
    if (!tableName || fieldsByEvent[tableName]) return;
    const cols = await ProductDataColumnStore.fetch({ pathParams: { productId, tableName } });
    setFieldsByEvent(prev => ({ ...prev, [tableName]: cols ?? [] }));
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
    const col = fieldsByEvent[m.tableName]?.find(c => c.name === fieldName);
    const agg = defaultAgg(col?.type);
    updateMeasure(id, { fieldName, aggregation: agg, name: `${agg}(${fieldName})` });
  }

  async function calculate() {
    setIsCalculating(true);
    beforeProcessing();
    const report = buildReportDefinition(reportName, measures, view);
    ReportResultModel.load(
      { pathParams: { productId }, body: { report } },
      null,
      () => {
        setIsCalculating(false);
        afterProcessing();
      }
    );
  }

  // Columns from the primary measure's table drive time field and breakdown options.
  const primaryCols = fieldsByEvent[measures[0]?.tableName ?? ''] ?? [];
  const dateCols    = primaryCols.filter(c => isDate(c.type));
  const dimCols     = primaryCols.filter(c => !isDate(c.type));

  // Same chart config derivation as ReportComponent.
  const primaryFields     = result?.groups ?? measures.filter(x => !x.secondaryAxis).map(x => x.name || autoName(x));
  const secondaryMeasures = measures.filter(x => x.secondaryAxis);
  const isStacked         = (result?.groups?.length ?? 0) > 0 || measures.some(x => x.stacked);

  const { headers, rows } = toRows(result?.data ?? []);
  const canCalculate      = !!measures[0]?.tableName && !!view.timeField && !isCalculating;

  return <div className="report-builder d-flex flex-column fullscreen">
    <div className="d-flex flex-row p-2 border-bottom">
      <div className="flex-fill">
        <input  className="form-control form-control-sm border-0" placeholder="Report Name"
                value={reportName} onChange={e => setReportName(e.target.value)} />
      </div>
      {result && (
        <div className="ms-2">
          <button className="btn btn-success btn-sm"
              onClick={() => props.onUpdateSuccess(buildReportDefinition(reportName, measures, view))}>
            Add to Dashboard
          </button>
        </div>
      )}
    </div>
    <div className="d-flex flex-row fullscreen">
      {/* ── Left: Builder ────────────────────────────────── */}
      <div className="metric-selection d-flex flex-column border-end">
        <div className="p-2 d-flex flex-column fullscreen">
          <div className="d-flex justify-content-between align-items-center mb-2">
            <span className="fw-semibold small">Metrics</span>
            <button className="btn btn-link btn-sm p-0" onClick={addMeasure}><span className="fa fa-plus" /></button>
          </div>
          <div className="d-flex flex-column fullscreen overflow-y-auto">
          {measures.map(m => (
            <MeasureRowComponent key={m.id} measure={m} events={events}
                fields={fieldsByEvent[m.tableName] ?? []}
                onEventChange={t => onTableChange(m.id, t)}
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
        </div>
        <div className="d-flex p-2 border-top">
          <div className="ms-auto">
            <button className="btn btn-sm btn-primary" onClick={calculate} disabled={!canCalculate}>Calculate</button>
          </div>
        </div>
      </div>

      {/* ── Right: Result ─────────────────────────────────── */}
      <div className="d-flex flex-column fullscreen">
        <div className="time-range border-bottom px-2 py-1 d-flex align-items-center gap-2">
          <select className="form-select form-select-sm" style={{ width: 'auto' }} value={view.timeField}
              onChange={e => setView(v => ({ ...v, timeField: e.target.value }))}>
            <option value="">— Time Field —</option>
            {dateCols.map(c => <option key={c.name} value={c.name}>{c.displayName || c.name}</option>)}
          </select>
          <DateRangePicker view={view} onChange={patch => setView(v => ({ ...v, ...patch }))} />
        </div>
        <div className="report-result d-flex flex-column fullscreen overflow-y-auto">
        {!result
          ? <div className="d-flex align-items-center justify-content-center h-100 text-muted small">
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
              {headers.length > 0 && <ReportGridTable headers={headers} rows={rows} />}
            </>
        }
        </div>
      </div>
    </div>
  </div>
}

// ── ReportGridTable ───────────────────────────────────────────────────────────

function ReportGridTable({ headers, rows }: { headers: string[], rows: any[][] }) {
  return <div className="rosie-grid rosie-grid-bordered rosie-grid-hover d-flex flex-row" style={{ maxHeight: 280 }}>
    <div className="rosie-grid-viewport d-flex flex-column fullscreen">
      <div className="rosie-grid-header fw-bold overflow-hidden d-flex">
        <div className="rosie-grid-row d-flex flex-row">
          {headers.map((h, i) => <div key={i} className="rosie-grid-cell p-1 small">{h}</div>)}
          <div style={{ width: 8 }} />
        </div>
      </div>
      <div className="rosie-grid-body fullscreen overflow-x-auto d-flex flex-column overflow-y-scroll">
        <div>
          {rows.map((row, i) => (
            <div key={i} className="rosie-grid-row d-flex flex-row">
              {row.map((cell, j) => <div key={j} className="rosie-grid-cell p-1 small">{String(cell ?? '')}</div>)}
            </div>
          ))}
        </div>
      </div>
      <div className="rosie-grid-footer border-top d-flex p-2">
        <span className="text-body-tertiary small">{rows.length} record{rows.length !== 1 ? 's' : ''}</span>
      </div>
    </div>
  </div>;
}

// ── Exports ───────────────────────────────────────────────────────────────────

export function ReportEditingView() {
  const params = useParams(),
        [productId, setProductId] = useState(''),
        [dashboardId, setDashboardId] = useState(''),
        [reportId, setReportId] = useState('');

  useEffect(() => {
    const { productId, dashboardId, reportId } = params;
    setProductId(productId);
    setDashboardId(dashboardId);
    setReportId(reportId);
  }, [params]);

  function onUpdateSuccess(report: ReportDefinition) {}

  return <ProductLayout>
    <ProductSelector navPath='/reports'>
      <li className="breadcrumb-item active">Create New Report</li>
    </ProductSelector>
    <main className="fullscreen">
      {reportId && <ReportEditingComponent productId={productId} dashboardId={dashboardId} reportId={reportId}
          onUpdateSuccess={onUpdateSuccess} />}
    </main>
  </ProductLayout>
}

export function ReportEditingDialog(props: ReportEditingComponentProps) {
  return <Dialog fitScreen id="report-editing-dialog" title="Create New Report" dialogClass="modal-xl">
    <div className="modal-body fullscreen">
      <ReportEditingComponent {...props} />
    </div>
  </Dialog>;
}
