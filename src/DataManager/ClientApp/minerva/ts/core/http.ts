import { Ajax, AjaxError, DataModel, HttpParams, LocalCache, ProxyConfig } from 'rosie-ui';
import { afterProcessing, beforeProcessing } from './shared';

const loginUrl = `/login`,
      verifyUrl = '/api/auth/verify?code={code}';

export const AUTH_TOKEN = 'auth_token';

export function redirectToLogin() {
  LocalCache.remove(AUTH_TOKEN);
  location.href = loginUrl;
}

export function verifyAuthUser<T = any>(code: string) {
  return Ajax.request<T>({
    url: verifyUrl.replace('{code}', code),
  })
}

export function onAjaxError(reason: AjaxError) {
  if (reason?.response?.status === 401) {
    redirectToLogin();
    return;
  }

  console.log(reason);
  return null;
}

export class AuthDataModel<T> extends DataModel<T> {
  fetch(params: HttpParams = {}, onError?: (_reason: AjaxError) => T, onComplete?: () => void) {
    params = params ?? {};
    if (!params.headers) params.headers = {};
    params.headers[AUTH_TOKEN] = LocalCache.get(AUTH_TOKEN);

    beforeProcessing();
    return super.fetch(params, onError ?? onAjaxError, onComplete ?? afterProcessing);
  }
}

export const Model = <T = any>(config?: ProxyConfig) => new AuthDataModel<T>(config);