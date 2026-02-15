import { PropsWithChildren } from 'react';
import { useLocation } from 'react-router';
import { LoadingIndicator, Rosie } from 'rosie-ui';
import { NavItem } from 'minerva/core';

export const navigator: NavItem[] = [{
  navId: 'products',
  navName: 'Products',
  navPath: '/products'
}, {
  navId: 'admin',
  navName: 'Administration',
  navPath: '/admin'
}]

export function AppLayout(props: PropsWithChildren<any>) {
  const location = useLocation();

  return <div className="fullscreen card border-0 border-radius-0 px-2 pb-2">
    <header className="card-header bg-transparent pt-0">
      <ul className="nav nav-tabs card-header-tabs">
        <li className="nav-item me-auto">
          <span className="h3 fw-bold border-0 bg-transparent">Minerva</span>
        </li>
        {navigator.map(navItem => {
          return <li key={navItem.navId} className="nav-item ms-1">
            <a href={navItem.navPath} className={Rosie.classNames('nav-link', { active: (location?.pathname ?? '').startsWith(navItem.navPath) })}>{navItem.navName}</a>
          </li>
        })}

      </ul>
    </header>
    <div className="fullscreen card-body border border-top-0 rounded-bottom">
      <LoadingIndicator />
      <div className="app fullscreen d-flex flex-row">
        {props.children}
      </div>
    </div>
  </div>
}