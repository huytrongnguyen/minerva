import { useState, useMemo } from 'react';

export interface ColumnDef<T> {
  header: string;
  accessorKey: keyof T | string;
  cell?: (item: T) => React.ReactNode;
  sortable?: boolean;
}

interface DataTableProps<T> {
  title: string;
  data: T[];
  columns: ColumnDef<T>[];
  searchPlaceholder?: string;
  pageSize?: number;
}

export function DataTable<T extends Record<string, any>>({
  title,
  data,
  columns,
  searchPlaceholder = 'Search...',
  pageSize = 10
}: DataTableProps<T>) {
  const [search, setSearch] = useState('');
  const [sortCol, setSortCol] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [page, setPage] = useState(1);

  const filteredData = useMemo(() => {
    if (!search) return data;
    const lower = search.toLowerCase();
    return data.filter(item =>
      Object.values(item).some(val => String(val).toLowerCase().includes(lower))
    );
  }, [data, search]);

  const sortedData = useMemo(() => {
    if (!sortCol) return filteredData;
    return [...filteredData].sort((a, b) => {
      const vA = a[sortCol];
      const vB = b[sortCol];
      if (vA < vB) return sortDir === 'asc' ? -1 : 1;
      if (vA > vB) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filteredData, sortCol, sortDir]);

  const totalPages = Math.ceil(sortedData.length / pageSize);
  const paginatedData = sortedData.slice((page - 1) * pageSize, page * pageSize);

  const handleSort = (colKey: string, sortable?: boolean) => {
    if (sortable === false) return;
    if (sortCol === colKey) {
      if (sortDir === 'asc') setSortDir('desc');
      else { setSortCol(null); setSortDir('asc'); }
    } else {
      setSortCol(colKey);
      setSortDir('asc');
    }
  };

  return (
    <div className="nova-table-wrapper">
      <div className="nova-table-wrapper__toolbar">
        <h3>{title}</h3>
        <div className="nova-search">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            className="nova-input"
            placeholder={searchPlaceholder}
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
          />
        </div>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table className="nova-table">
          <thead>
            <tr>
              {columns.map((col, i) => {
                const key = String(col.accessorKey);
                const isSorted = sortCol === key;
                return (
                  <th
                    key={i}
                    className={isSorted ? 'sorted' : ''}
                    onClick={() => handleSort(key, col.sortable)}
                    style={{ cursor: col.sortable !== false ? 'pointer' : 'default' }}
                  >
                    {col.header}
                    {col.sortable !== false && (
                      <span className="sort-icon">
                        {isSorted ? (sortDir === 'asc' ? '▲' : '▼') : '↕'}
                      </span>
                    )}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {paginatedData.length > 0 ? (
              paginatedData.map((row, rowIndex) => (
                <tr key={rowIndex}>
                  {columns.map((col, colIndex) => (
                    <td key={colIndex}>
                      {col.cell ? col.cell(row) : String(row[col.accessorKey as string] ?? '')}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length} style={{ textAlign: 'center', padding: '32px 16px', color: 'var(--nova-text-muted)' }}>
                  No results found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="nova-table-footer">
        <div className="nova-table-footer__info">
          Showing {sortedData.length === 0 ? 0 : (page - 1) * pageSize + 1} to {Math.min(page * pageSize, sortedData.length)} of {sortedData.length} entries
        </div>
        <div className="nova-table-footer__pages">
          <button
            className="nova-table-footer__page-btn"
            disabled={page === 1}
            onClick={() => setPage(p => p - 1)}
          >
            &lt;
          </button>
          <button
            className="nova-table-footer__page-btn active"
          >
            {page}
          </button>
          <button
            className="nova-table-footer__page-btn"
            disabled={page >= totalPages}
            onClick={() => setPage(p => p + 1)}
          >
            &gt;
          </button>
        </div>
      </div>
    </div>
  );
}
