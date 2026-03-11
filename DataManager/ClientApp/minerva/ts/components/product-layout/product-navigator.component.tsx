import { Fragment, useEffect, useState } from 'react';
import { Link, useLocation, useParams } from 'react-router';
import { NavItem, ProductDashboardTreeModel } from 'minerva/core';
import { Rosie } from 'rosie/core';

export function ProductNavigator() {
  const params = useParams(),
        [navigation, setNavigation] = useState([] as NavItem[]);

  useEffect(() => {
    const { productId } = params;
    if (productId) {
      loadDashboardTree(productId);
    }
  }, [params])

  async function loadDashboardTree(productId: string) {
    const dashboardTree = (await ProductDashboardTreeModel.fetch({ pathParams: { productId } })) ?? [],
          navigator: NavItem[] = [{
            navId: 'dashboards',
            navName: 'Dashboards',
            children: dashboardTree
          }, {
            navId: 'management',
            navName: 'Management',
            children: [{
              navId: 'events',
              navName: 'Events',
              navPath: `/products/${productId}/events`
            }, {
              navId: 'settings',
              navName: 'Settings',
              navPath: `/products/${productId}/settings`
            }]
          }];

    setNavigation(navigator);
  }

  return <>
    <NavItemList items={navigation} level={0} />
  </>
}

export function NavItemList(props: { items: NavItem[], level: number }) {
  const location = useLocation(),
        { items = [], level = 0 } = props;

  return <>
    {items.map(navItem => {
      if (!navItem.navPath || (navItem.children && navItem.children.length > 0)) {
        return <Fragment key={navItem.navId}>
          <div role="button" className={Rosie.classNames('nav-link py-1 pe-1 d-flex', { disabled: level === 0 })} style={{paddingLeft: 8 + 16 * level}}>
            <div>{navItem.navName}</div>
            {(level > 0) && <div className="dropdown ms-auto hidden-menu">
              <button className="btn btn-sm p-0 dropdown-toggle hide-indicator" data-bs-toggle="dropdown" data-bs-auto-close="true">
                <span className="fa fa-plus" />
              </button>
              <div className="dropdown-menu">
                <div role="button" className="dropdown-item">New Dashboard</div>
                <div role="button" className="dropdown-item">New Folder</div>
              </div>
            </div>}

          </div>
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