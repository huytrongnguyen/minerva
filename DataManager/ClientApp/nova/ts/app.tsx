import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { DashboardView } from './views/dashboard/DashboardView';

function App() {
  return (
    <BrowserRouter basename="/nova">
      <Routes>
        <Route path="/dashboard" element={<DashboardView />} />
        {/* Placeholders for other routes */}
        <Route path="/products" element={<div style={{ padding: 24 }}>Products View</div>} />
        <Route path="/events" element={<div style={{ padding: 24 }}>Events View</div>} />
        <Route path="/fields" element={<div style={{ padding: 24 }}>Fields View</div>} />
        <Route path="/reports" element={<div style={{ padding: 24 }}>Reports View</div>} />
        <Route path="/settings" element={<div style={{ padding: 24 }}>Settings View</div>} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

const rootElement = document.getElementById('nova-root');
if (rootElement) {
  const root = createRoot(rootElement);
  root.render(
    <StrictMode>
      <App />
    </StrictMode>
  );
}
