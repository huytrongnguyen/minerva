import { useEffect } from 'react';
import { HashRouter as Router, Navigate, Route, Routes } from 'react-router';
import { LocalCache } from 'rosie-ui';

// import { AUTH_TOKEN, AuthUserModel } from 'venus/core';
import { AppLayout, RequireAuth } from 'minerva/components';

import { navigator } from '../core';

import { AdsManagerView } from './ads-manager.view';

export function AppView() {
  useEffect(() => {
    // if (LocalCache.get(AUTH_TOKEN)) {
    //   AuthUserModel.load();
    // }
  }, []);

  return <Router>
    <AppLayout navigator={navigator} routes={<Routes>
      <Route path="/ads-manager" element={<RequireAuth component={AdsManagerView} title="User groups" />} />
      <Route path="*" element={<Navigate to="/ads-manager" />} />
    </Routes>} />
  </Router>
}