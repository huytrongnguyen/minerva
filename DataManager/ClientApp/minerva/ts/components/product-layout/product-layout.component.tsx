import { PropsWithChildren, useEffect, useState } from 'react';
import { useParams } from 'react-router';
import { CurrentProductModel } from 'minerva/core';
import { ProductNavigator } from './product-navigator.component';
import { AppSidebar } from '../app-layout';

export function ProductLayout(props: PropsWithChildren<any>) {
  const params = useParams(),
        [productId, setProductId] = useState('');

  useEffect(() => {
    const { productId } = params;
    if (productId) {
      setProductId(productId);
      CurrentProductModel.load({ pathParams: { productId } });
    }
  }, [params])

  return <>
    <AppSidebar>
      {productId && <div className="sidebar-body p-2 flex-1 overflow-y-auto">
        <nav className="nav nav-pills flex-column">
          <ProductNavigator />
        </nav>
      </div>}
    </AppSidebar>
    <div className="app-wrapper fullscreen d-flex position-relative">
      <div className="app-body fullscreen d-flex flex-column">
        {props.children}
      </div>
    </div>
  </>
}