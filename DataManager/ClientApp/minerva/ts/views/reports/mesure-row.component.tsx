import { useEffect, useState } from 'react';
import { InputDropdown } from 'rosie/components';
import { aggsFor, isDate, MeasureDraft, ProductDataColumn, ProductDataTable } from 'minerva/core';

export function MeasureRowComponent(props: {
  measure: MeasureDraft,
  events: ProductDataTable[],
  fields: ProductDataColumn[],
  onEventChange: (v: string) => void,
  onFieldChange: (v: string) => void,
  onChange: (patch: Partial<MeasureDraft>) => void,
  onRemove: () => void,
}) {
  const { measure: m, events: tables, fields: columns } = props;
  const valueCols = columns.filter(c => !isDate(c.type));
  const colType   = columns.find(c => c.name === m.fieldName)?.type ?? '';
  const aggs      = m.fieldName ? aggsFor(colType) : [];
  const [table, setTable] = useState<ProductDataTable>(null),
        [column, setColumn] = useState<ProductDataColumn>(null);

  return <div className="border rounded p-2 mb-2">
    <div className="row g-1 mb-1">
      <div className="dropdown col-6">
        <InputDropdown options={tables} valueField="name" displayField="displayName"
          searchBox defaultText="Event" menuStyle={{width:'12rem'}} itemClass="text-break text-wrap"
          buttonClass="text-truncate" buttonStyle={{maxWidth:'8rem'}}
          value={table ? [table] : []} onChange={(value) => { setTable(value[0]); props.onEventChange(value[0].name); }} />
      </div>
      <div className="dropdown col-6">
        <InputDropdown options={columns} valueField="name" displayField="displayName"
          searchBox defaultText="Field" menuStyle={{width:'12rem'}} itemClass="text-break text-wrap"
          buttonClass="text-truncate" buttonStyle={{maxWidth:'8rem'}}
          value={column ? [column] : []} onChange={(value) => { setColumn(value[0]); props.onFieldChange(value[0].name); }} />
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