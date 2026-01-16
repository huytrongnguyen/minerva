import { ReactElement } from 'react';
import { LoadingIndicator } from 'rosie-ui';

import { NavItem } from 'minerva/core';

import { AppNavigator } from './app-navigator.component';

export function AppLayout(props: { navigator: NavItem[], routes: ReactElement }) {
  return <div className="app fullscreen d-flex flex-row">
      <aside className="app-sidebar d-flex flex-column border-end">
        <div className="sidebar-body flex-1 overflow-y-auto">
          <AppNavigator navigator={props.navigator} />
        </div>
      </aside>
      <div className="app-wrapper fullscreen d-flex position-relative">
        <LoadingIndicator />
        <div className="app-body fullscreen d-flex flex-column">
          {props.routes}
        </div>
      </div>
    </div>
}