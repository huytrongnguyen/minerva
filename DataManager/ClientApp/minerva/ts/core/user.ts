import { Model } from './http';

export type AuthUser = {
  username: string,
  token: string,
}

export const AuthUserModel = Model<AuthUser>({ proxy: { url: '/api/auth/user' } });