import { PropsWithChildren, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Rosie, InputDropdown } from 'rosie-ui';
// import { InputDropdown } from 'minerva/components';
import { CurrentProductModel, ProductInfo, ProductInfoStore } from 'minerva/core';

interface ProductSelectorProps extends PropsWithChildren<any> { navPath: string }

export function ProductSelector(props: ProductSelectorProps) {
  const [products, setProducts] = useState<ProductInfo[]>([]),
        [selectedProduct, setSelectedProduct] = useState<ProductInfo>(null);

  useEffect(() => {
    const product$ = CurrentProductModel.subscribe(setSelectedProduct);

    loadProducts();

    return () => { product$.unsubscribe(); }
  }, []);

  async function loadProducts() {
    var products = await ProductInfoStore.fetch();
    setProducts(products ?? []);
  }

  return <ol className="breadcrumb py-0">
    <li className="breadcrumb-item">Products</li>
    <li className="breadcrumb-item dropdown">
      <InputDropdown options={products} value={selectedProduct ? [selectedProduct] : []}
        valueField="productId" displayField="productId" searchBox defaultText="" separator=""
        renderer={(value, item: ProductInfo) => {
          return <Link  to={`/products/${item.productId}${props.navPath}`} role="button"
                        className={Rosie.classNames('dropdown-item', { active: item.productId === selectedProduct?.productId })}>
            {value}
          </Link>
        }} />
    </li>
    {props.children}
  </ol>

  return
}