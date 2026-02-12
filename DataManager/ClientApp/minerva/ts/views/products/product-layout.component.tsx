import { PropsWithChildren, useEffect, useState } from 'react';
import { useParams } from 'react-router';
import { CurrentProductModel } from 'minerva/core';
import { ProductNavigator } from './product-navigator.component';

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
    <aside className="app-sidebar d-flex flex-column border-end">
      {productId && <div className="sidebar-body flex-1 overflow-y-auto">
        <nav className="nav nav-pills d-flex flex-column">
          <ProductNavigator />
        </nav>
      </div>}
    </aside>
    <div className="app-wrapper fullscreen d-flex position-relative">
      <div className="app-body fullscreen d-flex flex-column">
        {props.children}
      </div>
    </div>
  </>
}