import { HashRouter as Router, Navigate, Route, Routes, Link } from 'react-router';
import { HomeView } from './home';
import { Account, AppNavigator } from './ux';
import { MonitoringDetailsView, MonitoringListView } from './monitoring';

export function AppView() {
  return <Router>
    <div className="app d-flex flex-column">
      <header className="navbar navbar-expand-lg px-3 py-0 border-bottom">
        <span className="navbar-brand mb-0 fw-bold">Minerva</span>
        <div className="collapse navbar-collapse">
          <ul className="navbar-nav me-auto">
            <a href="/" className="nav-link active">Master Data</a>
            <a href="/Reports" className="nav-link">Reports</a>
            <a href="/HumanResource" className="nav-link">Human Resource</a>
            <a href="/Administration" className="nav-link">Administration</a>
          </ul>
        </div>
        <Account />
      </header>
      <div className="app-body d-flex flex-row flex-1">
        <aside className="app-sidebar d-flex flex-column border-end">
          <div className="sidebar-body flex-1 overflow-y-auto">
            <AppNavigator />
          </div>
        </aside>
        <div className="app-wrapper d-flex position-relative">
          <div id="app-splash-screen" className="mask">
            <div className="mask-msg">
              <div className="mask-msg-text">
                <span className="fa fa-circle-notch fa-spin me-1" />
                Loading...
              </div>
            </div>
          </div>
          <div className="app-body d-flex flex-column">
            <Routes>
              <Route path="/home" element={<HomeView />} />
              <Route path="/monitoring" element={<MonitoringListView />} />
              <Route path="/monitoring/details" element={<MonitoringDetailsView />} />
              <Route path="*" element={<Navigate to="/home" />} />
            </Routes>
          </div>
        </div>
      </div>
    </div>
  </Router>
}