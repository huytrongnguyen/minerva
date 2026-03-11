import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface LineChartCardProps {
  title: string;
  data: any[];
  lines: { key: string; color: string; name: string }[];
}

export function LineChartCard({ title, data, lines }: LineChartCardProps) {
  return (
    <div className="nova-card" style={{ height: 320, display: 'flex', flexDirection: 'column' }}>
      <h3 className="nova-section-title">{title}</h3>
      <div style={{ flex: 1, minHeight: 0 }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--nova-border)" />
            <XAxis
              dataKey="date"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11, fill: 'var(--nova-text-secondary)' }}
              dy={10}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11, fill: 'var(--nova-text-secondary)' }}
              tickFormatter={(val) => val >= 1000 ? `$${val / 1000}K` : `$${val}`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'var(--nova-surface)',
                borderColor: 'var(--nova-border)',
                borderRadius: 'var(--nova-radius)',
                fontSize: 12,
                boxShadow: 'var(--nova-shadow-md)'
              }}
              itemStyle={{ padding: '2px 0' }}
            />
            {lines.map((line) => (
              <Line
                key={line.key}
                type="monotone"
                dataKey={line.key}
                name={line.name}
                stroke={line.color}
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4, strokeWidth: 0 }}
                isAnimationActive={false}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
