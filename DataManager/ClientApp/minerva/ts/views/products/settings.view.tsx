import { useEffect, useState } from 'react';
import { Dialog, Rosie, useDialog } from 'rosie-ui';
import { CurrentProductModel, ProductInfo, TestConnectionModel, UpdateProductInfoModel, alertSuccess } from 'minerva/core';

import { ProductLayout } from './product-layout.component';
import { ProductSelector } from './product-selector.component';

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
              ? <input type="text" readOnly className="form-control-plaintext" value={sqlDialect} />
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

function ConnectorCreationDialog(props: { productId: string, onCreateSuccess: (productInfo: ProductInfo) => void }) {
  const { productId } = props,
        [dataProducer, setDataProducer] = useState(''),
        [sqlDialect, setSqlDialect] = useState('trino'),
        [endpoint, setEndpoint] = useState(''),
        [clientId, setClientId] = useState(''),
        [clientSecret, setClientSecret] = useState('');

  async function testConnection() {
    const result = await TestConnectionModel.fetch({
      pathParams: { productId },
      body: { sqlDialect, endpoint, clientId, clientSecret }
    });

    if (!result) return;

    alertSuccess(`Connect success! Found ${result.catalogs.length} catalog(s) with ${result.schemas.length} schema(s) and ${result.tables.length} table(s)`)
  }

  async function onSubmit() {
    console.log({ sqlDialect, endpoint, clientId, clientSecret })
    const result = await UpdateProductInfoModel.fetch({
      pathParams: { productId },
      body: { sqlDialect, endpoint, clientId, clientSecret }
    });

    result && props.onCreateSuccess(result)
  }

  return <Dialog id="connector-creation-dialog" title="Create Connection" dialogClass="modal-lg">
    <div className="modal-body">
      <div className="row">
        <label htmlFor="sheet_name" className="col-2 col-form-label text-end">Data Producer</label>
        <div className="col-10">
          <input className="form-control" type="text" value={dataProducer} onChange={e => setDataProducer(e.target.value)} />
        </div>
      </div>
      <div className="row mt-3">
        <label htmlFor="sheet_name" className="col-2 col-form-label text-end">Engine</label>
        <div className="col-10">
          <input className="form-control" type="text" value={sqlDialect} onChange={e => setSqlDialect(e.target.value)} />
        </div>
      </div>
      <div className="row mt-3">
        <label htmlFor="sheet_name" className="col-2 col-form-label text-end">Endpoint</label>
        <div className="col-10">
          <input className="form-control" type="text" value={endpoint} onChange={e => setEndpoint(e.target.value)} />
        </div>
      </div>
      <div className="row mt-3">
        <label htmlFor="sheet_name" className="col-2 col-form-label text-end">Client ID</label>
        <div className="col-10">
          <input className="form-control" type="text" value={clientId} onChange={e => setClientId(e.target.value)} />
        </div>
      </div>
      <div className="row mt-3">
        <label htmlFor="sheet_name" className="col-2 col-form-label text-end">Client Secret</label>
        <div className="col-10">
          <input className="form-control" type="text" value={clientSecret} onChange={e => setClientSecret(e.target.value)} />
        </div>
      </div>
    </div>
    <div className="modal-footer">
      <button type="button" className="btn btn-outline-secondary me-auto" onClick={() => testConnection()}>Test Connection</button>
      <button type="button" className="btn btn-outline-secondary" data-bs-dismiss="modal">Cancel</button>
      <button type="button" className="btn btn-primary ms-1" onClick={() => onSubmit()}>Add</button>
    </div>
  </Dialog>
}