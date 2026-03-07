import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

import { ProductLayout } from './product-layout.component';
import { ProductSelector } from './product-selector.component';
import { CompleteViewComponent } from './complete-view.component';
import { ProductDashboardModel } from 'minerva/core';
import { Dictionary } from 'rosie/core';

export function DashboardView() {
  const params = useParams(),
        [viewId, setViewId] = useState(''),
        [data, setData] = useState({} as Dictionary<any[]>);

  useEffect(() => {
    const data$ = ProductDashboardModel.subscribe(setData);
    return () => { data$.unsubscribe(); }
  }, []);

  useEffect(() => {
    const { productId, viewId } = params;
    setViewId(viewId);
    ProductDashboardModel.loadWithSplashScreen({ pathParams: { productId, viewId } });
  }, [params]);

  return <ProductLayout>
    <ProductSelector navPath='/dashboard'>
      <li className="breadcrumb-item active">Dashboard</li>
    </ProductSelector>
    <main className="fullscreen">
      {viewId === 'complete-view' && <CompleteViewComponent data={data} />}
    </main>
  </ProductLayout>
}