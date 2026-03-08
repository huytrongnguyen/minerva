import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import c3 from 'c3';
import { DashboardDefinitionModel, ReportDefinition, ReportResultModel } from 'minerva/core';
import { CartesianChart, ProductLayout, ProductSelector } from 'minerva/components';

export function DashboardView() {
  const params = useParams(),
        [productId, setProductId] = useState(''),
        [dashboardName, setDashboardName] = useState(''),
        [layout, setLayout] = useState<ReportDefinition[][]>([]);

  useEffect(() => {
    const layout$ = DashboardDefinitionModel.subscribe(value => {
      setDashboardName(value.name);
      const layout = value.reports.groupBy('rowIndex').orderBy('key')
          .map((row: { key: string, elements: ReportDefinition[] }) => {
            return row.elements.orderBy('colIndex');
          });
      setLayout(layout ?? []);
    });
    return () => { layout$.unsubscribe(); }
  }, []);

  useEffect(() => {
    const { productId, dashboardId } = params;
    setProductId(productId);
    DashboardDefinitionModel.loadWithSplashScreen({ pathParams: { productId, dashboardId } });
  }, [params]);

  return <ProductLayout>
    <ProductSelector navPath='/dashboard'>
      <li className="breadcrumb-item active">{dashboardName ?? 'Dashboard'}</li>
    </ProductSelector>
    <main className="fullscreen">
      {layout?.length > 0 && <div className="container-fluid mb-2">
        {layout.map((row, rowIndex) => {
          return <div key={rowIndex} className="row mt-2">
            {row.map((col, colIndex) => {
              return <div key={colIndex} className={`col-${col.colWidth}`}>
                <div className="card">
                  <div className="card-header">{col.name}</div>
                  <div className="card-body"><ReportComponent productId={productId} definition={col} /></div>
                </div>
              </div>
            })}
          </div>
        })}
      </div>}
    </main>
  </ProductLayout>
}

export function ReportComponent(props: { productId: string, definition: ReportDefinition }) {
  const [data,   setData]   = useState([]);
  const [groups, setGroups] = useState<string[] | null>(null);

  useEffect(() => {
    if (props.definition) {
      loadReport(props.productId, props.definition);
    }
  }, [props.definition]);

  async function loadReport(productId: string, report: ReportDefinition) {
    const result = await ReportResultModel.fetch({ pathParams: { productId }, body: { report } });
    setData(result?.data ?? []);
    setGroups(result?.groups ?? null);
  }

  const { measures, view } = props.definition;
  const primaryFields      = groups ?? measures.filter(x => !x.secondaryAxis).map(x => x.name);
  const secondaryMeasures  = measures.filter(x => x.secondaryAxis);
  const isStacked          = groups != null || measures.some(x => x.stacked);

  return <>
    {data?.length > 0 && <CartesianChart dataOriented="columns" data={data}
        series={{ xField: view.timeField }}
        axes={{
          x:  { type: 'timeseries', format: '%Y-%m-%d', rotate: 25 },
          y:  { fields: primaryFields, stacked: isStacked },
          y2: {
            fields: secondaryMeasures.map(x => x.name),
            type:   secondaryMeasures[0]?.chartType as c3.ChartType ?? 'bar',
          }
        }}
    />}
  </>
}
