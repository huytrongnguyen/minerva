import { useEffect, useState } from 'react';
import { Rosie, useDialog } from 'rosie-ui';
import { CurrentProductModel, ProductInfo } from 'minerva/core';

import { ProductLayout } from './product-layout.component';
import { ProductSelector } from './product-selector.component';
import { ConnectorCreationDialog } from './connector-creation.component';

export function ProductSettingsView() {
  const [productId, setProductId] = useState(''),
        [productName, setProductName] = useState(''),
        [dataOwner, setDataOwner] = useState(''),
        [startDate, setStartDate] = useState(''),
        [sqlDialect, setSqlDialect] = useState(''),
        connectorCreationDialog = useDialog('#connector-creation-dialog');

  useEffect(() => {
    const product$ = CurrentProductModel.subscribe(value => {
      setProductId(value.productId);
      setProductName(value.productName ?? '');
      setDataOwner(value.dataOwner ?? '');
      setStartDate(value.startDate ?? '');
      setSqlDialect(value.sqlDialect ?? '');
    });
    return () => { product$.unsubscribe(); }
  }, []);

  function onCreateConnectionSuccess(product: ProductInfo) {
    CurrentProductModel.loadData(product);
    Rosie.hideModal('#connector-creation-dialog');
  }

  return <ProductLayout>
    <ProductSelector navPath='/settings'>
      <li className="breadcrumb-item active">Settings</li>
    </ProductSelector>
    <main className="fullscreen">
      <div className="container-fluid mb-2">
        <div className="row mt-2">
          <label htmlFor="file" className="col-2 offset-2 col-form-label text-end">Product Name</label>
          <div className="col-6">
            <input className="form-control" type="text" value={productName} onChange={e => setProductName(e.target.value)} />
          </div>
        </div>
        <div className="row mt-2">
          <label htmlFor="file" className="col-2 offset-2 col-form-label text-end">Data Owner</label>
          <div className="col-6">
            <input type="text" className="form-control" value={dataOwner} onChange={e => setDataOwner(e.target.value)} />
          </div>
        </div>
        <div className="row mt-2">
          <label htmlFor="file" className="col-2 offset-2 col-form-label text-end">Start Date</label>
          <div className="col-6">
            <input type="text" className="form-control" value={startDate} onChange={e => setStartDate(e.target.value)} />
          </div>
        </div>
        <div className="row mt-2">
          <label htmlFor="file" className="col-2 offset-2 col-form-label text-end">Data Connection</label>
          <div className="col-6">
            {sqlDialect
              ? <>
                  <input type="text" readOnly className="form-control-plaintext" value={sqlDialect} />
                  <button className="btn btn-outline-secondary" onClick={() => connectorCreationDialog.show()}>
                    Update Tables
                  </button>
                </>
              : <button className="btn btn-outline-secondary" onClick={() => connectorCreationDialog.show()}>
                  Add Connection
                </button>
            }
          </div>
        </div>
      </div>
    </main>
    {connectorCreationDialog.isShown && <ConnectorCreationDialog productId={productId}
        onCreateSuccess={onCreateConnectionSuccess} />}
  </ProductLayout>
}

