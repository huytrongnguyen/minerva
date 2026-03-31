import { Model } from './http';
import { NavItem } from './types';

export type AuthUser = {
  username: string,
  token: string,
}

export const AuthUserModel = Model<AuthUser>({ proxy: { url: '/api/auth/user' } });

export const navigator: NavItem[] = [{
  navId: 'products',
  navName: 'Products',
  navPath: '/products'
}, {
  navId: 'admin',
  navName: 'Administration',
  navPath: '/admin'
}]