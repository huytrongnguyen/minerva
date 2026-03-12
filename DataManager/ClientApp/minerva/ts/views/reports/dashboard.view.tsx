import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { ProductDashboard, ReportDefinition, UpdateProductDashboardModel } from 'minerva/core';
import { ProductLayout, ProductSelector } from 'minerva/components';
import { ReportComponent } from './report.component';
import { useDialog } from 'rosie/components';
import { Rosie } from 'rosie/core';
import { ReportEditingDialog } from './report-editing.component';

export function DashboardView() {
  const params = useParams(),
        [productId, setProductId] = useState(''),
        [dashboardId, setDashboardId] = useState(''),
        [dashboardName, setDashboardName] = useState(''),
        reportEditingDialog = useDialog('#report-editing-dialog'),
        [layout, setLayout] = useState<ReportDefinition[][]>([]);

  useEffect(() => {
    const layout$ = ProductDashboard.subscribe(value => {
      setDashboardName(value.name);
      const layout = value.reports.groupBy('rowIndex').orderBy('key')
          .map((row: { key: string, elements: ReportDefinition[] }) => {
            return row.elements.orderBy('colIndex');
          });
      setLayout(layout ?? []);
    });
    return () => { layout$.unsubscribe(); }
  }, []);

  useEffect(() => {
    const { productId, dashboardId } = params;
    setProductId(productId);
    setDashboardId(dashboardId);
    ProductDashboard.loadWithSplashScreen({ pathParams: { productId, dashboardId } });
  }, [params]);

  async function saveDashboardReports() {
    const dashboard = await UpdateProductDashboardModel.fetch({
      pathParams: { productId, dashboardId },
      body: { productId, dashboardId, reports: layout.flatMap(x => x) },
    });
    ProductDashboard.loadData(dashboard);
  }

  function onUpdateReportSuccess() {
    Rosie.hideModal('#report-editing-dialog');
  }

  return <ProductLayout>
    <ProductSelector navPath='/dashboards'>
      <li className="breadcrumb-item active">{dashboardName ?? 'Dashboard'}</li>
      <div className="d-flex ms-auto">
        <div className="dropdown me-1">
          <button className="btn btn-sm btn-outline-secondary dropdown-toggle hide-indicator" data-bs-toggle="dropdown" data-bs-auto-close="true">
            <span className="fa fa-ellipsis" />
          </button>
          <div className="dropdown-menu">
            <button className="dropdown-item" onClick={() => saveDashboardReports()}>Save Dashboard</button>
          </div>
        </div>
        <button className="btn btn-sm btn-primary" onClick={() => reportEditingDialog.show()}>
          <span className="fa fa-plus" />
        </button>
      </div>
    </ProductSelector>
    <main className="fullscreen">
      <h1 className="p-2">{dashboardName}</h1>
      {layout?.length > 0 && <div className="container-fluid mb-2">
        {layout.map((row, rowIndex) => {
          return <div key={rowIndex} className="row mt-2">
            {row.map((col, colIndex) => <ReportComponent key={colIndex} productId={productId} definition={col} />)}
          </div>
        })}
      </div>}
    </main>
    {reportEditingDialog.isShown && <ReportEditingDialog productId={productId} dashboardId={dashboardId} reportId="-1"
            onUpdateSuccess={onUpdateReportSuccess} />}
  </ProductLayout>
}

