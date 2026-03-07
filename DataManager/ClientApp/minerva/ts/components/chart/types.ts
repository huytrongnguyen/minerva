import { Dictionary } from 'rosie/core';

type DataOriented = 'json' | 'rows' | 'columns';

export type ChartProps = {
  name?: string,
  dataOriented?: DataOriented,
  data: any[],
  series: Series,
  axes: { x: XAxis, y?: YAxis, y2?: YAxis, rotated?: boolean },
}

type Series = {
  type?: c3.ChartType,
  xField: string,
  yField: string | Dictionary<string>,
  stackedField?: string,
  label?: boolean | { format: c3.FormatFunction } | { format: { [key: string]: boolean | c3.FormatFunction } },
  tooltip?: { format?: string, renderer?: (value: c3.Primitive, ratio: number, id: string, index: number) => string }
}

type XAxis = {
  type?: c3.XAxisType,
  label?: string,
  format?: string,
  show?: boolean,
  rotate?: number,
}

type YAxis = {
  fields?: string[],
  type?: c3.ChartType,
  label?: string,
  format?: string,
  show?: boolean,
  rotate?: number,
  stacked?: boolean,
}

export const chartConfig = {
  height: 250,
  margin: { top: 9, left: 81 },
  colorPatterns: [
    '#e97b98', // pink          — primary (bars)
    '#6765e8', // purple        — secondary (lines)
    '#5b9bd5', // medium blue
    '#4dbdb5', // teal
    '#9b8dc4', // soft purple
    '#68b58a', // sage green
    '#f5a623', // amber
    '#a8c8e8', // pale blue
    '#b8ddd9', // pale teal
    '#d4c5ea', // pale lavender
    '#9da5b4', // slate gray
  ]
}