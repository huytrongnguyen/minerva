import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface StackedBarChartCardProps {
  title: string;
  data: any[];
  bars: { key: string; color: string; name: string }[];
}

export function StackedBarChartCard({ title, data, bars }: StackedBarChartCardProps) {
  return (
    <div className="nova-card" style={{ height: 320, display: 'flex', flexDirection: 'column' }}>
      <h3 className="nova-section-title">{title}</h3>
      <div style={{ flex: 1, minHeight: 0 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--nova-border)" />
            <XAxis
              dataKey="category"
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
              cursor={{ fill: 'var(--nova-surface-2)' }}
              contentStyle={{
                backgroundColor: 'var(--nova-surface)',
                borderColor: 'var(--nova-border)',
                borderRadius: 'var(--nova-radius)',
                fontSize: 12,
                boxShadow: 'var(--nova-shadow-md)'
              }}
            />
            <Legend
              wrapperStyle={{ fontSize: 11, paddingTop: 10 }}
              iconType="circle"
              iconSize={8}
            />
            {bars.map((bar) => (
              <Bar
                key={bar.key}
                dataKey={bar.key}
                name={bar.name}
                stackId="a"
                fill={bar.color}
                isAnimationActive={false}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
