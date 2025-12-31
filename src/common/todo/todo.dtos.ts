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

/**
 * Request payload for creating a new TODO item.
 */
export interface CreateTodoRequest {
  /** Title of the TODO (required) */
  title: string;

  /** Optional detailed description */
  description?: string;

  /** Initial status (defaults to 'planned' if not specified) */
  status?: TodoStatus;

  /** Array of tags for categorization */
  tags?:  string[];

  /** Username or identifier of the assigned person */
  assignee?: string;

  /** Priority level (defaults to 'medium' if not specified) */
  priority?: TodoPriority;

  /** Severity level (defaults to 'low' if not specified) */
  severity?: TodoSeverity;

  /** Due date in ISO 8601 format */
  dueDate?: string;

  /** Array of compliance frameworks this task relates to */
  complianceFrameworks?:  string[];
}

/**
 * Response payload after successfully creating a TODO item.
 */
export interface CreateTodoResponse {
  /** The newly created TODO item with server-generated fields */
  todo: Todo;
}
/**
 * Request payload for updating an existing TODO item.
 * All fields are optional - only provided fields will be updated.
 */
export interface UpdateTodoRequest {
  /** Updated title */
  title?: string;

  /** Updated description */
  description?: string;

  /** Updated status */
  status?: TodoStatus;

  /** Updated tags array (replaces existing tags) */
  tags?:  string[];

  /** Updated assignee (or undefined to clear) */
  assignee?: string;

  /** Updated priority level */
  priority?: TodoPriority;

  /** Updated severity level */
  severity?: TodoSeverity;

  /** Updated due date (set to null to clear) */
  dueDate?: string | null;

  /** Updated compliance frameworks array (replaces existing frameworks) */
  complianceFrameworks?:  string[];
}

/**
 * Response payload after successfully updating a TODO item.
 */
export interface UpdateTodoResponse {
  /** The updated TODO item with all current values */
  todo: Todo;
}
/**
 * Response payload after successfully deleting a TODO item.
 */
export interface DeleteTodoResponse {
  /** ID of the deleted TODO item */
  id: string;

  /** Confirmation that the deletion was successful */
  deleted: boolean;
}

/**
 * Response payload for fetching a single TODO item by ID.
 */
export interface GetTodoResponse {
  /** The requested TODO item */
  todo: Todo;
}
/**
 * Query parameters for listing and filtering TODO items.
 * All parameters are optional and can be combined for complex queries.
 */
export interface ListTodosQueryParams {
  /** Page number (1-based, defaults to 1) */
  page?: number;

  /** Number of items per page (defaults to 20, max 100) */
  pageSize?: number;

  /** Filter by status (single value or array for multiple statuses) */
  status?: TodoStatus |  TodoStatus[];

  /** Filter by tags (items must have ALL specified tags) */
  tags?:  string[];

  /** Full-text search across title and description */
  searchText?: string;

  /** Filter by assignee */
  assignee?: string;

  /** Filter by priority (single value or array for multiple priorities) */
  priority?: TodoPriority |  TodoPriority[];

  /** Filter by severity (single value or array for multiple severities) */
  severity?: TodoSeverity |  TodoSeverity[];

  /** Filter by compliance frameworks */
  complianceFrameworks?:  string[];

  /** Filter for items due after this date (ISO 8601) */
  dueDateAfter?: string;

  /** Filter for items due before this date (ISO 8601) */
  dueDateBefore?: string;

  /** Filter for items created after this date (ISO 8601) */
  createdAfter?: string;

  /** Filter for items created before this date (ISO 8601) */
  createdBefore?: string;

  /** Filter for items updated after this date (ISO 8601) */
  updatedAfter?: string;

  /** Filter for items updated before this date (ISO 8601) */
  updatedBefore?: string;

  /** Filter for items completed after this date (ISO 8601) */
  completedAfter?: string;

  /** Filter for items completed before this date (ISO 8601) */
  completedBefore?: string;

  /** Filter for overdue items (due date in the past and not completed) */
  isOverdue?: boolean;

  /** Field to sort by */
  sortField?: TodoSortField;

  /** Sort direction (asc or desc) */
  sortDirection?: SortDirection;
}
/**
 * Pagination metadata for list responses.
 */
export interface PaginationMeta {
  /** Current page number (1-based) */
  page: number;

  /** Number of items per page */
  pageSize: number;

  /** Total number of items matching the query */
  totalItems: number;

  /** Total number of pages available */
  totalPages: number;

  /** Whether there is a next page */
  hasNextPage: boolean;

  /** Whether there is a previous page */
  hasPreviousPage: boolean;
}

/**
 * Response payload for listing TODO items.
 * Includes both the data and pagination metadata.
 */
export interface ListTodosResponse {
  /** Array of TODO items for the current page */
  todos:  Todo[];

  /** Pagination information */
  pagination: PaginationMeta;
}
/**
 * Request payload for searching TODO items.
 * Supports full-text search, filtering, pagination, and sorting.
 */
export interface SearchTodosRequest {
  /** Full-text search query */
  query?: string;

  /** Filter criteria */
  filters?: {
    /** Filter by status values */
    status?:  TodoStatus[];

    /** Filter by tags (AND logic - must have all tags) */
    tags?:  string[];

    /** Filter by assignee */
    assignee?: string;

    /** Filter for items created after this date */
    createdAfter?: string;

    /** Filter for items created before this date */
    createdBefore?: string;

    /** Filter for items completed after this date */
    completedAfter?: string;

    /** Filter for items completed before this date */
    completedBefore?: string;
  };

  /** Page number for pagination */
  page?: number;

  /** Number of items per page */
  pageSize?: number;

  /** Sort configuration */
  sort?: {
    /** Field to sort by */
    field: TodoSortField;

    /** Sort direction */
    direction: SortDirection;
  };
}

/**
 * Response payload for search results.
 * Uses the same structure as list response.
 */
export type SearchTodosResponse = ListTodosResponse;
/**
 * Query parameters for fetching TODO statistics.
 */
export interface TodoStatsQueryParams {
  /** Only include TODOs created after this date */
  createdAfter?: string;

  /** Only include TODOs created before this date */
  createdBefore?: string;

  /** Time interval for completion trend data */
  timeInterval?: 'hour' | 'day' | 'week' | 'month';

  /** Maximum number of top tags to return (defaults to 10) */
  topTagsLimit?: number;
}

/**
 * Response payload containing TODO statistics.
 */
export interface TodoStatsResponse {
  /** Aggregated statistics data */
  stats: TodoStats;
}
/**
 * Query parameters for fetching advanced analytics.
 */
export interface TodoAnalyticsQueryParams {
  /** Filter analytics for a specific compliance framework */
  complianceFramework?: string;

  /** Only include overdue tasks in analytics */
  overdueOnly?: boolean;
}

/**
 * Response payload containing advanced analytics data.
 */
export interface TodoAnalyticsResponse {
  /** Comprehensive analytics data */
  analytics: AnalyticsStats;
}

/**
 * Response payload for autocomplete suggestions.
 * Provides lists of existing tags and compliance frameworks.
 */
export interface TodoSuggestionsResponse {
  /** List of unique tags used in existing TODOs */
  tags:  string[];

  /** List of unique compliance frameworks used in existing TODOs */
  complianceFrameworks:  string[];
}

/**
 * Standard error response structure for API errors.
 */
export interface ApiErrorResponse {
  /** HTTP status code */
  statusCode: number;

  /** Error type or category */
  error: string;

  /** Human-readable error message */
  message: string;

  /** Optional additional details about the error */
  details?: Record<string, unknown>;
}

/**
 * API endpoint paths for TODO operations.
 * Use these constants to ensure consistent endpoint references.
 */
export const TODO_API_ENDPOINTS = {
  /** GET /todos - List all TODOs */
  LIST: '/todos',

  /** POST /todos - Create a new TODO */
  CREATE: '/todos',

  /** GET /todos/:id - Get a single TODO */
  GET: (id: string) => `/todos/${id}`,

  /** PATCH /todos/:id - Update a TODO */
  UPDATE: (id: string) => `/todos/${id}`,

  /** DELETE /todos/:id - Delete a TODO */
  DELETE: (id: string) => `/todos/${id}`,

  /** POST /todos/_search - Search TODOs */
  SEARCH: '/todos/_search',

  /** GET /todos/_stats - Get TODO statistics */
  STATS: '/todos/_stats',

  /** GET /todos/_analytics - Get advanced analytics */
  ANALYTICS: '/todos/_analytics',
} as const;
