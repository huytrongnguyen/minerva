import { AreaChart, Area, ResponsiveContainer, Tooltip } from 'recharts';

interface KpiCardProps {
  label: string;
  value: string;
  delta?: string;
  deltaDir?: 'up' | 'down';
  accentColor?: string;
  sparklineData?: { v: number }[];
}

export function KpiCard({ label, value, delta, deltaDir = 'up', accentColor = 'var(--nova-blue)', sparklineData }: KpiCardProps) {
  return (
    <div className="nova-kpi">
      <div className="nova-kpi__label">{label}</div>
      <div className="nova-kpi__value">{value}</div>
      {delta && (
        <span className={`nova-kpi__delta nova-kpi__delta--${deltaDir}`}>
          {deltaDir === 'up' ? '↑' : '↓'} {delta}
        </span>
      )}
      {sparklineData && sparklineData.length > 0 && (
        <div style={{ marginTop: 8, height: 40 }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={sparklineData}>
              <defs>
                <linearGradient id={`sg-${label}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={accentColor} stopOpacity={0.2} />
                  <stop offset="95%" stopColor={accentColor} stopOpacity={0} />
                </linearGradient>
              </defs>
              <Area
                type="monotone"
                dataKey="v"
                stroke={accentColor}
                strokeWidth={1.5}
                fill={`url(#sg-${label})`}
                dot={false}
                isAnimationActive={false}
              />
              <Tooltip
                contentStyle={{ fontSize: 11, padding: '2px 8px', border: '1px solid var(--nova-border)', borderRadius: 4 }}
                formatter={(v: any) => [v, label]}
                labelFormatter={() => ''}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
