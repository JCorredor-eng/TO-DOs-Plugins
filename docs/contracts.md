# API Contracts Documentation

This document provides comprehensive documentation for all TypeScript contracts defined in the `common/` folder. These contracts serve as the API boundary between the frontend (client) and backend (server) of the Custom Plugin.

**Table of Contents**
- [Overview](#overview)
- [Core Configuration](#core-configuration)
- [Domain Types](#domain-types)
- [Data Transfer Objects (DTOs)](#data-transfer-objects-dtos)
- [Usage Examples](#usage-examples)
- [Validation Rules](#validation-rules)

---

## Overview

The contracts in this plugin follow a strict separation of concerns:

- **`src/common/constants.ts`**: Plugin-wide constants and configuration values
- **`src/common/todo/todo.types.ts`**: Domain entities, enums, and business types
- **`src/common/todo/todo.dtos.ts`**: API request/response data transfer objects

**Key Principles:**
- All contracts are **immutable** (readonly properties)
- All contracts are **type-safe** (no `any` types)
- All contracts are **shared** between frontend and backend
- All contracts are **versioned** and documented

---

## Core Configuration

### Plugin Identity

#### `PLUGIN_ID`
```typescript
export const PLUGIN_ID = 'customPlugin';
```
Unique identifier for the plugin within OpenSearch Dashboards.

**Type:** `string`
**Usage:** Route registration, plugin lifecycle management

---

#### `PLUGIN_NAME`
```typescript
export const PLUGIN_NAME = 'TO-DO Plugin';
```
Human-readable display name shown in the UI navigation menu.

**Type:** `string`
**Usage:** UI labels, page titles

---

### Data Storage

#### `DEFAULT_INDEX_NAME`
```typescript
export const DEFAULT_INDEX_NAME = 'customplugin-todos';
```
OpenSearch index name where TODO items are persisted.

**Type:** `string`
**Usage:** Repository layer, index management

---

### API Routing

#### `API_BASE_PATH`
```typescript
export const API_BASE_PATH = `/api/${PLUGIN_ID}`;
// Resolves to: "/api/customPlugin"
```
Base path for all plugin API endpoints.

**Type:** `string`
**Usage:** Route registration, HTTP client configuration

---

#### `TODOS_API_PATH`
```typescript
export const TODOS_API_PATH = `${API_BASE_PATH}/todos`;
// Resolves to: "/api/customPlugin/todos"
```
Base path for TODO-related endpoints.

**Type:** `string`
**Usage:** API client, route handlers

---

### Pagination

#### `DEFAULT_PAGE_SIZE`
```typescript
export const DEFAULT_PAGE_SIZE = 20;
```
Default number of items returned per page when not specified.

**Type:** `number`
**Range:** 1-100
**Usage:** List queries, pagination UI

---

#### `MAX_PAGE_SIZE`
```typescript
export const MAX_PAGE_SIZE = 100;
```
Maximum allowed items per page to prevent performance issues.

**Type:** `number`
**Enforcement:** Server-side validation
**Usage:** Input validation, pagination limits

---

### Date Formatting

#### `DATE_FORMAT`
```typescript
export const DATE_FORMAT = 'strict_date_optional_time';
```
OpenSearch date format string for all date fields.

**Type:** `string`
**Format:** ISO 8601 with optional time component
**Examples:**
- `2024-01-15`
- `2024-01-15T14:30:00Z`
- `2024-01-15T14:30:00.000Z`

**Usage:** Index mappings, date field validation

---

## Domain Types

### Status Management

#### `TodoStatus`
```typescript
export type TodoStatus = 'planned' | 'done' | 'error';
```
Represents the current lifecycle state of a TODO item.

**Values:**
- **`planned`**: Task is scheduled or pending (initial state)
- **`done`**: Task has been completed successfully
- **`error`**: Task encountered an issue or failed

**Related Constants:**
```typescript
export const TODO_STATUS_VALUES: readonly TodoStatus[] = ['planned', 'done', 'error'];

export const TODO_STATUS_LABELS: Record<TodoStatus, string> = {
  planned: 'Planned',
  done: 'Done',
  error: 'Error',
};

export const TODO_STATUS_COLORS: Record<TodoStatus, string> = {
  planned: 'primary',   // Blue
  done: 'success',      // Green
  error: 'danger',      // Red
};
```

**Usage:**
- Status filters in UI
- Workflow state transitions
- Analytics and statistics
- Visual indicators (badges, colors)

---

#### `TodoPriority`
```typescript
export type TodoPriority = 'low' | 'medium' | 'high' | 'critical';
```
Indicates the importance and urgency of a task.

**Values (ascending order):**
- **`low`**: Low priority, can be deferred
- **`medium`**: Normal priority (default)
- **`high`**: Important, should be addressed soon
- **`critical`**: Urgent, requires immediate attention

**Related Constants:**
```typescript
export const TODO_PRIORITY_VALUES: readonly TodoPriority[] = [
  'low', 'medium', 'high', 'critical'
];

export const TODO_PRIORITY_LABELS: Record<TodoPriority, string> = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
  critical: 'Critical',
};

export const TODO_PRIORITY_COLORS: Record<TodoPriority, string> = {
  low: 'default',       // Gray
  medium: 'primary',    // Blue
  high: 'warning',      // Orange
  critical: 'danger',   // Red
};
```

**Usage:**
- Task prioritization
- Sorting and filtering
- Risk assessment
- Visual indicators

---

#### `TodoSeverity`
```typescript
export type TodoSeverity = 'info' | 'low' | 'medium' | 'high' | 'critical';
```
Indicates the potential impact or seriousness of a task.

**Values (ascending order):**
- **`info`**: Informational, no impact
- **`low`**: Minor impact
- **`medium`**: Moderate impact
- **`high`**: Significant impact
- **`critical`**: Severe impact, critical system/business risk

**Related Constants:**
```typescript
export const TODO_SEVERITY_VALUES: readonly TodoSeverity[] = [
  'info', 'low', 'medium', 'high', 'critical'
];

export const TODO_SEVERITY_LABELS: Record<TodoSeverity, string> = {
  info: 'Info',
  low: 'Low',
  medium: 'Medium',
  high: 'High',
  critical: 'Critical',
};

export const TODO_SEVERITY_COLORS: Record<TodoSeverity, string> = {
  info: 'default',      // Gray
  low: 'primary',       // Blue
  medium: 'warning',    // Orange
  high: 'danger',       // Red
  critical: 'danger',   // Red (darker)
};
```

**Usage:**
- Impact assessment
- Compliance reporting
- Risk management
- Priority-severity matrix analysis

---

### Core Entities

#### `Todo`
```typescript
export interface Todo {
  readonly id: string;
  readonly title: string;
  readonly description?: string;
  readonly status: TodoStatus;
  readonly tags: readonly string[];
  readonly assignee?: string;
  readonly priority: TodoPriority;
  readonly severity: TodoSeverity;
  readonly dueDate?: string;
  readonly complianceFrameworks: readonly string[];
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly completedAt: string | null;
}
```

The core domain entity representing a TODO item.

**Fields:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | `string` | ✅ | Unique identifier (UUID v4) |
| `title` | `string` | ✅ | Task title/summary (max 500 chars) |
| `description` | `string` | ❌ | Detailed description (max 5000 chars) |
| `status` | `TodoStatus` | ✅ | Current lifecycle state |
| `tags` | `readonly string[]` | ✅ | Categorization tags (max 20 tags) |
| `assignee` | `string` | ❌ | Assigned person username/email |
| `priority` | `TodoPriority` | ✅ | Task importance level |
| `severity` | `TodoSeverity` | ✅ | Task impact level |
| `dueDate` | `string` | ❌ | Due date in ISO 8601 format |
| `complianceFrameworks` | `readonly string[]` | ✅ | Related compliance standards (max 10) |
| `createdAt` | `string` | ✅ | Creation timestamp (ISO 8601) |
| `updatedAt` | `string` | ✅ | Last update timestamp (ISO 8601) |
| `completedAt` | `string \| null` | ✅ | Completion timestamp or null |

**Immutability:**
All properties are `readonly` to prevent accidental mutation. Updates must go through the API layer.

**Automatic Timestamps:**
- `createdAt`: Set automatically on creation
- `updatedAt`: Updated automatically on every modification
- `completedAt`: Set automatically when status changes to 'done'

**Compliance Constants:**
```typescript
export const MAX_COMPLIANCE_FRAMEWORKS = 10;
export const MAX_COMPLIANCE_FRAMEWORK_LENGTH = 100;
```

---

### Sorting and Ordering

#### `TodoSortField`
```typescript
export type TodoSortField =
  | 'createdAt'
  | 'updatedAt'
  | 'completedAt'
  | 'title'
  | 'status'
  | 'priority'
  | 'severity'
  | 'dueDate';
```
Valid fields for sorting TODO items.

**Usage:** List queries, table sorting UI

---

#### `SortDirection`
```typescript
export type SortDirection = 'asc' | 'desc';
```
Sort order direction.

**Values:**
- **`asc`**: Ascending (A-Z, 0-9, oldest-newest)
- **`desc`**: Descending (Z-A, 9-0, newest-oldest)

---

#### `TodoSortOptions`
```typescript
export interface TodoSortOptions {
  readonly field: TodoSortField;
  readonly direction: SortDirection;
}
```
Complete sorting configuration for queries.

**Example:**
```typescript
const sortOptions: TodoSortOptions = {
  field: 'createdAt',
  direction: 'desc'
};
```

---

### Statistics Types

#### `TodoStats`
```typescript
export interface TodoStats {
  readonly total: number;
  readonly byStatus: Record<TodoStatus, number>;
  readonly topTags: readonly TagCount[];
  readonly completedOverTime: readonly TimeSeriesPoint[];
  readonly topAssignees: readonly AssigneeCount[];
  readonly unassignedCount: number;
}
```
Aggregated statistics for TODO items.

**Fields:**

| Field | Type | Description |
|-------|------|-------------|
| `total` | `number` | Total count of TODO items |
| `byStatus` | `Record<TodoStatus, number>` | Counts grouped by status |
| `topTags` | `TagCount[]` | Most frequently used tags |
| `completedOverTime` | `TimeSeriesPoint[]` | Completion trend data |
| `topAssignees` | `AssigneeCount[]` | Top assignees by task count |
| `unassignedCount` | `number` | Count of unassigned tasks |

**Related Types:**
```typescript
export interface TagCount {
  readonly tag: string;
  readonly count: number;
}

export interface TimeSeriesPoint {
  readonly date: string;      // ISO 8601
  readonly count: number;
}

export interface AssigneeCount {
  readonly assignee: string;
  readonly count: number;
}
```

---

#### `AnalyticsStats`
```typescript
export interface AnalyticsStats {
  readonly computedAt: string;
  readonly totalTasks: number;
  readonly complianceCoverage: readonly ComplianceCoverageStats[];
  readonly overdueTasks: OverdueTaskStats;
  readonly priorityDistribution: readonly DistributionStats[];
  readonly severityDistribution: readonly DistributionStats[];
  readonly prioritySeverityMatrix: readonly PrioritySeverityMatrixCell[];
}
```
Advanced analytics data for compliance and risk management.

**Fields:**

| Field | Type | Description |
|-------|------|-------------|
| `computedAt` | `string` | Timestamp when analytics were generated |
| `totalTasks` | `number` | Total tasks in analytics scope |
| `complianceCoverage` | `ComplianceCoverageStats[]` | Per-framework statistics |
| `overdueTasks` | `OverdueTaskStats` | Overdue task breakdown |
| `priorityDistribution` | `DistributionStats[]` | Tasks by priority level |
| `severityDistribution` | `DistributionStats[]` | Tasks by severity level |
| `prioritySeverityMatrix` | `PrioritySeverityMatrixCell[]` | Priority-severity heatmap data |

**Related Types:**
```typescript
export interface ComplianceCoverageStats {
  readonly framework: string;
  readonly total: number;
  readonly byStatus: Record<TodoStatus, number>;
  readonly completionRate: number;  // 0-100
}

export interface OverdueTaskStats {
  readonly total: number;
  readonly byPriority: Record<TodoPriority, number>;
  readonly bySeverity: Record<TodoSeverity, number>;
}

export interface DistributionStats {
  readonly label: string;
  readonly count: number;
  readonly percentage: number;  // 0-100
}

export interface PrioritySeverityMatrixCell {
  readonly priority: TodoPriority;
  readonly severity: TodoSeverity;
  readonly count: number;
  readonly percentage: number;  // 0-100
}
```

---

### Index Configuration

#### `TODO_INDEX_MAPPING`
```typescript
export const TODO_INDEX_MAPPING = {
  properties: {
    title: {
      type: 'text',
      fields: {
        keyword: { type: 'keyword', ignore_above: 256 }
      }
    },
    description: { type: 'text' },
    status: { type: 'keyword' },
    tags: { type: 'keyword' },
    assignee: { type: 'keyword' },
    priority: { type: 'keyword' },
    severity: { type: 'keyword' },
    due_date: { type: 'date', format: 'strict_date_optional_time' },
    compliance_framework: { type: 'keyword' },
    created_at: { type: 'date', format: 'strict_date_optional_time' },
    updated_at: { type: 'date', format: 'strict_date_optional_time' },
    completed_at: { type: 'date', format: 'strict_date_optional_time' }
  }
} as const;
```

OpenSearch index mapping defining field types and indexing behavior.

**Mapping Strategy:**
- **`text`**: Full-text search fields (title, description)
- **`keyword`**: Exact match, aggregations, filtering (status, tags, assignee, priority, severity)
- **`date`**: Temporal fields with ISO 8601 format

**Note:** Field names use `snake_case` in OpenSearch but are mapped to `camelCase` in TypeScript by the mapper layer.

---

#### `TODO_INDEX_SETTINGS`
```typescript
export const TODO_INDEX_SETTINGS = {
  number_of_shards: 1,
  number_of_replicas: 0
} as const;
```

Index configuration for development environment.

**Production Recommendations:**
- Increase `number_of_shards` based on data volume
- Set `number_of_replicas` ≥ 1 for high availability

---

## Data Transfer Objects (DTOs)

### Create Operations

#### `CreateTodoRequest`
```typescript
export interface CreateTodoRequest {
  title: string;
  description?: string;
  status?: TodoStatus;
  tags?: string[];
  assignee?: string;
  priority?: TodoPriority;
  severity?: TodoSeverity;
  dueDate?: string;
  complianceFrameworks?: string[];
}
```

Request payload for creating a new TODO item.

**Validation Rules:**

| Field | Required | Default | Constraints |
|-------|----------|---------|-------------|
| `title` | ✅ | - | 1-500 characters, non-empty |
| `description` | ❌ | - | Max 5000 characters |
| `status` | ❌ | `'planned'` | Valid TodoStatus value |
| `tags` | ❌ | `[]` | Max 20 items, each max 50 chars |
| `assignee` | ❌ | - | Max 100 characters |
| `priority` | ❌ | `'medium'` | Valid TodoPriority value |
| `severity` | ❌ | `'low'` | Valid TodoSeverity value |
| `dueDate` | ❌ | - | ISO 8601 date string |
| `complianceFrameworks` | ❌ | `[]` | Max 10 items, each max 100 chars |

**Example:**
```typescript
const request: CreateTodoRequest = {
  title: 'Implement audit logging for compliance',
  description: 'Add comprehensive audit trail for all data access',
  priority: 'high',
  severity: 'high',
  tags: ['security', 'compliance'],
  complianceFrameworks: ['PCI-DSS', 'SOC 2'],
  dueDate: '2024-03-31T23:59:59Z'
};
```

---

#### `CreateTodoResponse`
```typescript
export interface CreateTodoResponse {
  todo: Todo;
}
```

Response after successfully creating a TODO item.

**Fields:**
- `todo`: The newly created TODO with server-generated `id`, timestamps

---

### Update Operations

#### `UpdateTodoRequest`
```typescript
export interface UpdateTodoRequest {
  title?: string;
  description?: string;
  status?: TodoStatus;
  tags?: string[];
  assignee?: string;
  priority?: TodoPriority;
  severity?: TodoSeverity;
  dueDate?: string | null;
  complianceFrameworks?: string[];
}
```

Request payload for updating an existing TODO item (partial update).

**Behavior:**
- All fields are optional
- Only provided fields are updated
- Set `dueDate` to `null` to clear it
- Arrays (`tags`, `complianceFrameworks`) replace existing values entirely

**Automatic Updates:**
- `updatedAt` timestamp is set automatically
- `completedAt` is set when status changes to `'done'`
- `completedAt` is cleared when status changes away from `'done'`

**Validation Rules:**
Same constraints as `CreateTodoRequest` for each field.

**Example:**
```typescript
const update: UpdateTodoRequest = {
  status: 'done',
  // completedAt will be set automatically
};
```

---

#### `UpdateTodoResponse`
```typescript
export interface UpdateTodoResponse {
  todo: Todo;
}
```

Response after successfully updating a TODO item.

**Fields:**
- `todo`: The updated TODO with all current values

---

### Read Operations

#### `GetTodoResponse`
```typescript
export interface GetTodoResponse {
  todo: Todo;
}
```

Response for fetching a single TODO by ID.

**Errors:**
- `404 Not Found`: TODO with specified ID does not exist

---

#### `ListTodosQueryParams`
```typescript
export interface ListTodosQueryParams {
  page?: number;
  pageSize?: number;
  status?: TodoStatus | TodoStatus[];
  tags?: string[];
  searchText?: string;
  assignee?: string;
  priority?: TodoPriority | TodoPriority[];
  severity?: TodoSeverity | TodoSeverity[];
  complianceFrameworks?: string[];
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
```

Query parameters for listing and filtering TODO items.

**Pagination:**
- `page`: Page number (1-based, default: 1)
- `pageSize`: Items per page (default: 20, max: 100)

**Filtering:**
- `status`: Filter by one or more statuses
- `tags`: Filter by tags (AND logic - must have ALL specified tags)
- `searchText`: Full-text search across title and description (fuzzy matching)
- `assignee`: Filter by exact assignee match
- `priority`: Filter by one or more priorities
- `severity`: Filter by one or more severities
- `complianceFrameworks`: Filter by frameworks (OR logic)
- Date range filters (ISO 8601 format):
  - `dueDateAfter` / `dueDateBefore`
  - `createdAfter` / `createdBefore`
  - `updatedAfter` / `updatedBefore`
  - `completedAfter` / `completedBefore`
- `isOverdue`: Filter for overdue items (due date in past, not completed)

**Sorting:**
- `sortField`: Field to sort by (default: `'createdAt'`)
- `sortDirection`: Sort order (default: `'desc'`)

**Example:**
```typescript
const params: ListTodosQueryParams = {
  page: 1,
  pageSize: 50,
  status: ['planned', 'error'],
  priority: 'high',
  tags: ['security', 'compliance'],
  isOverdue: true,
  sortField: 'dueDate',
  sortDirection: 'asc'
};
```

---

#### `ListTodosResponse`
```typescript
export interface ListTodosResponse {
  todos: Todo[];
  pagination: PaginationMeta;
}
```

Response for listing TODO items with pagination.

**Fields:**

| Field | Type | Description |
|-------|------|-------------|
| `todos` | `Todo[]` | Array of TODO items for current page |
| `pagination` | `PaginationMeta` | Pagination metadata |

**`PaginationMeta`:**
```typescript
export interface PaginationMeta {
  page: number;              // Current page (1-based)
  pageSize: number;          // Items per page
  totalItems: number;        // Total matching items
  totalPages: number;        // Total pages available
  hasNextPage: boolean;      // Whether next page exists
  hasPreviousPage: boolean;  // Whether previous page exists
}
```

---

#### `SearchTodosRequest`
```typescript
export interface SearchTodosRequest {
  query?: string;
  filters?: {
    status?: TodoStatus[];
    tags?: string[];
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
```

Request payload for advanced search (POST body).

**Usage:** Complex searches with many parameters sent as POST body instead of query string.

---

#### `SearchTodosResponse`
```typescript
export type SearchTodosResponse = ListTodosResponse;
```

Alias for `ListTodosResponse` - same structure.

---

### Delete Operations

#### `DeleteTodoResponse`
```typescript
export interface DeleteTodoResponse {
  id: string;
  deleted: boolean;
}
```

Response after successfully deleting a TODO item.

**Fields:**
- `id`: ID of the deleted TODO
- `deleted`: Always `true` on success

**Errors:**
- `404 Not Found`: TODO with specified ID does not exist

---

### Statistics Operations

#### `TodoStatsQueryParams`
```typescript
export interface TodoStatsQueryParams {
  createdAfter?: string;
  createdBefore?: string;
  timeInterval?: 'hour' | 'day' | 'week' | 'month';
  topTagsLimit?: number;
}
```

Query parameters for fetching statistics.

**Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `createdAfter` | `string` | - | Only include items created after this date |
| `createdBefore` | `string` | - | Only include items created before this date |
| `timeInterval` | `string` | `'day'` | Granularity for time-series data |
| `topTagsLimit` | `number` | `10` | Max number of top tags to return |

---

#### `TodoStatsResponse`
```typescript
export interface TodoStatsResponse {
  stats: TodoStats;
}
```

Response containing aggregated statistics.

---

### Analytics Operations

#### `TodoAnalyticsQueryParams`
```typescript
export interface TodoAnalyticsQueryParams {
  complianceFramework?: string;
  overdueOnly?: boolean;
}
```

Query parameters for advanced analytics.

**Parameters:**
- `complianceFramework`: Filter analytics for specific framework
- `overdueOnly`: Only include overdue tasks in analytics

---

#### `TodoAnalyticsResponse`
```typescript
export interface TodoAnalyticsResponse {
  analytics: AnalyticsStats;
}
```

Response containing advanced analytics data.

---

### Autocomplete Operations

#### `TodoSuggestionsResponse`
```typescript
export interface TodoSuggestionsResponse {
  tags: string[];
  complianceFrameworks: string[];
}
```

Response providing autocomplete suggestions.

**Fields:**
- `tags`: List of unique tags from existing TODOs
- `complianceFrameworks`: List of unique compliance frameworks from existing TODOs

**Usage:** Autocomplete inputs, dropdown options

---

### Error Handling

#### `ApiErrorResponse`
```typescript
export interface ApiErrorResponse {
  statusCode: number;
  error: string;
  message: string;
  details?: Record<string, unknown>;
}
```

Standard error response structure for all API errors.

**Fields:**

| Field | Type | Description |
|-------|------|-------------|
| `statusCode` | `number` | HTTP status code (400, 404, 409, 500, etc.) |
| `error` | `string` | Error type (e.g., 'ValidationError', 'NotFoundError') |
| `message` | `string` | Human-readable error message |
| `details` | `object` | Optional additional error context |

**Common Error Codes:**
- `400 Bad Request`: Invalid input (validation failure)
- `404 Not Found`: Resource does not exist
- `409 Conflict`: Resource already exists or conflict
- `500 Internal Server Error`: Unexpected server error

**Example:**
```json
{
  "statusCode": 400,
  "error": "ValidationError",
  "message": "Title must be between 1 and 500 characters",
  "details": {
    "field": "title",
    "value": "",
    "constraint": "minLength"
  }
}
```

---

### API Endpoint Constants

#### `TODO_API_ENDPOINTS`
```typescript
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
```

Constant endpoint paths for type-safe API client usage.

**Usage:**
```typescript
import { TODOS_API_PATH, TODO_API_ENDPOINTS } from '@/common/todo/todo.dtos';

// GET /api/customPlugin/todos
const listUrl = `${TODOS_API_PATH}${TODO_API_ENDPOINTS.LIST}`;

// GET /api/customPlugin/todos/123e4567-e89b-12d3-a456-426614174000
const getUrl = `${TODOS_API_PATH}${TODO_API_ENDPOINTS.GET('123e4567-e89b-12d3-a456-426614174000')}`;
```

---

## Usage Examples

### Creating a TODO

**Request:**
```typescript
import { CreateTodoRequest } from '@/common/todo/todo.dtos';

const request: CreateTodoRequest = {
  title: 'Review security audit findings',
  description: 'Analyze Q1 2024 security audit results and create remediation plan',
  priority: 'critical',
  severity: 'high',
  status: 'planned',
  tags: ['security', 'audit', 'compliance'],
  assignee: 'john.doe@example.com',
  complianceFrameworks: ['SOC 2', 'ISO 27001'],
  dueDate: '2024-03-15T17:00:00Z'
};

// POST /api/customPlugin/todos
const response = await fetch('/api/customPlugin/todos', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(request)
});

const { todo }: CreateTodoResponse = await response.json();
console.log(`Created TODO: ${todo.id}`);
```

---

### Listing TODOs with Filters

**Request:**
```typescript
import { ListTodosQueryParams } from '@/common/todo/todo.dtos';

const params: ListTodosQueryParams = {
  page: 1,
  pageSize: 20,
  status: ['planned', 'error'],
  priority: ['high', 'critical'],
  tags: ['security'],
  isOverdue: true,
  sortField: 'priority',
  sortDirection: 'desc'
};

const queryString = new URLSearchParams(params as any).toString();
const response = await fetch(`/api/customPlugin/todos?${queryString}`);

const { todos, pagination }: ListTodosResponse = await response.json();
console.log(`Found ${pagination.totalItems} items across ${pagination.totalPages} pages`);
```

---

### Updating a TODO

**Request:**
```typescript
import { UpdateTodoRequest } from '@/common/todo/todo.dtos';

const todoId = '123e4567-e89b-12d3-a456-426614174000';
const update: UpdateTodoRequest = {
  status: 'done',
  // completedAt will be set automatically by the server
};

const response = await fetch(`/api/customPlugin/todos/${todoId}`, {
  method: 'PATCH',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(update)
});

const { todo }: UpdateTodoResponse = await response.json();
console.log(`Completed at: ${todo.completedAt}`);
```

---

### Fetching Statistics

**Request:**
```typescript
import { TodoStatsQueryParams } from '@/common/todo/todo.dtos';

const params: TodoStatsQueryParams = {
  createdAfter: '2024-01-01T00:00:00Z',
  timeInterval: 'week',
  topTagsLimit: 5
};

const queryString = new URLSearchParams(params as any).toString();
const response = await fetch(`/api/customPlugin/todos/_stats?${queryString}`);

const { stats }: TodoStatsResponse = await response.json();
console.log(`Total TODOs: ${stats.total}`);
console.log(`Completed: ${stats.byStatus.done}`);
console.log(`Top tags: ${stats.topTags.map(t => t.tag).join(', ')}`);
```

---

### Fetching Analytics

**Request:**
```typescript
import { TodoAnalyticsQueryParams } from '@/common/todo/todo.dtos';

const params: TodoAnalyticsQueryParams = {
  complianceFramework: 'PCI-DSS',
  overdueOnly: false
};

const queryString = new URLSearchParams(params as any).toString();
const response = await fetch(`/api/customPlugin/todos/_analytics?${queryString}`);

const { analytics }: TodoAnalyticsResponse = await response.json();

console.log(`Total tasks: ${analytics.totalTasks}`);
console.log(`Overdue tasks: ${analytics.overdueTasks.total}`);

analytics.complianceCoverage.forEach(framework => {
  console.log(`${framework.framework}: ${framework.completionRate}% complete`);
});
```

---

## Validation Rules

### Field Constraints

#### String Fields

| Field | Min Length | Max Length | Pattern |
|-------|------------|------------|---------|
| `title` | 1 | 500 | Non-empty |
| `description` | 0 | 5000 | - |
| `assignee` | 1 | 100 | Email or username |
| `tag` (individual) | 1 | 50 | Alphanumeric + `-_` |
| `complianceFramework` (individual) | 1 | 100 | - |

#### Array Fields

| Field | Min Items | Max Items | Item Constraint |
|-------|-----------|-----------|-----------------|
| `tags` | 0 | 20 | Max 50 chars each |
| `complianceFrameworks` | 0 | 10 | Max 100 chars each |

#### Numeric Fields

| Field | Min | Max | Default |
|-------|-----|-----|---------|
| `page` | 1 | ∞ | 1 |
| `pageSize` | 1 | 100 | 20 |
| `topTagsLimit` | 1 | 100 | 10 |

#### Date Fields

All date fields must be valid ISO 8601 strings:
- `dueDate`
- `createdAt`
- `updatedAt`
- `completedAt`
- All date range filters

**Valid formats:**
- `2024-01-15`
- `2024-01-15T14:30:00Z`
- `2024-01-15T14:30:00.000Z`
- `2024-01-15T14:30:00+00:00`

---

### Enum Validation

All enum fields must use valid enum values:

**TodoStatus:**
- `'planned'`, `'done'`, `'error'`

**TodoPriority:**
- `'low'`, `'medium'`, `'high'`, `'critical'`

**TodoSeverity:**
- `'info'`, `'low'`, `'medium'`, `'high'`, `'critical'`

**TodoSortField:**
- `'createdAt'`, `'updatedAt'`, `'completedAt'`, `'title'`, `'status'`, `'priority'`, `'severity'`, `'dueDate'`

**SortDirection:**
- `'asc'`, `'desc'`

**Time Interval:**
- `'hour'`, `'day'`, `'week'`, `'month'`

---

### Business Rules

1. **Status Transition:**
   - When status changes to `'done'`, `completedAt` is set to current timestamp
   - When status changes away from `'done'`, `completedAt` is set to `null`

2. **Timestamp Management:**
   - `createdAt` is set once on creation and never modified
   - `updatedAt` is updated on every modification
   - `completedAt` is managed by status transitions

3. **Tag Filtering:**
   - When filtering by multiple tags, items must have ALL specified tags (AND logic)

4. **Overdue Calculation:**
   - Item is overdue if `dueDate` is in the past AND status is not `'done'`

5. **Pagination:**
   - Page numbers are 1-based (first page is 1, not 0)
   - `pageSize` is capped at 100 to prevent performance issues
   - Empty results return `totalPages: 0` and `totalItems: 0`

---

## API Contract Versioning

The contracts in this document represent **version 1.0** of the Custom Plugin API.

**Versioning Strategy:**
- **Breaking changes** require a new major version (2.0, 3.0, etc.)
- **Backward-compatible additions** increment minor version (1.1, 1.2, etc.)
- **Bug fixes** increment patch version (1.0.1, 1.0.2, etc.)

**Breaking changes include:**
- Removing or renaming fields
- Changing field types
- Changing validation rules (making them stricter)
- Removing endpoints

**Non-breaking changes include:**
- Adding optional fields
- Adding new endpoints
- Adding new enum values
- Relaxing validation rules

---

## Generated Documentation

For interactive TypeDoc-generated documentation with full type references and source links, run:

```bash
# Inside the container at /home/node/kbn/plugins/custom_plugin
yarn docs:generate

# Open docs/generated/typedoc/index.html in a browser
```

This will generate comprehensive HTML documentation with:
- Full type hierarchies
- Source code references
- Cross-references between types
- Searchable index
- Inheritance diagrams

---

## Contract Testing

All contracts are validated in both unit tests and integration tests:

**Server-Side Tests:**
- `src/server/__tests__/todos.mapper.test.ts`: DTO ↔ Entity mapping
- `src/server/__tests__/todos.service.test.ts`: Business logic validation

**Client-Side Tests:**
- `src/public/features/todos/__tests__/`: Component integration with DTOs

**Running Contract Tests:**
```bash
# Inside container at /home/node/kbn/plugins/custom_plugin
yarn test

# Expected: All 169 tests pass
```

---

## Summary

This document provides complete documentation for all shared TypeScript contracts in the Custom Plugin. These contracts define the API boundary between frontend and backend, ensuring type safety and consistency across the entire application.

**Key Takeaways:**
- All contracts are **immutable** and **type-safe**
- Contracts are **shared** between client and server
- Extensive **validation rules** ensure data integrity
- **Comprehensive examples** demonstrate usage patterns
- **Versioning strategy** ensures backward compatibility

For questions or issues with these contracts, refer to:
- **Architecture Guide**: `/docs/architecture.md`
- **API Reference**: `/docs/api.md`
- **Features Documentation**: `/docs/features.md`
