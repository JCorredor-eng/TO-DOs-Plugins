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
   title: string;
   description?: string;
   status?: TodoStatus;
   tags?:  string[];
   assignee?: string;
   priority?: TodoPriority;
   severity?: TodoSeverity;
   dueDate?: string;
   complianceFrameworks?:  string[];
}
export interface CreateTodoResponse {
   todo: Todo;
}
export interface UpdateTodoRequest {
   title?: string;
   description?: string;
   status?: TodoStatus;
   tags?:  string[];
   assignee?: string;
   priority?: TodoPriority;
   severity?: TodoSeverity;
   dueDate?: string | null;
   complianceFrameworks?:  string[];
}
export interface UpdateTodoResponse {
   todo: Todo;
}
export interface DeleteTodoResponse {
   id: string;
   deleted: boolean;
}
export interface GetTodoResponse {
   todo: Todo;
}
export interface ListTodosQueryParams {
   page?: number;
   pageSize?: number;
   status?: TodoStatus |  TodoStatus[];
   tags?:  string[];
   searchText?: string;
   assignee?: string;
   priority?: TodoPriority |  TodoPriority[];
   severity?: TodoSeverity |  TodoSeverity[];
   complianceFrameworks?:  string[];
   dueDateAfter?: string;
   dueDateBefore?: string;
   createdAfter?: string;
   createdBefore?: string;
   updatedAfter?: string;
   updatedBefore?: string;
   completedAfter?: string;
   completedBefore?: string;
   isOverdue?: boolean;
   sortField?: TodoSortField;
   sortDirection?: SortDirection;
}
export interface PaginationMeta {
   page: number;
   pageSize: number;
   totalItems: number;
   totalPages: number;
   hasNextPage: boolean;
   hasPreviousPage: boolean;
}
export interface ListTodosResponse {
   todos:  Todo[];
   pagination: PaginationMeta;
}
export interface SearchTodosRequest {
   query?: string;
   filters?: {
     status?:  TodoStatus[];
     tags?:  string[];
     assignee?: string;
     createdAfter?: string;
     createdBefore?: string;
     completedAfter?: string;
     completedBefore?: string;
  };
   page?: number;
   pageSize?: number;
   sort?: {
     field: TodoSortField;
     direction: SortDirection;
  };
}
export type SearchTodosResponse = ListTodosResponse;
export interface TodoStatsQueryParams {
   createdAfter?: string;
   createdBefore?: string;
   timeInterval?: 'hour' | 'day' | 'week' | 'month';
   topTagsLimit?: number;
}
export interface TodoStatsResponse {
   stats: TodoStats;
}
export interface TodoAnalyticsQueryParams {
   complianceFramework?: string;
   overdueOnly?: boolean;
}
export interface TodoAnalyticsResponse {
   analytics: AnalyticsStats;
}

export interface TodoSuggestionsResponse {
   tags:  string[];
   complianceFrameworks:  string[];
}
export interface ApiErrorResponse {
   statusCode: number;
   error: string;
   message: string;
   details?: Record<string, unknown>;
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
