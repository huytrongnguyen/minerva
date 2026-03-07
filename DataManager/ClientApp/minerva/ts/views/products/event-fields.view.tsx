import { useEffect, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { Dialog, Dropdown, Grid, GridColumn, useDialog } from 'rosie/components';
import { ProductDataColumn, ProductDataColumnStore, UpdateProductDataColumnModel } from 'minerva/core';
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
    semanticFieldUpdationDialog.hide();
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
        <GridColumn headerName="Field Name" field="name" style={{flex:1}} />
        <GridColumn headerName="Display Name" field="displayName" style={{flex:1}} />
        <GridColumn headerName="Semantic Model" field="semanticName" style={{flex:1}} />
        <GridColumn headerName="Type" field="type" style={{flex:1}} />
        <GridColumn headerName="Desc" field="desc" style={{flex:1}} />
      </Grid>
    </main>
    {semanticFieldUpdationDialog.isShown && <SemanticFieldUpdationDialog productId={productId} tableName={tableName} eventName={eventName}
        onUpdateSuccess={onUpdateSemanticEventSuccess} />}
  </ProductLayout>
}

function SemanticFieldUpdationDialog(props: { productId: string, tableName: string, eventName: string, onUpdateSuccess: (tables: ProductDataColumn[]) => void }) {
  const { productId, tableName } = props,
        [eventTimeField, setEventTimeField] = useState(null as ProductDataColumn),
        [userIdField, setUserIdField] = useState(null as ProductDataColumn),
        [osField, setOSField] = useState(null as ProductDataColumn),
        [countryField, setCountryField] = useState(null as ProductDataColumn),
        [partDateField, setPartDateField] = useState(null as ProductDataColumn),
        [dataColumns, setDataColumns] = useState<ProductDataColumn[]>([]);

  useEffect(() => {
    const tables$ = ProductDataColumnStore.subscribe(value => {
      const columns = value.map(x => x.value);
      setDataColumns(columns);
      setPartDateField(columns.find(x => x.semanticName === 'part_date') ?? null);
      setEventTimeField(columns.find(x => x.semanticName === 'event_time') ?? null);
      setUserIdField(columns.find(x => x.semanticName === 'user_id') ?? null);
      setOSField(columns.find(x => x.semanticName === 'os') ?? null);
      setCountryField(columns.find(x => x.semanticName === 'country') ?? null);
    });
    return () => { tables$.unsubscribe(); }
  }, [])

  async function onSubmit() {
    const updatedColumns = dataColumns.map(column => {
      if (column.name === partDateField?.name) { column.semanticName = 'part_date'; return column; }
      else if (column.name === eventTimeField?.name) { column.semanticName = 'event_time'; return column; }
      else if (column.name === userIdField?.name) { column.semanticName = 'user_id'; return column; }
      else if (column.name === osField?.name) { column.semanticName = 'os'; return column; }
      else if (column.name === countryField?.name) { column.semanticName = 'country'; return column; }
      else return null;
    }).filter(x => x !== null);

    const result = await UpdateProductDataColumnModel.fetch({
      pathParams: { productId, tableName },
      body: { columns: updatedColumns }
    });

    result && props.onUpdateSuccess(result)
  }

  return <Dialog id="semantic-field-updation-dialog" title="Update Semantic Model" dialogClass="modal-lg">
    <div className="modal-body fullscreen d-flex flex-row pb-2">
      <div className="container-fluid">
        <div className="row mt-2">
          <label htmlFor="sheet_name" className="col-3 col-form-label text-end">Part Date</label>
          <div className="col-9 d-flex flex-row">
            <Dropdown options={dataColumns} value={partDateField ? [partDateField] : []}
                  valueField="name" displayField="name" searchBox
                  buttonClass="btn-outline-secondary" onChange={value => setPartDateField(value[0])} />
            {partDateField && <button type="button" className="btn btn-danger ms-1" onClick={() => setPartDateField(null)}>
              <span className="fa fa-xmark" />
            </button>}
          </div>
        </div>
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
          <label htmlFor="sheet_name" className="col-3 col-form-label text-end">User ID</label>
          <div className="col-9 d-flex flex-row">
            <Dropdown options={dataColumns} value={userIdField ? [userIdField] : []}
                  valueField="name" displayField="name" searchBox
                  buttonClass="btn-outline-secondary" onChange={value => setUserIdField(value[0])} />
            {userIdField && <button type="button" className="btn btn-danger ms-1" onClick={() => setUserIdField(null)}>
              <span className="fa fa-xmark" />
            </button>}
          </div>
        </div>
        <div className="row mt-2">
          <label htmlFor="sheet_name" className="col-3 col-form-label text-end">OS</label>
          <div className="col-9 d-flex flex-row">
            <Dropdown options={dataColumns} value={osField ? [osField] : []}
                  valueField="name" displayField="name" searchBox
                  buttonClass="btn-outline-secondary" onChange={value => setOSField(value[0])} />
            {osField && <button type="button" className="btn btn-danger ms-1" onClick={() => setOSField(null)}>
              <span className="fa fa-xmark" />
            </button>}
          </div>
        </div>
        <div className="row mt-2">
          <label htmlFor="sheet_name" className="col-3 col-form-label text-end">Country</label>
          <div className="col-9 d-flex flex-row">
            <Dropdown options={dataColumns} value={countryField ? [countryField] : []}
                  valueField="name" displayField="name" searchBox
                  buttonClass="btn-outline-secondary" onChange={value => setCountryField(value[0])} />
            {countryField && <button type="button" className="btn btn-danger ms-1" onClick={() => setCountryField(null)}>
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