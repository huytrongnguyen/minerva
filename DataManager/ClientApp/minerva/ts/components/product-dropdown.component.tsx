import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { Rosie } from 'rosie-ui';
import { CurrentProductModel, ProductInfo, ProductInfoStore } from 'minerva/core';

export function ProductDropdown() {
  const [currentProduct, setCurrentProduct] = useState({} as ProductInfo),
        [productList, setProductList] = useState([] as ProductInfo[]);

  useEffect(() => {
    const currentProduct$ = CurrentProductModel.subscribe(setCurrentProduct);
    loadProductList();
    return () => { currentProduct$.unsubscribe(); }
  }, []);

  async function loadProductList() {
    var products = await ProductInfoStore.fetch();
    setProductList(products ?? []);
  }

  return <>
    <span className="nav-link dropdown-toggle" role="button" data-bs-toggle="dropdown">{currentProduct.productId}</span>
    <div className="dropdown-menu">
    {productList.map(product => {
      return <Link key={product.productId} role="button" to={`/dashboard/${product.productId}`}
                    className={Rosie.classNames('dropdown-item', { active: product.productId === currentProduct.productId })}>
        {product.productId}
      </Link>
    })}
    </div>
  </>
}