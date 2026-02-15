import { Fragment, useEffect, useState } from 'react';
import { Link, useParams, useLocation } from 'react-router';
import { Rosie } from 'rosie-ui';

import { NavItem, ProductNavigatorModel } from 'minerva/core';

export function ProductNavigator() {
  const params = useParams(),
        [navigation, setNavigation] = useState([] as NavItem[]);

  useEffect(() => {
    const navigator$ = ProductNavigatorModel.subscribe(setNavigation);
    return () => { navigator$.unsubscribe(); }
  }, []);

  useEffect(() => {
    const { productId } = params;
    if (productId) {
      ProductNavigatorModel.load({ pathParams: { productId } });
    }
  }, [params])

  return <>
    <NavItemList items={navigation} level={0} />
  </>
}

function NavItemList(props: { items: NavItem[], level: number }) {
  const location = useLocation(),
        { items = [], level = 0 } = props;

  return <>
    {items.map(navItem => {
      if (navItem.children && navItem.children.length > 0) {
        return <Fragment key={navItem.navId}>
          <div className="nav-link disabled text-body-tertiary py-1 pe-1" style={{paddingLeft: 4 + 8 * level}}>{navItem.navName}</div>
          <NavItemList items={navItem.children} level={level + 1} />
        </Fragment>
      }

      return <Link key={navItem.navId} to={navItem.navPath} style={{paddingLeft: 4 + 8 * level}}
                    className={Rosie.classNames('nav-link rounded-0 py-1 pe-1', { active: location.pathname === navItem.navPath })}>
        {navItem.navIcon ? <span className={`fa fa-${navItem.navIcon} nav-icon`} /> : ''} {navItem.navName}
      </Link>
    })}
  </>
}