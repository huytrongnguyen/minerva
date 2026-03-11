import { PropsWithChildren } from 'react';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';

interface AppShellProps {
  title: string;
  breadcrumbs?: string[];
}

export function AppShell({ title, breadcrumbs, children }: PropsWithChildren<AppShellProps>) {
  return (
    <div className="nova-shell">
      <Sidebar />
      <div className="nova-main">
        <Topbar title={title} breadcrumbs={breadcrumbs} />
        <div className="nova-content">
          {children}
        </div>
      </div>
    </div>
  );
}
