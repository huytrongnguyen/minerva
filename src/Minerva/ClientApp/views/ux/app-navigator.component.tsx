import { Fragment, useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router';

import { NavItem } from 'minerva/core';
import { Rosie } from 'rosie';

const navigator: NavItem[] = [{
  navId: 'home',
  navName: 'Home',
  navPath: '/home'
}, {
  navId: 'reporting',
  navName: 'User Groups',
  navPath: '/reporting'
}, {
  navId: 'audit-trail',
  navName: 'Audit Trail',
  navPath: '/audit-trail'
}, {
  navId: 'monitoring',
  navName: 'Monitoring',
  navPath: '/monitoring'
}]

export function AppNavigator() {
  const location = useLocation(),
        [navigation, setNavigation] = useState([] as NavItem[]);

  useEffect(() => {
    setNavigation(navigator);
  }, []);

  return <nav className="d-flex flex-column">
    {navigation.map(navItem => {
      if (navItem.children && navItem.children.length > 0) {
        return <Fragment key={navItem.navId}>
          <div className="nav-link disabled text-dark text-uppercase fw-bold p-1">{navItem.navName}</div>
          {navItem.children.map(childNavItem => {
            return <NavigationLink key={childNavItem.navId} isChild navItem={childNavItem} active={location?.pathname.startsWith(childNavItem.navPath)} />
          })}
        </Fragment>
      }

      if (!navItem.navPath) return null;

      return <NavigationLink key={navItem.navId} navItem={navItem} active={location?.pathname.startsWith(navItem.navPath)} />
    })}
  </nav>
}

function NavigationLink(props: { navItem: NavItem, active: boolean, isChild?: boolean }) {
  const { navItem, active, isChild } = props;
  return <Link to={navItem.navPath} className={Rosie.classNames('nav-link p-1', { active, 'ps-3': isChild })}>
    {navItem.navIcon ? <span className={`fa fa-${navItem.navIcon} nav-icon`} /> : ''} {navItem.navName}
  </Link>
}