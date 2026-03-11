import { useEffect, useState } from 'react';
import c3 from 'c3';
import { ReportDefinition, ReportResultModel } from 'minerva/core';
import { CartesianChart } from 'minerva/components';

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

  return <div role="button" className={`col-${props.definition.colWidth}`}>
    <div className="card card-body card-hover">
      <div className="card-title d-flex">
        <button className="btn btn-link fs-4">{props.definition.name}</button>
        <div className="hidden-menu ms-auto mt-2">
          <button className="btn btn-sm">
            <span className="fa fa-ellipsis" />
          </button>
        </div>
      </div>
      <div>
        {data?.length > 0 && <CartesianChart dataOriented="columns" data={data}
            series={{ xField: view.timeField }}
            axes={{
              x:  { type: 'timeseries', format: '%Y-%m-%d', rotate: -25 },
              y:  { fields: primaryFields, stacked: isStacked },
              y2: {
                fields: secondaryMeasures.map(x => x.name),
                type:   secondaryMeasures[0]?.chartType as c3.ChartType ?? 'bar',
              }
            }}
        />}
      </div>
    </div>
  </div>
}
