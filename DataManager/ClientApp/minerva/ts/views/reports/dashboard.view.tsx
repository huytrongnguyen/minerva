import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { DashboardLayout, ReportDefinition } from 'minerva/core';
import { ProductLayout, ProductSelector } from 'minerva/components';
import { ReportComponent } from './report.component';

export function DashboardView() {
  const params = useParams(),
        [productId, setProductId] = useState(''),
        [dashboardName, setDashboardName] = useState(''),
        [layout, setLayout] = useState<ReportDefinition[][]>([]);

  useEffect(() => {
    const layout$ = DashboardLayout.subscribe(value => {
      setDashboardName(value.name);
      const layout = value.reports.groupBy('rowIndex').orderBy('key')
          .map((row: { key: string, elements: ReportDefinition[] }) => {
            return row.elements.orderBy('colIndex');
          });
      setLayout(layout ?? []);
    });
    return () => { layout$.unsubscribe(); }
  }, []);

  useEffect(() => {
    const { productId, dashboardId } = params;
    setProductId(productId);
    DashboardLayout.loadWithSplashScreen({ pathParams: { productId, dashboardId } });
  }, [params]);

  return <ProductLayout>
    <ProductSelector navPath='/dashboard'>
      <li className="breadcrumb-item active">{dashboardName ?? 'Dashboard'}</li>
      <div className="dropdown ms-auto">
        <button className="btn btn-sm btn-outline-secondary dropdown-toggle hide-indicator" data-bs-toggle="dropdown" data-bs-auto-close="true">
          <span className="fa fa-ellipsis" />
        </button>
        <div className="dropdown-menu">
          <button className="dropdown-item">Save Dashboard</button>
        </div>
      </div>
    </ProductSelector>
    <main className="fullscreen">
      <h1 className="p-2">{dashboardName}</h1>
      {layout?.length > 0 && <div className="container-fluid mb-2">
        {layout.map((row, rowIndex) => {
          return <div key={rowIndex} className="row mt-2">
            {row.map((col, colIndex) => <ReportComponent key={colIndex} productId={productId} definition={col} />)}
          </div>
        })}
      </div>}
    </main>
  </ProductLayout>
}

