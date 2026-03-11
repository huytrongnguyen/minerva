import { Ajax, AjaxError, DataModel, DataStore, HttpParams, LocalCache, ProxyConfig } from 'rosie/core';
import { afterProcessing, alertError, beforeProcessing } from './shared';

export const AUTH_TOKEN = 'auth_token';

export function redirectToLogin() {
  LocalCache.remove(AUTH_TOKEN);
  location.href = '/login';
}


export function onAjaxError(reason: AjaxError) {
  const { status, data } = reason.response;
  if (status === 401) {
    redirectToLogin();
    return;
  }

  if (data?.message) alertError(data?.message);

  return null;
}

export class AuthDataModel<T> extends DataModel<T> {
  loadWithSplashScreen(params?: HttpParams) {
    beforeProcessing();
    return super.load(params, onAjaxError, afterProcessing);
  }

  fetch(params: HttpParams = {}, onError?: (_reason: AjaxError) => T, onComplete?: () => void) {
    params = params ?? {};
    if (!params.headers) params.headers = {};
    params.headers[AUTH_TOKEN] = LocalCache.get(AUTH_TOKEN);

    beforeProcessing();
    return super.fetch(params, onError ?? onAjaxError, onComplete ?? afterProcessing);
  }
}

export const Model = <T = any>(config?: ProxyConfig) => new AuthDataModel<T>(config);

export class AuthDataStore<T> extends DataStore<T> {
  loadWithSplashScreen(params?: HttpParams) {
    beforeProcessing();
    return super.load(params, onAjaxError, afterProcessing);
  }

  fetch(params: HttpParams = {}, onError?: (_reason: AjaxError) => T[], onComplete?: () => void) {
    params = params ?? {};
    if (!params.headers) params.headers = {};
    params.headers[AUTH_TOKEN] = LocalCache.get(AUTH_TOKEN);

    return super.fetch(params, onError ?? onAjaxError, onComplete);
  }
}

export const Store = <T = any>(config?: ProxyConfig) => new AuthDataStore<T>(config);