import { ReactElement, PropsWithChildren } from 'react';
import { NavigatorComponent } from './navigator.component';
import { NavItem } from 'minerva/core';

export function ViewportComponent({ navigator, children, }: PropsWithChildren<{ navigator: NavItem[] }>) {
  return <div className="viewport">
    <aside>
      <NavigatorComponent navigator={navigator} />
    </aside>
    <div className="wrapper position-relative">
      <LoadingIndicator />
      <main>
        {children}
      </main>
    </div>
  </div>
}

export function LoadingIndicator() {
  return <div className="loading-indicator">
    <div className="loading-indicator-msg">
      <div className="loading-indicator-msg-text">
        <span className="fa fa-circle-notch fa-spin me-1" />
        Loading...
      </div>
    </div>
  </div>
}