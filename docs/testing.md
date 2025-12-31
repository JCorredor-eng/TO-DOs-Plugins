# Testing Guide

**Last Updated**: 2025-12-31

This guide provides comprehensive instructions for running and managing tests in the Docker-based OpenSearch Dashboards plugin development environment.

---

## Table of Contents

1. [Prerequisites & Environment Setup](#prerequisites--environment-setup)
2. [Accessing the Test Environment](#accessing-the-test-environment)
3. [Running Tests](#running-tests)
4. [Test Suites Overview](#test-suites-overview)
5. [Test Output Interpretation](#test-output-interpretation)
6. [Coverage Reports](#coverage-reports)
7. [Debugging Failed Tests](#debugging-failed-tests)
8. [Troubleshooting Guide](#troubleshooting-guide)
9. [Best Practices](#best-practices)
10. [CI/CD Integration](#cicd-integration)

---

## Prerequisites & Environment Setup

### System Requirements

Before running tests, ensure your system meets these requirements:

**Linux/macOS:**
```bash
# Set virtual memory for OpenSearch
sudo sysctl -w vm.max_map_count=262144

# Verify the setting
sysctl vm.max_map_count
```

**Ports:**
- Port 5601 must be available (or modify `docker-compose.yml`)

**Docker:**
- Docker Engine 20.10+
- Docker Compose V2

### Starting the Docker Environment

Navigate to the project root and start the containers:

```bash
cd /Users/juliancorredor/Dev/wazuh/dev_environment
docker compose up -d
```

**Expected Output:**
```
[+] Running 2/2
 ✔ Container dev_environment-os1-1  Started
 ✔ Container dev_environment-osd-1  Started
```

### Verifying Container Status

Check that containers are running and healthy:

```bash
docker compose ps
```

**Expected Output:**
```
NAME                    IMAGE                                 COMMAND                  SERVICE   STATUS                 PORTS
dev_environment-os1-1   opensearchproject/opensearch:2.16.0   "./opensearch-docker…"   os1       Up (healthy)          9200/tcp, 9300/tcp
dev_environment-osd-1   quay.io/wazuh/osd-dev:2.16.0          "tail -f /dev/null"      osd       Up                    0.0.0.0:5601->5601/tcp
```

**Container States:**
- **os1**: Must show `(healthy)` status before running tests
- **osd**: Must show `Up` status

**If containers are not running:**
```bash
# Check logs for errors
docker compose logs os1
docker compose logs osd

# Restart containers
docker compose restart
```

---

## Accessing the Test Environment

There are two methods to access the container for running tests:

### Method 1: VS Code "Attach to Running Container" (Recommended)

This method provides an integrated development experience with full VS Code features inside the container.

1. **Install Extension**: Install "Dev Containers" extension in VS Code
2. **Attach to Container**:
   - Open Command Palette (Cmd/Ctrl + Shift + P)
   - Select "Dev Containers: Attach to Running Container..."
   - Choose `dev_environment-osd-1`
3. **Open Plugin Directory**: Once attached, navigate to `/home/node/kbn/plugins/custom_plugin`

**Benefits:**
- Full VS Code features (IntelliSense, debugging, extensions)
- Integrated terminal
- File explorer
- Git integration

### Method 2: Docker Exec (Command Line)

Access the container via command line:

```bash
docker exec -it dev_environment-osd-1 /bin/bash
```

**Expected Output:**
```
node@osd:~/kbn$
```

**Navigate to Plugin Directory:**
```bash
cd /home/node/kbn/plugins/custom_plugin
```

**Verify Location:**
```bash
pwd
# Output: /home/node/kbn/plugins/custom_plugin

ls -la
# Should show: src/, package.json, etc.
```

### Container Filesystem Structure

```
/home/node/kbn/                           # OpenSearch Dashboards core
├── node_modules/                         # Shared dependencies
├── src/                                  # Core source code
├── plugins/
│   └── custom_plugin/                    # Your plugin (mounted from host)
│       ├── src/                          # Plugin source code
│       │   ├── public/                   # Frontend code
│       │   ├── server/                   # Backend code
│       │   ├── common/                   # Shared code
│       │   └── test/                     # Test configuration
│       ├── package.json                  # Plugin dependencies
│       └── node_modules/                 # Plugin-specific deps
└── config/
    └── opensearch_dashboards.yml         # Configuration
```

**Note**: The plugin directory (`/home/node/kbn/plugins/custom_plugin`) is a Docker volume mount pointing to `./src` on your host machine. Changes made on the host are immediately reflected in the container.

---

## Running Tests

All test commands must be executed from the plugin directory inside the container:

```bash
cd /home/node/kbn/plugins/custom_plugin
```

### Run All Tests

Execute the complete test suite (14+ test files, 250+ tests):

```bash
yarn test
```

**Expected Duration**: 30-60 seconds

**Expected Output:**
```
PASS  server/__tests__/todos.service.test.ts
PASS  server/__tests__/todo_stats.service.test.ts
PASS  server/__tests__/todos.mapper.test.ts
PASS  server/__tests__/todos.repository.test.ts
PASS  server/__tests__/todo_analytics.service.test.ts
PASS  public/features/todos/__tests__/TodosPage.test.tsx
PASS  public/features/todos/__tests__/TodosTable.test.tsx
PASS  public/features/todos/__tests__/TodoForm.test.tsx
PASS  public/features/todos/__tests__/TodosStatsDashboard.test.tsx
PASS  public/features/todos/__tests__/TodoFilters.test.tsx
PASS  public/features/todos/__tests__/ComplianceDashboard.test.tsx
PASS  public/features/todos/__tests__/KanbanBoard.test.tsx
PASS  public/features/todos/__tests__/KanbanCard.test.tsx
PASS  public/features/todos/hooks/__tests__/use_kanban_board.test.ts
PASS  public/features/todos/api/__tests__/query-params.builder.test.ts

Test Suites: 15 passed, 15 total
Tests:       250+ passed, 250+ total
Snapshots:   0 total
Time:        45.123 s
```

### Run Specific Test Suites

#### Server-Side Tests

**All Server Tests:**
```bash
yarn test server/__tests__/
```

**Individual Server Test Files:**
```bash
# CRUD service tests
yarn test server/__tests__/todos.service.test.ts

# Statistics service tests
yarn test server/__tests__/todo_stats.service.test.ts

# Analytics service tests (compliance, advanced stats)
yarn test server/__tests__/todo_analytics.service.test.ts

# Data mapper tests
yarn test server/__tests__/todos.mapper.test.ts

# Repository layer tests
yarn test server/__tests__/todos.repository.test.ts
```

#### Client-Side Tests

**All Frontend Tests:**
```bash
yarn test public/features/todos/__tests__/
```

**Individual Frontend Test Files:**
```bash
# Page component tests
yarn test public/features/todos/__tests__/TodosPage.test.tsx

# Table component tests
yarn test public/features/todos/__tests__/TodosTable.test.tsx

# Form component tests
yarn test public/features/todos/__tests__/TodoForm.test.tsx

# Stats dashboard tests
yarn test public/features/todos/__tests__/TodosStatsDashboard.test.tsx

# Filters component tests
yarn test public/features/todos/__tests__/TodoFilters.test.tsx

# Compliance dashboard tests
yarn test public/features/todos/__tests__/ComplianceDashboard.test.tsx

# Kanban board tests
yarn test public/features/todos/__tests__/KanbanBoard.test.tsx

# Kanban card tests
yarn test public/features/todos/__tests__/KanbanCard.test.tsx
```

#### Hook Tests

```bash
# All hook tests
yarn test public/features/todos/hooks/__tests__/

# Kanban board hook tests
yarn test public/features/todos/hooks/__tests__/use_kanban_board.test.ts
```

#### API Tests

```bash
# Query parameter builder tests
yarn test public/features/todos/api/__tests__/query-params.builder.test.ts
```

### Watch Mode (Development)

Run tests in watch mode for active development. Tests automatically re-run when files change:

```bash
yarn test --watch
```

**Interactive Commands:**
```
Watch Usage
 › Press f to run only failed tests.
 › Press o to only run tests related to changed files.
 › Press p to filter by a filename regex pattern.
 › Press t to filter by a test name regex pattern.
 › Press q to quit watch mode.
 › Press Enter to trigger a test run.
```

**Use Case**: Keep this running in a terminal while developing. Tests re-run automatically when you save files.

### Run Tests with Coverage

Generate a detailed coverage report:

```bash
yarn test --coverage
```

**Expected Duration**: 45-70 seconds (slightly slower due to instrumentation)

**Coverage Output Example:**
```
-------------------|---------|----------|---------|---------|-------------------
File               | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s
-------------------|---------|----------|---------|---------|-------------------
All files          |   92.45 |    86.32 |   91.18 |   93.12 |
 server/           |   94.23 |    88.45 |   93.56 |   95.01 |
  services/        |   95.67 |    90.12 |   94.23 |   96.34 |
  repositories/    |   93.45 |    87.34 |   92.11 |   94.56 |
  mappers/         |   96.78 |    91.23 |   95.67 |   97.89 |
 public/           |   90.12 |    84.23 |   88.45 |   91.23 |
  features/todos/  |   91.34 |    85.67 |   89.78 |   92.45 |
-------------------|---------|----------|---------|---------|-------------------
```

See [Coverage Reports](#coverage-reports) section for detailed interpretation.

### Run Tests with Additional Options

**Clear Jest Cache (troubleshooting):**
```bash
yarn test --clearCache
```

**Run Tests Silently (minimal output):**
```bash
yarn test --silent
```

**Run Tests in Band (no parallelization, useful for debugging):**
```bash
yarn test --runInBand
```

**Verbose Output:**
```bash
yarn test --verbose
```

**Update Snapshots (if applicable):**
```bash
yarn test --updateSnapshot
```

### One-Liner from Host Machine

Run tests without entering the container:

```bash
docker exec -it dev_environment-osd-1 bash -c "cd /home/node/kbn/plugins/custom_plugin && yarn test"
```

**With Coverage:**
```bash
docker exec -it dev_environment-osd-1 bash -c "cd /home/node/kbn/plugins/custom_plugin && yarn test --coverage"
```

---

## Test Suites Overview

The plugin has **15 test suites** covering all layers of the application:

### Server-Side Tests (5 suites)

#### 1. `todos.service.test.ts` - CRUD Service Tests

**Location**: `/home/node/kbn/plugins/custom_plugin/src/server/__tests__/todos.service.test.ts`

**Coverage**: TodosService business logic

**Test Count**: ~45 tests

**Categories**:
- **Create Operations**: Required fields, optional fields, validation
- **Read Operations**: Get by ID, list with pagination, filtering
- **Update Operations**: Partial updates, status changes, timestamp management
- **Delete Operations**: Successful deletion, non-existent items
- **Validation**: Title length, tag limits, assignee format, priority/severity values
- **Timestamp Management**: `createdAt`, `updatedAt`, `completedAt` handling

**Sample Test Cases**:
- Should create TODO with required fields only
- Should validate title length (max 200 chars)
- Should enforce tag limit (max 20 tags)
- Should set `completedAt` when status changes to 'done'
- Should clear `completedAt` when status changes from 'done' to 'planned'
- Should throw NotFoundError when updating non-existent TODO

**Expected Duration**: ~8 seconds

#### 2. `todo_stats.service.test.ts` - Statistics Service Tests

**Location**: `/home/node/kbn/plugins/custom_plugin/src/server/__tests__/todo_stats.service.test.ts`

**Coverage**: TodoStatsService aggregations and analytics

**Test Count**: ~30 tests

**Categories**:
- **Summary Stats**: Total count, status distribution (planned/done/error)
- **Tag Analytics**: Top tags with counts and percentages
- **Assignee Distribution**: TODOs per assignee
- **Timeline Analytics**: Completion trends over time
- **Priority/Severity Stats**: Distribution analysis
- **Empty State Handling**: Zero results, missing data

**Sample Test Cases**:
- Should return correct summary statistics (total, planned, done, error)
- Should calculate top tags with percentages
- Should aggregate TODOs by assignee
- Should return completion timeline with date buckets
- Should handle empty dataset gracefully

**Expected Duration**: ~6 seconds

#### 3. `todo_analytics.service.test.ts` - Advanced Analytics Tests

**Location**: `/home/node/kbn/plugins/custom_plugin/src/server/__tests__/todo_analytics.service.test.ts`

**Coverage**: TodoAnalyticsService compliance and advanced analytics

**Test Count**: ~55 tests

**Categories**:
- **Compliance Framework Analytics**: Coverage by framework (NIST, PCI-DSS, HIPAA, etc.)
- **Multi-Dimensional Aggregations**: Status + priority + severity combinations
- **Trend Analysis**: Time-based patterns
- **Validation**: Framework name validation, input constraints
- **Error Handling**: Invalid frameworks, missing data

**Sample Test Cases**:
- Should return analytics statistics with all aggregations
- Should return compliance coverage statistics
- Should accept valid compliance framework strings
- Should throw ValidationError if framework name exceeds max length
- Should handle missing compliance frameworks gracefully

**Expected Duration**: ~10 seconds

#### 4. `todos.mapper.test.ts` - Data Mapper Tests

**Location**: `/home/node/kbn/plugins/custom_plugin/src/server/__tests__/todos.mapper.test.ts`

**Coverage**: Data transformation between OpenSearch and DTOs

**Test Count**: ~20 tests

**Categories**:
- **DTO to OpenSearch Document**: Field name conversion (camelCase → snake_case)
- **OpenSearch Document to DTO**: Reverse transformation
- **Null/Undefined Handling**: Optional fields, missing data
- **Array Transformations**: Tags, compliance frameworks
- **Timestamp Formatting**: ISO 8601 strings

**Sample Test Cases**:
- Should convert DTO to OpenSearch document format
- Should convert OpenSearch document to DTO format
- Should handle null/undefined fields correctly
- Should preserve array values (tags, frameworks)
- Should format timestamps as ISO 8601 strings

**Expected Duration**: ~3 seconds

#### 5. `todos.repository.test.ts` - Repository Layer Tests

**Location**: `/home/node/kbn/plugins/custom_plugin/src/server/__tests__/todos.repository.test.ts`

**Coverage**: OpenSearch data access layer

**Test Count**: ~35 tests

**Categories**:
- **CRUD Operations**: Create, read, update, delete via OpenSearch client
- **Search Queries**: Full-text search, filtering, sorting
- **Pagination**: Offset-based pagination with `from` and `size`
- **Client Mocking**: Request-scoped client behavior
- **Error Handling**: Network errors, index errors, not found errors

**Sample Test Cases**:
- Should create document in OpenSearch with refresh
- Should retrieve document by ID
- Should update document with partial fields
- Should delete document and verify removal
- Should build correct search query with filters
- Should handle OpenSearch client errors

**Expected Duration**: ~7 seconds

### Client-Side Tests (9 suites)

#### 6. `TodosPage.test.tsx` - Main Page Component Tests

**Location**: `/home/node/kbn/plugins/custom_plugin/src/public/features/todos/__tests__/TodosPage.test.tsx`

**Coverage**: TodosPage component integration

**Test Count**: ~15 tests

**Categories**:
- **Rendering**: Initial render, loading states, data display
- **User Interactions**: Search, filter, create, update, delete
- **State Management**: Hook integration, state updates
- **Navigation**: Between different views (table, kanban, dashboard)
- **Error Handling**: API errors, empty states

**Sample Test Cases**:
- Should render loading spinner when loading
- Should display TODOs table when data is loaded
- Should call create TODO on form submit
- Should filter TODOs when filters change
- Should navigate between table and kanban views

**Expected Duration**: ~5 seconds

#### 7. `TodosTable.test.tsx` - Table Component Tests

**Location**: `/home/node/kbn/plugins/custom_plugin/src/public/features/todos/__tests__/TodosTable.test.tsx`

**Coverage**: TodosTable component

**Test Count**: ~25 tests

**Categories**:
- **Column Rendering**: All columns (title, status, assignee, tags, dates, actions)
- **Sorting**: Click column headers, sort direction
- **Pagination**: Page size, page navigation, item counts
- **Row Actions**: Edit, delete, status change
- **Selection**: Single/multi-row selection
- **Empty State**: No data message

**Sample Test Cases**:
- Should render all table columns
- Should display TODO items in rows
- Should sort by title when column clicked
- Should paginate with correct page sizes
- Should call onEdit when edit button clicked
- Should show confirmation modal on delete

**Expected Duration**: ~6 seconds

#### 8. `TodoForm.test.tsx` - Form Component Tests

**Location**: `/home/node/kbn/plugins/custom_plugin/src/public/features/todos/__tests__/TodoForm.test.tsx`

**Coverage**: TodoForm component validation and submission

**Test Count**: ~30 tests

**Categories**:
- **Field Rendering**: All form fields (title, description, status, etc.)
- **Validation**: Required fields, length limits, format validation
- **Submission**: Create mode, edit mode, error handling
- **Field Interactions**: Dropdowns, text inputs, tag inputs
- **Reset/Cancel**: Clear form, cancel edit
- **Error Display**: Validation errors, API errors

**Sample Test Cases**:
- Should render all form fields
- Should validate required title field
- Should enforce title max length (200 chars)
- Should allow adding/removing tags
- Should submit form with valid data
- Should display validation errors
- Should populate form in edit mode

**Expected Duration**: ~7 seconds

#### 9. `TodosStatsDashboard.test.tsx` - Stats Dashboard Tests

**Location**: `/home/node/kbn/plugins/custom_plugin/src/public/features/todos/__tests__/TodosStatsDashboard.test.tsx`

**Coverage**: TodosStatsDashboard component visualizations

**Test Count**: ~20 tests

**Categories**:
- **Summary Cards**: Total, planned, done, error counts
- **Chart Rendering**: Status distribution, top tags, timeline
- **Data Transformation**: Stats to chart data conversion
- **Loading State**: Skeleton loaders
- **Empty State**: No data handling
- **Responsive Layout**: Grid layout, card arrangement

**Sample Test Cases**:
- Should render summary statistics cards
- Should display status distribution chart
- Should display top tags bar chart
- Should display completion timeline
- Should show loading state
- Should handle empty stats gracefully

**Expected Duration**: ~5 seconds

#### 10. `TodoFilters.test.tsx` - Filters Component Tests

**Location**: `/home/node/kbn/plugins/custom_plugin/src/public/features/todos/__tests__/TodoFilters.test.tsx`

**Coverage**: TodoFilters component

**Test Count**: ~18 tests

**Categories**:
- **Filter Rendering**: Search, status, tags, assignee filters
- **Filter Changes**: OnChange callbacks, value updates
- **Clear Filters**: Reset to defaults
- **Multi-Select**: Tag selection, status selection
- **Autocomplete**: Assignee suggestions
- **Filter Count**: Active filter badges

**Sample Test Cases**:
- Should render all filter controls
- Should call onChange when search text changes
- Should filter by status selection
- Should filter by multiple tags
- Should autocomplete assignee names
- Should clear all filters on reset

**Expected Duration**: ~4 seconds

#### 11. `ComplianceDashboard.test.tsx` - Compliance Dashboard Tests

**Location**: `/home/node/kbn/plugins/custom_plugin/src/public/features/todos/__tests__/ComplianceDashboard.test.tsx`

**Coverage**: ComplianceDashboard component for compliance analytics

**Test Count**: ~25 tests

**Categories**:
- **Framework Selection**: Dropdown, framework filtering
- **Compliance Metrics**: Coverage percentages, framework counts
- **Visualizations**: Compliance charts, framework distribution
- **Loading State**: Loading compliance data
- **Empty State**: No compliance data
- **Framework Comparison**: Side-by-side framework stats

**Sample Test Cases**:
- Should render loading spinner when loading
- Should render framework filter dropdown
- Should call onFrameworkChange when framework selected
- Should display compliance coverage metrics
- Should render compliance framework distribution chart
- Should handle empty compliance data

**Expected Duration**: ~6 seconds

#### 12. `KanbanBoard.test.tsx` - Kanban Board Tests

**Location**: `/home/node/kbn/plugins/custom_plugin/src/public/features/todos/__tests__/KanbanBoard.test.tsx`

**Coverage**: KanbanBoard component for drag-and-drop task management

**Test Count**: ~22 tests

**Categories**:
- **Column Rendering**: Planned, done, error columns
- **Card Rendering**: TODO cards in columns
- **Drag and Drop**: Move cards between columns
- **Status Updates**: Update status on drop
- **Empty Columns**: Empty state messages
- **Loading State**: Column skeleton loaders

**Sample Test Cases**:
- Should render all kanban columns (planned, done, error)
- Should display TODO cards in correct columns by status
- Should allow dragging cards between columns
- Should update TODO status when card dropped
- Should show empty state for columns with no items
- Should display loading state while fetching data

**Expected Duration**: ~5 seconds

#### 13. `KanbanCard.test.tsx` - Kanban Card Tests

**Location**: `/home/node/kbn/plugins/custom_plugin/src/public/features/todos/__tests__/KanbanCard.test.tsx`

**Coverage**: KanbanCard component for individual task cards

**Test Count**: ~15 tests

**Categories**:
- **Card Display**: Title, description, tags, assignee, priority
- **Badge Rendering**: Priority badge, tag badges
- **Actions**: Edit, delete, quick actions
- **Visual States**: Selected, dragging, hover
- **Metadata Display**: Created date, assignee avatar
- **Truncation**: Long text handling

**Sample Test Cases**:
- Should render card with TODO data
- Should display title and description
- Should render tags as badges
- Should display assignee name
- Should show priority badge with correct color
- Should call onEdit when edit icon clicked
- Should call onDelete when delete icon clicked

**Expected Duration**: ~4 seconds

#### 14. `use_kanban_board.test.ts` - Kanban Hook Tests

**Location**: `/home/node/kbn/plugins/custom_plugin/src/public/features/todos/hooks/__tests__/use_kanban_board.test.ts`

**Coverage**: useKanbanBoard custom hook

**Test Count**: ~18 tests

**Categories**:
- **Data Fetching**: Load TODOs for kanban view
- **Column Organization**: Group TODOs by status
- **Drag Handler**: Handle card moves between columns
- **Status Update**: Update TODO status on drop
- **Error Handling**: API errors, network failures
- **Loading States**: Initial load, refetch

**Sample Test Cases**:
- Should fetch and organize TODOs by status columns
- Should return planned, done, error columns
- Should handle drag and drop between columns
- Should update TODO status when moved
- Should refetch data after status update
- Should handle API errors gracefully

**Expected Duration**: ~4 seconds

### API Tests (1 suite)

#### 15. `query-params.builder.test.ts` - Query Builder Tests

**Location**: `/home/node/kbn/plugins/custom_plugin/src/public/features/todos/api/__tests__/query-params.builder.test.ts`

**Coverage**: Query parameter construction for API calls

**Test Count**: ~12 tests

**Categories**:
- **Pagination Params**: Page, page size conversion to offset/limit
- **Sorting Params**: Sort field, sort direction
- **Filter Params**: Search, status, tags, assignee
- **URL Encoding**: Special characters, arrays
- **Default Values**: Fallback to defaults when not provided

**Sample Test Cases**:
- Should build query params with pagination
- Should convert page and pageSize to offset and limit
- Should include sorting parameters
- Should include filter parameters
- Should URL encode special characters
- Should handle array parameters (tags)

**Expected Duration**: ~2 seconds

---

## Test Output Interpretation

### Understanding Test Results

#### Successful Test Run

```
PASS  server/__tests__/todos.service.test.ts
  TodosService
    create
      ✓ should create a TODO with required fields (23ms)
      ✓ should create a TODO with all fields (18ms)
      ✓ should validate title length (12ms)
    update
      ✓ should update TODO with partial fields (15ms)
      ✓ should set completedAt when status changes to done (20ms)
    delete
      ✓ should delete TODO successfully (10ms)

Test Suites: 1 passed, 1 total
Tests:       6 passed, 6 total
Snapshots:   0 total
Time:        3.456 s
```

**Key Indicators of Success:**
- `PASS` status for test suite
- Green checkmarks (✓) for all tests
- No failures, errors, or warnings
- Reasonable execution time (< 60s for all suites)

#### Failed Test Run

```
FAIL  server/__tests__/todos.service.test.ts
  TodosService
    create
      ✓ should create a TODO with required fields (23ms)
      ✕ should validate title length (45ms)

  ● TodosService › create › should validate title length

    expect(received).rejects.toThrow(expected)

    Expected: ValidationError
    Received: function did not throw

      67 |       const longTitle = 'a'.repeat(201);
      68 |       const request = { title: longTitle };
    > 69 |       await expect(service.create(request)).rejects.toThrow(ValidationError);
         |             ^
      70 |     });

    at Object.<anonymous> (server/__tests__/todos.service.test.ts:69:13)

Test Suites: 1 failed, 1 total
Tests:       1 failed, 1 passed, 2 total
Snapshots:   0 total
Time:        3.789 s
```

**Key Indicators of Failure:**
- `FAIL` status for test suite
- Red ✕ for failed tests
- Error message with stack trace
- File path and line number where failure occurred
- Expected vs Received values

**How to Read the Error:**
1. **Test Name**: `TodosService › create › should validate title length`
2. **Error Type**: `expect(received).rejects.toThrow(expected)`
3. **Details**: Expected `ValidationError` but function did not throw
4. **Location**: `server/__tests__/todos.service.test.ts:69:13`

### Test Suite Summary

At the end of a test run, you'll see a summary:

```
Test Suites: 15 passed, 15 total
Tests:       250 passed, 250 total
Snapshots:   0 total
Time:        45.123 s
Ran all test suites.
```

**What Constitutes a Passing Test Suite:**
- **All test suites passed**: No failures
- **Test count matches expected**: ~250+ tests total
- **No skipped tests**: Unless intentionally skipped with `test.skip()`
- **No timeout errors**: Tests complete within reasonable time

**Expected Test Counts by Category:**
- Server tests: ~150 tests across 5 files
- Client tests: ~95 tests across 9 files
- API tests: ~12 tests

### Watch Mode Output

In watch mode, you'll see additional information:

```
Watch Usage
 › Press f to run only failed tests.
 › Press o to only run tests related to changed files.
 › Press p to filter by a filename regex pattern.
 › Press t to filter by a test name regex pattern.
 › Press q to quit watch mode.
 › Press Enter to trigger a test run.

Test Suites: 15 passed, 15 total
Tests:       250 passed, 250 total
Time:        45.123 s

Ran all test suites.
```

**Interactive Commands Explained:**
- **f**: Re-run only tests that failed in the last run
- **o**: Run tests for files that have changed since last commit (Git required)
- **p**: Filter by filename (e.g., `service` to run only service tests)
- **t**: Filter by test name (e.g., `should create` to run only create tests)
- **q**: Exit watch mode
- **Enter**: Manually trigger a test run

---

## Coverage Reports

### Generating Coverage Reports

Run tests with coverage enabled:

```bash
yarn test --coverage
```

### Reading Coverage Output

Coverage reports show how much of your code is executed during tests:

```
-------------------|---------|----------|---------|---------|-------------------
File               | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s
-------------------|---------|----------|---------|---------|-------------------
All files          |   92.45 |    86.32 |   91.18 |   93.12 |
 server/           |   94.23 |    88.45 |   93.56 |   95.01 |
  controllers/     |   96.45 |    90.23 |   95.12 |   97.34 |
   todos.controller.ts | 97.12 | 91.45 |  96.78 |   98.23 | 145,167
  services/        |   95.67 |    90.12 |   94.23 |   96.34 |
   todos.service.ts    | 96.34 | 91.23 |  95.45 |   97.56 | 89,234
   todo_stats.service.ts | 94.56 | 88.45 | 93.12 |   95.23 | 123,156,189
  repositories/    |   93.45 |    87.34 |   92.11 |   94.56 |
   todos.repository.ts | 94.12 | 88.67 |  93.45 |   95.78 | 67,89,112
  mappers/         |   96.78 |    91.23 |   95.67 |   97.89 |
   todos.mapper.ts     | 97.45 | 92.34 |  96.78 |   98.67 | 45
 public/           |   90.12 |    84.23 |   88.45 |   91.23 |
  features/todos/  |   91.34 |    85.67 |   89.78 |   92.45 |
   ui/             |   89.45 |    83.12 |   87.23 |   90.34 |
    TodosPage.tsx      | 90.23 | 84.56 |  88.45 |   91.67 | 34,67,89
    TodosTable.tsx     | 88.67 | 82.34 |  86.78 |   89.45 | 45,78,123,145
   hooks/          |   93.12 |    87.45 |   91.56 |   94.23 |
    use_todos.ts       | 94.56 | 88.67 |  92.34 |   95.78 | 23,45
-------------------|---------|----------|---------|---------|-------------------
```

### Coverage Metrics Explained

1. **% Stmts (Statements)**: Percentage of code statements executed
   - **Goal**: >90% for production code
   - **Interpretation**: Higher is better, but 100% is not always necessary

2. **% Branch (Branch Coverage)**: Percentage of conditional branches tested
   - **Goal**: >85% for production code
   - **Interpretation**: Tests both `if` and `else` paths, all `switch` cases
   - **Example**: If you have `if (x > 5) {...} else {...}`, both paths should be tested

3. **% Funcs (Function Coverage)**: Percentage of functions called
   - **Goal**: >90% for production code
   - **Interpretation**: Every function should be invoked at least once

4. **% Lines (Line Coverage)**: Percentage of executable lines executed
   - **Goal**: >90% for production code
   - **Interpretation**: Similar to statement coverage, but line-based

5. **Uncovered Line #s**: Specific line numbers not covered by tests
   - **Use**: Identify gaps in test coverage
   - **Example**: `145,167` means lines 145 and 167 were not executed

### HTML Coverage Report

Coverage data is also saved as an HTML report:

```bash
# After running yarn test --coverage, view the report:
# On host machine (coverage/ directory is created in src/)
open /Users/juliancorredor/Dev/wazuh/dev_environment/src/coverage/lcov-report/index.html
```

The HTML report provides:
- Interactive file browser
- Line-by-line coverage highlighting
- Branch coverage details
- Uncovered code highlighting (red = not covered, green = covered)

### Coverage Thresholds

The project enforces minimum coverage thresholds. Tests will fail if coverage drops below:

- **Statements**: 85%
- **Branches**: 80%
- **Functions**: 85%
- **Lines**: 85%

**Note**: These thresholds are configured in `src/test/config.js`.

### Improving Coverage

To increase coverage:

1. **Identify Uncovered Code**: Check "Uncovered Line #s" column
2. **Write Missing Tests**: Add tests for uncovered branches/functions
3. **Review Edge Cases**: Test error paths, null/undefined values, boundary conditions
4. **Run Coverage Again**: Verify improvements with `yarn test --coverage`

---

## Debugging Failed Tests

### Step 1: Identify the Failing Test

Read the error output carefully:

```
FAIL  server/__tests__/todos.service.test.ts
  ● TodosService › create › should validate title length

    expect(received).rejects.toThrow(expected)

    Expected: ValidationError
    Received: function did not throw

      69 |       await expect(service.create(request)).rejects.toThrow(ValidationError);
         |             ^

    at server/__tests__/todos.service.test.ts:69:13
```

**Key Information:**
- **File**: `server/__tests__/todos.service.test.ts`
- **Test**: `TodosService › create › should validate title length`
- **Line**: Line 69
- **Issue**: Expected ValidationError but function didn't throw

### Step 2: Run the Specific Test

Isolate the failing test:

```bash
# Run only the specific test file
yarn test server/__tests__/todos.service.test.ts

# Run only tests matching a pattern
yarn test -t "should validate title length"
```

### Step 3: Add Debugging Output

Temporarily add `console.log()` statements to understand what's happening:

```typescript
// In the test file
it('should validate title length', async () => {
  const longTitle = 'a'.repeat(201);
  const request = { title: longTitle };

  console.log('Request:', request);
  console.log('Title length:', longTitle.length);

  await expect(service.create(request)).rejects.toThrow(ValidationError);
});
```

Run the test again to see the output:

```bash
yarn test -t "should validate title length"
```

### Step 4: Use VS Code Debugger

If using VS Code attached to the container:

1. **Set Breakpoint**: Click in the gutter next to the line number
2. **Run Debug**: Use VS Code's Jest extension or debug configuration
3. **Inspect Variables**: Hover over variables, check call stack
4. **Step Through**: Use F10 (step over), F11 (step into)

### Step 5: Check Implementation Code

Verify the implementation matches the test expectations:

```bash
# Read the service implementation
cat src/server/services/todos.service.ts | grep -A 10 "create"
```

### Step 6: Common Debugging Scenarios

#### Test Times Out

**Symptom:**
```
Timeout - Async callback was not invoked within the 5000 ms timeout specified by jest.setTimeout
```

**Solution:**
```typescript
// Increase timeout for this test
it('should handle long operation', async () => {
  // ... test code
}, 10000); // 10 second timeout
```

#### Mock Not Working

**Symptom:**
```
Expected mock function to have been called, but it was not called
```

**Solution:**
```typescript
// Clear mocks between tests
beforeEach(() => {
  jest.clearAllMocks();
});

// Verify mock setup
console.log('Mock calls:', mockFunction.mock.calls);
```

#### Async Issues

**Symptom:**
```
Error: expect(received).resolves.toBe(expected)
Received promise rejected instead of resolved
```

**Solution:**
```typescript
// Ensure you await async operations
await expect(asyncFunction()).resolves.toBe(expected);

// Or use .rejects for error cases
await expect(asyncFunction()).rejects.toThrow(ErrorType);
```

#### Component Not Rendering

**Symptom:**
```
TestingLibraryElementError: Unable to find element with text: "Expected Text"
```

**Solution:**
```typescript
// Use screen.debug() to see what's rendered
import { render, screen } from '@testing-library/react';

render(<Component />);
screen.debug(); // Prints entire DOM

// Or debug specific element
const element = screen.getByTestId('my-element');
screen.debug(element);
```

### Step 7: Run in Band for Sequential Execution

If tests pass individually but fail together (race conditions):

```bash
yarn test --runInBand
```

This disables parallel execution, making debugging easier.

### Step 8: Check for Side Effects

Ensure tests are isolated and don't affect each other:

```typescript
beforeEach(() => {
  // Reset all mocks
  jest.clearAllMocks();

  // Reset module registry
  jest.resetModules();

  // Clear any global state
});

afterEach(() => {
  // Cleanup after each test
});
```

---

## Troubleshooting Guide

### Container Not Running

**Symptom:**
```bash
$ docker exec -it dev_environment-osd-1 bash
Error: No such container: dev_environment-osd-1
```

**Solution:**
```bash
# Start containers
docker compose up -d

# Verify status
docker compose ps

# If still not working, check logs
docker compose logs osd
```

### Port Conflicts

**Symptom:**
```
Error starting userland proxy: listen tcp4 0.0.0.0:5601: bind: address already in use
```

**Solution:**

**Option 1: Kill Process Using Port**
```bash
# Find process using port 5601
lsof -i :5601

# Kill the process (replace PID with actual process ID)
kill -9 <PID>
```

**Option 2: Change Port in docker-compose.yml**
```yaml
services:
  osd:
    ports:
      - "5602:5601"  # Use port 5602 on host
```

### Memory Issues (OpenSearch)

**Symptom:**
- Container crashes or becomes unresponsive
- OpenSearch shows out-of-memory errors
- Tests hang indefinitely

**Solution:**

**Linux/macOS:**
```bash
# Increase virtual memory
sudo sysctl -w vm.max_map_count=262144

# Make permanent (Linux)
echo "vm.max_map_count=262144" | sudo tee -a /etc/sysctl.conf

# Verify
sysctl vm.max_map_count
```

**Docker Desktop (Windows/Mac):**
- Open Docker Desktop Settings
- Go to Resources → Advanced
- Increase memory to at least 4GB
- Apply & Restart

### Test Failures After Dependency Changes

**Symptom:**
- Tests fail after running `yarn add` or `npm install`
- Import errors or module not found errors
- Tests pass locally but fail in Docker

**Solution:**

**Option 1: Restart OpenSearch Dashboards Server**
```bash
# If OSD is running, stop it (Ctrl+C in the terminal where it's running)
# Then restart:
cd /home/node/kbn
yarn start --no-base-path
```

**Option 2: Rebuild Container**
```bash
# On host machine
docker compose down
docker compose up -d

# Re-enter container and run tests
docker exec -it dev_environment-osd-1 bash
cd /home/node/kbn/plugins/custom_plugin
yarn test
```

### Cache Issues

**Symptom:**
- Tests pass locally but fail in Docker (or vice versa)
- Stale test results
- Tests don't reflect recent code changes

**Solution:**

**Clear Jest Cache:**
```bash
yarn test --clearCache
```

**Clear Node Modules (nuclear option):**
```bash
# Inside container
cd /home/node/kbn/plugins/custom_plugin
rm -rf node_modules
yarn install
yarn test
```

### Permission Errors

**Symptom:**
```
EACCES: permission denied, open '/home/node/kbn/plugins/custom_plugin/coverage/...'
```

**Solution:**

**Inside Container:**
```bash
# Fix ownership (run as root if needed)
chown -R node:node /home/node/kbn/plugins/custom_plugin
```

**On Host Machine:**
```bash
# Fix permissions on src/ directory
cd /Users/juliancorredor/Dev/wazuh/dev_environment
sudo chown -R $(whoami):$(whoami) src/
```

### Missing Dependencies

**Symptom:**
```
Cannot find module '@elastic/eui' from 'src/public/features/todos/ui/TodosPage.tsx'
```

**Solution:**

**Check if Dependency Exists in Core:**
```bash
# Inside container
cd /home/node/kbn
grep "@elastic/eui" package.json
```

**If Not Found, Install in Plugin:**
```bash
cd /home/node/kbn/plugins/custom_plugin
yarn add @elastic/eui
```

**Then Restart Tests:**
```bash
yarn test
```

### Test Timeout Issues

**Symptom:**
```
Timeout - Async callback was not invoked within the 5000 ms timeout
```

**Solution:**

**Increase Global Timeout (in test/config.js):**
```javascript
export default {
  // ...
  testTimeout: 10000, // 10 seconds
};
```

**Increase Specific Test Timeout:**
```typescript
it('should handle slow operation', async () => {
  // test code
}, 15000); // 15 second timeout
```

### OpenSearch Connection Issues

**Symptom:**
- Tests fail with connection errors
- "Unable to connect to OpenSearch" messages

**Solution:**

**Verify OpenSearch is Running:**
```bash
docker compose ps os1
# Should show "Up (healthy)"
```

**Check OpenSearch Health:**
```bash
# From host machine
curl -k -u admin:Wazuh-1234 https://localhost:9200/_cluster/health

# Or from inside osd container
curl -k -u admin:Wazuh-1234 https://os1:9200/_cluster/health
```

**Restart OpenSearch:**
```bash
docker compose restart os1

# Wait for healthy status
docker compose ps os1
```

### Tests Pass Individually But Fail Together

**Symptom:**
- Single test file passes: `yarn test todos.service.test.ts` ✓
- All tests fail: `yarn test` ✗

**Cause**: Test pollution, shared state, or race conditions

**Solution:**

**Run in Band (Sequential):**
```bash
yarn test --runInBand
```

**Ensure Proper Cleanup:**
```typescript
beforeEach(() => {
  jest.clearAllMocks();
  jest.resetModules();
});

afterEach(() => {
  // Cleanup any side effects
});
```

### Module Resolution Errors

**Symptom:**
```
Cannot find module '../../common' from 'src/server/services/todos.service.ts'
```

**Solution:**

**Check tsconfig.json Paths:**
```bash
cat src/tsconfig.json
```

**Verify Import Paths:**
```typescript
// Correct (relative path)
import { Todo } from '../../common/todo/todo.types';

// Incorrect (absolute path not configured)
import { Todo } from 'common/todo/todo.types';
```

### Git-Related Issues in Tests

**Symptom:**
- Watch mode doesn't detect changed files
- `Press o` in watch mode doesn't work

**Cause**: Git not initialized in container

**Solution:**

**Initialize Git (if needed):**
```bash
cd /home/node/kbn/plugins/custom_plugin
git init
git add .
git commit -m "Initial commit"
```

**Or Use Manual Filter:**
```bash
# In watch mode, press 'p' to filter by pattern instead of 'o'
```

---

## Best Practices

### Development Workflow

1. **Always Run Tests Before Committing**
   ```bash
   # Full test suite
   yarn test

   # With coverage to ensure quality
   yarn test --coverage
   ```

2. **Use Watch Mode During Active Development**
   ```bash
   # In one terminal: watch mode
   yarn test --watch

   # In another terminal: develop and save files
   # Tests auto-run on file changes
   ```

3. **Run Tests in Docker, Not Just Locally**
   - OpenSearch Dashboards plugins have specific runtime requirements
   - Docker environment matches production more closely
   - Ensures tests work in CI/CD pipelines

4. **Write Tests Before Fixing Bugs**
   - Write a failing test that reproduces the bug
   - Fix the code until the test passes
   - Regression prevention

5. **Keep Tests Fast**
   - Mock external dependencies (OpenSearch, HTTP clients)
   - Use in-memory data when possible
   - Avoid real network calls in unit tests

### Test Organization

6. **Follow Naming Conventions**
   ```typescript
   // Test files
   todos.service.test.ts       // Server-side
   TodosPage.test.tsx          // Client-side (React)

   // Test descriptions
   describe('TodosService', () => {
     describe('create', () => {
       it('should create a TODO with required fields', () => {
         // Test implementation
       });
     });
   });
   ```

7. **Group Related Tests**
   ```typescript
   describe('TodosService', () => {
     describe('CRUD Operations', () => {
       describe('create', () => { /* create tests */ });
       describe('update', () => { /* update tests */ });
       describe('delete', () => { /* delete tests */ });
     });

     describe('Validation', () => {
       describe('title validation', () => { /* title tests */ });
       describe('tag validation', () => { /* tag tests */ });
     });
   });
   ```

8. **Test One Thing Per Test**
   ```typescript
   // Good - focused test
   it('should validate title length', async () => {
     const longTitle = 'a'.repeat(201);
     await expect(service.create({ title: longTitle }))
       .rejects.toThrow(ValidationError);
   });

   // Bad - testing multiple things
   it('should validate all fields', async () => {
     // Tests title, tags, assignee, etc. all at once
   });
   ```

### Code Quality

9. **Maintain High Coverage**
   - Aim for >90% statement coverage
   - Aim for >85% branch coverage
   - Focus on critical paths first (services, repositories)

10. **Test Edge Cases**
    ```typescript
    // Don't just test the happy path
    it('should handle empty string title', () => { /* ... */ });
    it('should handle null description', () => { /* ... */ });
    it('should handle very long tag names', () => { /* ... */ });
    it('should handle special characters in assignee', () => { /* ... */ });
    ```

11. **Mock External Dependencies**
    ```typescript
    // Mock OpenSearch client
    jest.mock('../repositories/todos.repository');

    // Mock HTTP client
    jest.mock('@elastic/eui/lib/services/http');
    ```

12. **Clean Up After Tests**
    ```typescript
    afterEach(() => {
      jest.clearAllMocks();
    });

    afterAll(() => {
      // Cleanup resources if needed
    });
    ```

### CI/CD Preparation

13. **Ensure Tests Are Deterministic**
    - Avoid relying on current date/time (mock Date)
    - Avoid random values (seed random generators)
    - Avoid flaky network calls (mock all external APIs)

14. **Keep Test Data Isolated**
    ```typescript
    // Good - test data in test file
    const sampleTodo: Todo = {
      id: 'test-123',
      title: 'Test TODO',
      // ...
    };

    // Bad - shared test data across files
    import { sharedTestTodos } from '../fixtures';
    ```

15. **Document Intentionally Skipped Tests**
    ```typescript
    it.skip('should handle concurrent updates', () => {
      // TODO: Implement after adding optimistic locking
      // See issue #123
    });
    ```

### Performance

16. **Parallelize When Possible**
    - Jest runs tests in parallel by default
    - Use `--runInBand` only for debugging

17. **Limit Test Scope**
    ```bash
    # Don't always run ALL tests during development
    # Use patterns to run relevant tests only
    yarn test server/__tests__/todos.service.test.ts
    yarn test -t "create"
    ```

18. **Profile Slow Tests**
    ```bash
    # Identify slow tests
    yarn test --verbose

    # Look for tests taking >1 second
    # Optimize or split into smaller tests
    ```

---

## CI/CD Integration

### GitHub Actions Example

If you set up CI/CD with GitHub Actions, use this workflow:

```yaml
# .github/workflows/test.yml
name: Test

on:
  pull_request:
    branches: [main]
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout code
        uses: actions/checkout@v3

      - name: Set vm.max_map_count
        run: sudo sysctl -w vm.max_map_count=262144

      - name: Start Docker containers
        run: docker compose up -d

      - name: Wait for OpenSearch healthy
        run: |
          timeout 300 bash -c '
            until docker compose ps os1 | grep -q "healthy"; do
              echo "Waiting for OpenSearch..."
              sleep 5
            done
          '

      - name: Run tests
        run: |
          docker exec dev_environment-osd-1 bash -c "
            cd /home/node/kbn/plugins/custom_plugin &&
            yarn test --coverage
          "

      - name: Upload coverage reports
        uses: codecov/codecov-action@v3
        with:
          files: ./src/coverage/lcov.info
          fail_ci_if_error: true

      - name: Stop containers
        if: always()
        run: docker compose down
```

### CI/CD Best Practices

1. **Always Run in Docker**
   - Use the same `docker-compose.yml` as local development
   - Ensures environment parity

2. **Fail on Coverage Drop**
   - Set minimum coverage thresholds
   - Block PRs that reduce coverage

3. **Cache Dependencies**
   ```yaml
   - name: Cache node modules
     uses: actions/cache@v3
     with:
       path: src/node_modules
       key: ${{ runner.os }}-node-${{ hashFiles('src/package.json') }}
   ```

4. **Run Tests in Parallel (if multiple suites)**
   ```yaml
   strategy:
     matrix:
       test-group: [server, client, api]
   ```

5. **Save Test Artifacts**
   ```yaml
   - name: Upload test results
     if: always()
     uses: actions/upload-artifact@v3
     with:
       name: test-results
       path: src/coverage/
   ```

### GitLab CI Example

```yaml
# .gitlab-ci.yml
test:
  image: docker:latest
  services:
    - docker:dind

  before_script:
    - sysctl -w vm.max_map_count=262144
    - docker compose up -d
    - timeout 300 bash -c 'until docker compose ps os1 | grep -q "healthy"; do sleep 5; done'

  script:
    - docker exec dev_environment-osd-1 bash -c "cd /home/node/kbn/plugins/custom_plugin && yarn test --coverage"

  after_script:
    - docker compose down

  coverage: '/All files[^|]*\|[^|]*\s+([\d\.]+)/'

  artifacts:
    reports:
      coverage_report:
        coverage_format: cobertura
        path: src/coverage/cobertura-coverage.xml
    paths:
      - src/coverage/
```

### Local vs CI Differences

**Potential Differences:**
- **Environment Variables**: CI may not have `.env` files
- **Port Availability**: CI runners may use different ports
- **Timing**: CI may be slower (cold start, no cache)
- **Permissions**: CI runs as different user

**Mitigation:**
- Use environment variables for configuration
- Mock time-sensitive operations
- Increase timeouts in CI (if needed)
- Ensure Docker containers run as consistent user

---

## Summary

This guide covered:

- **Environment Setup**: Starting Docker, accessing containers, verifying status
- **Running Tests**: All tests, specific suites, watch mode, coverage
- **Test Suites**: 15 test suites covering server, client, hooks, and API layers
- **Output Interpretation**: Reading test results, identifying failures
- **Coverage Reports**: Understanding metrics, improving coverage
- **Debugging**: Step-by-step troubleshooting for failed tests
- **Troubleshooting**: Common issues and solutions (containers, ports, cache, permissions)
- **Best Practices**: Development workflow, test organization, code quality
- **CI/CD Integration**: GitHub Actions and GitLab CI examples

**Quick Reference Commands:**

```bash
# Start environment
docker compose up -d

# Access container
docker exec -it dev_environment-osd-1 bash
cd /home/node/kbn/plugins/custom_plugin

# Run all tests
yarn test

# Run with coverage
yarn test --coverage

# Watch mode
yarn test --watch

# Specific test file
yarn test server/__tests__/todos.service.test.ts

# Clear cache
yarn test --clearCache

# Stop environment
docker compose down
```

**Expected Test Results:**
- **Test Suites**: 15 passed, 15 total
- **Tests**: 250+ passed, 250+ total
- **Coverage**: >90% statements, >85% branches
- **Duration**: 30-60 seconds (full suite)

For more information, see:
- [Architecture Documentation](./architecture.md)
- [Features Documentation](./features.md)
- [API Reference](./api.md)
- [CLAUDE.md](/Users/juliancorredor/Dev/wazuh/dev_environment/CLAUDE.md)

---

**Maintenance Note**: This documentation should be reviewed and updated whenever:
- New test suites are added
- Testing dependencies are upgraded (Jest, testing-library, etc.)
- Docker configuration changes
- Test expectations change (e.g., new test count threshold)
