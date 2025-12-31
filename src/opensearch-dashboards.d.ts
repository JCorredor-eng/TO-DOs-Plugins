

declare module '../../../../src/core/server' {
  export interface Logger {
    debug: (message: string, meta?: any) => void;
    info: (message: string, meta?: any) => void;
    warn: (message: string, meta?: any) => void;
    error: (message: string | Error, meta?: any) => void;
    trace: (message: string, meta?: any) => void;
  }

  export interface IRouter {
    get: (config: any, handler: any) => void;
    post: (config: any, handler: any) => void;
    put: (config: any, handler: any) => void;
    patch: (config: any, handler: any) => void;
    delete: (config: any, handler: any) => void;
  }

  export interface OpenSearchDashboardsResponseFactory {
    ok: (options?: { body?: any; headers?: Record<string, string> }) => any;
    accepted: (options?: { body?: any; headers?: Record<string, string> }) => any;
    noContent: (options?: { headers?: Record<string, string> }) => any;
    created: (options?: { body?: any; headers?: Record<string, string> }) => any;
    badRequest: (options?: { body?: any }) => any;
    unauthorized: (options?: { body?: any }) => any;
    forbidden: (options?: { body?: any }) => any;
    notFound: (options?: { body?: any }) => any;
    conflict: (options?: { body?: any }) => any;
    internalError: (options?: { body?: any }) => any;
    customError: (options: { statusCode: number; body?: any }) => any;
  }

  export interface PluginInitializerContext {
    logger: {
      get: (...args: string[]) => Logger;
    };
    config: {
      get: () => any;
    };
  }

  export interface RequestHandlerContext {
    core: {
      opensearch: {
        client: {
          asCurrentUser: any;
          asInternalUser: any;
        };
      };
    };
  }

  export interface OpenSearchDashboardsRequest {
    params: any;
    query: any;
    body: any;
  }

  export interface CoreSetup<TPluginsStart = any> {
    http: {
      createRouter: () => IRouter;
    };
  }
}

declare module '../../../../src/core/public' {
  import { FC, ReactElement } from 'react';

  export interface HttpSetup {
    get: <T = any>(path: string, options?: { query?: Record<string, any> }) => Promise<T>;
    post: <T = any>(path: string, options?: { body?: string; query?: Record<string, any> }) => Promise<T>;
    put: <T = any>(path: string, options?: { body?: string; query?: Record<string, any> }) => Promise<T>;
    patch: <T = any>(path: string, options?: { body?: string; query?: Record<string, any> }) => Promise<T>;
    delete: <T = any>(path: string, options?: { query?: Record<string, any> }) => Promise<T>;
  }

  export interface NotificationsStart {
    toasts: {
      addSuccess: (title: string | ReactElement, options?: any) => void;
      addError: (error: Error, options?: { title: string }) => void;
      addWarning: (title: string | ReactElement, options?: any) => void;
      addInfo: (title: string | ReactElement, options?: any) => void;
    };
  }

  export interface AppMountParameters {
    element: HTMLElement;
    appBasePath: string;
    onAppLeave: (handler: () => void) => void;
  }

  export interface CoreSetup<TPluginsStart = any> {
    application: {
      register: (app: any) => void;
    };
    http: HttpSetup;
    notifications: NotificationsStart;
  }

  export interface CoreStart {
    http: HttpSetup;
    notifications: NotificationsStart;
    application: any;
    chrome: any;
    i18n: any;
    overlays: any;
    uiSettings: any;
  }
}
