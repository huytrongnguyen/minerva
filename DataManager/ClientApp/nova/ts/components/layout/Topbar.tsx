interface TopbarProps {
  title: string;
  breadcrumbs?: string[];
  userInitials?: string;
}

export function Topbar({ title, breadcrumbs = [], userInitials = 'MN' }: TopbarProps) {
  return (
    <header className="nova-topbar">
      <div className="nova-topbar__breadcrumb">
        {breadcrumbs.map((crumb, i) => (
          <span key={i}>
            {i > 0 && <span className="sep"> / </span>}
            <span>{crumb}</span>
          </span>
        ))}
        {breadcrumbs.length > 0 && <span className="sep"> / </span>}
        <span style={{ fontWeight: 600, color: 'var(--nova-text)' }}>{title}</span>
      </div>
      <div className="nova-topbar__spacer" />
      <div className="nova-topbar__avatar">{userInitials}</div>
    </header>
  );
}
