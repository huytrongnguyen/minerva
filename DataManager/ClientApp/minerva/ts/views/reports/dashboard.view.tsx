import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { DashboardLayout, DashboardLayoutModel } from 'minerva/core';
import { ProductLayout, ProductSelector } from 'minerva/components';

import { CompleteViewComponent } from './complete-view.component';

export function DashboardView() {
  const params = useParams(),
        [layout, setLayout] = useState<DashboardLayout | null>(null);

  useEffect(() => {
    const layout$ = DashboardLayoutModel.subscribe(setLayout);
    return () => { layout$.unsubscribe(); }
  }, []);

  useEffect(() => {
    const { productId, dashboardId } = params;
    DashboardLayoutModel.loadWithSplashScreen({ pathParams: { productId, dashboardId } });
  }, [params]);

  return <ProductLayout>
    <ProductSelector navPath='/dashboard'>
      <li className="breadcrumb-item active">Dashboard</li>
    </ProductSelector>
    <main className="fullscreen">
      {params.dashboardId === 'complete-view' && layout &&
        <CompleteViewComponent layout={layout} productId={params.productId} dashboardId={params.dashboardId} />}
    </main>
  </ProductLayout>
}
