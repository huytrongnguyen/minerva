import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import { LocalCache } from 'rosie/core';
import { AUTH_TOKEN, AuthUser, AuthUserModel, verifyAuthToken } from 'minerva/core';

export function Auth() {
  const location = useLocation(),
        navigate = useNavigate();

  useEffect(() => {
    const { ticket } = location.search.decodeQS<{ ticket: string }>();

    if (ticket) getAuthUser(ticket);
  }, [])

  async function getAuthUser(ticket: string) {
    const user = await verifyAuthToken<AuthUser>(ticket);

    if (user) {
      LocalCache.set(AUTH_TOKEN, user.token);
      AuthUserModel.load();
      navigate('/home');
    }
  }

  return null;
}