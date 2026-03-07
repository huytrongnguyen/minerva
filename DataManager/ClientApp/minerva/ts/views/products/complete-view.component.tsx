import { CartesianChart } from 'minerva/components';
import { d3Format } from 'minerva/core';
import { Dictionary } from 'rosie/core';

export function CompleteViewComponent(props: { data: Dictionary<any[]> }) {
  return <>
    <div className="container-fluid mb-2">
      <div className="row mt-2">
        <div className="col-6">
          <div className="card">
            <div className="card-header">Installs &amp; CPI</div>
            <div className="card-body">
              <CartesianChart name="installs-cpi" data={props.data?.installs}
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
            </div>
          </div>
        </div>
      </div>
    </div>
  </>
}