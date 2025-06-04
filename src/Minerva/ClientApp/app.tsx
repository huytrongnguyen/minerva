import { createRoot } from 'react-dom/client';

import { AppView } from './views/app.view';

createRoot(document.getElementById('react-root') as HTMLElement).render(<AppView />);