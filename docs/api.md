# TODO Plugin REST API Reference

## Overview

This document provides comprehensive documentation for the TODO Plugin REST API endpoints. The API follows RESTful principles and provides complete CRUD operations, advanced filtering, search capabilities, and analytics for TODO items.

## Base URL

All API endpoints are prefixed with:

```
http://localhost:5601/api/customPlugin/todos
```

## Authentication

All endpoints require OpenSearch Dashboards session authentication. Users must be authenticated before accessing these endpoints.

## Common Response Formats

### Success Response

All successful responses return a `200 OK` status code with a JSON body containing the requested data.

### Error Response

All error responses follow a consistent structure:

```json
{
  "statusCode": 400,
  "error": "VALIDATION_ERROR",
  "message": "Human-readable error message",
  "details": {
    "field": "fieldName",
    "additionalInfo": "value"
  }
}
```

## Error Codes

| HTTP Status | Error Code | Description |
|-------------|-----------|-------------|
| 400 | `VALIDATION_ERROR` | Request validation failed |
| 404 | `NOT_FOUND` | Requested resource not found |
| 409 | `CONFLICT` | Resource conflict occurred |
| 422 | `BUSINESS_RULE_VIOLATION` | Business rule violated |
| 500 | `INDEX_ERROR` | OpenSearch index operation failed |
| 500 | `INTERNAL_ERROR` | Unexpected server error |
| 500 | `OPENSEARCH_ERROR` | OpenSearch-specific error |

---

## Endpoints

### 1. List TODO Items

Retrieves a paginated list of TODO items with optional filtering, searching, and sorting.

**Endpoint:** `GET /api/customPlugin/todos`

**Query Parameters:**

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `page` | number | No | 1 | Page number (1-based, min: 1) |
| `pageSize` | number | No | 20 | Items per page (min: 1, max: 100) |
| `status` | string | No | - | Filter by status (comma-separated for multiple: `planned,in_progress,done,error`) |
| `tags` | string | No | - | Filter by tags - items must have ALL specified tags (comma-separated) |
| `searchText` | string | No | - | Full-text search across title and description (fuzzy matching) |
| `assignee` | string | No | - | Filter by assignee username |
| `priority` | string | No | - | Filter by priority (comma-separated: `low,medium,high,critical`) |
| `severity` | string | No | - | Filter by severity (comma-separated: `info,low,medium,high,critical`) |
| `complianceFrameworks` | string | No | - | Filter by compliance frameworks (comma-separated) |
| `dueDateAfter` | string | No | - | Filter items due after this date (ISO 8601 format) |
| `dueDateBefore` | string | No | - | Filter items due before this date (ISO 8601 format) |
| `createdAfter` | string | No | - | Filter items created after this date (ISO 8601 format) |
| `createdBefore` | string | No | - | Filter items created before this date (ISO 8601 format) |
| `updatedAfter` | string | No | - | Filter items updated after this date (ISO 8601 format) |
| `updatedBefore` | string | No | - | Filter items updated before this date (ISO 8601 format) |
| `completedAfter` | string | No | - | Filter items completed after this date (ISO 8601 format) |
| `completedBefore` | string | No | - | Filter items completed before this date (ISO 8601 format) |
| `isOverdue` | string | No | - | Filter overdue items (`true` or `false`) |
| `sortField` | string | No | `createdAt` | Sort field: `createdAt`, `updatedAt`, `completedAt`, `title`, `status`, `priority`, `severity`, `dueDate` |
| `sortDirection` | string | No | `desc` | Sort direction: `asc` or `desc` |

**Request Example:**

```http
GET /api/customPlugin/todos?page=1&pageSize=20&status=planned,error&priority=high,critical&sortField=priority&sortDirection=desc
```

**Response (200 OK):**

```json
{
  "todos": [
    {
      "id": "todo-001",
      "title": "Fix critical security vulnerability in authentication module",
      "description": "CVE-2024-12345 requires immediate patching of the OAuth2 implementation",
      "status": "planned",
      "tags": ["security", "authentication", "urgent"],
      "assignee": "john.doe",
      "priority": "critical",
      "severity": "critical",
      "dueDate": "2025-01-15T23:59:59.000Z",
      "complianceFrameworks": ["PCI-DSS", "SOC2"],
      "createdAt": "2024-12-20T10:30:00.000Z",
      "updatedAt": "2024-12-30T14:22:00.000Z",
      "completedAt": null
    },
    {
      "id": "todo-002",
      "title": "Review and update access control policies",
      "description": "Quarterly review of user permissions and role assignments",
      "status": "error",
      "tags": ["compliance", "access-control"],
      "assignee": "jane.smith",
      "priority": "high",
      "severity": "medium",
      "dueDate": "2025-01-10T17:00:00.000Z",
      "complianceFrameworks": ["HIPAA", "GDPR"],
      "createdAt": "2024-12-15T09:00:00.000Z",
      "updatedAt": "2024-12-28T11:15:00.000Z",
      "completedAt": null
    }
  ],
  "pagination": {
    "page": 1,
    "pageSize": 20,
    "totalItems": 42,
    "totalPages": 3,
    "hasNextPage": true,
    "hasPreviousPage": false
  }
}
```

**Validation Rules:**

- `page`: Must be >= 1
- `pageSize`: Must be between 1 and 100
- `status`: Must be one of: `planned`, `in_progress`, `done`, `error`
- `priority`: Must be one of: `low`, `medium`, `high`, `critical`
- `severity`: Must be one of: `info`, `low`, `medium`, `high`, `critical`
- `sortField`: Must be a valid sort field
- `sortDirection`: Must be `asc` or `desc`
- Date fields: Must be valid ISO 8601 format

**Error Responses:**

```json
// 400 Bad Request - Invalid query parameter
{
  "statusCode": 400,
  "error": "VALIDATION_ERROR",
  "message": "Invalid status: invalid_status",
  "details": {
    "field": "status",
    "validValues": ["planned", "in_progress", "done", "error"]
  }
}
```

```json
// 500 Internal Server Error - OpenSearch error
{
  "statusCode": 500,
  "error": "OPENSEARCH_ERROR",
  "message": "OpenSearch error: search_phase_execution_exception"
}
```

---

### 2. Get TODO by ID

Retrieves a single TODO item by its unique identifier.

**Endpoint:** `GET /api/customPlugin/todos/{id}`

**Path Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string | Yes | Unique identifier of the TODO item (min length: 1) |

**Request Example:**

```http
GET /api/customPlugin/todos/todo-001
```

**Response (200 OK):**

```json
{
  "todo": {
    "id": "todo-001",
    "title": "Fix critical security vulnerability in authentication module",
    "description": "CVE-2024-12345 requires immediate patching of the OAuth2 implementation",
    "status": "planned",
    "tags": ["security", "authentication", "urgent"],
    "assignee": "john.doe",
    "priority": "critical",
    "severity": "critical",
    "dueDate": "2025-01-15T23:59:59.000Z",
    "complianceFrameworks": ["PCI-DSS", "SOC2"],
    "createdAt": "2024-12-20T10:30:00.000Z",
    "updatedAt": "2024-12-30T14:22:00.000Z",
    "completedAt": null
  }
}
```

**Validation Rules:**

- `id`: Must not be empty or whitespace-only

**Error Responses:**

```json
// 400 Bad Request - Invalid ID
{
  "statusCode": 400,
  "error": "VALIDATION_ERROR",
  "message": "ID is required",
  "details": {
    "field": "id"
  }
}
```

```json
// 404 Not Found - TODO does not exist
{
  "statusCode": 404,
  "error": "NOT_FOUND",
  "message": "TODO with id 'invalid-id' not found"
}
```

---

### 3. Create TODO Item

Creates a new TODO item with the specified properties.

**Endpoint:** `POST /api/customPlugin/todos`

**Request Body:**

| Field | Type | Required | Constraints | Description |
|-------|------|----------|-------------|-------------|
| `title` | string | Yes | Min: 1, Max: 256 characters | Title of the TODO item |
| `description` | string | No | Max: 4000 characters | Detailed description |
| `status` | string | No | `planned`, `in_progress`, `done`, `error` | Initial status (defaults to `planned`) |
| `tags` | string[] | No | Max 20 tags, each max 50 characters | Tags for categorization |
| `assignee` | string | No | Max: 100 characters | Username of assigned person |
| `priority` | string | No | `low`, `medium`, `high`, `critical` | Priority level (defaults to `medium`) |
| `severity` | string | No | `info`, `low`, `medium`, `high`, `critical` | Severity level (defaults to `low`) |
| `dueDate` | string | No | ISO 8601 format | Due date for the task |
| `complianceFrameworks` | string[] | No | Max 10 frameworks, each max 100 characters | Related compliance frameworks |

**Request Example:**

```http
POST /api/customPlugin/todos
Content-Type: application/json

{
  "title": "Implement multi-factor authentication for admin panel",
  "description": "Add MFA requirement for all administrator accounts to meet SOC2 compliance requirements",
  "status": "planned",
  "tags": ["security", "authentication", "compliance"],
  "assignee": "security-team",
  "priority": "high",
  "severity": "high",
  "dueDate": "2025-02-28T23:59:59.000Z",
  "complianceFrameworks": ["SOC2", "ISO27001"]
}
```

**Response (200 OK):**

```json
{
  "todo": {
    "id": "todo-123",
    "title": "Implement multi-factor authentication for admin panel",
    "description": "Add MFA requirement for all administrator accounts to meet SOC2 compliance requirements",
    "status": "planned",
    "tags": ["security", "authentication", "compliance"],
    "assignee": "security-team",
    "priority": "high",
    "severity": "high",
    "dueDate": "2025-02-28T23:59:59.000Z",
    "complianceFrameworks": ["SOC2", "ISO27001"],
    "createdAt": "2025-01-02T10:15:30.000Z",
    "updatedAt": "2025-01-02T10:15:30.000Z",
    "completedAt": null
  }
}
```

**Validation Rules:**

- **title**: Required, non-empty after trimming, max 256 characters
- **description**: Optional, max 4000 characters
- **status**: Must be one of: `planned`, `done`, `error`
- **tags**: Max 20 tags, each tag max 50 characters
- **assignee**: Optional, max 100 characters
- **priority**: Must be one of: `low`, `medium`, `high`, `critical`
- **severity**: Must be one of: `info`, `low`, `medium`, `high`, `critical`
- **dueDate**: Must be valid ISO 8601 format (e.g., `2025-12-31T23:59:59.000Z`)
- **complianceFrameworks**: Max 10 frameworks, each max 100 characters

**Server-Generated Fields:**

- `id`: Automatically generated unique identifier
- `createdAt`: Automatically set to current timestamp
- `updatedAt`: Automatically set to current timestamp
- `completedAt`: Set to `null` on creation

**Error Responses:**

```json
// 400 Bad Request - Title validation failed
{
  "statusCode": 400,
  "error": "VALIDATION_ERROR",
  "message": "Title is required",
  "details": {
    "field": "title"
  }
}
```

```json
// 400 Bad Request - Title too long
{
  "statusCode": 400,
  "error": "VALIDATION_ERROR",
  "message": "Title must not exceed 256 characters",
  "details": {
    "field": "title",
    "maxLength": 256,
    "actualLength": 300
  }
}
```

```json
// 400 Bad Request - Too many tags
{
  "statusCode": 400,
  "error": "VALIDATION_ERROR",
  "message": "Maximum 20 tags allowed",
  "details": {
    "field": "tags",
    "maxTags": 20,
    "actualTags": 25
  }
}
```

```json
// 400 Bad Request - Invalid date format
{
  "statusCode": 400,
  "error": "VALIDATION_ERROR",
  "message": "Invalid dueDate format. Use ISO 8601 format (e.g., 2025-12-31T23:59:59Z)",
  "details": {
    "field": "dueDate",
    "format": "ISO 8601"
  }
}
```

---

### 4. Update TODO Item

Updates an existing TODO item with partial updates. Only provided fields will be modified.

**Endpoint:** `PATCH /api/customPlugin/todos/{id}`

**Path Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string | Yes | Unique identifier of the TODO item to update |

**Request Body:**

All fields are optional. At least one field must be provided.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `title` | string | Min: 1, Max: 256 characters | Updated title |
| `description` | string | Max: 4000 characters | Updated description |
| `status` | string | `planned`, `in_progress`, `done`, `error` | Updated status |
| `tags` | string[] | Max 20 tags, each max 50 characters | Updated tags (replaces existing) |
| `assignee` | string | Max: 100 characters | Updated assignee |
| `priority` | string | `low`, `medium`, `high`, `critical` | Updated priority |
| `severity` | string | `info`, `low`, `medium`, `high`, `critical` | Updated severity |
| `dueDate` | string \| null | ISO 8601 format or `null` to clear | Updated due date (set to `null` to remove) |
| `complianceFrameworks` | string[] | Max 10 frameworks, each max 100 characters | Updated frameworks (replaces existing) |

**Request Example:**

```http
PATCH /api/customPlugin/todos/todo-001
Content-Type: application/json

{
  "status": "done",
  "description": "CVE-2024-12345 has been patched. OAuth2 implementation updated to version 2.1.5"
}
```

**Response (200 OK):**

```json
{
  "todo": {
    "id": "todo-001",
    "title": "Fix critical security vulnerability in authentication module",
    "description": "CVE-2024-12345 has been patched. OAuth2 implementation updated to version 2.1.5",
    "status": "done",
    "tags": ["security", "authentication", "urgent"],
    "assignee": "john.doe",
    "priority": "critical",
    "severity": "critical",
    "dueDate": "2025-01-15T23:59:59.000Z",
    "complianceFrameworks": ["PCI-DSS", "SOC2"],
    "createdAt": "2024-12-20T10:30:00.000Z",
    "updatedAt": "2025-01-02T15:45:22.000Z",
    "completedAt": "2025-01-02T15:45:22.000Z"
  }
}
```

**Automatic Timestamp Management:**

- `updatedAt`: Always updated to current timestamp
- `completedAt`:
  - Set to current timestamp when `status` changes to `done`
  - Set to `null` when `status` changes from `done` to another status
  - Remains unchanged if `status` is not modified

**Request Example - Clearing Due Date:**

```http
PATCH /api/customPlugin/todos/todo-001
Content-Type: application/json

{
  "dueDate": null
}
```

**Validation Rules:**

- **At least one field** must be provided for update
- **title**: If provided, cannot be empty, max 256 characters
- **description**: Max 4000 characters
- **status**: Must be one of: `planned`, `done`, `error`
- **tags**: Max 20 tags, each tag max 50 characters
- **assignee**: Max 100 characters
- **priority**: Must be one of: `low`, `medium`, `high`, `critical`
- **severity**: Must be one of: `info`, `low`, `medium`, `high`, `critical`
- **dueDate**: Must be valid ISO 8601 format or `null`
- **complianceFrameworks**: Max 10 frameworks, each max 100 characters

**Error Responses:**

```json
// 400 Bad Request - No fields provided
{
  "statusCode": 400,
  "error": "VALIDATION_ERROR",
  "message": "At least one field must be provided for update"
}
```

```json
// 400 Bad Request - Empty title
{
  "statusCode": 400,
  "error": "VALIDATION_ERROR",
  "message": "Title cannot be empty",
  "details": {
    "field": "title"
  }
}
```

```json
// 404 Not Found - TODO does not exist
{
  "statusCode": 404,
  "error": "NOT_FOUND",
  "message": "TODO with id 'invalid-id' not found"
}
```

---

### 5. Delete TODO Item

Permanently deletes a TODO item.

**Endpoint:** `DELETE /api/customPlugin/todos/{id}`

**Path Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string | Yes | Unique identifier of the TODO item to delete |

**Request Example:**

```http
DELETE /api/customPlugin/todos/todo-001
```

**Response (200 OK):**

```json
{
  "id": "todo-001",
  "deleted": true
}
```

**Validation Rules:**

- `id`: Must not be empty or whitespace-only

**Error Responses:**

```json
// 400 Bad Request - Invalid ID
{
  "statusCode": 400,
  "error": "VALIDATION_ERROR",
  "message": "ID is required",
  "details": {
    "field": "id"
  }
}
```

```json
// 404 Not Found - TODO does not exist
{
  "statusCode": 404,
  "error": "NOT_FOUND",
  "message": "TODO with id 'invalid-id' not found"
}
```

---

### 6. Get TODO Statistics

Retrieves aggregated statistics for TODO items including status distribution, top tags, completion trends, and assignee distribution.

**Endpoint:** `GET /api/customPlugin/todos/_stats`

**Query Parameters:**

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `createdAfter` | string | No | - | Only include TODOs created after this date (ISO 8601) |
| `createdBefore` | string | No | - | Only include TODOs created before this date (ISO 8601) |
| `timeInterval` | string | No | `day` | Time interval for completion trend: `hour`, `day`, `week`, `month` |
| `topTagsLimit` | number | No | 10 | Maximum number of top tags to return (min: 1, max: 100) |

**Request Example:**

```http
GET /api/customPlugin/todos/_stats?createdAfter=2024-01-01T00:00:00.000Z&timeInterval=week&topTagsLimit=5
```

**Response (200 OK):**

```json
{
  "stats": {
    "total": 127,
    "byStatus": {
      "planned": 45,
      "done": 68,
      "error": 14
    },
    "topTags": [
      {
        "tag": "security",
        "count": 42
      },
      {
        "tag": "compliance",
        "count": 35
      },
      {
        "tag": "authentication",
        "count": 28
      },
      {
        "tag": "infrastructure",
        "count": 22
      },
      {
        "tag": "monitoring",
        "count": 18
      }
    ],
    "completedOverTime": [
      {
        "date": "2024-12-01T00:00:00.000Z",
        "count": 5
      },
      {
        "date": "2024-12-08T00:00:00.000Z",
        "count": 8
      },
      {
        "date": "2024-12-15T00:00:00.000Z",
        "count": 12
      },
      {
        "date": "2024-12-22T00:00:00.000Z",
        "count": 10
      },
      {
        "date": "2024-12-29T00:00:00.000Z",
        "count": 7
      }
    ],
    "topAssignees": [
      {
        "assignee": "john.doe",
        "count": 23
      },
      {
        "assignee": "jane.smith",
        "count": 19
      },
      {
        "assignee": "security-team",
        "count": 15
      },
      {
        "assignee": "compliance-team",
        "count": 12
      },
      {
        "assignee": "devops-team",
        "count": 8
      }
    ],
    "unassignedCount": 12
  }
}
```

**Response Schema:**

```typescript
{
  stats: {
    total: number;                          // Total number of TODOs
    byStatus: {
      planned: number;                      // Count of planned TODOs
      done: number;                         // Count of completed TODOs
      error: number;                        // Count of error TODOs
    };
    topTags: Array<{
      tag: string;                          // Tag name
      count: number;                        // Number of TODOs with this tag
    }>;
    completedOverTime: Array<{
      date: string;                         // ISO 8601 date string
      count: number;                        // Number of TODOs completed in this time period
    }>;
    topAssignees: Array<{
      assignee: string;                     // Assignee username
      count: number;                        // Number of TODOs assigned to this person
    }>;
    unassignedCount: number;                // Number of TODOs without an assignee
  }
}
```

**Validation Rules:**

- `createdAfter`: Must be valid ISO 8601 format
- `createdBefore`: Must be valid ISO 8601 format
- `createdAfter` must be before `createdBefore` if both are provided
- `timeInterval`: Must be one of: `hour`, `day`, `week`, `month`
- `topTagsLimit`: Must be between 1 and 100

**Error Responses:**

```json
// 400 Bad Request - Invalid date format
{
  "statusCode": 400,
  "error": "VALIDATION_ERROR",
  "message": "Invalid createdAfter date format. Use ISO 8601 format.",
  "details": {
    "field": "createdAfter",
    "value": "invalid-date"
  }
}
```

```json
// 400 Bad Request - Date range error
{
  "statusCode": 400,
  "error": "VALIDATION_ERROR",
  "message": "createdAfter must be before createdBefore",
  "details": {
    "createdAfter": "2025-01-01T00:00:00.000Z",
    "createdBefore": "2024-01-01T00:00:00.000Z"
  }
}
```

```json
// 400 Bad Request - Invalid time interval
{
  "statusCode": 400,
  "error": "VALIDATION_ERROR",
  "message": "Invalid timeInterval: invalid_interval",
  "details": {
    "field": "timeInterval",
    "validValues": ["hour", "day", "week", "month"]
  }
}
```

```json
// 400 Bad Request - Invalid topTagsLimit
{
  "statusCode": 400,
  "error": "VALIDATION_ERROR",
  "message": "topTagsLimit must be between 1 and 100",
  "details": {
    "field": "topTagsLimit",
    "min": 1,
    "max": 100,
    "value": 150
  }
}
```

---

### 7. Get Advanced Analytics

Retrieves comprehensive analytics data for compliance and risk assessment, including compliance coverage, overdue tasks, priority/severity distributions, and priority-severity matrix.

**Endpoint:** `GET /api/customPlugin/todos/_analytics`

**Query Parameters:**

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `complianceFramework` | string | No | - | Filter analytics for a specific compliance framework (max 100 characters) |
| `overdueOnly` | string | No | `false` | Only include overdue tasks (`true` or `false`) |

**Request Example:**

```http
GET /api/customPlugin/todos/_analytics?complianceFramework=PCI-DSS&overdueOnly=false
```

**Response (200 OK):**

```json
{
  "analytics": {
    "computedAt": "2025-01-02T16:30:00.000Z",
    "totalTasks": 127,
    "complianceCoverage": [
      {
        "framework": "PCI-DSS",
        "total": 38,
        "byStatus": {
          "planned": 12,
          "done": 22,
          "error": 4
        },
        "completionRate": 57.89
      },
      {
        "framework": "SOC2",
        "total": 42,
        "byStatus": {
          "planned": 15,
          "done": 25,
          "error": 2
        },
        "completionRate": 59.52
      },
      {
        "framework": "HIPAA",
        "total": 28,
        "byStatus": {
          "planned": 8,
          "done": 18,
          "error": 2
        },
        "completionRate": 64.29
      },
      {
        "framework": "GDPR",
        "total": 19,
        "byStatus": {
          "planned": 5,
          "done": 12,
          "error": 2
        },
        "completionRate": 63.16
      }
    ],
    "overdueTasks": {
      "total": 23,
      "byPriority": {
        "low": 2,
        "medium": 7,
        "high": 10,
        "critical": 4
      },
      "bySeverity": {
        "info": 1,
        "low": 3,
        "medium": 8,
        "high": 7,
        "critical": 4
      }
    },
    "priorityDistribution": [
      {
        "label": "low",
        "count": 18,
        "percentage": 14.17
      },
      {
        "label": "medium",
        "count": 45,
        "percentage": 35.43
      },
      {
        "label": "high",
        "count": 42,
        "percentage": 33.07
      },
      {
        "label": "critical",
        "count": 22,
        "percentage": 17.32
      }
    ],
    "severityDistribution": [
      {
        "label": "info",
        "count": 12,
        "percentage": 9.45
      },
      {
        "label": "low",
        "count": 28,
        "percentage": 22.05
      },
      {
        "label": "medium",
        "count": 38,
        "percentage": 29.92
      },
      {
        "label": "high",
        "count": 32,
        "percentage": 25.20
      },
      {
        "label": "critical",
        "count": 17,
        "percentage": 13.39
      }
    ],
    "prioritySeverityMatrix": [
      {
        "priority": "critical",
        "severity": "critical",
        "count": 8,
        "percentage": 6.30
      },
      {
        "priority": "critical",
        "severity": "high",
        "count": 7,
        "percentage": 5.51
      },
      {
        "priority": "high",
        "severity": "critical",
        "count": 5,
        "percentage": 3.94
      },
      {
        "priority": "high",
        "severity": "high",
        "count": 12,
        "percentage": 9.45
      },
      {
        "priority": "high",
        "severity": "medium",
        "count": 15,
        "percentage": 11.81
      },
      {
        "priority": "medium",
        "severity": "medium",
        "count": 18,
        "percentage": 14.17
      }
    ]
  }
}
```

**Response Schema:**

```typescript
{
  analytics: {
    computedAt: string;                     // ISO 8601 timestamp when analytics were computed
    totalTasks: number;                     // Total number of tasks in analytics
    complianceCoverage: Array<{
      framework: string;                    // Compliance framework name (e.g., PCI-DSS)
      total: number;                        // Total TODOs related to this framework
      byStatus: {
        planned: number;                    // Planned TODOs for this framework
        done: number;                       // Completed TODOs for this framework
        error: number;                      // Error TODOs for this framework
      };
      completionRate: number;               // Percentage of completed TODOs (0-100)
    }>;
    overdueTasks: {
      total: number;                        // Total number of overdue tasks
      byPriority: {
        low: number;                        // Overdue tasks with low priority
        medium: number;                     // Overdue tasks with medium priority
        high: number;                       // Overdue tasks with high priority
        critical: number;                   // Overdue tasks with critical priority
      };
      bySeverity: {
        info: number;                       // Overdue tasks with info severity
        low: number;                        // Overdue tasks with low severity
        medium: number;                     // Overdue tasks with medium severity
        high: number;                       // Overdue tasks with high severity
        critical: number;                   // Overdue tasks with critical severity
      };
    };
    priorityDistribution: Array<{
      label: string;                        // Priority level
      count: number;                        // Number of tasks with this priority
      percentage: number;                   // Percentage of total (0-100)
    }>;
    severityDistribution: Array<{
      label: string;                        // Severity level
      count: number;                        // Number of tasks with this severity
      percentage: number;                   // Percentage of total (0-100)
    }>;
    prioritySeverityMatrix: Array<{
      priority: string;                     // Priority level
      severity: string;                     // Severity level
      count: number;                        // Number of tasks with this combination
      percentage: number;                   // Percentage of total (0-100)
    }>;
  }
}
```

**Validation Rules:**

- `complianceFramework`: Must be a string, max 100 characters
- `overdueOnly`: Must be a boolean value (`true` or `false` as string)

**Error Responses:**

```json
// 400 Bad Request - Invalid compliance framework
{
  "statusCode": 400,
  "error": "VALIDATION_ERROR",
  "message": "complianceFramework must not exceed 100 characters",
  "details": {
    "field": "complianceFramework",
    "maxLength": 100,
    "actualLength": 150
  }
}
```

```json
// 400 Bad Request - Invalid overdueOnly value
{
  "statusCode": 400,
  "error": "VALIDATION_ERROR",
  "message": "overdueOnly must be a boolean",
  "details": {
    "field": "overdueOnly",
    "value": "invalid"
  }
}
```

---

### 8. Get Suggestions

Retrieves lists of unique tags and compliance frameworks currently in use across all TODO items. Useful for populating autocomplete dropdowns and filter options.

**Endpoint:** `GET /api/customPlugin/todos/_suggestions`

**Query Parameters:**

None

**Request Example:**

```http
GET /api/customPlugin/todos/_suggestions
```

**Response (200 OK):**

```json
{
  "tags": [
    "security",
    "compliance",
    "authentication",
    "infrastructure",
    "monitoring",
    "access-control",
    "encryption",
    "logging",
    "backup",
    "network",
    "database",
    "api",
    "frontend",
    "backend"
  ],
  "complianceFrameworks": [
    "PCI-DSS",
    "SOC2",
    "HIPAA",
    "GDPR",
    "ISO27001",
    "NIST",
    "CIS",
    "FedRAMP"
  ]
}
```

**Response Schema:**

```typescript
{
  tags: string[];                           // Array of unique tags from all TODOs
  complianceFrameworks: string[];           // Array of unique compliance frameworks from all TODOs
}
```

**Error Responses:**

```json
// 500 Internal Server Error - OpenSearch error
{
  "statusCode": 500,
  "error": "OPENSEARCH_ERROR",
  "message": "OpenSearch error: search_phase_execution_exception"
}
```

---

## Data Types Reference

### TODO Entity

```typescript
interface Todo {
  id: string;                               // Unique identifier
  title: string;                            // Title (1-256 characters)
  description?: string;                     // Description (0-4000 characters)
  status: TodoStatus;                       // Status: planned, in_progress, done, error
  tags: readonly string[];                  // Tags (max 20, each max 50 chars)
  assignee?: string;                        // Assignee (max 100 characters)
  priority: TodoPriority;                   // Priority: low, medium, high, critical
  severity: TodoSeverity;                   // Severity: info, low, medium, high, critical
  dueDate?: string;                         // Due date (ISO 8601)
  complianceFrameworks: readonly string[];  // Frameworks (max 10, each max 100 chars)
  createdAt: string;                        // Creation timestamp (ISO 8601)
  updatedAt: string;                        // Last update timestamp (ISO 8601)
  completedAt: string | null;               // Completion timestamp (ISO 8601) or null
}
```

### Enumeration Types

```typescript
// Status values
type TodoStatus = 'planned' | 'in_progress' | 'done' | 'error';

// Priority levels (ascending order)
type TodoPriority = 'low' | 'medium' | 'high' | 'critical';

// Severity levels (ascending order)
type TodoSeverity = 'info' | 'low' | 'medium' | 'high' | 'critical';

// Sort fields
type TodoSortField =
  | 'createdAt'
  | 'updatedAt'
  | 'completedAt'
  | 'title'
  | 'status'
  | 'priority'
  | 'severity'
  | 'dueDate';

// Sort directions
type SortDirection = 'asc' | 'desc';

// Time intervals for statistics
type TimeInterval = 'hour' | 'day' | 'week' | 'month';
```

---

## Field Validation Summary

### String Fields

| Field | Required | Min Length | Max Length | Additional Rules |
|-------|----------|------------|------------|------------------|
| `title` | Yes (create) | 1 | 256 | Cannot be empty or whitespace-only |
| `description` | No | 0 | 4000 | - |
| `assignee` | No | 0 | 100 | - |
| `status` | No | - | - | Must be valid enum value |
| `priority` | No | - | - | Must be valid enum value |
| `severity` | No | - | - | Must be valid enum value |

### Array Fields

| Field | Max Items | Max Item Length | Additional Rules |
|-------|-----------|-----------------|------------------|
| `tags` | 20 | 50 characters | Each tag validated individually |
| `complianceFrameworks` | 10 | 100 characters | Each framework validated individually |

### Date Fields

All date fields must be in **strict ISO 8601 format** (e.g., `2025-12-31T23:59:59.000Z`).

- `dueDate`: Can be set to `null` in update requests to clear
- `createdAt`: Auto-generated, cannot be set manually
- `updatedAt`: Auto-managed, cannot be set manually
- `completedAt`: Auto-managed based on status transitions

---

## Date Format Specification

All date and timestamp fields use **ISO 8601 format** with strict validation:

**Valid Format:** `YYYY-MM-DDTHH:mm:ss.sssZ`

**Examples:**
- `2025-01-15T23:59:59.000Z` (valid)
- `2024-12-31T00:00:00.000Z` (valid)
- `2025-12-31` (invalid - missing time component)
- `2025-12-31T23:59:59` (invalid - missing timezone)
- `12/31/2025` (invalid - wrong format)

---

## Pagination

All list and search endpoints support pagination:

- **Default page size:** 20 items
- **Maximum page size:** 100 items
- **Page numbers:** 1-based indexing

**Pagination Response:**

```typescript
{
  pagination: {
    page: number;                           // Current page (1-based)
    pageSize: number;                       // Items per page
    totalItems: number;                     // Total items matching query
    totalPages: number;                     // Total number of pages
    hasNextPage: boolean;                   // Whether next page exists
    hasPreviousPage: boolean;               // Whether previous page exists
  }
}
```

---

## Filtering

### Status Filtering

Filter by one or more status values using comma-separated strings:

```
?status=planned
?status=planned,error
?status=done
```

### Priority/Severity Filtering

Filter by one or more priority/severity values using comma-separated strings:

```
?priority=high
?priority=high,critical
?severity=critical
```

### Tag Filtering

Filter by tags using comma-separated strings. Items must have **ALL** specified tags (AND logic):

```
?tags=security
?tags=security,compliance
?tags=security,compliance,urgent
```

### Date Range Filtering

Filter by date ranges using ISO 8601 format:

```
?createdAfter=2024-01-01T00:00:00.000Z
?createdBefore=2024-12-31T23:59:59.000Z
?createdAfter=2024-01-01T00:00:00.000Z&createdBefore=2024-12-31T23:59:59.000Z
```

Available date range filters:
- `dueDateAfter` / `dueDateBefore`
- `createdAfter` / `createdBefore`
- `updatedAfter` / `updatedBefore`
- `completedAfter` / `completedBefore`

### Overdue Filtering

Filter for overdue tasks (due date in the past and not completed):

```
?isOverdue=true
```

---

## Sorting

### Server-Side Sorting

All list endpoints support server-side sorting:

```
?sortField=createdAt&sortDirection=desc
?sortField=priority&sortDirection=asc
?sortField=dueDate&sortDirection=asc
```

**Available Sort Fields:**
- `createdAt` (default)
- `updatedAt`
- `completedAt`
- `title`
- `status`
- `priority`
- `severity`
- `dueDate`

**Sort Directions:**
- `asc`: Ascending (A-Z, 0-9, oldest-newest)
- `desc`: Descending (Z-A, 9-0, newest-oldest) - default

---

## Full-Text Search

Use the `searchText` parameter for full-text search across title and description fields:

```
?searchText=security
?searchText=authentication vulnerability
?searchText=CVE-2024
```

**Search Features:**
- Searches both `title` and `description` fields
- Supports fuzzy matching for typo tolerance
- Case-insensitive
- Can be combined with filters and sorting

**Example:**

```
GET /api/customPlugin/todos?searchText=security&status=planned&priority=high,critical&sortField=priority&sortDirection=desc
```

---

## HTTP Status Codes

| Status Code | Meaning | Usage |
|-------------|---------|-------|
| 200 | OK | Request successful |
| 400 | Bad Request | Validation error or malformed request |
| 404 | Not Found | Resource not found |
| 409 | Conflict | Resource conflict |
| 422 | Unprocessable Entity | Business rule violation |
| 500 | Internal Server Error | Server error or OpenSearch error |

---

## Error Handling Best Practices

1. **Always check the `statusCode` field** in error responses
2. **Use the `error` field** for programmatic error handling
3. **Display the `message` field** to end users
4. **Parse the `details` object** for additional context about validation failures
5. **Log complete error responses** for debugging purposes

**Example Error Handling (JavaScript):**

```javascript
try {
  const response = await fetch('/api/customPlugin/todos', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(todoData)
  });

  if (!response.ok) {
    const error = await response.json();

    if (error.error === 'VALIDATION_ERROR') {
      // Handle validation errors
      console.error('Validation failed:', error.message, error.details);
    } else if (error.error === 'NOT_FOUND') {
      // Handle not found errors
      console.error('Resource not found:', error.message);
    } else {
      // Handle other errors
      console.error('Request failed:', error.message);
    }

    throw new Error(error.message);
  }

  const data = await response.json();
  return data.todo;
} catch (error) {
  console.error('Request failed:', error);
  throw error;
}
```

---

## Rate Limiting

Currently, no rate limiting is enforced. However, it is recommended to implement client-side throttling for:

- List/search requests: Max 10 requests per second
- Statistics/analytics requests: Max 2 requests per second

---

## Versioning

The current API version is **v1** (implicit). No version prefix is required in the URL.

Future versions will be introduced with URL prefixes (e.g., `/api/customPlugin/v2/todos`) while maintaining backward compatibility for v1.

---

## OpenSearch Index Information

**Index Name:** `customplugin-todos`

**Index Mapping:**
- `title`: Full-text indexed with keyword subfield
- `description`: Full-text indexed
- `status`, `tags`, `assignee`, `priority`, `severity`, `compliance_framework`: Keyword fields
- `created_at`, `updated_at`, `completed_at`, `due_date`: Date fields with strict ISO 8601 format

**Note:** The index is automatically created on first use with optimized mappings for search and aggregation performance.

---

## Additional Resources

- [Architecture Documentation](./architecture.md)
- [Features Documentation](./features.md)
- [Testing Guide](./testing.md)
- [Technical Challenges](./technical-challenges.md)

---

## Support

For issues, questions, or contributions, please refer to the main project documentation.

---

**Last Updated:** 2025-01-02
**API Version:** 1.0.0
