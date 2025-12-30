# TO-DO Plugin for OpenSearch Dashboards

A full-stack TODO management application built as an OpenSearch Dashboards plugin. Designed for security professionals using Wazuh to track compliance tasks aligned with standards like PCI DSS, ISO 27001, and SOX.

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Plugin Structure](#plugin-structure)
3. [Data Model](#data-model)
4. [REST API Contract](#rest-api-contract)
5. [Development](#development)
6. [Testing](#testing)
7. [Challenges and Solutions](#challenges-and-solutions)
8. [Future Enhancements](#future-enhancements)

---

## Architecture Overview

### High-Level Architecture

```
+-------------------+     HTTP/REST     +-------------------+     OpenSearch     +-------------------+
|                   |  <--------------> |                   |  <-------------->  |                   |
|  React Frontend   |                   |  Backend-for-     |                    |    OpenSearch     |
|  (OUI Components) |                   |  Frontend (BFF)   |                    |    Index          |
|                   |                   |                   |                    |                   |
+-------------------+                   +-------------------+                    +-------------------+
     public/                                  server/                            customplugin-todos
```

### Design Principles

1. **Feature-First UI Organization**: Frontend code is organized by feature (e.g., `features/todos/`) rather than by type (components, hooks). Each feature is self-contained with its own API client, hooks, and UI components.

2. **Layered Backend Architecture**: The BFF follows a strict layering pattern:
   - **Routes**: HTTP endpoint definitions with request validation
   - **Controllers**: Request/response orchestration
   - **Services**: Business logic and orchestration
   - **Repositories**: Data access (OpenSearch operations)
   - **Mappers**: Transform between OpenSearch documents and domain entities

3. **Shared Contracts**: TypeScript types and DTOs in `common/` ensure type safety across the frontend-backend boundary. Raw OpenSearch responses are never exposed to the UI.

4. **Validation at Boundaries**: Input validation happens at route boundaries using schema validation. Never trust client input.

5. **Separation of Concerns**: OpenSearch client usage is isolated to the repository layer only.

---

## Plugin Structure

```
src/
  common/                          # Shared contracts (no runtime deps)
    constants.ts                   # Plugin ID, API paths, defaults
    todo/
      todo.types.ts                # Domain entities (Todo, TodoStatus)
      todo.dtos.ts                 # API request/response shapes
      index.ts                     # Re-exports
    index.ts                       # Main export

  server/                          # Backend-for-Frontend (BFF)
    index.ts                       # Plugin entry point
    plugin.ts                      # Plugin lifecycle (setup, start, stop)
    config/
      schema.ts                    # Configuration schema
      types.ts                     # Config types
    routes/
      index.ts                     # Route registration
      todos.routes.ts              # TODO endpoint definitions
    controllers/
      todos.controller.ts          # Request handling
    services/
      todos.service.ts             # Business logic
      todo_stats.service.ts        # Stats/aggregation logic
    repositories/
      index_manager.ts             # Index creation/management
      todos.repository.ts          # OpenSearch CRUD operations
    mappers/
      todos.mapper.ts              # Document <-> Entity transformation
    validation/
      todos.validation.ts          # Request body/query schemas
    errors/
      app_errors.ts                # Custom error classes
      http_error_mapper.ts         # Error to HTTP response mapping
    __tests__/
      todos.service.test.ts        # Service unit tests
      todos.routes.test.ts         # Route integration tests

  public/                          # React Frontend
    index.ts                       # Entry point
    plugin.ts                      # Plugin registration
    application.tsx                # App mount
    index.scss                     # Global styles
    app/
      routes.tsx                   # Route configuration
      app_providers.tsx            # Context providers
    shared/
      api/http.ts                  # HTTP client utilities
      api/api_errors.ts            # Error handling
      hooks/use_toasts.ts          # Toast notifications
      hooks/use_debounce.ts        # Debounce hook
      ui/Loading.tsx               # Loading spinner
      ui/EmptyState.tsx            # Empty state component
    features/
      todos/
        api/todos.client.ts        # API client for todos
        hooks/use_todos.ts         # List/search hook
        hooks/use_create_todo.ts   # Create mutation hook
        hooks/use_update_todo.ts   # Update mutation hook
        hooks/use_delete_todo.ts   # Delete mutation hook
        ui/TodosPage.tsx           # Main page component
        ui/TodosTable.tsx          # Data table
        ui/TodosStatsDashboard.tsx # Stats dashboard
        ui/TodoForm.tsx            # Create/edit form
        ui/TodoFilters.tsx         # Filter controls
        index.ts                   # Feature exports

  test/                            # Test configuration
    config.js                      # Jest config
    jest.js                        # Jest runner
```

---

## Data Model

### OpenSearch Index

**Index Name**: `customplugin-todos`

**Mapping**:
```json
{
  "mappings": {
    "properties": {
      "title": {
        "type": "text",
        "fields": {
          "keyword": {
            "type": "keyword",
            "ignore_above": 256
          }
        }
      },
      "description": {
        "type": "text"
      },
      "status": {
        "type": "keyword"
      },
      "tags": {
        "type": "keyword"
      },
      "assignee": {
        "type": "keyword"
      },
      "created_at": {
        "type": "date",
        "format": "strict_date_optional_time"
      },
      "updated_at": {
        "type": "date",
        "format": "strict_date_optional_time"
      },
      "completed_at": {
        "type": "date",
        "format": "strict_date_optional_time"
      }
    }
  },
  "settings": {
    "number_of_shards": 1,
    "number_of_replicas": 0
  }
}
```

### Domain Entity: Todo

| Field        | Type                | Description                              |
|--------------|---------------------|------------------------------------------|
| id           | string              | Unique identifier (OpenSearch _id)       |
| title        | string              | Task title (required, searchable)        |
| description  | string (optional)   | Detailed description (searchable)        |
| status       | TodoStatus          | 'planned' | 'done' | 'error'            |
| tags         | string[]            | Categorization tags (filterable)         |
| assignee     | string (optional)   | Assigned user                            |
| createdAt    | string (ISO 8601)   | Creation timestamp                       |
| updatedAt    | string (ISO 8601)   | Last modification timestamp              |
| completedAt  | string | null       | Completion timestamp (null if not done)  |

### Status Values

| Status   | Description                           | UI Color |
|----------|---------------------------------------|----------|
| planned  | Task is pending/scheduled             | Primary  |
| done     | Task completed successfully           | Success  |
| error    | Task blocked or encountered an issue  | Danger   |

---

## REST API Contract

**Base Path**: `/api/customPlugin/todos`

### Endpoints

#### List/Search TODOs

```
GET /api/customPlugin/todos
```

**Query Parameters**:
| Parameter      | Type                    | Default    | Description                              |
|----------------|-------------------------|------------|------------------------------------------|
| page           | number                  | 1          | Page number (1-based)                    |
| pageSize       | number                  | 20         | Items per page (max: 100)                |
| status         | string | string[]      | -          | Filter by status                         |
| tags           | string[]                | -          | Filter by tags (AND logic)               |
| searchText     | string                  | -          | Full-text search (title + description)   |
| assignee       | string                  | -          | Filter by assignee                       |
| sortField      | string                  | createdAt  | Sort field                               |
| sortDirection  | 'asc' | 'desc'         | desc       | Sort direction                           |

**Response** (200 OK):
```json
{
  "todos": [
    {
      "id": "abc123",
      "title": "Review PCI DSS controls",
      "description": "Annual review of payment card security",
      "status": "planned",
      "tags": ["compliance", "pci-dss"],
      "assignee": "john.doe",
      "createdAt": "2024-01-15T10:30:00.000Z",
      "updatedAt": "2024-01-15T10:30:00.000Z",
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

#### Create TODO

```
POST /api/customPlugin/todos
```

**Request Body**:
```json
{
  "title": "Review PCI DSS controls",
  "description": "Annual review of payment card security",
  "status": "planned",
  "tags": ["compliance", "pci-dss"],
  "assignee": "john.doe"
}
```

| Field       | Required | Constraints                      |
|-------------|----------|----------------------------------|
| title       | Yes      | 1-256 characters                 |
| description | No       | Max 4000 characters              |
| status      | No       | Defaults to 'planned'            |
| tags        | No       | Max 20 tags, each max 50 chars   |
| assignee    | No       | Max 100 characters               |

**Response** (201 Created):
```json
{
  "todo": {
    "id": "abc123",
    "title": "Review PCI DSS controls",
    "description": "Annual review of payment card security",
    "status": "planned",
    "tags": ["compliance", "pci-dss"],
    "assignee": "john.doe",
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z",
    "completedAt": null
  }
}
```

#### Get TODO by ID

```
GET /api/customPlugin/todos/{id}
```

**Response** (200 OK):
```json
{
  "todo": { ... }
}
```

**Response** (404 Not Found):
```json
{
  "statusCode": 404,
  "error": "Not Found",
  "message": "Todo with id 'xyz' not found"
}
```

#### Update TODO

```
PATCH /api/customPlugin/todos/{id}
```

**Request Body** (all fields optional):
```json
{
  "title": "Updated title",
  "status": "done",
  "tags": ["updated", "tags"]
}
```

**Response** (200 OK):
```json
{
  "todo": { ... }
}
```

**Note**: When status changes to 'done', `completedAt` is automatically set to the current timestamp. When status changes from 'done' to another status, `completedAt` is set to null.

#### Delete TODO

```
DELETE /api/customPlugin/todos/{id}
```

**Response** (200 OK):
```json
{
  "id": "abc123",
  "deleted": true
}
```

#### Get Statistics

```
GET /api/customPlugin/todos/_stats
```

**Query Parameters**:
| Parameter      | Type                            | Default | Description                    |
|----------------|---------------------------------|---------|--------------------------------|
| createdAfter   | string (ISO 8601)               | -       | Filter: created after date     |
| createdBefore  | string (ISO 8601)               | -       | Filter: created before date    |
| timeInterval   | 'hour'|'day'|'week'|'month'     | day     | Histogram bucket size          |
| topTagsLimit   | number                          | 10      | Max tags to return             |

**Response** (200 OK):
```json
{
  "stats": {
    "total": 42,
    "byStatus": {
      "planned": 25,
      "done": 15,
      "error": 2
    },
    "topTags": [
      { "tag": "compliance", "count": 18 },
      { "tag": "pci-dss", "count": 12 },
      { "tag": "urgent", "count": 8 }
    ],
    "completedOverTime": [
      { "date": "2024-01-08", "count": 3 },
      { "date": "2024-01-09", "count": 5 },
      { "date": "2024-01-10", "count": 2 }
    ]
  }
}
```

### Error Responses

All endpoints return errors in a consistent format:

```json
{
  "statusCode": 400,
  "error": "Bad Request",
  "message": "Validation failed",
  "details": {
    "title": "Title is required"
  }
}
```

| Status Code | Error Type        | Common Causes                    |
|-------------|-------------------|----------------------------------|
| 400         | Bad Request       | Validation errors, malformed JSON|
| 404         | Not Found         | Resource does not exist          |
| 500         | Internal Error    | OpenSearch errors, server issues |

---

## Development

### Prerequisites

- Docker and Docker Compose installed
- Port 5601 available
- Sufficient memory for OpenSearch (Linux: run `sudo sysctl -w vm.max_map_count=262144`)

### Starting the Environment

```bash
# Start containers
docker compose up -d

# Check container status
docker compose ps
```

### Running OpenSearch Dashboards

1. Attach to the `osd` container:
   - Using VS Code: "Dev Containers: Attach to Running Container..."
   - Or via CLI: `docker exec -it <container_id> bash`

2. Navigate to the platform directory:
   ```bash
   cd /home/node/kbn
   ```

3. Start the development server:
   ```bash
   yarn start --no-base-path
   ```

4. Wait for optimization to complete (first run takes several minutes):
   ```
   np bld    log   [success][@osd/optimizer] 51 bundles compiled successfully
   ```

5. Access the application:
   - URL: http://localhost:5601
   - Credentials: `admin` / `Wazuh-1234`
   - Navigate to the TODO plugin from the side menu

### Hot Reload

- **Server changes** (`src/server/**`): Server restarts automatically
- **Frontend changes** (`src/public/**`): Bundles recompile; refresh browser (disable cache in DevTools)

---

## Testing

### Running Tests

Inside the Docker container, from the plugin directory:

```bash
cd /home/node/kbn/plugins/custom_plugin

# Run all tests
yarn test

# Run specific test file
yarn test todos.service.test.ts

# Run with coverage
yarn test --coverage
```

### Test Structure

- **Server tests** (`server/__tests__/`):
  - `todos.service.test.ts`: Unit tests for service layer with mocked repository
  - `todos.routes.test.ts`: Integration tests for HTTP endpoints

- **Frontend tests** (`public/features/todos/__tests__/`):
  - `TodosTable.test.tsx`: Table rendering, pagination, action triggers
  - `TodoForm.test.tsx`: Form validation and submission
  - `TodosStatsDashboard.test.tsx`: Stats dashboard rendering with statistics data

---

## Challenges and Solutions

### 1. Type Safety Across Boundaries
**Challenge**: Ensuring consistent types between frontend and backend.
**Solution**: Shared types in `common/` with strict TypeScript compilation. DTOs define exact API shapes, and mappers transform between OpenSearch documents and domain entities.

### 2. OpenSearch Date Handling
**Challenge**: OpenSearch returns dates as strings; JavaScript uses Date objects.
**Solution**: All dates stored and transmitted as ISO 8601 strings. Parsing to Date objects happens only in UI components when needed for display.

### 3. Hot Reload in Docker
**Challenge**: File change detection across Docker volume mounts.
**Solution**: The dev environment uses volume mounts with proper polling. Ensure browser caching is disabled during development.

### 4. Index Initialization
**Challenge**: Ensuring the index exists with correct mappings before first use.
**Solution**: `IndexManager` checks and creates the index during plugin setup. Mappings are defined in `todo.types.ts` and applied automatically.

---

## Future Enhancements

1. **Due Dates**: Add `dueAt` field for deadline tracking with overdue highlighting
2. **Priority Levels**: Add priority field (low, medium, high, critical)
3. **Audit Trail**: Track all changes with timestamps and user attribution
4. **Attachments**: Link related files or documents to tasks
5. **Recurring Tasks**: Support for repeating tasks on schedules
6. **Export/Import**: CSV/JSON export for reporting and backup
7. **Multi-tenant Support**: Index prefix per tenant for data isolation
8. **Notifications**: Email or in-app notifications for due dates and assignments
9. **Subtasks**: Hierarchical task structure with parent-child relationships
10. **Bulk Operations**: Select multiple tasks for batch status updates or deletion

---

## Scripts

| Command                          | Description                                    |
|----------------------------------|------------------------------------------------|
| `yarn osd bootstrap`             | Install dependencies and setup                 |
| `yarn start --no-base-path`      | Start development server                       |
| `yarn test`                      | Run Jest tests                                 |
| `yarn plugin-helpers build`      | Create distributable plugin package            |

---

## License

This plugin is provided as part of the Wazuh development environment.
