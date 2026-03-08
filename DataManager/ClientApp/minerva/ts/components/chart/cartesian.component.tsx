import { useEffect, useState } from 'react';
import c3, { ChartConfiguration } from 'c3';
import { Rosie } from 'rosie/core';
import { chartConfig, ChartProps, d3Format, d3Pattern } from './types';

export function CartesianChart(props: ChartProps) {
  const [chartId] = useState(Rosie.guid(`rosie-chart-${props.name ?? ''}-`));

  useEffect(() => {
    if (!props.data?.length) return;

    const { dataOriented, series, axes } = props,
          { xField, yField } = series,
    //       valueFields = typeof yField === 'string' ? { [yField]: yField } : yField,
          seriesType = series.type ?? 'bar',
          types = { } as { [key: string]: c3.ChartType };

    axes?.y?.fields?.forEach(field => types[field] = axes?.y?.type ?? seriesType);
    axes?.y2?.fields?.forEach(field => types[field] = axes?.y2?.type ?? seriesType);

    // console.log({ dataOriented, series, axes });

    const config = {
      bindto: `#${chartId}`,
      data: {
        [dataOriented ?? 'columns']: props.data,
        x: xField,
        // names: valueFields,
        type: seriesType,
        types,
        axes: Object.fromEntries(axes?.y2?.fields?.map(field => [field, 'y2']) ?? []),
        groups: axes?.y?.stacked ? [axes.y.fields] : undefined,
        // labels: false,//series?.label ?? false,
        // order: null,
      },
      size: { height: chartConfig.height },
      axis: {
        x: {
          type: axes.x.type,
          // label: axes?.x?.label,
          // show: axes?.x?.show ?? true,
          tick: { format: axes?.x?.format, rotate: axes?.x?.rotate, multiline: false }
        },
        // y: { label: axes?.y?.label, show: axes?.y?.show ?? true, tick: { format: d3Pattern(axes?.y?.format ?? ',.2~s'), rotate: axes?.y?.rotate } },
        y2: {
          show: axes?.y2?.fields?.length > 0,
          tick: { format: d3Pattern(axes?.y2?.format ?? ',.2~s') }
        },
        // rotated: axes?.rotated,
      },
      color: { pattern: chartConfig.colorPatterns },
      grid: { y: { show: true } },
      // tooltip: { format: { value: series?.tooltip?.renderer ?? ((value: number) => d3Format(value, series?.tooltip?.format ?? ',.2~f')) } }
    } as ChartConfiguration;

    // console.log({ config });

    c3.generate(config);
  }, [props.data]);

  return <div id={chartId} className="c3" />
}