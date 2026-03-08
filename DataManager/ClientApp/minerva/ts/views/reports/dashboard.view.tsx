import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Dictionary } from 'rosie/core';
import { ProductDashboardModel } from 'minerva/core';
import { ProductLayout, ProductSelector } from 'minerva/components';

import { CompleteViewComponent } from './complete-view.component';

export function DashboardView() {
  const params = useParams(),
        [dashboardId, setDashboardId] = useState(''),
        [data, setData] = useState({} as Dictionary<any[]>);

  useEffect(() => {
    const data$ = ProductDashboardModel.subscribe(setData);
    return () => { data$.unsubscribe(); }
  }, []);

  useEffect(() => {
    const { productId, dashboardId } = params;
    setDashboardId(dashboardId);
    ProductDashboardModel.loadWithSplashScreen({ pathParams: { productId, dashboardId } });
  }, [params]);

  return <ProductLayout>
    <ProductSelector navPath='/dashboard'>
      <li className="breadcrumb-item active">Dashboard</li>
    </ProductSelector>
    <main className="fullscreen">
      {dashboardId === 'complete-view' && <CompleteViewComponent data={data} />}
    </main>
  </ProductLayout>
}