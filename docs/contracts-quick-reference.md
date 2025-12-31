# API Contracts Quick Reference

Quick lookup guide for TypeScript contracts in the Custom Plugin.

> **Full Documentation:** See [contracts.md](./contracts.md) for complete documentation with examples.

---

## Core Constants

```typescript
// Plugin Identity
PLUGIN_ID = 'customPlugin'
PLUGIN_NAME = 'TO-DO Plugin'

// API Paths
API_BASE_PATH = '/api/customPlugin'
TODOS_API_PATH = '/api/customPlugin/todos'

// Pagination
DEFAULT_PAGE_SIZE = 20
MAX_PAGE_SIZE = 100

// Index
DEFAULT_INDEX_NAME = 'customplugin-todos'
DATE_FORMAT = 'strict_date_optional_time'
```

---

## Enums

### TodoStatus
```typescript
type TodoStatus = 'planned' | 'done' | 'error'
```

### TodoPriority
```typescript
type TodoPriority = 'low' | 'medium' | 'high' | 'critical'
```

### TodoSeverity
```typescript
type TodoSeverity = 'info' | 'low' | 'medium' | 'high' | 'critical'
```

### TodoSortField
```typescript
type TodoSortField =
  | 'createdAt' | 'updatedAt' | 'completedAt' | 'title'
  | 'status' | 'priority' | 'severity' | 'dueDate'
```

### SortDirection
```typescript
type SortDirection = 'asc' | 'desc'
```

---

## Core Entity

### Todo
```typescript
interface Todo {
  readonly id: string                              // UUID v4
  readonly title: string                           // 1-500 chars
  readonly description?: string                    // Max 5000 chars
  readonly status: TodoStatus
  readonly tags: readonly string[]                 // Max 20 items
  readonly assignee?: string                       // Max 100 chars
  readonly priority: TodoPriority
  readonly severity: TodoSeverity
  readonly dueDate?: string                        // ISO 8601
  readonly complianceFrameworks: readonly string[] // Max 10 items
  readonly createdAt: string                       // ISO 8601, auto
  readonly updatedAt: string                       // ISO 8601, auto
  readonly completedAt: string | null              // ISO 8601, auto
}
```

---

## Request DTOs

### CreateTodoRequest
```typescript
interface CreateTodoRequest {
  title: string                  // Required: 1-500 chars
  description?: string           // Optional: max 5000 chars
  status?: TodoStatus            // Default: 'planned'
  tags?: string[]                // Default: []
  assignee?: string              // Optional
  priority?: TodoPriority        // Default: 'medium'
  severity?: TodoSeverity        // Default: 'low'
  dueDate?: string               // ISO 8601
  complianceFrameworks?: string[] // Default: []
}
```

### UpdateTodoRequest
```typescript
interface UpdateTodoRequest {
  title?: string                 // Partial update
  description?: string
  status?: TodoStatus            // Auto-updates completedAt
  tags?: string[]                // Replaces array
  assignee?: string
  priority?: TodoPriority
  severity?: TodoSeverity
  dueDate?: string | null        // Set null to clear
  complianceFrameworks?: string[] // Replaces array
}
```

### ListTodosQueryParams
```typescript
interface ListTodosQueryParams {
  // Pagination
  page?: number                           // Default: 1
  pageSize?: number                       // Default: 20, max: 100

  // Filters
  status?: TodoStatus | TodoStatus[]
  tags?: string[]                         // AND logic
  searchText?: string                     // Full-text search
  assignee?: string
  priority?: TodoPriority | TodoPriority[]
  severity?: TodoSeverity | TodoSeverity[]
  complianceFrameworks?: string[]         // OR logic

  // Date Filters
  dueDateAfter?: string
  dueDateBefore?: string
  createdAfter?: string
  createdBefore?: string
  updatedAfter?: string
  updatedBefore?: string
  completedAfter?: string
  completedBefore?: string
  isOverdue?: boolean

  // Sorting
  sortField?: TodoSortField               // Default: 'createdAt'
  sortDirection?: SortDirection           // Default: 'desc'
}
```

---

## Response DTOs

### CreateTodoResponse
```typescript
interface CreateTodoResponse {
  todo: Todo  // With auto-generated id, timestamps
}
```

### UpdateTodoResponse
```typescript
interface UpdateTodoResponse {
  todo: Todo  // Updated with new values
}
```

### GetTodoResponse
```typescript
interface GetTodoResponse {
  todo: Todo
}
```

### DeleteTodoResponse
```typescript
interface DeleteTodoResponse {
  id: string
  deleted: boolean  // Always true on success
}
```

### ListTodosResponse
```typescript
interface ListTodosResponse {
  todos: Todo[]
  pagination: PaginationMeta
}

interface PaginationMeta {
  page: number
  pageSize: number
  totalItems: number
  totalPages: number
  hasNextPage: boolean
  hasPreviousPage: boolean
}
```

---

## Statistics DTOs

### TodoStats
```typescript
interface TodoStats {
  total: number
  byStatus: Record<TodoStatus, number>
  topTags: TagCount[]
  completedOverTime: TimeSeriesPoint[]
  topAssignees: AssigneeCount[]
  unassignedCount: number
}

interface TagCount {
  tag: string
  count: number
}

interface TimeSeriesPoint {
  date: string       // ISO 8601
  count: number
}

interface AssigneeCount {
  assignee: string
  count: number
}
```

### TodoStatsQueryParams
```typescript
interface TodoStatsQueryParams {
  createdAfter?: string                            // ISO 8601
  createdBefore?: string                           // ISO 8601
  timeInterval?: 'hour' | 'day' | 'week' | 'month' // Default: 'day'
  topTagsLimit?: number                            // Default: 10
}
```

### TodoStatsResponse
```typescript
interface TodoStatsResponse {
  stats: TodoStats
}
```

---

## Analytics DTOs

### AnalyticsStats
```typescript
interface AnalyticsStats {
  computedAt: string                                // ISO 8601
  totalTasks: number
  complianceCoverage: ComplianceCoverageStats[]
  overdueTasks: OverdueTaskStats
  priorityDistribution: DistributionStats[]
  severityDistribution: DistributionStats[]
  prioritySeverityMatrix: PrioritySeverityMatrixCell[]
}

interface ComplianceCoverageStats {
  framework: string
  total: number
  byStatus: Record<TodoStatus, number>
  completionRate: number  // 0-100
}

interface OverdueTaskStats {
  total: number
  byPriority: Record<TodoPriority, number>
  bySeverity: Record<TodoSeverity, number>
}

interface DistributionStats {
  label: string
  count: number
  percentage: number  // 0-100
}

interface PrioritySeverityMatrixCell {
  priority: TodoPriority
  severity: TodoSeverity
  count: number
  percentage: number  // 0-100
}
```

### TodoAnalyticsQueryParams
```typescript
interface TodoAnalyticsQueryParams {
  complianceFramework?: string
  overdueOnly?: boolean
}
```

### TodoAnalyticsResponse
```typescript
interface TodoAnalyticsResponse {
  analytics: AnalyticsStats
}
```

---

## Error Response

### ApiErrorResponse
```typescript
interface ApiErrorResponse {
  statusCode: number                      // 400, 404, 409, 500, etc.
  error: string                           // Error type
  message: string                         // Human-readable message
  details?: Record<string, unknown>       // Optional context
}
```

**Common Status Codes:**
- `400` - Validation error (invalid input)
- `404` - Not found (resource doesn't exist)
- `409` - Conflict (duplicate, state conflict)
- `500` - Internal server error

---

## API Endpoints

```typescript
const TODO_API_ENDPOINTS = {
  LIST: '/todos',                           // GET
  CREATE: '/todos',                         // POST
  GET: (id: string) => `/todos/${id}`,      // GET
  UPDATE: (id: string) => `/todos/${id}`,   // PATCH
  DELETE: (id: string) => `/todos/${id}`,   // DELETE
  SEARCH: '/todos/_search',                 // POST
  STATS: '/todos/_stats',                   // GET
  ANALYTICS: '/todos/_analytics',           // GET
}
```

**Full paths:**
```
GET    /api/customPlugin/todos
POST   /api/customPlugin/todos
GET    /api/customPlugin/todos/:id
PATCH  /api/customPlugin/todos/:id
DELETE /api/customPlugin/todos/:id
POST   /api/customPlugin/todos/_search
GET    /api/customPlugin/todos/_stats
GET    /api/customPlugin/todos/_analytics
```

---

## Validation Rules

### String Constraints
| Field | Min | Max | Pattern |
|-------|-----|-----|---------|
| `title` | 1 | 500 | Non-empty |
| `description` | 0 | 5000 | - |
| `assignee` | 1 | 100 | Email/username |
| `tag` (each) | 1 | 50 | Alphanumeric + `-_` |
| `complianceFramework` (each) | 1 | 100 | - |

### Array Constraints
| Field | Min Items | Max Items |
|-------|-----------|-----------|
| `tags` | 0 | 20 |
| `complianceFrameworks` | 0 | 10 |

### Numeric Constraints
| Field | Min | Max | Default |
|-------|-----|-----|---------|
| `page` | 1 | ∞ | 1 |
| `pageSize` | 1 | 100 | 20 |
| `topTagsLimit` | 1 | 100 | 10 |

### Date Format
All dates must be ISO 8601:
- `2024-01-15`
- `2024-01-15T14:30:00Z`
- `2024-01-15T14:30:00.000Z`

---

## Business Rules

1. **Status → completedAt:**
   - Status changes to `'done'` → `completedAt` = current time
   - Status changes from `'done'` → `completedAt` = null

2. **Timestamps:**
   - `createdAt` set once, never modified
   - `updatedAt` updated on every change
   - `completedAt` managed by status transitions

3. **Tag Filtering:**
   - Multiple tags = AND logic (must have ALL)

4. **Overdue Calculation:**
   - `dueDate` < now AND status != 'done'

5. **Pagination:**
   - 1-based page numbers
   - Max pageSize enforced at 100

---

## Quick Examples

### Create TODO
```typescript
const request: CreateTodoRequest = {
  title: 'Security audit review',
  priority: 'high',
  severity: 'high',
  tags: ['security', 'compliance'],
  complianceFrameworks: ['SOC 2']
}
```

### Update TODO
```typescript
const update: UpdateTodoRequest = {
  status: 'done'  // Auto-sets completedAt
}
```

### List with Filters
```typescript
const params: ListTodosQueryParams = {
  status: ['planned', 'error'],
  priority: 'high',
  isOverdue: true,
  sortField: 'dueDate',
  sortDirection: 'asc'
}
```

### Get Statistics
```typescript
const params: TodoStatsQueryParams = {
  timeInterval: 'week',
  topTagsLimit: 5
}
```

---

## Type Imports

```typescript
// Constants
import {
  PLUGIN_ID,
  API_BASE_PATH,
  TODOS_API_PATH,
  DEFAULT_PAGE_SIZE,
  MAX_PAGE_SIZE
} from '@/common/constants';

// Domain Types
import {
  Todo,
  TodoStatus,
  TodoPriority,
  TodoSeverity,
  TodoStats,
  AnalyticsStats,
  TodoSortField,
  SortDirection
} from '@/common/todo/todo.types';

// DTOs
import {
  CreateTodoRequest,
  CreateTodoResponse,
  UpdateTodoRequest,
  UpdateTodoResponse,
  ListTodosQueryParams,
  ListTodosResponse,
  TodoStatsQueryParams,
  TodoStatsResponse,
  ApiErrorResponse,
  TODO_API_ENDPOINTS
} from '@/common/todo/todo.dtos';
```

---

**Full Documentation:** [contracts.md](./contracts.md)

**Interactive Docs:** Generate with `yarn docs:generate` (see [generated/README.md](./generated/README.md))

**Last Updated:** 2025-01-01
