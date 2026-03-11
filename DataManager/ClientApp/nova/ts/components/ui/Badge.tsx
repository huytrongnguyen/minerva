interface BadgeProps {
  color: 'green' | 'blue' | 'amber' | 'purple' | 'gray' | 'red';
  children: React.ReactNode;
}

export function Badge({ color, children }: BadgeProps) {
  return <span className={`nova-badge nova-badge--${color}`}>{children}</span>;
}
