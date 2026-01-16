import { LocalCache } from 'rosie-ui';
import { AUTH_TOKEN, redirectToLogin } from 'minerva/core';

export function RequireAuth({ component: Component, title = '' }) {
  if (!LocalCache.get(AUTH_TOKEN)) redirectToLogin();

  document.title = title ? `${title} | Minerva` : 'Minerva';

  return <Component />;
}