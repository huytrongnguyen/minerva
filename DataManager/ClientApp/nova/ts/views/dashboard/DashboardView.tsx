import { useState } from 'react';
import { AppShell, KpiCard, LineChartCard, StackedBarChartCard, DataTable, FilterBar, Badge } from '../../components';
import { FilterState } from '../../core/types';
import { defaultFilters } from '../../components/filters/FilterBar';
import { ColumnDef } from '../../components/table/DataTable';

// -- Mock Data --
const sparkData = [
  { v: 100 }, { v: 120 }, { v: 110 }, { v: 130 }, { v: 145 }, { v: 140 }, { v: 160 }
];

const ltvData = [
  { date: 'Mar 1', 'Facebook Ads': 1200, 'Google Ads': 900, 'Organic': 500 },
  { date: 'Mar 2', 'Facebook Ads': 2100, 'Google Ads': 1000, 'Organic': 600 },
  { date: 'Mar 3', 'Facebook Ads': 1800, 'Google Ads': 1400, 'Organic': 800 },
  { date: 'Mar 4', 'Facebook Ads': 2400, 'Google Ads': 1700, 'Organic': 1100 },
  { date: 'Mar 5', 'Facebook Ads': 2800, 'Google Ads': 2000, 'Organic': 1300 },
  { date: 'Mar 6', 'Facebook Ads': 2500, 'Google Ads': 2200, 'Organic': 1500 },
  { date: 'Mar 7', 'Facebook Ads': 3100, 'Google Ads': 2400, 'Organic': 1600 },
];

const revenueData = [
  { category: 'Facebook Ads', Revenue: 18500 },
  { category: 'Google Ads', Revenue: 14200 },
  { category: 'Organic', Revenue: 6800 },
];

const cohortData = [
  { id: '123358027', country: 'US', platform: 'iOS', sessions: 10, spend: 124.50, status: 'Active', d7: '38.5%' },
  { id: '123357000', country: 'DE', platform: 'Android', sessions: 8, spend: 89.90, status: 'Inactive', d7: '34.2%' },
  { id: '123357025', country: 'GB', platform: 'iOS', sessions: 14, spend: 210.00, status: 'Active', d7: '45.1%' },
  { id: '123357313', country: 'FR', platform: 'Android', sessions: 4, spend: 12.00, status: 'Active', d7: '12.0%' },
  { id: '123352031', country: 'JP', platform: 'iOS', sessions: 22, spend: 450.75, status: 'Active', d7: '55.8%' },
  { id: '123354279', country: 'BR', platform: 'Android', sessions: 2, spend: 4.99, status: 'Inactive', d7: '5.0%' },
];

const columns: ColumnDef<typeof cohortData[0]>[] = [
  { header: 'Player ID', accessorKey: 'id' },
  { header: 'Country', accessorKey: 'country' },
  { header: 'Platform', accessorKey: 'platform' },
  { header: 'Sessions', accessorKey: 'sessions' },
  {
    header: 'Total Spend',
    accessorKey: 'spend',
    cell: (item) => `$${item.spend.toFixed(2)}`
  },
  {
    header: 'Status',
    accessorKey: 'status',
    cell: (item) => (
      <Badge color={item.status === 'Active' ? 'green' : 'gray'}>{item.status}</Badge>
    )
  },
  { header: 'D7 Retention', accessorKey: 'd7' },
];

export function DashboardView() {
  const [filters, setFilters] = useState<FilterState>(defaultFilters);

  const handleApply = (f: FilterState) => {
    setFilters(f);
    // In real app, fetch data here.
  };

  return (
    <AppShell title="Dashboard">
      <FilterBar
        filters={filters}
        onApply={handleApply}
        products={[{ id: 'ballistar', name: 'Ballistar' }, { id: 'test_game', name: 'Test Game' }]}
      />

      <div className="nova-grid nova-grid--4 nova-section">
        <KpiCard label="Total Revenue" value="$124.5K" delta="12%" deltaDir="up" sparklineData={sparkData} accentColor="var(--nova-green)" />
        <KpiCard label="Active Users" value="89.2K" delta="5%" deltaDir="up" sparklineData={sparkData} accentColor="var(--nova-blue)" />
        <KpiCard label="Avg LTV" value="$1.42" delta="3%" deltaDir="up" sparklineData={sparkData} accentColor="var(--nova-purple)" />
        <KpiCard label="D1 Retention" value="38.5%" delta="1%" deltaDir="down" sparklineData={sparkData.slice().reverse()} accentColor="var(--nova-amber)" />
      </div>

      <div className="nova-chart-row nova-section">
        <LineChartCard
          title="LTV Trend (Past 7 Days)"
          data={ltvData}
          lines={[
            { key: 'Facebook Ads', name: 'Facebook Ads', color: 'var(--nova-blue)' },
            { key: 'Google Ads', name: 'Google Ads', color: 'var(--nova-green)' },
            { key: 'Organic', name: 'Organic', color: 'var(--nova-text-secondary)' },
          ]}
        />
        <StackedBarChartCard
          title="Revenue by Source"
          data={revenueData}
          bars={[
            { key: 'Revenue', name: 'Revenue', color: 'var(--nova-blue)' }
          ]}
        />
      </div>

      <DataTable
        title="Player Cohorts"
        data={cohortData}
        columns={columns}
      />
    </AppShell>
  );
}
