import { useEffect, useState } from 'react';
import { DataModel, Dialog, Grid, GridColumn } from 'rosie-ui';
import { ProductInfo, ConnectionDataSetStore, UpdateProductInfoModel, ProductDataSet, ConnectionDataSetModel, alertError, UpdateProductDataTableModel } from 'minerva/core';

export function ConnectorCreationDialog(props: { productId: string, onCreateSuccess: (productInfo: ProductInfo) => void }) {
  const { productId } = props,
        [dataProducer, setDataProducer] = useState(''),
        [sqlDialect, setSqlDialect] = useState('trino'),
        [endpoint, setEndpoint] = useState('https://trino.gio.vng.vn:443'),
        [clientId, setClientId] = useState('huynt3'),
        [clientSecret, setClientSecret] = useState('E1kOe8y3yYZqat'),
        [dataSetName, setDataSetName] = useState('iceberg.ballistar'),
        [selectedDataSets, setSelectedDataSets] = useState<ProductDataSet[]>([]);

  useEffect(() => {
    return () => {
      setDataSetName('');
      setSelectedDataSets([]);
      ConnectionDataSetStore.loadData([]);
    }
  }, [])

  async function testConnection() {
    ConnectionDataSetStore.load({
      pathParams: { productId },
      body: { sqlDialect, endpoint, clientId, clientSecret }
    });
  }

  async function onSubmit() {
    const product = await UpdateProductInfoModel.fetch({
      pathParams: { productId },
      body: { sqlDialect, endpoint, clientId, clientSecret }
    });

    await UpdateProductDataTableModel.fetch({
      pathParams: { productId },
      body: { dataSets: selectedDataSets }
    });

    product && props.onCreateSuccess(product)
  }

  async function addDataSet() {
    if ((ConnectionDataSetStore?.value ?? []).find(x => x.get('name') === dataSetName)) {
      alertError(`Schema ${dataSetName} already existed`);
      return;
    }

    const result = await ConnectionDataSetModel.fetch({
      pathParams: { productId, dataSetName },
      body: { sqlDialect, endpoint, clientId, clientSecret }
    });

    if (!result?.tables?.length) {
      alertError(`Cannot get table from schema ${dataSetName}`);
      return;
    }

    const record = DataModel.create(result);
    record.select();
    ConnectionDataSetStore.insertRecord(record);
    addToSelectedDataSet(record.value);
    setDataSetName('');
  }

  function addToSelectedDataSet(dataSet: ProductDataSet) {
    const newList = selectedDataSets.filter(x => x.name !== dataSet.name);
    if (selectedDataSets.length === newList.length) {
      setSelectedDataSets([...selectedDataSets, dataSet]);
    } else {
      setSelectedDataSets([...newList]);
    }
  }

  return <Dialog fitScreen id="connector-creation-dialog" title="Create Connection" dialogClass="modal-xl">
    <div className="modal-body fullscreen d-flex flex-row p-0">
      <div className="flex-fill overflow-y-auto py-2">
        <div className="container-fluid">
          <div className="row">
            <label htmlFor="sheet_name" className="col-3 col-form-label text-end">Data Producer</label>
            <div className="col-9">
              <input className="form-control" type="text" value={dataProducer} onChange={e => setDataProducer(e.target.value)} />
            </div>
          </div>
          <div className="row mt-3">
            <label htmlFor="sheet_name" className="col-3 col-form-label text-end">Engine</label>
            <div className="col-9">
              <input className="form-control" type="text" value={sqlDialect} onChange={e => setSqlDialect(e.target.value)} />
            </div>
          </div>
          <div className="row mt-3">
            <label htmlFor="sheet_name" className="col-3 col-form-label text-end">Endpoint</label>
            <div className="col-9">
              <input className="form-control" type="text" value={endpoint} onChange={e => setEndpoint(e.target.value)} />
            </div>
          </div>
          <div className="row mt-3">
            <label htmlFor="sheet_name" className="col-3 col-form-label text-end">Client ID</label>
            <div className="col-9">
              <input className="form-control" type="text" value={clientId} onChange={e => setClientId(e.target.value)} />
            </div>
          </div>
          <div className="row mt-3">
            <label htmlFor="sheet_name" className="col-3 col-form-label text-end">Client Secret</label>
            <div className="col-9">
              <input className="form-control" type="text" value={clientSecret} onChange={e => setClientSecret(e.target.value)} />
            </div>
          </div>
        </div>
      </div>
      <div className="fullscreen d-flex flex-column" style={{width:600}}>
        <div className="py-2 pe-2">
          <div className="input-group">
            <input type="text" className="form-control" value={dataSetName} onChange={e => setDataSetName(e.target.value)} placeholder="Schema" />
            <button type="button" className="btn btn-outline-secondary" disabled={dataSetName.trim() === ''} onClick={() => addDataSet()}>Add</button>
          </div>
        </div>
        <Grid fitScreen store={ConnectionDataSetStore} checkboxSelection onCheckChange={addToSelectedDataSet}>
          <GridColumn headerName="Schema" field="name" style={{flex:1}} />
          <GridColumn headerName="Table Count" field="tables" style={{width:150}} renderer={(value: string[]) => value?.length ?? 0} />
        </Grid>
      </div>
    </div>
    <div className="modal-footer">
      <button type="button" className="btn btn-outline-secondary me-auto" onClick={() => testConnection()}>Test Connection</button>
      <button type="button" className="btn btn-outline-secondary" data-bs-dismiss="modal">Cancel</button>
      <button type="button" className="btn btn-primary ms-1" disabled={selectedDataSets?.length <= 0} onClick={() => onSubmit()}>
        Save{selectedDataSets?.length > 0 ? ` (${selectedDataSets.length})` : ''}
      </button>
    </div>
  </Dialog>
}