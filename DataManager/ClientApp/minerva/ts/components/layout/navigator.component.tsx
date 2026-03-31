import { Fragment, PropsWithChildren, useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router';
import { Rosie } from 'rosie/core';
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

export function NavigatorComponent(props: PropsWithChildren<any>) {
  const [navigation, setNavigation] = useState([] as NavItem[]);

  useEffect(() => {
    setNavigation([{
      navId: 'products',
      navName: 'Products',
      navPath: '/products'
    }, {
      navId: 'admin',
      navName: 'Administration',
      navPath: '/admin'
    }]);
  }, []);

  return <></>

  // return <aside>
  //   <div role="button" className="navbar-brand p-2">Minerva</div>
  //   <nav className="nav nav-pills flex-column border-bottom p-2">
  //     <NavItemList items={navigation} level={0} />
  //   </nav>
  //   {props.children}
  // </aside>
}

export function NavItemList(props: { items: NavItem[], level: number }) {
  const location = useLocation(),
        { items = [], level = 0 } = props;

  return <>
    {items.map(navItem => {
      if (!navItem.navPath || (navItem.children && navItem.children.length > 0)) {
        return <Fragment key={navItem.navId}>
          <div className="nav-link disabled py-1 pe-1" style={{paddingLeft: 8 + 16 * level}}>{navItem.navName}</div>
          <NavItemList items={navItem.children} level={level + 1} />
        </Fragment>
      }

      return <Link key={navItem.navId} to={navItem.navPath} style={{paddingLeft: 8 + 16 * level}}
                    className={Rosie.classNames('nav-link py-1 pe-1', { active: location.pathname.startsWith(navItem.navPath) })}>
        {navItem.navIcon ? <span className={`fa fa-${navItem.navIcon} nav-icon`} /> : ''} {navItem.navName}
      </Link>
    })}
  </>
}