import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { DataModel } from 'rosie/core';
import { Dialog, Dropdown, Grid, GridColumn, useDialog } from 'rosie/components';
import { ProductDataTable, ProductDataTableStore, UpdateProductDataTableModel } from 'minerva/core';
import { ProductLayout } from './product-layout.component';
import { ProductSelector } from './product-selector.component';

export function EventListView() {
  const params = useParams(),
        [productId, setProductId] = useState(''),
        semanticEventUpdationDialog = useDialog('#semantic-event-updation-dialog');

  useEffect(() => {
    const { productId } = params;
    setProductId(productId);
    ProductDataTableStore.loadWithSplashScreen({ pathParams: { productId } });
  }, [params]);

  function onUpdateSemanticEventSuccess(tables: ProductDataTable[]) {
    ProductDataTableStore.loadData(tables);
    semanticEventUpdationDialog.hide();
  }

  return <ProductLayout>
    <ProductSelector navPath='/events'>
      <li className="breadcrumb-item active">Events</li>
      <div className="ms-auto">
        <button className="btn btn-sm btn-primary" onClick={() => semanticEventUpdationDialog.show()}>
          Update Semantic Events
        </button>
      </div>
    </ProductSelector>
    <main className="fullscreen">
      <Grid fitScreen store={ProductDataTableStore}>
        <GridColumn headerName="Event Name" field="name" style={{flex:1}} renderer={(value: string, record: DataModel<ProductDataTable>) => <>
          <Link to={`/products/${productId}/events/${value}${record.get('semanticName') ? `?semanticEvent=${record.get('semanticName')}` : ''}`}>{value}</Link>
        </>} />
        <GridColumn headerName="Display Name" field="displayName" style={{flex:1}} />
        <GridColumn headerName="Semantic Event" field="semanticName" style={{flex:1}} />
      </Grid>
    </main>
    {semanticEventUpdationDialog.isShown && <SemanticEventUpdationDialog productId={productId}
        onUpdateSuccess={onUpdateSemanticEventSuccess} />}
  </ProductLayout>
}

function SemanticEventUpdationDialog(props: { productId: string, onUpdateSuccess: (tables: ProductDataTable[]) => void }) {
  const { productId } = props,
        [installEvent, setInstallEvent] = useState(null as ProductDataTable),
        [openAppEvent, setOpenAppEvent] = useState(null as ProductDataTable),
        [registerEvent, setRegisterEvent] = useState(null as ProductDataTable),
        [sessionStartEvent, setSessionStartEvent] = useState(null as ProductDataTable),
        [sessionEndEvent, setSessionEndEvent] = useState(null as ProductDataTable),
        [purchaseEvent, setPurchaseEvent] = useState(null as ProductDataTable),
        [dataTables, setDataTables] = useState<ProductDataTable[]>([]);

  useEffect(() => {
    const tables$ = ProductDataTableStore.subscribe(value => {
      const tables = value.map(x => x.value);
      setDataTables(tables);
      setInstallEvent(tables.find(x => x.semanticName === 'install') ?? null);
      setOpenAppEvent(tables.find(x => x.semanticName === 'open_app') ?? null);
      setRegisterEvent(tables.find(x => x.semanticName === 'register') ?? null);
      setSessionStartEvent(tables.find(x => x.semanticName === 'session_start') ?? null);
      setSessionEndEvent(tables.find(x => x.semanticName === 'session_end') ?? null);
      setPurchaseEvent(tables.find(x => x.semanticName === 'purchase') ?? null);
    });
    return () => { tables$.unsubscribe(); }
  }, [])

  async function onSubmit() {
    const updatedTables = dataTables.map(table => {
      if (table.name === installEvent?.name) { table.semanticName = 'install'; return table; }
      else if (table.name === openAppEvent?.name) { table.semanticName = 'open_app'; return table; }
      else if (table.name === registerEvent?.name) { table.semanticName = 'register'; return table; }
      else if (table.name === sessionStartEvent?.name) { table.semanticName = 'session_start'; return table; }
      else if (table.name === sessionEndEvent?.name) { table.semanticName = 'session_end'; return table; }
      else if (table.name === purchaseEvent?.name) { table.semanticName = 'purchase'; return table; }
      else return null;
    }).filter(x => x !== null);

    const result = await UpdateProductDataTableModel.fetch({
      pathParams: { productId },
      body: { tables: updatedTables }
    });

    result && props.onUpdateSuccess(result)
  }

  return <Dialog id="semantic-event-updation-dialog" title="Update Semantic Model" dialogClass="modal-lg">
    <div className="modal-body fullscreen d-flex flex-row pb-2">
      <div className="container-fluid">
        <div className="row mt-2">
          <label htmlFor="sheet_name" className="col-3 col-form-label text-end">Install</label>
          <div className="col-9 d-flex flex-row">
            <Dropdown options={dataTables} value={installEvent ? [installEvent] : []}
                  valueField="name" displayField="name" searchBox
                  buttonClass="btn-outline-secondary" onChange={value => setInstallEvent(value[0])} />
            {installEvent && <button type="button" className="btn btn-danger ms-1" onClick={() => setInstallEvent(null)}>
              <span className="fa fa-xmark" />
            </button>}
          </div>
        </div>
        <div className="row mt-2">
          <label htmlFor="sheet_name" className="col-3 col-form-label text-end">Open App</label>
          <div className="col-9 d-flex flex-row">
            <Dropdown options={dataTables} value={openAppEvent ? [openAppEvent] : []}
                  valueField="name" displayField="name" searchBox
                  buttonClass="btn-outline-secondary" onChange={value => setOpenAppEvent(value[0])} />
            {openAppEvent && <button type="button" className="btn btn-danger ms-1" onClick={() => setOpenAppEvent(null)}>
              <span className="fa fa-xmark" />
            </button>}
          </div>
        </div>
        <div className="row mt-2">
          <label htmlFor="sheet_name" className="col-3 col-form-label text-end">Complete Registration</label>
          <div className="col-9 d-flex flex-row">
            <Dropdown options={dataTables} value={registerEvent ? [registerEvent] : []}
                  valueField="name" displayField="name" searchBox
                  buttonClass="btn-outline-secondary" onChange={value => setRegisterEvent(value[0])} />
            {registerEvent && <button type="button" className="btn btn-danger ms-1" onClick={() => setRegisterEvent(null)}>
              <span className="fa fa-xmark" />
            </button>}
          </div>
        </div>
        <div className="row mt-2">
          <label htmlFor="sheet_name" className="col-3 col-form-label text-end">Session Start</label>
          <div className="col-9 d-flex flex-row">
            <Dropdown options={dataTables} value={sessionStartEvent ? [sessionStartEvent] : []}
                  valueField="name" displayField="name" searchBox
                  buttonClass="btn-outline-secondary" onChange={value => setSessionStartEvent(value[0])} />
            {sessionStartEvent && <button type="button" className="btn btn-danger ms-1" onClick={() => setSessionStartEvent(null)}>
              <span className="fa fa-xmark" />
            </button>}
          </div>
        </div>
        <div className="row mt-2">
          <label htmlFor="sheet_name" className="col-3 col-form-label text-end">Session End</label>
          <div className="col-9 d-flex flex-row">
            <Dropdown options={dataTables} value={sessionEndEvent ? [sessionEndEvent] : []}
                  valueField="name" displayField="name" searchBox
                  buttonClass="btn-outline-secondary" onChange={value => setSessionEndEvent(value[0])} />
            {sessionEndEvent && <button type="button" className="btn btn-danger ms-1" onClick={() => setSessionEndEvent(null)}>
              <span className="fa fa-xmark" />
            </button>}
          </div>
        </div>
        <div className="row mt-2">
          <label htmlFor="sheet_name" className="col-3 col-form-label text-end">Purchase</label>
          <div className="col-9 d-flex flex-row">
            <Dropdown options={dataTables} value={purchaseEvent ? [purchaseEvent] : []}
                  valueField="name" displayField="name" searchBox
                  buttonClass="btn-outline-secondary" onChange={value => setPurchaseEvent(value[0])} />
            {purchaseEvent && <button type="button" className="btn btn-danger ms-1" onClick={() => setPurchaseEvent(null)}>
              <span className="fa fa-xmark" />
            </button>}
          </div>
        </div>
      </div>
    </div>
    <div className="modal-footer">
      <button type="button" className="btn btn-outline-secondary" data-bs-dismiss="modal">Cancel</button>
      <button type="button" className="btn btn-primary ms-1" onClick={() => onSubmit()}>Save</button>
    </div>
  </Dialog>
}