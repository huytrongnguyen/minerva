import { useEffect } from 'react';
import { BrowserRouter as Router, Navigate, Route, Routes } from 'react-router';
import { LocalCache } from 'rosie/core';
import { AUTH_TOKEN, AuthUserModel, navigator } from 'minerva/core';
import { RequireAuth, ViewportComponent } from 'minerva/components';

import { HomeView } from './home.view';
import { ProductListView } from './products';
// import { ProductSettingsView } from './products';
// import { EventFieldListView, EventListView } from './events';
// import { DashboardView } from './reports';
// import { AdminView } from './admin.view';
// import { ReportEditingView } from './reports/report-editing.component';

export function AppView() {
  useEffect(() => {
    if (LocalCache.get(AUTH_TOKEN)) {
      AuthUserModel.load();
    }
  }, []);

  return <Router>
    <ViewportComponent navigator={navigator}>
      <Routes>
        <Route path="/home" element={<RequireAuth component={HomeView} title="Home" />} />
        {/* <Route path="/admin" element={<RequireAuth component={AdminView} title="Administration" />} /> */}
        {/* <Route path="/products" element={<RequireAuth component={ProductListView} title="Products" />} /> */}
        {/* <Route path="/products/:productId/settings" element={<RequireAuth component={ProductSettingsView} title="Product Settings" />} /> */}
        {/* <Route path="/products/:productId/events" element={<RequireAuth component={EventListView} title="Events" />} /> */}
        {/* <Route path="/products/:productId/events/:tableName" element={<RequireAuth component={EventFieldListView} title="Event Fields" />} /> */}
        {/* <Route path="/products/:productId/dashboards/:dashboardId" element={<RequireAuth component={DashboardView} title="Dashboards" />} /> */}
        {/* <Route path="/products/:productId/dashboards/:dashboardId/reports/:reportId" element={<RequireAuth component={ReportEditingView} title="Reports" />} /> */}
        <Route path="*" element={<Navigate to="/home" />} />
      </Routes>
    </ViewportComponent>
  </Router>
}