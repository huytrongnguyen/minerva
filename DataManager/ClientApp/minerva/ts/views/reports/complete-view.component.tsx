import { useEffect, useState } from 'react';
import { DashboardLayout, ReportModel, ReportResult } from 'minerva/core';
import { CartesianChart, d3Format } from 'minerva/components';

type Props = {
  layout: DashboardLayout,
  productId: string,
  dashboardId: string,
}

// Loads a single report independently — parallel with other useReport calls.
function useReport(productId: string, dashboardId: string, reportId: string) {
  const [result, setResult] = useState<ReportResult | null>(null);

  useEffect(() => {
    const model = ReportModel();
    const sub   = model.subscribe(setResult);
    model.load({ pathParams: { productId, dashboardId, reportId } });
    return () => { sub.unsubscribe(); }
  }, [productId, dashboardId, reportId]);

  return result;
}

export function CompleteViewComponent({ layout, productId, dashboardId }: Props) {
  const [installsCpiStub, costByOsStub] = layout.reports;

  const installsCpi = useReport(productId, dashboardId, installsCpiStub?.id);
  const costByOs    = useReport(productId, dashboardId, costByOsStub?.id);

  return <>
    <div className="container-fluid mb-2">
      <div className="row mt-2">
        <div className="col-6">
          <div className="card">
            <div className="card-header">{installsCpiStub?.name}</div>
            <div className="card-body">
              {installsCpi
                ? <CartesianChart name="installs-cpi" dataOriented="columns" data={installsCpi.data as any[]}
                      series={{
                        xField: 'report_date', yField: { installs: 'Installs', cpi: 'CPI' },
                        tooltip: {
                          renderer: (value: number, _: number, id: string) => {
                            return d3Format(value, id === 'cpi' ? '$,.2~f' : ',.2~f');
                          }
                        }
                      }}
                      axes={{
                        x: { type: 'timeseries', format: '%Y-%m-%d', rotate: 25 },
                        y: { fields: ['installs'] },
                        y2: { fields: ['cpi'], type: 'line', format: '$,.2~f' }
                      }} />
                : <p className="text-muted small">Loading...</p>}
            </div>
          </div>
        </div>
        <div className="col-6">
          <div className="card">
            <div className="card-header">{costByOsStub?.name}</div>
            <div className="card-body">
              {costByOs
                ? <CartesianChart name="cost-by-os" dataOriented="columns" data={costByOs.data as any[]}
                      series={{
                        xField: 'report_date',
                        yField: Object.fromEntries(
                          costByOs.columns.slice(1).map(c => [c.field, c.label])
                        ),
                      }}
                      axes={{
                        x: { type: 'timeseries', format: '%Y-%m-%d', rotate: 25 },
                        y: { fields: costByOs.columns.slice(1).map(c => c.field), stacked: true },
                      }} />
                : <p className="text-muted small">Loading...</p>}
            </div>
          </div>
        </div>
      </div>
    </div>
  </>
}
