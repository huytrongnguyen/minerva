import { useEffect, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { Dialog, Dropdown, Grid, GridColumn, Rosie, useDialog } from 'rosie-ui';
import { ProductDataColumn, ProductDataColumnStore, ProductDataTable, ProductDataTableStore, UpdateProductDataTableModel } from 'minerva/core';
import { ProductLayout } from './product-layout.component';
import { ProductSelector } from './product-selector.component';

export function EventFieldListView() {
  const params = useParams(),
        [searchParams] = useSearchParams(),
        [productId, setProductId] = useState(''),
        [tableName, setTableName] = useState(''),
        [eventName, setEventName] = useState(''),
        semanticFieldUpdationDialog = useDialog('#semantic-field-updation-dialog');

  useEffect(() => {
    const { productId, tableName } = params;
    setProductId(productId);
    setTableName(tableName);
    setEventName(searchParams.get('semanticEvent'));
    ProductDataColumnStore.loadWithSplashScreen({ pathParams: { productId, tableName } });
  }, [params]);

  function onUpdateSemanticEventSuccess(tables: ProductDataColumn[]) {
    ProductDataColumnStore.loadData(tables);
    Rosie.hideModal('#semantic-field-updation-dialog');
  }

  return <ProductLayout>
    <ProductSelector navPath='/events'>
      <li className="breadcrumb-item">
        <Link to={`/products/${productId}/events`} role="button">Events</Link>
      </li>
      <li className="breadcrumb-item active">{tableName}</li>
      {eventName && <div className="ms-auto">
        <button className="btn btn-sm btn-primary" onClick={() => semanticFieldUpdationDialog.show()}>
          Update Semantic Fields
        </button>
      </div>}
    </ProductSelector>
    <main className="fullscreen">
      <Grid fitScreen store={ProductDataColumnStore}>
        <GridColumn headerName="Field Name" field="name" style={{flex:1}} renderer={(value: string) => <>
          <Link to={`/products/${productId}/events/${value}`}>{value}</Link>
        </>} />
        <GridColumn headerName="Display Name" field="displayName" style={{flex:1}} />
        <GridColumn headerName="Semantic Model" field="semanticName" style={{flex:1}} />
        <GridColumn headerName="Type" field="type" style={{flex:1}} />
        <GridColumn headerName="Desc" field="desc" style={{flex:1}} />
      </Grid>
    </main>
    {semanticFieldUpdationDialog.isShown && <SemanticFieldUpdationDialog productId={productId} eventName={eventName}
        onUpdateSuccess={onUpdateSemanticEventSuccess} />}
  </ProductLayout>
}

function SemanticFieldUpdationDialog(props: { productId: string, eventName: string, onUpdateSuccess: (tables: ProductDataColumn[]) => void }) {
  const { productId } = props,
        [eventTimeField, setEventTimeField] = useState(null as ProductDataColumn),
        [openAppEvent, setOpenAppEvent] = useState(null as ProductDataTable),
        [registerEvent, setRegisterEvent] = useState(null as ProductDataTable),
        [sessionStartEvent, setSessionStartEvent] = useState(null as ProductDataTable),
        [sessionEndEvent, setSessionEndEvent] = useState(null as ProductDataTable),
        [purchaseEvent, setPurchaseEvent] = useState(null as ProductDataTable),
        [dataColumns, setDataColumns] = useState<ProductDataColumn[]>([]);

  useEffect(() => {
    const tables$ = ProductDataColumnStore.subscribe(value => setDataColumns(value.map(x => x.value)));
    return () => { tables$.unsubscribe(); }
  }, [])

  async function onSubmit() {
    const body = {
      install: eventTimeField?.name ?? null,
      openApp: openAppEvent?.name ?? null,
      register: registerEvent?.name ?? null,
      sessionStart: sessionStartEvent?.name ?? null,
      sessionEnd: sessionEndEvent?.name ?? null,
      purchase: purchaseEvent?.name ?? null,
    }

    const updatedTables = dataColumns.map(table => {
      if (table.name === eventTimeField?.name) { table.semanticName = 'install'; return table; }
      else if (table.name === openAppEvent?.name) { table.semanticName = 'openApp'; return table; }
      else if (table.name === registerEvent?.name) { table.semanticName = 'register'; return table; }
      else if (table.name === sessionStartEvent?.name) { table.semanticName = 'sessionStart'; return table; }
      else if (table.name === sessionEndEvent?.name) { table.semanticName = 'sessionEnd'; return table; }
      else if (table.name === purchaseEvent?.name) { table.semanticName = 'purchase'; return table; }
      else return null;
    }).filter(x => x !== null);

    const result = await UpdateProductDataTableModel.fetch({
      pathParams: { productId },
      body: { tables: updatedTables }
    });

    result && props.onUpdateSuccess(result)
  }

  return <Dialog id="semantic-field-updation-dialog" title="Update Semantic Model" dialogClass="modal-lg">
    <div className="modal-body fullscreen d-flex flex-row pb-2">
      <div className="container-fluid">
        <div className="row mt-2">
          <label htmlFor="sheet_name" className="col-3 col-form-label text-end">Event Time</label>
          <div className="col-9 d-flex flex-row">
            <Dropdown options={dataColumns} value={eventTimeField ? [eventTimeField] : []}
                  valueField="name" displayField="name" searchBox
                  buttonClass="btn-outline-secondary" onChange={value => setEventTimeField(value[0])} />
            {eventTimeField && <button type="button" className="btn btn-danger ms-1" onClick={() => setEventTimeField(null)}>
              <span className="fa fa-xmark" />
            </button>}
          </div>
        </div>
        <div className="row mt-2">
          <label htmlFor="sheet_name" className="col-3 col-form-label text-end">Open App</label>
          <div className="col-9 d-flex flex-row">
            <Dropdown options={dataColumns} value={openAppEvent ? [openAppEvent] : []}
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
            <Dropdown options={dataColumns} value={registerEvent ? [registerEvent] : []}
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
            <Dropdown options={dataColumns} value={sessionStartEvent ? [sessionStartEvent] : []}
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
            <Dropdown options={dataColumns} value={sessionEndEvent ? [sessionEndEvent] : []}
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
            <Dropdown options={dataColumns} value={purchaseEvent ? [purchaseEvent] : []}
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