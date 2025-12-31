# OpenSearch Dashboards TODO Plugin

A production-ready TODO management plugin for OpenSearch Dashboards 2.16.0, featuring a complete CRUD system with advanced search, filtering, and analytics capabilities.

## Table of Contents

- [Overview](#overview)
- [Key Features](#key-features)
- [Quick Start](#quick-start)
- [Documentation](#documentation)
- [Technology Stack](#technology-stack)
- [Project Structure](#project-structure)
- [Running Tests](#running-tests)
- [Development Workflow](#development-workflow)
- [Support](#support)

## Overview

This plugin provides a comprehensive task management system designed for OpenSearch Dashboards, with advanced analytics and compliance tracking capabilities tailored for security professionals and compliance teams.

The plugin demonstrates best practices for OpenSearch Dashboards plugin development including:

- **5-Layer Backend Architecture**: Strict separation between Routes → Controllers → Services → Repositories → Mappers
- **Presentational Component Pattern**: Frontend components are pure presentation with zero business logic
- **Custom Hooks Architecture**: 14 custom React hooks containing all business logic, state management, and API calls
- **Kanban Board View**: Drag-and-drop task management with visual workflow columns
- **Type Safety**: Full TypeScript implementation with strict type checking
- **Data Validation**: Input validation at all boundaries using `@osd/config-schema`
- **DTO Pattern**: Well-defined API contracts between frontend and backend
- **Repository Pattern**: Single point of OpenSearch interaction
- **Feature-First Organization**: Frontend code organized by feature for better maintainability
- **Comprehensive Testing**: 250+ tests covering backend services, frontend components, and analytics features
- **Analytics Architecture**: Priority, severity, due date, and compliance framework tracking
- **Zero-Downtime Migrations**: Non-breaking schema evolution for analytics fields

## Key Features

### Core Functionality

- **Full CRUD Operations**: Create, read, update, and delete TODO items with rich metadata
- **Kanban Board View**: Visual workflow management with drag-and-drop status transitions across 3 columns (Planned, Done, Error)
- **Table View**: Traditional table view with advanced filtering, sorting, and pagination
- **Advanced Search**: Full-text search across titles and descriptions with fuzzy matching
- **Multi-Filter Support**: Filter by status, tags, assignee, priority, severity, compliance frameworks
- **Date Range Filtering**: Prominent date range picker in top navigation bar (TopNavMenu) with quick select options and "Last 7 days" default
- **Server-Side Pagination**: Efficient handling of large datasets with configurable page sizes (up to 100 items per page)
- **Flexible Sorting**: Sort by created date, updated date, completed date, title, status, priority, severity, or due date
- **Tag-Based Organization**: Categorize tasks with multiple tags (up to 20 per item)
- **Status Tracking**: Track tasks through three lifecycle states (planned, done, error)
- **Assignment Management**: Assign tasks to team members for accountability

### Analytics Features

- **Priority Management**: Four-tier priority system (low, medium, high, critical) for task urgency tracking
- **Severity Classification**: Five-level severity assessment (info, low, medium, high, critical) for impact evaluation
- **Due Date Tracking**: ISO 8601 date support with automatic overdue detection for tasks past deadline
- **Compliance Framework Association**: Link tasks to regulatory standards (PCI-DSS, ISO-27001, SOX, HIPAA, GDPR, etc.) - up to 10 frameworks per task
- **Overdue Detection**: Automatic identification of tasks that are overdue (past due date AND not completed)
- **Advanced Filtering**: Filter by priority levels, severity levels, compliance frameworks, due date ranges, and overdue status
- **Multi-Dimensional Sorting**: Sort by priority, severity, or due date to support risk-based workflows

### Data Visualization

- **3-Tab Interface**: Switch between Table View, Kanban View, and Analytics View
- **Kanban Cards**: Rich card display with title, description, priority/severity badges, tags, assignee, and due date
- **Drag-and-Drop**: Intuitive status changes by dragging cards between columns
- **Status Distribution Chart**: Progress bars showing task distribution with percentages and colors
- **Top Tags Analytics**: Horizontal bar chart of most frequently used tags with percentages
- **Assignee Distribution Chart**: Bar chart showing task distribution by assignee
- **Real-Time Statistics**: Summary cards showing total, planned, done, and error counts
- **Priority/Severity Badges**: Color-coded visual indicators throughout the UI
- **Overdue Highlights**: Red indicators for tasks past their due date in both table and kanban views

### Data Persistence

- **OpenSearch Storage**: All data persisted in OpenSearch 2.16.0 index with analytics-optimized mappings
- **Automatic Index Management**: Index created automatically with support for date fields and keyword aggregations
- **Zero-Downtime Schema Evolution**: Analytics fields added via non-breaking schema updates
- **Audit Trail**: Created, updated, and completed timestamps for all items
- **Date Field Optimization**: ISO 8601 date format with strict validation for due date tracking

## Quick Start

### Prerequisites

- Docker Desktop or Docker Engine with Docker Compose
- At least 4GB available RAM
- Port 5601 available (or modify `docker-compose.yml`)

### Step 1: Increase Virtual Memory (Linux/macOS)

OpenSearch requires higher virtual memory limits:

```bash
sudo sysctl -w vm.max_map_count=262144
```

To make this permanent on Linux, add to `/etc/sysctl.conf`:
```
vm.max_map_count=262144
```

### Step 2: Start Docker Containers

```bash
# Navigate to project directory
cd /path/to/dev_environment

# Start containers
docker compose up -d

# Verify containers are running
docker compose ps
```

Expected output:
```
NAME                    STATUS              PORTS
dev_environment-os1-1   running (healthy)   9200/tcp, 9300/tcp
dev_environment-osd-1   running             0.0.0.0:5601->5601/tcp
```

### Step 3: Start OpenSearch Dashboards

The OpenSearch Dashboards server must be started manually in development mode.

**Option A: Using VS Code (Recommended)**

1. Install the [Dev Containers](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.remote-containers) extension
2. Open Command Palette (Cmd/Ctrl + Shift + P)
3. Select "Dev Containers: Attach to Running Container"
4. Choose `dev_environment-osd-1`
5. Open terminal in the attached VS Code window
6. Run:
   ```bash
   cd /home/node/kbn
   yarn start --no-base-path
   ```

**Option B: Using Docker Exec**

```bash
# Attach to the container
docker exec -it dev_environment-osd-1 bash

# Inside the container
cd /home/node/kbn
yarn start --no-base-path
```

### Step 4: Wait for Optimization

First-time startup triggers code optimization (2-5 minutes). Server is ready when you see:

```
server    log   [XX:XX:XX.XXX] [info][server][OpenSearchDashboards][http] http server running at http://0.0.0.0:5601
```

Optimization complete when you see:
```
np bld    log   [XX:XX:XX.XXX] [success][@osd/optimizer] 51 bundles compiled successfully after XX.X sec, watching for changes
```

### Step 5: Access the Application

1. Open browser: **http://localhost:5601**
2. Login credentials:
   - Username: `admin`
   - Password: `Wazuh-1234`
3. Click hamburger menu (top-left) and select **TO-DO Plugin**

### Stop the Environment

```bash
# Stop containers (preserves data)
docker compose stop

# Stop and remove containers (clean slate)
docker compose down

# Stop and remove all data (including OpenSearch indices)
docker compose down -v
```

## Documentation

Comprehensive documentation is available in the `docs/` directory:

### Core Documentation

- **[User Guide](docs/user-guide.md)**: Complete user manual with step-by-step instructions, screenshots, and best practices for using the task management plugin
- **[Architecture Guide](docs/architecture.md)**: Comprehensive system architecture including the presentational component pattern, 5-layer backend architecture, 14 custom hooks, 18 UI components, data flow diagrams, and design patterns
- **[Features Documentation](docs/features.md)**: Complete feature catalog with 50+ implemented features, user workflows, API endpoints, data models, and technical constraints

### Additional Resources

- **[CLAUDE.md](CLAUDE.md)**: Developer guidance for working with this project and Claude Code integration

## Technology Stack

### Backend

- **OpenSearch Dashboards 2.16.0**: Plugin platform
- **Node.js**: Server runtime
- **TypeScript**: Type-safe JavaScript
- **@osd/config-schema**: Input validation
- **OpenSearch Client 2.16.0**: Database interaction

### Frontend

- **React 17+**: UI framework
- **@elastic/eui**: Elastic UI component library
- **TypeScript**: Type-safe JavaScript
- **React Hooks**: State management and side effects

### Data Layer

- **OpenSearch 2.16.0**: Document storage and search engine
- **Index**: `customplugin-todos`

### Testing

- **Jest**: Test runner
- **React Testing Library**: Component testing
- **Coverage**: 250+ passing tests across 6 suites with comprehensive analytics coverage

## Project Structure

```
dev_environment/
├── docker-compose.yml              # Container definitions
├── config/
│   └── opensearch_dashboards.yml   # OSD configuration
├── src/                            # Plugin source code
│   ├── opensearch_dashboards.json  # Plugin manifest
│   ├── package.json                # Dependencies and scripts
│   ├── common/                     # Shared types and DTOs
│   │   ├── constants.ts            # Plugin constants
│   │   └── todo/
│   │       ├── index.ts            # Exports
│   │       ├── todo.types.ts       # Domain entities
│   │       └── todo.dtos.ts        # API contracts
│   ├── server/                     # Backend (Node.js)
│   │   ├── plugin.ts               # Plugin lifecycle
│   │   ├── routes/                 # HTTP endpoints
│   │   │   ├── index.ts
│   │   │   └── todos.routes.ts     # TODO API routes
│   │   ├── controllers/            # Request/response handling
│   │   │   ├── index.ts
│   │   │   └── todos.controller.ts
│   │   ├── services/               # Business logic
│   │   │   ├── index.ts
│   │   │   ├── todos.service.ts
│   │   │   └── todo_stats.service.ts
│   │   ├── repositories/           # OpenSearch data access
│   │   │   ├── index.ts
│   │   │   ├── todos.repository.ts
│   │   │   └── index_manager.ts
│   │   ├── mappers/                # Data transformations
│   │   │   ├── index.ts
│   │   │   └── todos.mapper.ts
│   │   ├── errors/                 # Error handling
│   │   │   ├── index.ts
│   │   │   ├── app_errors.ts
│   │   │   └── http_error_mapper.ts
│   │   └── __tests__/              # Backend tests (3 suites)
│   │       ├── todos.service.test.ts
│   │       ├── todo_stats.service.test.ts
│   │       └── todos.mapper.test.ts
│   ├── public/                     # Frontend (React)
│   │   ├── plugin.ts               # Plugin registration
│   │   ├── application.tsx         # App entry point
│   │   ├── components/
│   │   │   ├── app.tsx                      # Main app component
│   │   │   └── language-selector.tsx        # i18n language switcher
│   │   └── features/todos/                  # Feature-first organization
│   │       ├── index.ts
│   │       ├── api/
│   │       │   └── todos.client.ts          # HTTP client
│   │       ├── hooks/                       # Custom React hooks (14 hooks)
│   │       │   ├── use_todos_page.ts        # Page orchestrator
│   │       │   ├── use_todos_table.ts       # Table delete modal logic
│   │       │   ├── use_todo_filters.ts      # Filter state management
│   │       │   ├── use_todo_form.ts         # Form state & validation
│   │       │   ├── use_compliance_dashboard.ts  # Framework selection
│   │       │   ├── use_kanban_board.ts      # Kanban drag-drop logic
│   │       │   ├── use_todos_stats_dashboard.ts # Stats data transformation
│   │       │   ├── use_todos.ts             # Fetch todos data
│   │       │   ├── use_create_todo.ts       # Create operation
│   │       │   ├── use_update_todo.ts       # Update operation
│   │       │   ├── use_delete_todo.ts       # Delete operation
│   │       │   ├── use_todo_stats.ts        # Statistics fetching
│   │       │   ├── use_todo_analytics.ts    # Analytics fetching
│   │       │   └── use_todo_suggestions.ts  # Autocomplete suggestions
│   │       ├── ui/                          # Presentational components
│   │       │   ├── TodosPage.tsx            # Main page (3 tabs)
│   │       │   ├── TodosTable.tsx           # TODO table
│   │       │   ├── TodoFilters.tsx          # Advanced filters
│   │       │   ├── TodoForm.tsx             # Create/Edit form
│   │       │   ├── KanbanBoard.tsx          # Kanban board view
│   │       │   ├── TodosStatsDashboard.tsx  # General statistics
│   │       │   ├── ComplianceDashboard.tsx  # Compliance analytics
│   │       │   ├── ComplianceFrameworkChart.tsx
│   │       │   ├── PrioritySeverityHeatmap.tsx
│   │       │   ├── HighCriticalTasksChart.tsx
│   │       │   ├── OverdueTasksTable.tsx
│   │       │   └── components/              # Reusable chart components
│   │       │       ├── KanbanCard.tsx       # Draggable TODO card
│   │       │       ├── KanbanColumn.tsx     # Droppable column
│   │       │       ├── StatsSummaryCards.tsx
│   │       │       ├── StatusDistributionChart.tsx
│   │       │       ├── TopTagsChart.tsx
│   │       │       └── AssigneeDistributionChart.tsx
│   │       └── __tests__/                   # Frontend tests (6 suites)
│   │           ├── setup.ts
│   │           ├── TodosPage.test.tsx
│   │           ├── TodosTable.test.tsx
│   │           ├── TodoFilters.test.tsx
│   │           ├── TodoForm.test.tsx
│   │           ├── TodosStatsDashboard.test.tsx
│   │           └── ComplianceDashboard.test.tsx
├── docs/                           # Documentation
│   ├── architecture.md             # Architecture guide (new)
│   └── features.md                 # Features documentation (new)
├── CLAUDE.md                       # Claude Code guidance
├── PROJECT_RULES.md                # Architecture rules
└── README.md                       # This file
```

## Running Tests

Tests must be run inside the Docker container:

```bash
# Attach to container
docker exec -it dev_environment-osd-1 bash

# Navigate to plugin directory
cd /home/node/kbn/plugins/custom_plugin

# Run all tests
yarn test

# Run with coverage
yarn test --coverage

# Run specific test suite
yarn test server/__tests__/todos.service.test.ts

# Watch mode for development
yarn test --watch
```

Expected output:
```
Test Suites: 6 passed, 6 total
Tests:       250 passed, 250 total
Snapshots:   0 total
Time:        35.678 s
```

For comprehensive testing documentation including troubleshooting, debugging, and CI/CD integration, see **[Testing Guide](docs/testing.md)**.

## Development Workflow

### Hot Reload

Development mode enables automatic reloading:

- **Server changes** (`src/server/**`): Server automatically restarts
- **Frontend changes** (`src/public/**`): Code re-optimized, browser updates

### Disable Browser Cache

While developing, disable browser cache in DevTools (Network tab) to ensure you see the latest changes.

### Installing Dependencies

Check if dependency exists in OpenSearch Dashboards core first:

```bash
# Inside the container
cat /home/node/kbn/package.json | grep <dependency_name>
```

If not found, install in plugin directory:

```bash
cd /home/node/kbn/plugins/custom_plugin
yarn add <dependency_name>
```

**Important**: Stop the OpenSearch Dashboards server before installing dependencies.

### Building the Plugin

Create a distributable plugin package:

```bash
# Inside the container
cd /home/node/kbn/plugins/custom_plugin
yarn build
```

This creates a `.zip` file in `build/` that can be installed in production.

## Support

For questions or issues:

1. **User Guide**: Check the [User Guide](docs/user-guide.md) for step-by-step instructions on using the plugin
2. **Architecture**: Check the [Architecture Guide](docs/architecture.md) for system design and patterns
3. **Features**: Review the [Features Documentation](docs/features.md) for functional capabilities
4. **API**: Consult the [API Reference](docs/api.md) for endpoint specifications
5. **UI**: See the [Dashboard Guide](docs/dashboards.md) for frontend components
6. **Testing**: Read the [Testing Guide](docs/testing.md) for running tests and debugging
7. **Development**: Review [CLAUDE.md](CLAUDE.md) for development workflow guidance
8. **Contracts**: View [TypeScript Contracts](docs/contracts.md) for shared types documentation
9. **Documentation**: See [Documentation Analytics](docs/documentation-analytics.md) for coverage metrics and generated documentation analysis

## License

This project is part of the Wazuh ecosystem. Please refer to the main Wazuh repository for licensing information.

---

**Plugin ID**: `customPlugin`
**Display Name**: TO-DO Plugin
**Version**: 1.0.0
**OpenSearch Dashboards Version**: 2.16.0
**OpenSearch Version**: 2.16.0
