import {
  Todo,
  TodoStatus,
  TodoPriority,
  TodoSeverity,
  TodoSortField,
  SortDirection,
  TodoStats,
  AnalyticsStats,
} from './todo.types';
export interface CreateTodoRequest {
  readonly title: string;
  readonly description?: string;
  readonly status?: TodoStatus;
  readonly tags?: readonly string[];
  readonly assignee?: string;
  readonly priority?: TodoPriority;
  readonly severity?: TodoSeverity;
  readonly dueDate?: string;
  readonly complianceFrameworks?: readonly string[];
}
export interface CreateTodoResponse {
  readonly todo: Todo;
}
export interface UpdateTodoRequest {
  readonly title?: string;
  readonly description?: string;
  readonly status?: TodoStatus;
  readonly tags?: readonly string[];
  readonly assignee?: string;
  readonly priority?: TodoPriority;
  readonly severity?: TodoSeverity;
  readonly dueDate?: string | null;
  readonly complianceFrameworks?: readonly string[];
}
export interface UpdateTodoResponse {
  readonly todo: Todo;
}
export interface DeleteTodoResponse {
  readonly id: string;
  readonly deleted: boolean;
}
export interface GetTodoResponse {
  readonly todo: Todo;
}
export interface ListTodosQueryParams {
  readonly page?: number;
  readonly pageSize?: number;
  readonly status?: TodoStatus | readonly TodoStatus[];
  readonly tags?: readonly string[];
  readonly searchText?: string;
  readonly assignee?: string;
  readonly priority?: TodoPriority | readonly TodoPriority[];
  readonly severity?: TodoSeverity | readonly TodoSeverity[];
  readonly complianceFrameworks?: readonly string[];
  readonly dueDateAfter?: string;
  readonly dueDateBefore?: string;
  readonly isOverdue?: boolean;
  readonly sortField?: TodoSortField;
  readonly sortDirection?: SortDirection;
}
export interface PaginationMeta {
  readonly page: number;
  readonly pageSize: number;
  readonly totalItems: number;
  readonly totalPages: number;
  readonly hasNextPage: boolean;
  readonly hasPreviousPage: boolean;
}
export interface ListTodosResponse {
  readonly todos: readonly Todo[];
  readonly pagination: PaginationMeta;
}
export interface SearchTodosRequest {
  readonly query?: string;
  readonly filters?: {
    readonly status?: readonly TodoStatus[];
    readonly tags?: readonly string[];
    readonly assignee?: string;
    readonly createdAfter?: string;
    readonly createdBefore?: string;
    readonly completedAfter?: string;
    readonly completedBefore?: string;
  };
  readonly page?: number;
  readonly pageSize?: number;
  readonly sort?: {
    readonly field: TodoSortField;
    readonly direction: SortDirection;
  };
}
export type SearchTodosResponse = ListTodosResponse;
export interface TodoStatsQueryParams {
  readonly createdAfter?: string;
  readonly createdBefore?: string;
  readonly timeInterval?: 'hour' | 'day' | 'week' | 'month';
  readonly topTagsLimit?: number;
}
export interface TodoStatsResponse {
  readonly stats: TodoStats;
}
export interface TodoAnalyticsQueryParams {
  readonly complianceFramework?: string;
  readonly overdueOnly?: boolean;
}
export interface TodoAnalyticsResponse {
  readonly analytics: AnalyticsStats;
}

export interface TodoSuggestionsResponse {
  readonly tags: readonly string[];
  readonly complianceFrameworks: readonly string[];
}
export interface ApiErrorResponse {
  readonly statusCode: number;
  readonly error: string;
  readonly message: string;
  readonly details?: Record<string, unknown>;
}
export const TODO_API_ENDPOINTS = {
  LIST: '/todos',
  CREATE: '/todos',
  GET: (id: string) => `/todos/${id}`,
  UPDATE: (id: string) => `/todos/${id}`,
  DELETE: (id: string) => `/todos/${id}`,
  SEARCH: '/todos/_search',
  STATS: '/todos/_stats',
  ANALYTICS: '/todos/_analytics',
} as const;
