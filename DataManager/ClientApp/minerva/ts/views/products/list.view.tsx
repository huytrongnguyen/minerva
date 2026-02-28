import { useEffect } from 'react';
import { Link } from 'react-router';
import { Grid, GridColumn } from 'rosie-ui';
import { ProductInfoStore } from 'minerva/core';

export function ProductListView() {
  useEffect(() => {
    ProductInfoStore.loadWithSplashScreen();
  }, []);

  return <>
    <div className="app-wrapper fullscreen d-flex position-relative">
      <div className="app-body fullscreen d-flex flex-column">
        <ol className="breadcrumb">
          <li className="breadcrumb-item">Products</li>
          <div className="ms-auto">
            <button className="btn btn-sm btn-primary">
              <span className="fa fa-plus me-1" /> Create Product
            </button>
          </div>
        </ol>
        <main className="fullscreen">
          <Grid fitScreen store={ProductInfoStore}>
            <GridColumn headerName="Product ID" field="productId" style={{flex:1}} renderer={(value: string) => <>
              <Link to={`/products/${value}/dashboard/smart-view/overview`}>{value}</Link>
            </>} />
            <GridColumn headerName="Start Date" field="startDate" style={{width:200}} renderer={(value: string) => Date.parseDate(value).format()} />
            <GridColumn headerName="Action" field="productId" style={{width:200}} renderer={(value: string) => <>
              <Link to={`/products/${value}/settings`}>Settings</Link>
            </>} />
          </Grid>
        </main>
      </div>
    </div>

  </>
}