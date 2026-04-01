import { PropsWithChildren, useState } from 'react';
import { NavigatorComponent } from './navigator.component';
import { NavItem } from 'minerva/core';
import { Rosie } from 'rosie/core';

export function ViewportComponent({ navigator, children, }: PropsWithChildren<{ navigator: NavItem[] }>) {
  const [collapsed, setCollapsed] = useState<boolean>(false);

  return <div className="viewport fullscreen d-flex flex-row">
    <aside className={Rosie.classNames({ collapsed })}>
      <header className="p-2 border-bottom">
        <span className="navbar-brand text-primary fw-bold">Minerva</span>
      </header>
      <NavigatorComponent navigator={navigator} />
      <div className="d-flex justify-content-end p-2">
        <button className="btn sidebar-collapse-btn" onClick={() => setCollapsed(c => !c)}>
          {collapsed ? <span className="fa fa-chevron-right" /> : <span className="fa fa-chevron-left" />}
        </button>
      </div>
      <footer className="p-2 border-top">
        <span>test</span>
      </footer>
    </aside>
    <div className="wrapper flex-1 position-relative border-start">
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