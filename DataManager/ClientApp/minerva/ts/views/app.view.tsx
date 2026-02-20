import { useEffect } from 'react';
import { BrowserRouter as Router, Navigate, Route, Routes } from 'react-router';
// import { LocalCache } from 'rosie-ui';

// import { AUTH_TOKEN, AuthUserModel } from 'venus/core';
import { AppLayout, RequireAuth } from 'minerva/components';

// import { navigator } from '../core';

import { DashboardView, EventListView, ProductListView, ProductSettingsView } from './products';
import { AdminView } from './admin.view';

export function AppView() {
  useEffect(() => {
    // if (LocalCache.get(AUTH_TOKEN)) {
    //   AuthUserModel.load();
    // }
  }, []);

  return <Router>
    <AppLayout>
      <Routes>
        <Route path="/admin" element={<RequireAuth component={AdminView} title="Administration" />} />
        <Route path="/products" element={<RequireAuth component={ProductListView} title="Products" />} />
        <Route path="/products/:productId/settings" element={<RequireAuth component={ProductSettingsView} title="Product Settings" />} />
        <Route path="/products/:productId/events" element={<RequireAuth component={EventListView} title="Events" />} />
        <Route path="/products/:productId/dashboard/:spaceId/:viewId" element={<RequireAuth component={DashboardView} title="Dashboard" />} />
        <Route path="*" element={<Navigate to="/products" />} />
      </Routes>
    </AppLayout>
  </Router>
}