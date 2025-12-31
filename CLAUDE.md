# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is an OpenSearch Dashboards plugin development environment using Docker containers. The project implements a production-ready TODO management plugin (`customPlugin`) with a complete CRUD system, advanced search, filtering, and analytics capabilities.

The plugin demonstrates enterprise-grade architectural patterns including:
- **5-Layer Backend Architecture**: Routes → Controllers → Services → Repositories → Mappers
- **Feature-First Frontend**: React components organized by feature with custom hooks
- **Comprehensive Testing**: 169 tests (95+ tests across 6 test suites) with >90% coverage
- **Full Documentation**: Architecture guides, API references, and technical documentation

## Architecture

### Container-Based Development

The environment runs entirely in Docker containers defined in `docker-compose.yml`:

- **os1**: OpenSearch indexer node (2.16.0) - the backend data store
- **osd**: OpenSearch Dashboards (2.16.0) in development mode - the UI platform

The plugin source code in `src/` is mounted as a volume into the `osd` container at `/home/node/kbn/plugins/custom_plugin`, enabling live development with hot-reload.

### Plugin Structure

The plugin follows a strict layered architecture with clear separation of concerns:

#### Server-Side (Backend) - 5 Layers

1. **Routes** (`src/server/routes/`): HTTP endpoint definitions
   - `todos.routes.ts`: 6 REST endpoints (CRUD + stats)
   - Input validation using `@osd/config-schema`
   - Route registration in `plugin.ts`

2. **Controllers** (`src/server/controllers/`): Request/response handling
   - `todos.controller.ts`: Parse requests, delegate to services, format responses
   - Error handling and HTTP status code mapping

3. **Services** (`src/server/services/`): Business logic
   - `todos.service.ts`: CRUD operations, validation, business rules
   - `todo_stats.service.ts`: Analytics and aggregations
   - Automatic timestamp management (completedAt on status change)

4. **Repositories** (`src/server/repositories/`): OpenSearch data access (single boundary)
   - `todos.repository.ts`: All OpenSearch operations (search, create, update, delete)
   - `index_manager.ts`: Index creation with mappings
   - Request-scoped client from `context.core.opensearch.client.asCurrentUser`

5. **Mappers** (`src/server/mappers/`): Data transformation
   - `todos.mapper.ts`: Convert between OpenSearch documents and DTOs
   - Field name conversion (snake_case ↔ camelCase)
   - Never expose raw OpenSearch responses to UI

**Additional Backend Layers:**
- **Errors** (`src/server/errors/`): Custom error hierarchy and HTTP mapping
  - `app_errors.ts`: NotFoundError, ValidationError, ConflictError, etc.
  - `http_error_mapper.ts`: Map application errors to HTTP status codes

#### Client-Side (Frontend) - Feature-First

- **Plugin Registration** (`src/public/plugin.ts`): Registers app in navigation menu
- **Application Entry** (`src/public/application.tsx`): Mounts React app
- **Feature Organization** (`src/public/features/todos/`):
  - `api/todos.client.ts`: HTTP client for backend API
  - `hooks/`: 5 custom React hooks (use_todos, use_create_todo, use_update_todo, use_delete_todo, use_todo_stats)
  - `ui/`: React components (TodosPage, TodosTable, TodosChart, TodoForm, TodoFilters)
  - Uses `@elastic/eui` components for UI consistency

#### Common (Shared) - API Contracts

- **Constants** (`src/common/constants.ts`): Plugin ID, API paths, defaults
- **Types** (`src/common/todo/todo.types.ts`): Domain entities (Todo, TodoStatus, etc.)
- **DTOs** (`src/common/todo/todo.dtos.ts`): API request/response contracts

Plugin metadata is defined in `src/opensearch_dashboards.json` (plugin ID, version, dependencies).

### Important Paths

- Plugin source code is developed in `src/` on the host
- Inside the container, the plugin lives at `/home/node/kbn/plugins/custom_plugin`
- OpenSearch Dashboards core is at `/home/node/kbn` in the container
- Configuration is in `config/opensearch_dashboards.yml`

## Development Workflow

### Starting the Environment

```bash
# Start containers
docker compose up -d

# Check status
docker compose ps
```

The `osd` container starts but does NOT run OpenSearch Dashboards automatically. You must start the server manually.

### Running OpenSearch Dashboards in Development Mode

1. Attach to the `osd` container (use VS Code's "Attach to Running Container" feature or `docker exec`)
2. Inside the container, navigate to `/home/node/kbn`
3. Start the development server:

```bash
yarn start --no-base-path
```

The server is ready when you see:
```
server    log   [XX:XX:XX.XXX] [info][server][OpenSearchDashboards][http] http server running at http://0.0.0.0:5601
```

First-time startup triggers code optimization which can take several minutes. You'll see:
```
np bld    log   [XX:XX:XX.XXX] [success][@osd/optimizer] 51 bundles compiled successfully after XX.X sec, watching for changes
```

### Accessing the Application

- OpenSearch Dashboards UI: http://localhost:5601
- Credentials: `admin` / `Wazuh-1234`
- Custom plugin is accessible from the side navigation menu

### Hot Reload Behavior

Development mode enables automatic reloading:
- **Server changes** (`src/server/**`): Server automatically restarts
- **Frontend changes** (`src/public/**`): Code is re-optimized and browser updates (disable browser cache in DevTools for best results)

### Building the Plugin

Inside the container at `/home/node/kbn/plugins/custom_plugin`:

```bash
yarn build
```

This creates a distributable plugin package.

### Testing

The plugin has comprehensive test coverage with 169 tests across 6 test suites:

**Server-Side Tests** (`src/server/__tests__/`):
- `todos.service.test.ts`: Business logic and CRUD operations
- `todo_stats.service.test.ts`: Statistics and analytics
- `todos.mapper.test.ts`: Data transformation logic

**Client-Side Tests** (`src/public/features/todos/__tests__/`):
- `TodosTable.test.tsx`: Table component rendering and interactions
- `TodosChart.test.tsx`: Chart visualization
- `TodoForm.test.tsx`: Form validation and submission

Run tests inside the container:

```bash
# From /home/node/kbn/plugins/custom_plugin
yarn test                    # Run all tests
yarn test --coverage         # With coverage report
yarn test --watch            # Watch mode

# Run specific suite
yarn test server/__tests__/todos.service.test.ts
yarn test public/features/todos/__tests__/TodoForm.test.tsx
```

**Expected Results:**
- Test Suites: 6 passed, 6 total
- Tests: 169 passed, 169 total
- Coverage: >90% statements, >85% branches

For comprehensive testing documentation, see `docs/testing.md`.

## Making OpenSearch Queries

**IMPORTANT**: All OpenSearch operations MUST go through the Repository layer (PROJECT RULE #2).

Access the OpenSearch client in repositories via the request-scoped client:

```typescript
// In repositories only (src/server/repositories/)
export class TodosRepository {
  constructor(private client: OpenSearchClient) {}

  async findById(id: string): Promise<Todo | null> {
    const response = await this.client.get({
      index: DEFAULT_INDEX_NAME,
      id,
    });
    return response.body._source;
  }

  async search(query: object): Promise<SearchResponse> {
    return await this.client.search({
      index: DEFAULT_INDEX_NAME,
      body: query,
    });
  }

  async create(id: string, todo: Partial<Todo>): Promise<void> {
    await this.client.create({
      index: DEFAULT_INDEX_NAME,
      id,
      body: todo,
      refresh: 'wait_for',
    });
  }
}
```

**Repository Pattern Benefits:**
- Single point of OpenSearch interaction
- Easy to mock for testing
- Centralized error handling
- Request-scoped security context

**Client Injection in Routes:**
```typescript
// In route handlers (src/server/routes/)
router.get('/todos', async (context, request, response) => {
  const client = context.core.opensearch.client.asCurrentUser;
  const repository = new TodosRepository(client);
  const service = new TodosService(repository);
  const controller = new TodosController(service);

  return await controller.listTodos(request, response);
});
```

Reference: [Elasticsearch JavaScript Client API](https://www.elastic.co/guide/en/elasticsearch/client/javascript-api/current/api-reference.html)

## Dependencies

The plugin can access OpenSearch Dashboards' dependencies. Before adding a new dependency:

1. Check if it exists in `/home/node/kbn/package.json` inside the container
2. If not found, install it in the plugin directory (`/home/node/kbn/plugins/custom_plugin`):

```bash
yarn add <dependency_name>
# or
npm install <dependency_name>
```

Stop the OpenSearch Dashboards server before installing dependencies.

## Documentation

Comprehensive documentation is available in the `docs/` directory:

### Core Documentation
- **[Architecture Guide](docs/architecture.md)**: System architecture, data flow, design patterns (1,026 lines)
- **[Features Documentation](docs/features.md)**: All features, user workflows, usage examples (764 lines)
- **[API Reference](docs/api.md)**: Complete REST API documentation with examples (716 lines)

### Specialized Documentation
- **[Dashboard & UI Guide](docs/dashboards.md)**: Frontend components and visualizations (44KB)
- **[Testing Guide](docs/testing.md)**: How to run tests in Docker, debugging, CI/CD (1,016 lines)
- **[Technical Challenges](docs/technical-challenges.md)**: Architecture decisions and lessons learned
- **[Roadmap](docs/roadmap.md)**: Future enhancements aligned with Wazuh workflows (38KB)

## System Requirements

- Increase virtual memory for OpenSearch (required on Linux):
  ```bash
  sudo sysctl -w vm.max_map_count=262144
  ```
- Ensure port 5601 is available on the host (or modify `docker-compose.yml`)

## Stopping the Environment

```bash
# Stop containers (preserves data)
docker compose stop

# Stop and remove containers (clean slate)
docker compose down
```

## Implemented Features

The TODO plugin includes the following production-ready features:

### Core CRUD Operations
- ✅ Create TODO items with title, description, status, tags, assignee
- ✅ List TODOs with server-side pagination (10/20/50/100 items per page)
- ✅ Get single TODO by ID
- ✅ Update TODO with partial updates (PATCH)
- ✅ Delete TODO with confirmation dialog

### Search & Filtering
- ✅ Full-text search across title and description with fuzzy matching
- ✅ Filter by status (planned, done, error)
- ✅ Filter by tags (AND logic - must have all specified tags)
- ✅ Filter by assignee
- ✅ Combine multiple filters simultaneously

### Sorting
- ✅ Sort by: created date, updated date, completed date, title, status
- ✅ Ascending/descending order
- ✅ Server-side sorting for performance

### Analytics & Visualizations
- ✅ Summary statistics (total, planned, done, error counts)
- ✅ Status distribution with progress bars
- ✅ Top tags bar chart with percentages
- ✅ Completion timeline (time-series data)

### Data Management
- ✅ OpenSearch persistence with optimized index mappings
- ✅ Automatic index creation on first use
- ✅ Automatic timestamp management (created, updated, completed)
- ✅ Tag-based organization (up to 20 tags per item)

### Testing & Quality
- ✅ 169 passing tests across 6 test suites
- ✅ >90% code coverage (statements)
- ✅ Backend unit tests (services, mappers)
- ✅ Frontend component tests (React Testing Library)

## PROJECT RULES

These rules MUST be followed when working with this codebase:

1. **Never return raw OpenSearch responses to the UI. Always map to DTOs.**
   - Use mappers in `src/server/mappers/` to transform data
   - Define DTOs in `src/common/todo/todo.dtos.ts`

2. **All OpenSearch operations must go through repositories (single boundary).**
   - Only `src/server/repositories/` should interact with OpenSearch
   - Services and controllers never directly access the OpenSearch client

3. **Routes must validate input. No unvalidated params/query/body.**
   - Use `@osd/config-schema` for input validation
   - Validate in route handlers before passing to controllers

4. **Frontend must call only the plugin BFF endpoints (no direct OpenSearch from UI).**
   - Use `src/public/features/todos/api/todos.client.ts`
   - Never import OpenSearch client in frontend code

5. **Must include table + chart. Must include search + CRUD. Must persist.**
   - ✅ Implemented: TodosTable, TodosChart, search, filters, CRUD, OpenSearch persistence

6. **Tests must run in Docker and be green. If a test fails, fix it before adding new features.**
   - Run `yarn test` inside container before committing
   - All 169 tests must pass

7. **Prefer @opensearch-project/oui / @elastic/eui components for UI consistency.**
   - Use EUI components for all UI elements
   - Follow EUI design patterns and accessibility guidelines

8. **Add pagination + sorting (server-side preferred) and document it.**
   - ✅ Implemented: Server-side pagination and sorting
   - ✅ Documented in `docs/features.md` and `docs/api.md`

9. **Keep codebase TypeScript strict; avoid `any`.**
   - Use explicit types for all variables, parameters, and return values
   - Enable strict mode in TypeScript configuration

10. **Update README as features are added; do not leave docs for the end.**
    - ✅ Documentation complete: 8 comprehensive documentation files
    - Keep documentation in sync with code changes

Always use context7 when I need code generation, setup or configuration steps, or
library/API documentation. This means you should automatically use the Context7 MCP
tools to resolve library id and get library docs without me having to explicitly ask.


# 🌐 Language Enforcement Rule — English Only

## Global Rule
All outputs **MUST be written in English**.

This includes, without exception:
- Source code
- Code comments
- Documentation (README, ADRs, API docs, diagrams text, examples)
- Commit messages (if suggested)
- Variable names, function names, class names
- Logs, error messages, warnings
- Test descriptions
- TODOs, FIXMEs, and inline notes
- Architecture explanations and design decisions

## Strict Prohibitions
- ❌ No Spanish (or any other language) is allowed in:
  - Comments
  - Documentation
  - Explanations
  - Code identifiers
- ❌ Do not translate partially.
- ❌ Do not mix languages.

## Enforcement Behavior
- If input is provided in Spanish, **respond entirely in English**.
- If existing code/comments are in Spanish, **refactor them to English**.
- If ambiguity exists, prefer **clear, professional technical English**.

## Style Guidelines
- Use clear, professional, senior-level technical English.
- Prefer concise and explicit wording.
- Follow industry-standard terminology.
- Avoid informal language unless explicitly requested.

## Quality Gate
Any output that contains non-English content is considered **invalid** and must be corrected before proceeding.

---

**This rule has priority over any other stylistic or formatting preference.**
