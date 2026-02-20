import { useEffect, useState } from 'react';
import { ProductLayout } from './product-layout.component';
import { ProductSelector } from './product-selector.component';
import { CurrentProductModel } from 'minerva/core';

export function DashboardView() {
  const [productId, setProductId] = useState('');

  useEffect(() => {
      const product$ = CurrentProductModel.subscribe(value => {
        setProductId(value.productId);
      });
      return () => { product$.unsubscribe(); }
    }, []);

  return <ProductLayout>
    <ProductSelector navPath='/dashboard'>
      <li className="breadcrumb-item active">Dashboard</li>
    </ProductSelector>
    <main className="fullscreen"></main>
  </ProductLayout>
}