export type NavItem = {
  navId: string,
  navName: string,
  navPath?: string,
  navIcon?: string,
  children?: NavItem[],
  groups?: any[],
}