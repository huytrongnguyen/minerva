import { Fragment, useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router';
import { Rosie } from 'rosie-ui';

import { NavItem } from 'minerva/core';

export function AppNavigator(props: { navigator: NavItem[] }) {
  const location = useLocation(),
        [navigation, setNavigation] = useState([] as NavItem[]);

  useEffect(() => {
    setNavigation(props.navigator);
  }, []);

  return <nav className="d-flex flex-column">
    {navigation.map(navItem => {
      if (navItem.children && navItem.children.length > 0) {
        return <Fragment key={navItem.navId}>
          <div className="nav-link disabled text-body-tertiary text-uppercase fw-bold p-1">{navItem.navName}</div>
          {navItem.children.map(childNavItem => {
            return <NavigationLink key={childNavItem.navId} isChild navItem={childNavItem} currentPath={location?.pathname ?? ''} />
          })}
        </Fragment>
      }

      if (!navItem.navPath) return null;

      return <NavigationLink key={navItem.navId} navItem={navItem} currentPath={location?.pathname ?? ''} />
    })}
  </nav>
}

function NavigationLink(props: { navItem: NavItem, isChild?: boolean, currentPath: string }) {
  const { navItem, isChild, currentPath } = props,
        activeFn = navItem.activeFn ?? ((path: string) => path.startsWith(navItem.navPath));
  return <Link to={navItem.navPath} className={Rosie.classNames('nav-link p-1', { active: activeFn(currentPath), 'ps-3': isChild })}>
    {navItem.navIcon ? <span className={`fa fa-${navItem.navIcon} nav-icon`} /> : ''} {navItem.navName}
  </Link>
}