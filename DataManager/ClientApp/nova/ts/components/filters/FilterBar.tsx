import { useState, useCallback } from 'react';
import { FilterState } from '../../core/types';

interface FilterBarProps {
  filters: FilterState;
  onApply: (f: FilterState) => void;
  products?: { id: string; name: string }[];
}

const TODAY = new Date().toISOString().slice(0, 10);
const D30 = new Date(Date.now() - 30 * 86400000).toISOString().slice(0, 10);

export function FilterBar({ filters, onApply, products = [] }: FilterBarProps) {
  const [draft, setDraft] = useState<FilterState>(filters);

  const set = useCallback((key: keyof FilterState, val: string) => {
    setDraft(prev => ({ ...prev, [key]: val }));
  }, []);

  function handleApply() {
    onApply(draft);
  }

  return (
    <div className="nova-filter-bar">
      {/* Date range */}
      <div className="nova-filter-bar__group">
        <span className="nova-filter-bar__label">Date from</span>
        <input
          type="date"
          className="nova-input"
          value={draft.dateFrom}
          onChange={e => set('dateFrom', e.target.value)}
        />
      </div>
      <div className="nova-filter-bar__group">
        <span className="nova-filter-bar__label">Date to</span>
        <input
          type="date"
          className="nova-input"
          value={draft.dateTo}
          onChange={e => set('dateTo', e.target.value)}
        />
      </div>

      {/* Product */}
      {products.length > 0 && (
        <div className="nova-filter-bar__group">
          <span className="nova-filter-bar__label">Product</span>
          <select
            className="nova-select"
            value={draft.productId}
            onChange={e => set('productId', e.target.value)}
          >
            <option value="">All Products</option>
            {products.map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>
      )}

      {/* Platform */}
      <div className="nova-filter-bar__group">
        <span className="nova-filter-bar__label">Platform</span>
        <select
          className="nova-select"
          value={draft.platform}
          onChange={e => set('platform', e.target.value)}
        >
          <option value="">All Platforms</option>
          <option value="ios">iOS</option>
          <option value="android">Android</option>
        </select>
      </div>

      {/* Country */}
      <div className="nova-filter-bar__group">
        <span className="nova-filter-bar__label">Country</span>
        <select
          className="nova-select"
          value={draft.country}
          onChange={e => set('country', e.target.value)}
        >
          <option value="">All Countries</option>
          <option value="US">United States</option>
          <option value="GB">United Kingdom</option>
          <option value="DE">Germany</option>
          <option value="JP">Japan</option>
          <option value="BR">Brazil</option>
          <option value="KR">South Korea</option>
          <option value="CA">Canada</option>
          <option value="AU">Australia</option>
          <option value="FR">France</option>
        </select>
      </div>

      <button
        className="nova-btn nova-btn--primary"
        style={{ alignSelf: 'flex-end' }}
        onClick={handleApply}
      >
        Apply Filters
      </button>
    </div>
  );
}

export const defaultFilters: FilterState = {
  dateFrom: D30,
  dateTo: TODAY,
  productId: '',
  platform: '',
  country: '',
};
