import { useEffect } from 'react';
import { Link } from 'react-router';
import { Grid, GridColumn } from 'rosie-ui';
import { ProductInfoStore } from 'minerva/core';

export function ProductListView() {
  useEffect(() => {
    ProductInfoStore.loadWithSplashScreen();
  }, []);

  return <>
    <Grid fitScreen store={ProductInfoStore}>
      <GridColumn headerName="Product ID" field="productId" style={{flex:1}} renderer={(value: string) => <>
        <Link to={`/products/${value}/smart-view/overview`}>{value}</Link>
      </>} />
      <GridColumn headerName="Start Date" field="startDate" style={{width:200}} renderer={(value: string) => Date.parseDate(value).format()} />
      <GridColumn headerName="Action" field="productId" style={{width:200}} renderer={(value: string) => <>
        <Link to={`/products/${value}/settings`}>Settings</Link>
      </>} />
    </Grid>
  </>
}