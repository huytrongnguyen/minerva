import { useEffect } from 'react';
import { HashRouter as Router, Navigate, Route, Routes } from 'react-router';
import { LocalCache } from 'rosie-ui';

// import { AUTH_TOKEN, AuthUserModel } from 'venus/core';
import { AppLayout } from 'minerva/components';

import { navigator } from '../core';

export function AppView() {
  useEffect(() => {
    // if (LocalCache.get(AUTH_TOKEN)) {
    //   AuthUserModel.load();
    // }
  }, []);

  return <Router>
    <AppLayout navigator={navigator} routes={<Routes>
    </Routes>} />
  </Router>
}