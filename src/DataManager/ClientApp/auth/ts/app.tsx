import { useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter as Router, Route, Routes } from 'react-router';
import { useSearchParams, useNavigate } from 'react-router';

import { LocalCache } from 'rosie/core';
import { AUTH_TOKEN, AuthUser, AuthUserModel, verifyAuthUser } from 'minerva/core';

// Error: useLocation() may be used only in the context of a <Router> component.
function AuthView() {
  const [searchParams] = useSearchParams(),
        navigate = useNavigate();

  useEffect(() => {
    const code = searchParams.get('code');

    console.log(code);

    if (code) getAuthUser(code);
  }, [])

  async function getAuthUser(code: string) {
    const user = await verifyAuthUser<AuthUser>(code);

    if (user) {
      LocalCache.set(AUTH_TOKEN, user.token);
      AuthUserModel.load();
      navigate('/');
    }
  }

  return null;
}

function AppView() {
  return <Router>
          <Routes>
            <Route path="*" element={<AuthView />} />
          </Routes>
  </Router>
}

createRoot(document.getElementById('react-root') as HTMLElement).render(<AppView />);