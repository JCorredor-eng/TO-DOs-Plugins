

declare module 'react' {
  export type FC<P = {}> = (props: P) => ReactElement | null;
  export type ReactElement = any;
  export type ReactNode = any;
  export type ComponentType<P = any> = any;
  export type CSSProperties = any;
  export type ReactEventHandler<T = Element> = (event: any) => void;
  export type ChangeEvent<T = Element> = any;
  export type MouseEvent<T = Element> = any;
  export type FormEvent<T = Element> = any;
  export type KeyboardEvent<T = Element> = any;
  export type FocusEvent<T = Element> = any;

  export function useState<S>(initialState: S | (() => S)): [S, (newState: S) => void];
  export function useEffect(effect: () => void | (() => void), deps?: readonly any[]): void;
  export function useCallback<T extends (...args: any[]) => any>(callback: T, deps: readonly any[]): T;
  export function useMemo<T>(factory: () => T, deps: readonly any[]): T;
  export function useRef<T>(initialValue: T): { current: T };
  export function useContext<T>(context: any): T;
  export function useReducer<R extends (state: any, action: any) => any>(
    reducer: R,
    initialState: any,
    init?: any
  ): [any, (action: any) => void];

  export function createContext<T>(defaultValue: T): any;
  export function createElement(type: any, props?: any, ...children: any[]): ReactElement;
  export function cloneElement(element: ReactElement, props?: any, ...children: any[]): ReactElement;
  export function isValidElement(object: any): boolean;

  export const Children: any;
  export const Fragment: any;
  export const StrictMode: any;
  export const Suspense: any;

  export default any;

  namespace React {
    export type FC<P = {}> = (props: P) => ReactElement | null;
    export type ReactElement = any;
    export type ReactNode = any;
  }
}

declare module 'react-dom' {
  import { ReactElement } from 'react';
  export function render(element: ReactElement, container: Element | null): void;
  export function unmountComponentAtNode(container: Element): boolean;
  export const version: string;
  const ReactDOM: any;
  export default ReactDOM;
}

declare module '@elastic/eui' {

  export const EuiPage: any;
  export const EuiPageBody: any;
  export const EuiPageContent: any;
  export const EuiPageContentBody: any;
  export const EuiPageHeader: any;
  export const EuiPanel: any;
  export const EuiFlexGroup: any;
  export const EuiFlexItem: any;
  export const EuiSpacer: any;
  export const EuiHorizontalRule: any;

  export const EuiTitle: any;
  export const EuiText: any;

  export const EuiButton: any;
  export const EuiButtonEmpty: any;
  export const EuiButtonIcon: any;

  export const EuiForm: any;
  export const EuiFormRow: any;
  export const EuiFieldText: any;
  export const EuiFieldSearch: any;
  export const EuiTextArea: any;
  export const EuiSelect: any;
  export const EuiCheckbox: any;
  export const EuiSwitch: any;
  export const EuiComboBox: any;
  export const EuiDatePicker: any;

  export const EuiBasicTable: any;
  export type EuiBasicTableColumn<T> = any;
  export const EuiTablePagination: any;

  export const EuiModal: any;
  export const EuiModalHeader: any;
  export const EuiModalHeaderTitle: any;
  export const EuiModalBody: any;
  export const EuiModalFooter: any;
  export const EuiConfirmModal: any;
  export const EuiOverlayMask: any;
  export const EuiFlyout: any;
  export const EuiFlyoutHeader: any;
  export const EuiFlyoutBody: any;
  export const EuiFlyoutFooter: any;
  export const EuiPopover: any;

  export const EuiBadge: any;
  export const EuiHealth: any;
  export const EuiStat: any;
  export const EuiProgress: any;
  export const EuiIcon: any;
  export const EuiToolTip: any;
  export const EuiHighlight: any;
  export const EuiDescriptionList: any;

  export const EuiCallOut: any;
  export const EuiEmptyPrompt: any;
  export const EuiLoadingSpinner: any;
  export const EuiLoadingChart: any;

  export const EuiTabs: any;
  export const EuiTab: any;
  export const EuiTabbedContent: any;
  export type EuiTabbedContentTab = any;
  export const EuiLink: any;
  export const EuiHeaderLink: any;

  export const EuiSelectable: any;
  export type EuiSelectableOption = any;
  export const EuiSelectableMessage: any;

  export const EuiFilterGroup: any;
  export const EuiFilterButton: any;

  export const EuiCard: any;
  export const EuiAccordion: any;
  export type EuiComboBoxOptionOption<T = any> = any;

  export const useEuiTheme: any;
}

declare module '@osd/i18n' {
  export const i18n: {
    translate(id: string, options?: { defaultMessage: string; values?: Record<string, any> }): string;
  };

  export class I18n {
    translate(id: string, options?: { defaultMessage: string; values?: Record<string, any> }): string;
  }
}

declare module '@osd/i18n/react' {
  import { ComponentType, ReactElement } from 'react';

  export const I18nProvider: ComponentType<{ children: ReactElement }>;

  export function FormattedMessage(props: {
    id: string;
    defaultMessage: string;
    values?: Record<string, any>;
  }): ReactElement;

  export function useIntl(): {
    formatMessage: (descriptor: { id: string; defaultMessage: string }, values?: Record<string, any>) => string;
  };

  export const injectI18n: any;
}

declare module '**/src/core/public' {
  export * from 'opensearch-dashboards/public';
}

declare module '**/src/core/server' {
  export * from 'opensearch-dashboards/server';
}

declare module '../../../src/core/public' {
  export * from 'opensearch-dashboards/public';
}

declare module '../../../../src/core/public' {
  export * from 'opensearch-dashboards/public';
}

declare module '../../../../../src/core/public' {
  export * from 'opensearch-dashboards/public';
}

declare module '../../../src/core/server' {
  export * from 'opensearch-dashboards/server';
}

declare module '../../../../src/core/server' {
  export * from 'opensearch-dashboards/server';
}

declare module '../../../../../src/core/server' {
  export * from 'opensearch-dashboards/server';
}

declare module 'opensearch-dashboards/public' {
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

  export interface Plugin<TSetup = void, TStart = void, TPluginsSetup = any, TPluginsStart = any> {
    setup(core: CoreSetup<TPluginsStart>, plugins: TPluginsSetup): TSetup;
    start(core: CoreStart, plugins: TPluginsStart): TStart;
    stop?(): void;
  }
}

declare module 'opensearch-dashboards/server' {
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
}
