import { useEffect, useState } from 'react';
import { ProductLayout } from './product-layout.component';
import { ProductSelector } from './product-selector.component';
import { CurrentProductModel, ProductEvent, ProductEventStore, TrackedEventStore } from 'minerva/core';
import { Dialog, Grid, GridColumn, useDialog } from 'rosie-ui';
import { Link } from 'react-router-dom';

export function EventListView() {
  const [productId, setProductId] = useState(''),
        eventCreationDialog = useDialog('#event-creation-dialog');

  useEffect(() => {
    const product$ = CurrentProductModel.subscribe(value => {
      const { productId } = value;
      setProductId(productId);
      ProductEventStore.loadWithSplashScreen({ pathParams: { productId } });
    });
    return () => { product$.unsubscribe(); }
  }, []);

  function onCreateEventSuccess() {}

  return <ProductLayout>
    <ProductSelector navPath='/events'>
      <li className="breadcrumb-item active">Events</li>
      <div className="ms-auto">
        <button className="btn btn-sm btn-primary" onClick={() => eventCreationDialog.show()}>
          <span className="fa fa-plus me-1" /> Events
        </button>
      </div>
    </ProductSelector>
    <main className="fullscreen">
      <Grid fitScreen store={ProductEventStore}>
        <GridColumn headerName="Event Name" field="eventName" style={{flex:1}} renderer={(value: string) => <>
          <Link to={`/products/${productId}/tables/${value}`}>{value}</Link>
        </>} />
      </Grid>
    </main>
    {eventCreationDialog.isShown && <EventCreationDialog productId={productId}
        onCreateSuccess={onCreateEventSuccess} />}
  </ProductLayout>
}

function EventCreationDialog(props: { productId: string, onCreateSuccess: () => void }) {
  const { productId } = props,
        [eventName, setEventName] = useState(''),
        [eventSemanticName, setEventSemanticName] = useState(''),
        [selectedEvents, setSelectedEvents] = useState<ProductEvent[]>([]);

  useEffect(() => {
    const event$ = ProductEventStore.subscribe(data => setSelectedEvents(data.map(x => x.value)));
    TrackedEventStore.load({ pathParams: { productId } });

    return () => {
      TrackedEventStore.loadData([]);
      event$.unsubscribe();
    }
  }, [])

  function onCheckChange() {

  }

  async function onSubmit() {
  }

  async function addEvent() {

  }

  return <Dialog id="event-creation-dialog" title="Create Event" dialogClass="modal-lg" fitScreen>
    <div className="modal-body fullscreen p-0">
      <Grid fitScreen footer store={TrackedEventStore} checkboxSelection onCheckChange={onCheckChange}>
        <GridColumn headerName="Event Name" field="eventName" style={{flex:1}} />
        <GridColumn headerName="Semantic Name" field="eventSemanticName" style={{width:150}} />
      </Grid>
    </div>
    <div className="modal-footer">
      <div className="me-auto">
        <div className="input-group">
          <input type="text" className="form-control" value={eventName} onChange={e => setEventName(e.target.value)} placeholder="Event name" />
          <input type="text" className="form-control" value={eventSemanticName} onChange={e => setEventSemanticName(e.target.value)} placeholder="Semantic name" />
          <button type="button" className="btn btn-outline-secondary" disabled={eventName.trim() === ''} onClick={() => addEvent()}>Add</button>
        </div>
      </div>
      <button type="button" className="btn btn-outline-secondary" data-bs-dismiss="modal">Cancel</button>
      <button type="button" className="btn btn-primary ms-1" onClick={() => onSubmit()}>Save</button>
    </div>
  </Dialog>
}