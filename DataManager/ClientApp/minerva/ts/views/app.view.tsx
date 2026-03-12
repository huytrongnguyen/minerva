import { useEffect } from 'react';
import { BrowserRouter as Router, Navigate, Route, Routes } from 'react-router';
import { LocalCache } from 'rosie/core';
import { AUTH_TOKEN, AuthUserModel } from 'minerva/core';
import { AppLayout, RequireAuth } from 'minerva/components';

import { ProductListView, ProductSettingsView } from './products';
import { EventFieldListView, EventListView } from './events';
import { DashboardView } from './reports';
import { AdminView } from './admin.view';
import { ReportEditingView } from './reports/report-editing.component';

export function AppView() {
  useEffect(() => {
    if (LocalCache.get(AUTH_TOKEN)) {
      AuthUserModel.load();
    }
  }, []);

  return <Router>
    <AppLayout>
      <Routes>
        <Route path="/admin" element={<RequireAuth component={AdminView} title="Administration" />} />
        <Route path="/products" element={<RequireAuth component={ProductListView} title="Products" />} />
        <Route path="/products/:productId/settings" element={<RequireAuth component={ProductSettingsView} title="Product Settings" />} />
        <Route path="/products/:productId/events" element={<RequireAuth component={EventListView} title="Events" />} />
        <Route path="/products/:productId/events/:tableName" element={<RequireAuth component={EventFieldListView} title="Event Fields" />} />
        <Route path="/products/:productId/dashboards/:dashboardId" element={<RequireAuth component={DashboardView} title="Dashboards" />} />
        <Route path="/products/:productId/dashboards/:dashboardId/reports/:reportId" element={<RequireAuth component={ReportEditingView} title="Reports" />} />
        <Route path="*" element={<Navigate to="/products" />} />
      </Routes>
    </AppLayout>
  </Router>
}