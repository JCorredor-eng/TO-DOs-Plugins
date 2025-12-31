# Dashboard Components & UI Architecture

## Table of Contents
1. [Overview](#overview)
2. [Presentational Architecture](#presentational-architecture)
3. [Custom Hooks Reference](#custom-hooks-reference)
4. [Page Components](#page-components)
5. [Table Components](#table-components)
6. [Kanban Board Components](#kanban-board-components)
7. [Filter Components](#filter-components)
8. [Form Components](#form-components)
9. [Chart & Analytics Components](#chart--analytics-components)
10. [Component Library Usage](#component-library-usage)
11. [User Workflows & View Selection](#user-workflows--view-selection)
12. [Developer Experience](#developer-experience)
13. [Testing Strategy](#testing-strategy)

---

## Overview

The TODO Management dashboard provides security professionals with a comprehensive interface for task management, analytics, and compliance tracking. The UI is built following modern React best practices with a **strict separation between presentation and business logic** through the presentational component pattern.

### Target Users
Security operations professionals using the Wazuh platform who need to:
- Track security-related tasks and remediation items
- Monitor compliance framework coverage
- Prioritize work based on severity and priority
- Analyze task completion trends and patterns
- Manage overdue security actions

### Key Design Principles
1. **Presentational Components**: All UI components are pure presentational, receiving props and rendering UI
2. **Custom Hooks for Logic**: All state management, side effects, and business logic live in custom hooks
3. **Clear Separation of Concerns**: Components handle visualization; hooks handle data and interactions
4. **Reusability**: Hooks can be tested independently and reused across components
5. **Maintainability**: Changes to logic don't require modifying component rendering code

---

## Presentational Architecture

### Architecture Overview

The refactored architecture follows a clear three-layer pattern:

```
┌─────────────────────────────────────────────────────────────┐
│                   Presentational Components                  │
│  - Pure functions of props                                   │
│  - No state management (except UI-only state)                │
│  - No side effects or API calls                              │
│  - Focus on rendering and user interaction                   │
└─────────────────────────────────────────────────────────────┘
                            ▲
                            │ data, uiState, actions
                            │
┌─────────────────────────────────────────────────────────────┐
│                      Custom Hooks Layer                      │
│  - Encapsulate all business logic                            │
│  - Manage component state                                    │
│  - Handle side effects (API calls, subscriptions)            │
│  - Return structured objects: { data, uiState, actions }     │
└─────────────────────────────────────────────────────────────┘
                            ▲
                            │ API responses
                            │
┌─────────────────────────────────────────────────────────────┐
│                     API Client Layer                         │
│  - HTTP communication with backend                           │
│  - Request/response handling                                 │
│  - Type-safe API contracts                                   │
└─────────────────────────────────────────────────────────────┘
```

### Benefits of This Architecture

#### 1. Improved Testability
- **Hooks**: Test business logic in isolation without rendering components
- **Components**: Test rendering logic with mock props
- **API Clients**: Mock HTTP layer easily in tests

#### 2. Enhanced Maintainability
- **Single Responsibility**: Each layer has one clear purpose
- **Easier Debugging**: Logic errors are isolated to hooks; rendering issues are in components
- **Refactoring Safety**: Change logic without touching UI; redesign UI without affecting logic

#### 3. Better Developer Experience
- **Clear Structure**: Developers know exactly where to look for logic vs. presentation
- **Reusable Logic**: Hooks can be shared across multiple components
- **Type Safety**: TypeScript interfaces enforce contracts between layers
- **Reduced Cognitive Load**: Components are simpler and easier to understand

#### 4. Code Organization
- **Consistent Patterns**: All components follow the same architectural pattern
- **Predictable Structure**: New developers can quickly understand the codebase
- **Scalability**: Easy to add new features without increasing complexity

---

## Custom Hooks Reference

All custom hooks follow a consistent return structure:

```typescript
{
  data: { ... },        // Computed or fetched data
  uiState: { ... },     // UI state (loading, errors, open/closed states)
  actions: { ... }      // Event handlers and state updaters
}
```

### Core Data Hooks

#### `useTodos`
**Purpose**: Fetches and manages TODO list data with pagination and filtering.

**Location**: `src/public/features/todos/hooks/use_todos.ts`

**Parameters**:
```typescript
{
  client: TodosClient;
  initialParams?: ListTodosQueryParams;
  autoFetch?: boolean;
}
```

**Returns**:
```typescript
{
  todos: Todo[];
  pagination: PaginationMeta | null;
  loading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
  setParams: (params: ListTodosQueryParams) => void;
  params: ListTodosQueryParams;
}
```

**Usage Example**:
```typescript
const { todos, pagination, loading, error, refresh } = useTodos({
  client,
  initialParams: { page: 1, pageSize: 20, sortField: 'createdAt' },
});
```

**Key Features**:
- Automatic data fetching on mount (configurable via `autoFetch`)
- Re-fetches when parameters change
- Handles loading and error states
- Provides manual refresh capability

---

#### `useTodoStats`
**Purpose**: Fetches general statistics about TODO items (status distribution, tag usage).

**Location**: `src/public/features/todos/hooks/use_todo_stats.ts`

**Parameters**:
```typescript
{
  client: TodosClient;
}
```

**Returns**:
```typescript
{
  stats: TodoStats | null;
  loading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
}
```

**Data Provided**:
- Total count of TODOs
- Count by status (planned, done, error)
- Most frequently used tags
- Completion percentages

---

#### `useTodoAnalytics`
**Purpose**: Fetches compliance and security analytics data.

**Location**: `src/public/features/todos/hooks/use_todo_analytics.ts`

**Parameters**:
```typescript
{
  client: TodosClient;
  filters?: { complianceFramework?: string };
}
```

**Returns**:
```typescript
{
  data: AnalyticsStats | null;
  loading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
}
```

**Analytics Included**:
- Compliance framework coverage
- Priority/severity distribution
- Overdue task tracking
- High/critical task counts

---

### CRUD Operation Hooks

#### `useCreateTodo`
**Purpose**: Handles TODO creation with notifications and success callbacks.

**Location**: `src/public/features/todos/hooks/use_create_todo.ts`

**Parameters**:
```typescript
{
  client: TodosClient;
  notifications: NotificationsStart;
  onSuccess?: () => void;
}
```

**Returns**:
```typescript
{
  createTodo: (data: CreateTodoRequest) => Promise<void>;
  loading: boolean;
}
```

**Features**:
- Automatic success/error notifications
- Executes `onSuccess` callback after creation
- Loading state management

---

#### `useUpdateTodo`
**Purpose**: Handles TODO updates with optimistic UI patterns.

**Location**: `src/public/features/todos/hooks/use_update_todo.ts`

**Parameters**:
```typescript
{
  client: TodosClient;
  notifications: NotificationsStart;
  onSuccess?: () => void;
}
```

**Returns**:
```typescript
{
  updateTodo: (id: string, data: UpdateTodoRequest) => Promise<void>;
  loading: boolean;
}
```

---

#### `useDeleteTodo`
**Purpose**: Handles TODO deletion with confirmation workflow.

**Location**: `src/public/features/todos/hooks/use_delete_todo.ts`

**Parameters**:
```typescript
{
  client: TodosClient;
  notifications: NotificationsStart;
  onSuccess?: () => void;
}
```

**Returns**:
```typescript
{
  deleteTodo: (id: string) => Promise<void>;
}
```

---

### UI Coordination Hooks

#### `useTodosPage`
**Purpose**: Orchestrates all state and logic for the main TodosPage component.

**Location**: `src/public/features/todos/hooks/use_todos_page.ts`

**Parameters**:
```typescript
{
  http: HttpSetup;
  notifications: NotificationsStart;
  dateRange?: {
    from: string;  // Relative (e.g., "now-7d") or absolute ISO 8601
    to: string;    // Relative (e.g., "now") or absolute ISO 8601
  };
}
```

**Returns**:
```typescript
{
  data: {
    todos: Todo[];
    pagination: PaginationMeta | null;
    stats: TodoStats | null;
    analytics: AnalyticsStats | null;
    client: TodosClient;
  };
  uiState: {
    selectedTab: 'table' | 'analytics';
    isFormOpen: boolean;
    todoToEdit: Todo | null;
    loading: boolean;
    error: Error | null;
    // ... all filter states
    sortField: TodoSortField;
    sortDirection: 'asc' | 'desc';
  };
  actions: {
    setSelectedTab: (tab: 'table' | 'analytics') => void;
    handleFiltersChange: (filters: {...}) => void;
    handleTableChange: (...) => void;
    handleCreateClick: () => void;
    handleEditClick: (todo: Todo) => void;
    handleFormClose: () => void;
    handleFormSubmit: (data: CreateTodoRequest | UpdateTodoRequest) => Promise<void>;
    deleteTodo: (id: string) => void;
    refreshAnalytics: () => void;
    handleFrameworkFilterChange: (framework?: string) => void;
  };
}
```

**Responsibilities**:
- Coordinates data fetching hooks (`useTodos`, `useTodoStats`, `useTodoAnalytics`)
- Manages CRUD operation hooks (`useCreateTodo`, `useUpdateTodo`, `useDeleteTodo`)
- Maintains filter state (search, status, tags, priorities, severities)
- **Processes date range from TopNavMenu**: Converts relative dates (e.g., "now-7d") to absolute ISO 8601 timestamps using moment.js
- **Applies date filtering**: Maps converted dates to `createdAfter` and `createdBefore` query parameters
- Handles pagination and sorting state
- Manages form modal state (open/closed, edit mode)
- Provides unified actions for child components
- Refreshes related data after CRUD operations

**Date Range Processing**:
```typescript
// Example: Converting relative to absolute dates
// Input from TopNavMenu: { from: "now-7d", to: "now" }
// Converted to: { createdAfter: "2025-12-23T10:30:00.000Z", createdBefore: "2025-12-30T10:30:00.000Z" }
```

**Why This Hook Exists**:
This hook centralizes complex page-level orchestration, keeping the `TodosPage` component purely presentational. It demonstrates the **Container Hook** pattern where a single hook coordinates multiple sub-hooks and handles data transformations (like date range conversion).

---

#### `useKanbanBoard`
**Purpose**: Manages Kanban board business logic including grouping, drag-drop, and status updates.

**Location**: `src/public/features/todos/hooks/use_kanban_board.ts`

**Parameters**:
```typescript
{
  todos: Todo[];
  loading: boolean;
  error: Error | null;
  updateTodo: (id: string, data: { status: TodoStatus }) => Promise<Todo | null>;
  onEdit: (todo: Todo) => void;
  onDelete: (todoId: string) => void;
}
```

**Returns**:
```typescript
{
  data: {
    columns: readonly KanbanColumnData[];  // Pre-grouped todos by status
  };
  uiState: {
    isDragging: boolean;
    hasError: boolean;
    isEmpty: boolean;
  };
  actions: {
    handleDragEnd: (result: DropResult) => Promise<void>;
    handleEdit: (todo: Todo) => void;
    handleDelete: (todoId: string) => void;
  };
}
```

**Responsibilities**:
- Groups todos by status (planned, done, error) using `useMemo` for performance
- Builds column metadata (title, color, droppableId) from status constants
- Handles drag-drop events from `EuiDragDropContext`
- Validates drop targets (ignores drops outside columns or in same column)
- Calls `updateTodo` API to persist status changes
- Delegates edit and delete actions to parent callbacks
- Tracks drag state for potential UI feedback features

**Business Logic Examples**:

Grouping todos by status:
```typescript
const groupedTodos = useMemo(() => {
  const groups: Record<TodoStatus, Todo[]> = {
    planned: [],
    done: [],
    error: [],
  };
  todos.forEach((todo) => {
    if (groups[todo.status]) {
      groups[todo.status].push(todo);
    }
  });
  return groups;
}, [todos]);
```

Handling drag-drop:
```typescript
const handleDragEnd = useCallback(async (result: DropResult) => {
  if (!result.destination) return;  // Dropped outside
  if (result.source.droppableId === result.destination.droppableId) return;  // No change

  await updateTodo(result.draggableId, { status: result.destination.droppableId });
}, [updateTodo]);
```

**Why This Hook Exists**:
Keeps `KanbanBoard` component purely presentational. All grouping logic, drag-drop handling, and API interactions are encapsulated in this hook, following PROJECT RULE #11.

---

#### `useTodosTable`
**Purpose**: Manages table-specific UI state and interactions.

**Location**: `src/public/features/todos/hooks/use_todos_table.ts`

**Parameters**:
```typescript
{
  pagination: PaginationMeta | null;
  sortField: TodoSortField;
  sortDirection: 'asc' | 'desc';
  onDelete: (id: string) => void;
  onTableChange: (page, pageSize, sortField?, sortDirection?) => void;
}
```

**Returns**:
```typescript
{
  data: {
    todoToDelete: Todo | null;
    paginationConfig: EuiTablePagination | undefined;
    sortingConfig: EuiTableSorting;
  };
  actions: {
    handleDeleteClick: (todo: Todo) => void;
    handleDeleteConfirm: () => void;
    handleDeleteCancel: () => void;
    handleTableChange: (criteria: CriteriaWithPagination<Todo>) => void;
  };
}
```

**Responsibilities**:
- Manages delete confirmation modal state
- Converts backend pagination to EUI table format
- Handles table interaction events (pagination, sorting)
- Provides delete workflow (click → confirm → execute)

---

#### `useTodoFilters`
**Purpose**: Manages filter state for status, priority, severity, tags, and overdue filters.

**Location**: `src/public/features/todos/hooks/use_todo_filters.ts`

**Parameters**:
```typescript
{
  searchText?: string;
  selectedStatuses?: TodoStatus[];
  selectedTags?: string[];
  selectedPriorities?: TodoPriority[];
  selectedSeverities?: TodoSeverity[];
  showOverdueOnly?: boolean;
  dateFilters?: DateRangeFilters;  // Kept for backward compatibility but not used in UI
  onFiltersChange: (filters: {...}) => void;
}
```

**Returns**:
```typescript
{
  data: {
    statusOptions: EuiSelectableOption[];
    priorityOptions: EuiSelectableOption[];
    severityOptions: EuiSelectableOption[];
    localSearchText: string;
    localTags: string;
    localShowOverdueOnly: boolean;
    activeFiltersCount: number;
  };
  uiState: {
    isStatusPopoverOpen: boolean;
    isPriorityPopoverOpen: boolean;
    isSeverityPopoverOpen: boolean;
  };
  actions: {
    // Popover toggles
    setIsStatusPopoverOpen: (open: boolean) => void;
    setIsPriorityPopoverOpen: (open: boolean) => void;
    setIsSeverityPopoverOpen: (open: boolean) => void;
    // Filter handlers
    handleSearchChange: (value: string) => void;
    handleStatusChange: (options: EuiSelectableOption[]) => void;
    handlePriorityChange: (options: EuiSelectableOption[]) => void;
    handleSeverityChange: (options: EuiSelectableOption[]) => void;
    handleTagsBlur: () => void;
    handleOverdueToggle: (e: ChangeEvent) => void;
    handleClearAll: () => void;
  };
}
```

**Responsibilities**:
- Manages local state for controlled inputs (search, tags, overdue toggle)
- Controls filter popover visibility
- Builds EUI selectable options from domain types
- Coordinates filter changes (propagates to parent via `onFiltersChange`)
- Tracks active filter counts for UI badges
- Provides clear-all functionality

**Note on Date Filtering**:
Date range filtering was moved from this component to the TopNavMenu date picker. This simplifies the filter panel UI and provides better discoverability. The `dateFilters` parameter is retained for API compatibility but date filtering UI is no longer rendered in the TodoFilters component.

---

#### `useTodoForm`
**Purpose**: Manages form state, validation, and submission for create/edit workflows.

**Location**: `src/public/features/todos/hooks/use_todo_form.ts`

**Parameters**:
```typescript
{
  todo?: Todo | null;
  onSubmit: (data: CreateTodoRequest | UpdateTodoRequest) => Promise<void>;
  client: TodosClient;
}
```

**Returns**:
```typescript
{
  data: {
    isEditMode: boolean;
    suggestedTags: string[];
    suggestedFrameworks: string[];
    statusOptions: SelectOption[];
    priorityOptions: SelectOption[];
    severityOptions: SelectOption[];
  };
  formState: {
    title: string;
    description: string;
    status: TodoStatus;
    assignee: string;
    selectedTags: EuiComboBoxOptionOption[];
    priority: TodoPriority;
    severity: TodoSeverity;
    dueDate: string;
    selectedComplianceFrameworks: EuiComboBoxOptionOption[];
    errors: FormErrors;
  };
  actions: {
    setTitle: (value: string) => void;
    setDescription: (value: string) => void;
    setStatus: (value: TodoStatus) => void;
    setAssignee: (value: string) => void;
    setSelectedTags: (options: EuiComboBoxOptionOption[]) => void;
    setPriority: (value: TodoPriority) => void;
    setSeverity: (value: TodoSeverity) => void;
    setDueDate: (value: string) => void;
    setSelectedComplianceFrameworks: (options: EuiComboBoxOptionOption[]) => void;
    onCreateTag: (searchValue: string) => void;
    onCreateComplianceFramework: (searchValue: string) => void;
    handleSubmit: (e: FormEvent) => Promise<void>;
  };
}
```

**Responsibilities**:
- Initializes form with TODO data (edit mode) or defaults (create mode)
- Syncs form state when `todo` prop changes
- Validates all fields according to business rules
- Builds select options for status, priority, severity
- Fetches suggestions for tags and compliance frameworks
- Differentiates between create and update requests
- Only sends changed fields in update requests (optimization)
- Manages error state for inline validation feedback

**Validation Rules**:
- **Title**: Required, max 256 characters
- **Description**: Optional, max 4000 characters
- **Tags**: Max 20 tags
- **Due Date**: Valid date format
- **Compliance Frameworks**: Max 5 frameworks, each max 100 characters

---

#### `useComplianceDashboard`
**Purpose**: Manages compliance framework filtering on analytics dashboard.

**Location**: `src/public/features/todos/hooks/use_compliance_dashboard.ts`

**Parameters**:
```typescript
{
  data: AnalyticsStats | null;
  onFrameworkChange?: (framework?: string) => void;
}
```

**Returns**:
```typescript
{
  data: {
    selectedFramework: string;
    frameworkOptions: SelectOption[];
  };
  actions: {
    handleFrameworkChange: (e: ChangeEvent<HTMLSelectElement>) => void;
  };
}
```

**Responsibilities**:
- Extracts available frameworks from analytics data
- Builds select options with "All Frameworks" default
- Manages selected framework state
- Propagates changes to parent component

---

#### `useTodosStatsDashboard`
**Purpose**: Transforms raw stats data into pre-computed chart-ready visualizations with percentages and colors.

**Location**: `src/public/features/todos/hooks/use_todos_stats_dashboard.ts`

**Parameters**:
```typescript
{
  stats: TodoStats | null;
  loading: boolean;
  error: Error | null;
}
```

**Returns**:
```typescript
{
  data: {
    total: number;
    planned: number;
    done: number;
    error: number;
  } | null;
  uiState: {
    hasData: boolean;      // True if stats exist and total > 0
    hasTags: boolean;      // True if any tags exist
    hasAssignees: boolean; // True if assignees or unassigned count > 0
  };
  charts: {
    statusDistribution: readonly StatusDistributionItem[];  // With percentages + colors
    topTags: readonly TagChartItem[];                       // With percentages
    assignees: readonly AssigneeChartItem[];                // With percentages
    unassignedItem: AssigneeChartItem | null;               // With percentage
  };
}
```

**Responsibilities**:
- Extracts summary statistics from `TodoStats` API response
- Calculates percentages for all chart data (status, tags, assignees)
- Maps status color names (e.g., "success") to hex values (e.g., "#00BFB3")
- Determines UI state flags for conditional rendering
- Pre-computes all data so chart components are purely presentational
- Uses `useMemo` extensively to prevent unnecessary re-computation

**Data Transformation Examples**:

Calculating status distribution with percentages:
```typescript
const statusDistribution = useMemo(() => {
  if (!stats || stats.total === 0) return [];

  return (Object.keys(stats.byStatus) as TodoStatus[]).map((status) => {
    const count = stats.byStatus[status];
    const percentage = Math.round((count / stats.total) * 100);
    const color = mapStatusColorToHex(TODO_STATUS_COLORS[status]);

    return { status, count, percentage, color };
  });
}, [stats]);
```

Calculating tag percentages:
```typescript
const topTags = useMemo(() => {
  if (!stats || !stats.topTags) return [];

  return stats.topTags.map((tagCount) => ({
    tag: tagCount.tag,
    count: tagCount.count,
    percentage: Math.round((tagCount.count / stats.total) * 100),
  }));
}, [stats]);
```

**Why This Hook Exists**:
Keeps `TodosStatsDashboard` and all chart components purely presentational. All business logic (percentage calculations, color mapping) is isolated in this hook. Chart components receive data ready for rendering, following PROJECT RULE #11.

---

### Helper Hooks

#### `useTodoSuggestions`
**Purpose**: Fetches autocomplete suggestions for tags and compliance frameworks.

**Location**: `src/public/features/todos/hooks/use_todo_suggestions.ts`

**Returns**:
```typescript
{
  tags: string[];
  complianceFrameworks: string[];
}
```

**Usage**: Used by `useTodoForm` to provide ComboBox suggestions based on existing data.

---

## Page Components

### CustomPluginApp (Application Root)
**Location**: `src/public/components/app.tsx`

**Purpose**: Root application component that provides top-level navigation and routing.

**Props**:
```typescript
{
  basename: string;
  notifications: CoreStart['notifications'];
  http: CoreStart['http'];
  navigation: NavigationPublicPluginStart;
}
```

**State Management**:
```typescript
const [dateRange, setDateRange] = useState({
  from: 'now-7d',  // Default: Last 7 days
  to: 'now',
});
```

**Component Structure**:
```typescript
<Router basename={basename}>
  <CustomI18nProvider>
    <navigation.ui.TopNavMenu
      appName={PLUGIN_ID}
      showSearchBar={false}
      showDatePicker={true}
      dateRangeFrom={dateRange.from}
      dateRangeTo={dateRange.to}
      onQuerySubmit={handleQuerySubmit}
      useDefaultBehaviors={true}
    />
    <Switch>
      <Route path="/todos">
        <TodosPage
          http={http}
          notifications={notifications}
          dateRange={dateRange}
        />
      </Route>
    </Switch>
  </CustomI18nProvider>
</Router>
```

**TopNavMenu Configuration**:
- **Date Picker**: Enabled (`showDatePicker={true}`)
- **Search Bar**: Disabled (`showSearchBar={false}`)
- **Default Range**: "Last 7 days" (now-7d to now)
- **Date Range Formats**: Supports both relative (e.g., "now-7d") and absolute (ISO 8601) dates
- **Update Behavior**: `handleQuerySubmit` updates state when user changes date range

**User Value**:
- **Always Visible Filtering**: Date range picker always displayed in top navigation
- **Standard UX Pattern**: Consistent with OpenSearch Dashboards and Wazuh platform conventions
- **Quick Access**: Common date filtering operations require minimal clicks
- **Professional Appearance**: Uses native OSD TopNavMenu component

**Developer Notes**:
- Date range state managed at app level (above TodosPage)
- Date range passed as prop to child components
- TopNavMenu is a platform component (not custom-built)
- Search bar disabled because search is provided in TodoFilters component

---

### TodosPage
**Location**: `src/public/features/todos/ui/TodosPage.tsx`

**Purpose**: Main container component for the entire TODO management interface.

**Props**:
```typescript
{
  http: HttpSetup;
  notifications: NotificationsStart;
  dateRange?: {
    from: string;
    to: string;
  };
}
```

**Hook Used**: `useTodosPage`

**Component Structure**:
```typescript
const { data, uiState, actions } = useTodosPage({ http, notifications, dateRange });

// Destructure for clarity
const { todos, pagination, stats, analytics, client } = data;
const { selectedTab, isFormOpen, todoToEdit, loading, error, ... } = uiState;
const { setSelectedTab, handleFiltersChange, handleTableChange, ... } = actions;
```

**Date Range Handling**:
- Receives `dateRange` prop from parent (`CustomPluginApp`)
- Passed to `useTodosPage` hook for processing
- Hook converts relative dates (e.g., "now-7d") to absolute ISO 8601 timestamps using moment.js
- Applied as `createdAfter` and `createdBefore` filters to TODO query

**Rendering Logic**:
1. **Page Header**: Title, description, language selector, create button
2. **Tabbed Interface**:
   - **Table View Tab**:
     - `<TodoFilters />` - Filter controls (status, priority, severity, tags, overdue)
     - Error callout (if error exists)
     - Empty prompt (if no TODOs and not loading)
     - `<TodosTable />` - Main data table
   - **Kanban Board Tab**:
     - `<TodoFilters />` - Same filter controls as Table view
     - Error callout (if error exists)
     - Empty prompt (if no TODOs and not loading)
     - `<KanbanBoard />` - Drag-and-drop board with status columns
   - **Analytics Tab**:
     - General Statistics section with `<TodosStatsDashboard />`
     - Compliance & Security Analytics section with `<ComplianceDashboard />`
3. **Form Modal**: `<TodoForm />` (conditionally rendered when `isFormOpen` is true)

**EUI Components Used**:
- `EuiPage`, `EuiPageBody`, `EuiPageContent`, `EuiPageContentBody`
- `EuiPageHeader` - Page title and actions
- `EuiTabbedContent` - Tab navigation
- `EuiButton` - Create TODO button
- `EuiCallOut` - Error display
- `EuiEmptyPrompt` - Empty state
- `EuiSpacer` - Spacing control

**User Value**:
- **Single Entry Point**: All TODO management in one place
- **Context Switching**: Easy switch between table view, Kanban board, and analytics
- **Workflow Flexibility**: Choose view based on task (detailed review vs. active management vs. reporting)
- **Quick Actions**: Create button always visible in header
- **Date-Based Filtering**: Works seamlessly with TopNavMenu date picker
- **Error Feedback**: Clear error messages guide users when issues occur
- **Empty State Guidance**: Helpful prompts when starting fresh
- **Filter Persistence**: Filters remain active when switching between Table and Kanban views

**Developer Notes**:
- This component is **purely presentational** - all logic is in `useTodosPage`
- Props are clearly separated into data, uiState, and actions
- Date range filtering logic is in the hook, not the component
- Tab content is defined declaratively
- Internationalization using `<FormattedMessage />` throughout

---

## Table Components

### TodosTable
**Location**: `src/public/features/todos/ui/TodosTable.tsx`

**Purpose**: Displays TODO items in a sortable, paginated table with inline actions.

**Props**:
```typescript
{
  todos: Todo[];
  pagination: PaginationMeta | null;
  loading: boolean;
  sortField?: TodoSortField;
  sortDirection?: 'asc' | 'desc';
  onEdit: (todo: Todo) => void;
  onDelete: (id: string) => void;
  onTableChange: (page, pageSize, sortField?, sortDirection?) => void;
}
```

**Hook Used**: `useTodosTable`

**Table Columns**:

| Column | Field | Width | Sortable | Description |
|--------|-------|-------|----------|-------------|
| **Title** | `title` | 25% | Yes | Bold title with description below in subdued color |
| **Status** | `status` | 10% | Yes | Color-coded badge (default/success/danger) |
| **Tags** | `tags` | 15% | No | First 3 tags shown, "+N" badge if more exist |
| **Assignee** | `assignee` | 12% | No | User assigned to task, "-" if empty |
| **Created** | `createdAt` | 12% | Yes | Relative time ("2 days ago") |
| **Updated** | `updatedAt` | 12% | Yes | Relative time |
| **Completed** | `completedAt` | 12% | Yes | Formatted date or "-" if not completed |
| **Due Date** | `dueDate` | 12% | Yes | Formatted date, marked red if overdue |
| **Actions** | - | 100px | No | Edit and Delete icon buttons |

**Sortable Fields**:
- `title`
- `status`
- `createdAt`
- `updatedAt`
- `completedAt`
- `dueDate`

All sorting is **server-side** for optimal performance with large datasets.

**Pagination Configuration**:
- Page sizes: 10, 20, 50, 100 items
- Shows current page, total items, and page navigation
- Server-side pagination for scalability

**Actions**:
1. **Edit**: Opens TODO in form modal for editing
2. **Delete**: Opens confirmation modal, then deletes TODO

**Confirmation Modal**:
- Displays when delete action is clicked
- Shows TODO title being deleted
- Warning that action cannot be undone
- Confirm/Cancel buttons

**Formatters and Utilities**:

```typescript
// Relative time formatting
formatRelativeTime(dateString: string): string
// Examples: "just now", "5 minutes ago", "3 hours ago", "2 days ago"

// Date formatting
formatDate(dateString: string): string
// Example: "Dec 30, 2025"

// Overdue detection
isOverdue(dueDateString: string): boolean
// Returns true if due date is in the past and status is not 'done'
```

**EUI Components Used**:
- `EuiBasicTable` - Main table component with pagination and sorting
- `EuiBadge` - Status and tag badges
- `EuiFlexGroup`, `EuiFlexItem` - Tag layout
- `EuiText` - Text formatting
- `EuiConfirmModal` - Delete confirmation

**User Value**:
- **At-a-Glance Status**: Color-coded status badges
- **Rich Information**: Title + description in one column saves space
- **Time Awareness**: Relative timestamps show recency; absolute dates for completion
- **Overdue Visibility**: Red highlighting for overdue tasks
- **Efficient Navigation**: Large page sizes for power users; small for focused work
- **Safe Deletion**: Confirmation prevents accidental data loss

**Developer Notes**:
- Table state (pagination, sorting, delete modal) managed by `useTodosTable` hook
- All user interactions delegate to parent via callbacks
- Formatters are co-located with component (could be extracted if reused)
- Internationalization for all column headers and action labels

---

## Kanban Board Components

The Kanban board provides an alternative, visual workflow-oriented view for managing TODO items. It enables drag-and-drop task management across status columns, making it ideal for security teams following Agile or Kanban workflows.

### KanbanBoard (Container)
**Location**: `src/public/features/todos/ui/KanbanBoard.tsx`

**Purpose**: Main container for the Kanban board view with drag-and-drop functionality.

**Props**:
```typescript
{
  todos: Todo[];                                    // All todos to display (filtered by parent)
  loading: boolean;                                 // Loading state from parent
  error: Error | null;                              // Error state from parent
  onStatusChange: (todoId: string, status: TodoStatus) => Promise<void>;  // Status update handler
  onEdit: (todo: Todo) => void;                    // Edit callback
  onDelete: (todoId: string) => void;              // Delete callback
}
```

**Hook Used**: `useKanbanBoard`

**Component Structure**:
```typescript
const { data, uiState, actions } = useKanbanBoard({
  todos,
  loading,
  error,
  updateTodo,
  onEdit,
  onDelete,
});

<EuiDragDropContext onDragEnd={actions.handleDragEnd}>
  <EuiFlexGroup>
    {data.columns.map((column) => (
      <KanbanColumn key={column.status} {...column} />
    ))}
  </EuiFlexGroup>
</EuiDragDropContext>
```

**Column Configuration**:
The board displays four columns, one for each status:

| Column | Status | Color | Icon | Purpose |
|--------|--------|-------|------|---------|
| **Planned** | `planned` | Primary (Blue) | - | Tasks that are scheduled or pending |
| **In Progress** | `in_progress` | Warning (Orange) | - | Tasks currently being worked on |
| **Done** | `done` | Success (Green) | - | Tasks that have been completed |
| **Error** | `error` | Danger (Red) | - | Tasks that failed or encountered issues |

**Visual Layout**:
```
┌────────────────┬────────────────┬────────────────┬────────────────┐
│   PLANNED      │  IN PROGRESS   │     DONE       │     ERROR      │
│   (Blue)       │   (Orange)     │   (Green)      │    (Red)       │
│   Count: 8     │   Count: 3     │   Count: 12    │   Count: 2     │
├────────────────┼────────────────┼────────────────┼────────────────┤
│ ┌────────────┐ │ ┌────────────┐ │ ┌────────────┐ │ ┌────────────┐ │
│ │[≡] Task 1  │ │ │[≡] Task 5  │ │ │[≡] Task 9  │ │ │[≡] Task 13 │ │
│ │  Priority  │ │ │  Priority  │ │ │  Priority  │ │ │  Priority  │ │
│ │  Severity  │ │ │  Severity  │ │ │  Severity  │ │ │  Severity  │ │
│ │  Tags      │ │ │  Tags      │ │ │  Tags      │ │ │  Tags      │ │
│ │  Assignee  │ │ │  Assignee  │ │ │  Assignee  │ │ │  Assignee  │ │
│ │  Due Date  │ │ │  Due Date  │ │ │  Due Date  │ │ │  Due Date  │ │
│ │ [Edit][Del]│ │ │ [Edit][Del]│ │ │ [Edit][Del]│ │ │ [Edit][Del]│ │
│ └────────────┘ │ └────────────┘ │ └────────────┘ │ └────────────┘ │
│ ┌────────────┐ │ ┌────────────┐ │ ┌────────────┐ │ ┌────────────┐ │
│ │[≡] Task 2  │ │ │[≡] Task 6  │ │ │[≡] Task 10 │ │ │[≡] Task 14 │ │
│ │   ...      │ │ │   ...      │ │ │   ...      │ │ │   ...      │ │
│ └────────────┘ │ └────────────┘ │ └────────────┘ │ └────────────┘ │
│      ...       │      ...       │      ...       │      ...       │
└────────────────┴────────────────┴────────────────┴────────────────┘

[≡] = Drag handle icon
Drag any card to any column to change its status
```

**Drag-and-Drop Behavior**:
1. **Initiate Drag**: User clicks and holds the drag handle icon (grab icon) on the left side of a card
2. **Visual Feedback**: Card becomes semi-transparent, cursor changes to "grabbing"
3. **Drop Zones**: All four columns are valid drop targets
4. **Status Transitions**: Any task can be moved to any column - the system supports all status transitions:
   - `planned` → `in_progress` (start working on a task)
   - `in_progress` → `done` (complete a task)
   - `in_progress` → `error` (mark a task as failed or blocked)
   - `error` → `planned` (reset and reschedule a failed task)
   - `error` → `in_progress` (retry a failed task)
   - `done` → `planned` or `in_progress` (reopen a completed task)
   - Any other combination is allowed for maximum workflow flexibility
5. **Status Update Process**: On drop, the following occurs:
   - Card immediately moves to the new column (optimistic UI update)
   - API call is made to update the task status in the backend
   - If successful: Success toast notification is displayed
   - If failed: Card reverts to original column, error toast is displayed
   - All data is refreshed (todos list, statistics, analytics charts)
6. **Same Column Drop**: If a card is dropped in the same column it started from, no API call is made

**Loading State**:
- Displays centered `EuiLoadingSpinner` (size XL) while initial data loads
- Partial loading (e.g., during status update) shows inline spinners on affected cards

**Empty State**:
Each empty column displays an `EuiEmptyPrompt` with:
- Icon: `visTable`
- Title: "No {status} tasks"
- Body: "Drag tasks here or create new ones"

**EUI Components Used**:
- `EuiDragDropContext` - Top-level drag-drop provider
- `EuiFlexGroup`, `EuiFlexItem` - Responsive column layout
- `EuiLoadingSpinner` - Loading state
- `EuiSpacer` - Spacing control

**User Value for Security Professionals**:
- **Visual Workflow Management**: See task distribution across all 4 statuses (Planned, In Progress, Done, Error) at a glance
- **Quick Status Updates**: Drag-and-drop eliminates multi-click edit workflows (no need to open edit form just to change status)
- **Complete Task Lifecycle**: Four-column layout maps to real-world security workflows (plan → execute → complete → handle failures)
- **WIP Limit Awareness**: "In Progress" column makes active work visible; identify bottlenecks and overcommitment
- **Team Collaboration**: Shared board view promotes transparency; everyone sees who's working on what
- **Error Visibility**: Dedicated "Error" column highlights blocked or failed tasks requiring team intervention
- **Touch-Friendly**: Works on tablets for operations center displays and wall-mounted monitors
- **Real-Time Updates**: Status changes propagate immediately to backend; all viewers see updates
- **Multilingual Support**: Column titles and messages support English and Spanish for global teams

**Developer Notes**:
- All business logic (grouping by status, drag handlers) is in `useKanbanBoard` hook
- Component is purely presentational
- Drag-drop library: `@elastic/eui` (built on `react-beautiful-dnd`)
- Status update triggers full data refresh (todos, stats, analytics)
- Minimum column width: 320px for readability

---

### KanbanColumn
**Location**: `src/public/features/todos/ui/components/KanbanColumn.tsx`

**Purpose**: Displays a single status column with droppable area for task cards.

**Props**:
```typescript
{
  status: TodoStatus;          // Status value (planned/in_progress/done/error)
  title: string;               // Internationalized display title for header
  color: string;               // EUI color for visual accent
  todos: readonly Todo[];      // Todos in this column
  droppableId: string;         // Unique ID for drag-drop library
  onEdit: (todo: Todo) => void;       // Edit callback
  onDelete: (todoId: string) => void; // Delete callback
}
```

**Column Header**:
- Title with count badge: "Planned (5)"
- Size: `xs` (EuiTitle)
- Count updates dynamically as tasks move

**Droppable Area**:
- Component: `EuiDroppable`
- Spacing: `m` (medium) between cards
- Min Height: 400px (prevents collapse when empty)
- Flex Growth: Expands to fill available vertical space

**Card Rendering**:
Each TODO item is wrapped in an `EuiDraggable` component:
```typescript
<EuiDraggable
  key={todo.id}
  draggableId={todo.id}
  index={index}
  customDragHandle={true}      // Card itself is not draggable
  hasInteractiveChildren={true} // Allow button clicks within card
>
  {(provided) => (
    <KanbanCard
      todo={todo}
      onEdit={onEdit}
      onDelete={onDelete}
      dragHandleProps={provided.dragHandleProps}
    />
  )}
</EuiDraggable>
```

**Empty Column State**:
- Icon: `visTable`
- Title: "No {status} tasks"
- Body: "Drag tasks here or create new ones"
- Size: `xs` (EuiEmptyPrompt)

**EUI Components Used**:
- `EuiPanel` - Column container with border
- `EuiTitle` - Column header
- `EuiDroppable` - Drop target area
- `EuiDraggable` - Draggable card wrapper
- `EuiEmptyPrompt` - Empty state

**User Value**:
- **Status Visibility**: Column headers show task counts per status across all 4 columns
- **Clear Organization**: Visual separation between planned, in-progress, completed, and error states
- **Drag-and-Drop**: Intuitive interaction for status transitions
- **Empty State Guidance**: Helpful prompts when columns are empty
- **Internationalization**: Column titles and messages support multiple languages (English/Spanish)

**Developer Notes**:
- Purely presentational component (no hooks)
- Receives pre-grouped todos from parent
- Drag-drop handlers managed by parent `EuiDragDropContext`
- Responsive min-height ensures usability on small screens

---

### KanbanCard
**Location**: `src/public/features/todos/ui/components/KanbanCard.tsx`

**Purpose**: Displays a single TODO item as a draggable card with rich metadata.

**Props**:
```typescript
{
  todo: Todo;                    // Todo item to display
  index: number;                 // Index for drag-drop ordering
  onEdit: (todo: Todo) => void;  // Edit callback
  onDelete: (todoId: string) => void; // Delete callback
  dragHandleProps?: any;         // Drag handle props from EuiDraggable
}
```

**Card Layout**:

```
┌─────────────────────────────────────────────────────┐
│ [Grab Icon] │ Title (bold, 2-line truncate)        │
│             │ Description (subdued, 3-line trunc)  │
│             │                                       │
│             │ [Priority] [Severity] [Tag1] [Tag2]  │
│             │ [+N more tags]                        │
│             │                                       │
│             │ [User Icon] assignee                  │
│             │ [Calendar Icon] due date (red if     │
│             │                        overdue)       │
│───────────────────────────────────────────────────┤
│             │                            [Edit]    │
│             │                            [Delete]  │
└─────────────────────────────────────────────────────┘
```

**Card Sections**:

#### 1. Drag Handle
- **Icon**: `grab` (EuiIcon)
- **Color**: Subdued
- **Tooltip**: "Drag to move TODO"
- **Cursor**: `grab` (changes to `grabbing` when dragging)
- **Position**: Left side, aligned to top

#### 2. Title
- **Styling**: Bold, size `xxs` (h4)
- **Truncation**: 2 lines with ellipsis (CSS `-webkit-line-clamp`)
- **Use Case**: Quick task identification

#### 3. Description
- **Styling**: Subdued color, size `xs`
- **Truncation**: 3 lines with ellipsis
- **Conditional**: Only shown if description exists
- **Use Case**: Additional context without opening full details

#### 4. Metadata Badges
**Priority Badge**:
- Colors: `default` (low), `primary` (medium), `warning` (high), `danger` (critical)
- Labels: "Low", "Medium", "High", "Critical"
- Always visible

**Severity Badge**:
- Colors: `default` (low), `primary` (medium), `warning` (high), `danger` (critical)
- Labels: "Low", "Medium", "High", "Critical"
- Always visible

**Tags**:
- Display: First 3 tags as `hollow` color badges
- Truncation: If more than 3 tags, show "+N" badge with tooltip
- Tooltip: "N more tags"
- Wrapping: `EuiFlexGroup` with `wrap` and `responsive={false}`

#### 5. Assignee
- **Icon**: `user` (size `s`, subdued)
- **Display**: Assignee name in small, subdued text
- **Conditional**: Only shown if assignee is set
- **Layout**: Icon + text in horizontal flex group

#### 6. Due Date
- **Icon**: `calendar` (size `s`)
- **Color**: Red if overdue, subdued otherwise
- **Format**: "MMM D, YYYY" (e.g., "Dec 30, 2025")
- **Overdue Label**: Appends "(Overdue)" in red if past due and status ≠ 'done'
- **Overdue Detection**: `moment(dueDate).isBefore(moment(), 'day')`
- **Conditional**: Only shown if due date is set

#### 7. Action Buttons
**Edit Button**:
- Icon: `pencil`
- Color: Primary
- Size: `s`
- Position: Top-right corner
- Action: Opens TODO in edit form

**Delete Button**:
- Icon: `trash`
- Color: Danger
- Size: `s`
- Position: Below edit button
- Action: Triggers delete confirmation modal

**Date Formatters**:
```typescript
// Due date formatting
const formattedDueDate = useMemo(() => {
  if (!todo.dueDate) return null;
  return moment(todo.dueDate).format('MMM D, YYYY');
}, [todo.dueDate]);

// Overdue detection
const isOverdue = useMemo(() => {
  if (!todo.dueDate || todo.status === 'done') return false;
  return moment(todo.dueDate).isBefore(moment(), 'day');
}, [todo.dueDate, todo.status]);
```

**EUI Components Used**:
- `EuiPanel` - Card container (small padding, border, no shadow)
- `EuiFlexGroup`, `EuiFlexItem` - Layout and spacing
- `EuiIcon` - Icons for drag handle, user, calendar
- `EuiTitle` - Title text
- `EuiText` - Description and metadata text
- `EuiBadge` - Priority, severity, tags
- `EuiButtonIcon` - Edit and delete buttons
- `EuiToolTip` - Tooltips for drag handle and extra tags
- `EuiSpacer` - Vertical spacing

**User Value for Security Professionals**:
- **At-a-Glance Information**: All critical metadata visible without clicking
- **Priority/Severity Awareness**: Color-coded badges for quick risk assessment
- **Overdue Highlighting**: Red text and icon draw attention to urgent tasks
- **Tag Categorization**: Quick identification of task type (e.g., "Firewall", "Compliance")
- **Assignee Visibility**: Know who owns each task in shared team boards
- **Efficient Actions**: Edit and delete without navigating away
- **Touch-Friendly**: Large drag handle and action buttons for tablet use

**Developer Notes**:
- Pure presentational component with memoized computed values
- All date calculations use `moment` for consistent formatting
- Truncation uses CSS `-webkit-line-clamp` for graceful overflow
- Custom drag handle prevents accidental drags when clicking card content
- `hasInteractiveChildren={true}` on `EuiDraggable` allows button clicks
- All user actions delegate to parent via callbacks

---

### useKanbanBoard Hook
**Location**: `src/public/features/todos/hooks/use_kanban_board.ts`

**Purpose**: Encapsulates Kanban board business logic including grouping, drag-drop handling, and status updates.

**Parameters**:
```typescript
{
  todos: Todo[];                     // All todos (filtered by parent)
  loading: boolean;                  // Loading state
  error: Error | null;               // Error state
  updateTodo: (id: string, data: { status: TodoStatus }) => Promise<Todo | null>;
  onEdit: (todo: Todo) => void;      // Edit callback
  onDelete: (todoId: string) => void; // Delete callback
}
```

**Returns**:
```typescript
{
  data: {
    columns: readonly KanbanColumnData[];  // Column metadata + grouped todos
  };
  uiState: {
    isDragging: boolean;   // True during drag operation
    hasError: boolean;     // True if error exists
    isEmpty: boolean;      // True if no todos
  };
  actions: {
    handleDragEnd: (result: DropResult) => Promise<void>;  // Drag-drop handler
    handleEdit: (todo: Todo) => void;        // Edit handler
    handleDelete: (todoId: string) => void;  // Delete handler
  };
}
```

**Business Logic**:

#### 1. Grouping Todos by Status
```typescript
const groupedTodos = useMemo(() => {
  const groups: Record<TodoStatus, Todo[]> = {
    planned: [],
    in_progress: [],
    done: [],
    error: [],
  };
  todos.forEach((todo) => {
    if (groups[todo.status]) {
      groups[todo.status].push(todo);
    }
  });
  return groups;
}, [todos]);
```

#### 2. Building Column Metadata
```typescript
const columns = useMemo((): readonly KanbanColumnData[] => {
  return TODO_STATUS_VALUES.map((status) => ({
    status,
    title: i18n.translate(`customPlugin.status.${status}`, {
      defaultMessage: status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' '),
    }),                                    // Internationalized: "Planned", "In Progress", "Done", "Error"
    color: TODO_STATUS_COLORS[status],     // EUI color names (primary/warning/success/danger)
    droppableId: status,                   // Unique ID for drag-drop
    todos: groupedTodos[status],           // Pre-filtered todos
    count: groupedTodos[status].length,    // Todo count for header
  }));
}, [groupedTodos]);
```

#### 3. Handling Drag-and-Drop
```typescript
const handleDragEnd = useCallback(async (result: DropResult) => {
  setIsDragging(false);

  // Dropped outside droppable area
  if (!result.destination) return;

  const sourceStatus = result.source.droppableId as TodoStatus;
  const destStatus = result.destination.droppableId as TodoStatus;

  // No status change
  if (sourceStatus === destStatus) return;

  const todoId = result.draggableId;

  try {
    // Update status via API
    await updateTodo(todoId, { status: destStatus });
    // Note: updateTodo hook handles:
    // - Loading state
    // - Success toast
    // - Data refresh (todos, stats, analytics)
  } catch (err) {
    // Error toast shown by updateTodo hook
    console.error('Failed to update todo status:', err);
  }
}, [updateTodo]);
```

**Memoization Strategy**:
- All computed values are memoized with `useMemo` to prevent unnecessary re-renders
- Callbacks use `useCallback` to maintain referential equality
- Dependencies are carefully tracked to ensure updates when data changes

**User Value**:
- **Instant Feedback**: Optimistic UI updates make drag-drop feel responsive
- **Error Recovery**: Failed status updates revert card to original column
- **Background Refresh**: Related data (stats, analytics) refreshes after status change
- **Performance**: Memoization prevents lag when board has many cards

**Developer Notes**:
- Hook follows PROJECT RULE #11 (business logic in hooks, not components)
- Returns UI-friendly contract: `{ data, uiState, actions }`
- All side effects (API calls) are handled via `updateTodo` hook
- Drag state tracking enables future features (e.g., visual feedback during drag)

---

### Kanban Board Internationalization (i18n)

The Kanban board components fully support internationalization using OpenSearch Dashboards' i18n framework (`@osd/i18n` and `@osd/i18n/react`). This enables security teams to use the board in their preferred language.

**Supported Languages**:
- English (default)
- Spanish

**Internationalized Elements**:

#### 1. Column Titles
Column titles are dynamically translated based on the user's locale:

```typescript
import { i18n } from '@osd/i18n';

const title = i18n.translate(`customPlugin.status.${status}`, {
  defaultMessage: status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' '),
});
```

**Translation Keys**:
- `customPlugin.status.planned` → "Planned" (EN) / "Planificado" (ES)
- `customPlugin.status.in_progress` → "In Progress" (EN) / "En Progreso" (ES)
- `customPlugin.status.done` → "Done" (EN) / "Completado" (ES)
- `customPlugin.status.error` → "Error" (EN) / "Error" (ES)

#### 2. Empty State Messages
Empty column prompts are internationalized using `FormattedMessage`:

```typescript
import { FormattedMessage } from '@osd/i18n/react';

<FormattedMessage
  id="customPlugin.kanban.column.empty.title"
  defaultMessage="No {status} tasks"
  values={{ status: title.toLowerCase() }}
/>

<FormattedMessage
  id="customPlugin.kanban.column.empty.body"
  defaultMessage="Drag tasks here or create new ones"
/>
```

#### 3. Card Action Tooltips and Labels
All interactive elements have internationalized labels:

```typescript
// Drag handle tooltip
<FormattedMessage
  id="customPlugin.kanban.card.dragToMove"
  defaultMessage="Drag to move TODO"
/>

// Extra tags tooltip
<FormattedMessage
  id="customPlugin.kanban.card.moreTags"
  defaultMessage="{count} more tags"
  values={{ count: remainingTagsCount }}
/>

// Overdue indicator
<FormattedMessage
  id="customPlugin.kanban.card.overdue"
  defaultMessage="Overdue"
/>

// Edit button aria-label
i18n.translate('customPlugin.kanban.card.edit', {
  defaultMessage: 'Edit TODO',
})

// Delete button aria-label
i18n.translate('customPlugin.kanban.card.delete', {
  defaultMessage: 'Delete TODO',
})
```

**Language Selection**:
Users can change their language preference through OpenSearch Dashboards' global settings:
1. Navigate to Stack Management → Advanced Settings
2. Search for "Locale" or "Language"
3. Select preferred language (e.g., `en` or `es`)
4. Reload the page to apply changes

**Benefits for International Teams**:
- **Reduced Training Time**: Security teams can use the board in their native language
- **Accessibility**: Meets localization requirements for global enterprises
- **Consistency**: Follows OpenSearch Dashboards' i18n patterns
- **Extensibility**: Easy to add new languages by providing translation files
- **Fallback Handling**: If a translation is missing, the default English message is displayed

**Developer Notes**:
- All user-facing strings use `i18n.translate()` or `<FormattedMessage />`
- No hardcoded English strings in JSX
- Translation keys follow the pattern: `customPlugin.[component].[element].[property]`
- Parameterized messages (e.g., "{count} more tags") use the `values` prop for dynamic content
- Accessibility labels (`aria-label`) are also internationalized for screen reader support

---

## Filter Components

### TodoFilters
**Location**: `src/public/features/todos/ui/TodoFilters.tsx`

**Purpose**: Comprehensive filtering interface with search, multi-select filters, and date ranges.

**Props**:
```typescript
{
  searchText?: string;
  selectedStatuses?: TodoStatus[];
  selectedTags?: string[];
  selectedPriorities?: TodoPriority[];
  selectedSeverities?: TodoSeverity[];
  showOverdueOnly?: boolean;
  dateFilters?: DateRangeFilters;
  onFiltersChange: (filters: {...}) => void;
}
```

**Hook Used**: `useTodoFilters`

**Filter Controls**:

#### 1. Full-Text Search
- **Type**: `EuiFieldSearch`
- **Width**: Flexible (min 300px)
- **Behavior**: Instant search (no debounce by default)
- **Scope**: Searches title and description fields
- **Clearable**: Yes

#### 2. Status Filter
- **Type**: `EuiFilterButton` with `EuiPopover` + `EuiSelectable`
- **Options**: Planned, Done, Error
- **Multi-Select**: Yes
- **Badge**: Shows count of selected statuses
- **Active Indicator**: Highlighted when filters applied

#### 3. Priority Filter
- **Type**: `EuiFilterButton` with `EuiPopover` + `EuiSelectable`
- **Options**: Low, Medium, High, Critical
- **Multi-Select**: Yes
- **Badge**: Shows count of selected priorities

#### 4. Severity Filter
- **Type**: `EuiFilterButton` with `EuiPopover` + `EuiSelectable`
- **Options**: Low, Medium, High, Critical
- **Multi-Select**: Yes
- **Badge**: Shows count of selected severities

#### 5. Tags Filter
- **Type**: `EuiFieldText`
- **Input**: Comma-separated tag list
- **Behavior**: Applies on blur (to avoid partial queries)
- **Logic**: AND logic (must match all specified tags)

#### 6. Overdue Toggle
- **Type**: `EuiSwitch`
- **Behavior**: Shows only tasks with `dueDate` in the past and status ≠ 'done'

#### 7. Clear All Filters Button
- **Type**: `EuiFilterButton` with "cross" icon
- **Visibility**: Only shown when `activeFiltersCount > 0`
- **Action**: Resets all filters to default state

**Note on Date Filtering**:
Date range filtering is handled by the TopNavMenu date picker (see [CustomPluginApp](#custompluginapp-application-root) section above). The date picker is always visible in the top navigation bar and filters TODOs by creation date. This design decision improves discoverability and follows standard security application UX patterns.

**Filter State Management**:
- **Local State**: Controlled inputs maintain local state for immediate UI feedback
- **Parent Sync**: Changes propagate to parent via `onFiltersChange` callback
- **Active Count**: Dynamically calculated based on applied filters

**EUI Components Used**:
- `EuiFieldSearch` - Search input
- `EuiFilterGroup` - Groups filter buttons
- `EuiFilterButton` - Filter buttons with badges
- `EuiPopover` - Filter dropdown containers
- `EuiSelectable` - Multi-select lists
- `EuiFieldText` - Tag input
- `EuiSwitch` - Overdue toggle

**User Value for Security Professionals**:
- **Multi-Dimensional Filtering**: Combine search, status, priority, severity, tags simultaneously
- **Date-Based Analysis**: Filter by creation date range via TopNavMenu (always visible)
- **Overdue Focus**: Quickly isolate urgent, overdue items
- **Tag-Based Organization**: Filter by security frameworks or categorization tags
- **Clear Feedback**: Active filter badges show applied filters at a glance
- **Easy Reset**: One-click clear for starting fresh

**Developer Notes**:
- All filter logic is in `useTodoFilters` hook
- Component is purely presentational
- Date filters use Moment.js for date handling
- Filter changes reset pagination to page 1 (handled by parent)
- Internationalization throughout

---

## Form Components

### TodoForm
**Location**: `src/public/features/todos/ui/TodoForm.tsx`

**Purpose**: Flyout modal for creating new TODOs or editing existing ones.

**Props**:
```typescript
{
  todo?: Todo | null;
  loading?: boolean;
  onSubmit: (data: CreateTodoRequest | UpdateTodoRequest) => Promise<void>;
  onClose: () => void;
  client: TodosClient;
}
```

**Hook Used**: `useTodoForm`

**Modal Type**: `EuiFlyout` (side panel, medium size)

**Form Fields**:

| Field | Type | Required | Max Length | Default | Validation |
|-------|------|----------|------------|---------|------------|
| **Title** | Text | Yes | 256 chars | - | Required, length check |
| **Description** | TextArea | No | 4000 chars | - | Length check |
| **Status** | Select | Yes | - | 'planned' | One of: planned, done, error |
| **Tags** | ComboBox | No | 20 tags | [] | Max count, suggestions |
| **Assignee** | Text | No | 100 chars | - | - |
| **Priority** | Select | Yes | - | 'medium' | One of: low, medium, high, critical |
| **Severity** | Select | Yes | - | 'low' | One of: low, medium, high, critical |
| **Due Date** | Date | No | - | - | Valid date format |
| **Compliance Frameworks** | ComboBox | No | 5 items | [] | Max count, max item length |

**Field Details**:

#### Title
- **Help Text**: "Required. Maximum 256 characters."
- **Error Display**: Inline validation error below field
- **Validation**: Real-time on submit, not on every keystroke

#### Description
- **Component**: `EuiTextArea` with 6 rows
- **Help Text**: "Optional. Maximum 4000 characters."
- **Use Case**: Detailed task information, remediation steps, notes

#### Status
- **Options**: Planned, Done, Error
- **Labels**: Internationalized status labels
- **Default**: 'planned' for new TODOs

#### Tags
- **Component**: `EuiComboBox` with suggestions
- **Suggestions**: Fetched from existing TODOs via `useTodoSuggestions`
- **Creation**: Press Enter to create new tags
- **Help Text**: "Optional. Press Enter to create a new tag. Maximum 20 tags."
- **Use Case**: Categorization (e.g., "SIEM", "Firewall", "Compliance")

#### Assignee
- **Placeholder**: "e.g., john.doe"
- **Help Text**: "Optional. Maximum 100 characters."
- **Use Case**: Task ownership tracking

#### Priority
- **Options**: Low, Medium, High, Critical
- **Help Text**: "Priority level for task execution."
- **Use Case**: Work prioritization for security analysts

#### Severity
- **Options**: Low, Medium, High, Critical
- **Help Text**: "Impact level of the task."
- **Use Case**: Risk assessment and prioritization

#### Due Date
- **Component**: Native date picker (`<input type="date">`)
- **Help Text**: "Optional. Target completion date."
- **Overdue Detection**: Tasks with past due dates are highlighted in table

#### Compliance Frameworks
- **Component**: `EuiComboBox` with suggestions
- **Suggestions**: Fetched from existing TODOs
- **Creation**: Press Enter to add new frameworks
- **Help Text**: "Optional. Press Enter to add. Maximum 5 frameworks."
- **Examples**: "PCI-DSS", "ISO-27001", "NIST-800-53", "HIPAA"
- **Use Case**: Track compliance coverage and requirements

**Form Modes**:

#### Create Mode
- **Trigger**: Click "Create TODO" button in page header
- **Title**: "Create TODO"
- **Submit Button**: "Create TODO" with plus icon
- **Behavior**: All fields start empty (defaults applied)

#### Edit Mode
- **Trigger**: Click edit icon in table row
- **Title**: "Edit TODO"
- **Submit Button**: "Save Changes" with save icon
- **Behavior**: Form pre-populated with existing TODO data
- **Optimization**: Only sends changed fields to backend

**Form Actions**:

1. **Submit**:
   - Validates all fields
   - Shows inline errors if validation fails
   - Calls `onSubmit` with data
   - Parent handles API call and success actions
   - Loading state disables submit button

2. **Cancel**:
   - Closes flyout without saving
   - No confirmation needed (could add if form is dirty)

**Validation Errors**:
- Displayed inline below each field
- Red border on invalid fields
- Error messages are internationalized
- Validation runs on submit, not on blur (to avoid annoyance)

**EUI Components Used**:
- `EuiFlyout`, `EuiFlyoutHeader`, `EuiFlyoutBody`, `EuiFlyoutFooter`
- `EuiForm`, `EuiFormRow`
- `EuiFieldText`, `EuiTextArea`
- `EuiSelect` - Dropdown selects
- `EuiComboBox` - Tag and framework selectors
- `EuiButton`, `EuiButtonEmpty` - Form actions

**User Value**:
- **Comprehensive Data Entry**: Capture all relevant task metadata in one form
- **Smart Suggestions**: Tag and framework suggestions speed up data entry
- **Flexible Categorization**: Support for multiple tags and compliance frameworks
- **Validation Feedback**: Clear error messages guide correct data entry
- **Efficient Editing**: Only changed fields are sent to server

**Developer Notes**:
- Form state and validation logic in `useTodoForm` hook
- Component is purely presentational
- Form synchronizes with `todo` prop via `useEffect`
- Suggestions are fetched on mount via `useTodoSuggestions`
- Edit mode detects changes and sends minimal update payload

---

## Chart & Analytics Components

### TodosStatsDashboard
**Location**: `src/public/features/todos/ui/TodosStatsDashboard.tsx`

**Purpose**: Container component for general statistics dashboard with multiple chart visualizations.

**Props**:
```typescript
{
  stats: TodoStats | null;
  loading: boolean;
  error: Error | null;
}
```

**Hook Used**: `useTodosStatsDashboard`

**Component Structure**:
```typescript
const { data, uiState, charts } = useTodosStatsDashboard({ stats, loading, error });

// Rendering:
<StatsSummaryCards total={data.total} planned={data.planned} done={data.done} error={data.error} />
<StatusDistributionChart items={charts.statusDistribution} />
{uiState.hasTags && <TopTagsChart items={charts.topTags} />}
{uiState.hasAssignees && <AssigneeDistributionChart assignees={charts.assignees} unassigned={charts.unassignedItem} />}
```

**Visualizations** (in order):

#### 1. Summary Statistics Cards
Component: `<StatsSummaryCards />`
- Four stat cards in horizontal layout
- Displays: Total, Planned, Done, Error counts
- Color-coded by status (primary, default, success, danger)

#### 2. Status Distribution Chart
Component: `<StatusDistributionChart />`
- Horizontal progress bars showing percentage completion
- Displays count and percentage for each status
- Color-coded bars match status colors

#### 3. Top Tags Chart
Component: `<TopTagsChart />`
- Horizontal bar chart of most used tags
- Shows count and percentage for each tag
- Only rendered if tags exist

#### 4. Assignee Distribution Chart
Component: `<AssigneeDistributionChart />`
- Horizontal bar chart of task distribution by assignee
- Includes unassigned tasks count
- Only rendered if assignees exist

**State Handling**:

**Loading State**:
- `EuiLoadingChart` (size XL) centered in panel
- Minimum height: 400px

**Error State**:
- `EuiEmptyPrompt` with danger icon
- Title: "Failed to Load Statistics"
- Displays error message

**Empty State**:
- `EuiEmptyPrompt` with chart icon
- Title: "No Statistics Available"
- Body: "Create some TODO items to see statistics"

**User Value for Security Professionals**:
- **Quick Overview**: Four stat cards provide instant workload snapshot
- **Status Visibility**: Visual progress bars show completion rates
- **Tag Insights**: Identify most common categorizations (e.g., "Firewall", "SIEM")
- **Workload Distribution**: See how tasks are distributed across team members
- **Unassigned Awareness**: Track tasks that need assignment
- **Completion Tracking**: Monitor percentage of done vs. planned tasks

**Developer Notes**:
- Container component delegates all logic to `useTodosStatsDashboard` hook
- Hook pre-computes percentages, colors, and formats data for charts
- Chart components are purely presentational (receive pre-computed data)
- Conditional rendering based on `uiState` flags (hasTags, hasAssignees)
- All chart components use consistent color theming from `constants/theme.ts`

---

### StatsSummaryCards
**Location**: `src/public/features/todos/ui/components/StatsSummaryCards.tsx`

**Purpose**: Displays four summary stat cards showing total and status breakdown counts.

**Props**:
```typescript
{
  readonly total: number;
  readonly planned: number;
  readonly done: number;
  readonly error: number;
}
```

**Rendering**:
```
┌──────────────┬──────────────┬──────────────┬──────────────┐
│   Total      │   Planned    │     Done     │    Error     │
│     42       │      15      │      20      │       7      │
│  (Primary)   │  (Default)   │  (Success)   │   (Danger)   │
└──────────────┴──────────────┴──────────────┴──────────────┘
```

**Card Layout**:
- **Component**: `EuiStat` inside `EuiPanel`
- **Title**: Count number (large, color-coded)
- **Description**: Label text
- **Alignment**: Center
- **Colors**:
  - Total: `primary` (blue)
  - Planned: `TODO_STATUS_COLORS.planned` (default blue)
  - Done: `TODO_STATUS_COLORS.done` (success green)
  - Error: `TODO_STATUS_COLORS.error` (danger red)

**EUI Components Used**:
- `EuiFlexGroup` - Horizontal layout
- `EuiFlexItem` - Equal-width columns
- `EuiPanel` - Card containers
- `EuiStat` - Stat display

**User Value**:
- **At-a-Glance Metrics**: Four key numbers visible without scrolling
- **Color Coding**: Status colors provide visual context
- **Balanced Layout**: Equal card widths create visual harmony
- **Print-Friendly**: Clean layout works well in reports

**Developer Notes**:
- Pure presentational component (no hooks)
- Receives pre-computed counts from parent
- Uses constants from `common/todo/todo.types.ts` for colors
- Internationalized labels via `i18n.translate()`

---

### StatusDistributionChart
**Location**: `src/public/features/todos/ui/components/StatusDistributionChart.tsx`

**Purpose**: Visualizes status distribution with horizontal progress bars.

**Props**:
```typescript
{
  readonly items: readonly StatusDistributionItem[];
}

interface StatusDistributionItem {
  status: TodoStatus;
  count: number;
  percentage: number;  // Pre-computed by hook
  color: string;       // Hex color (pre-computed by hook)
}
```

**Rendering Example**:
```
Status Distribution
───────────────────────────────────────────
Planned     15 (36%)  [████████░░░░░░░░░░░░]
Done        20 (48%)  [███████████░░░░░░░░░]
Error        7 (16%)  [████░░░░░░░░░░░░░░░░]
```

**Chart Layout**:
For each status item:
1. **Badge**: Status label with color (Planned/Done/Error)
2. **Count + Percentage**: "15 (36%)" in bold
3. **Progress Bar**:
   - Width: 120px (from `CHART_SIZES.progressBarWidth`)
   - Height: 8px (from `CHART_SIZES.progressBarHeight`)
   - Background: Light gray (`CHART_COLORS.background`)
   - Fill: Status color (pre-computed, mapped to hex)
   - Border radius: 4px

**EUI Components Used**:
- `EuiPanel` - Chart container
- `EuiTitle` - Chart title
- `EuiFlexGroup`, `EuiFlexItem` - Layout
- `EuiBadge` - Status labels
- `EuiText` - Count/percentage display
- `EuiSpacer` - Spacing

**Data Flow**:
```
TodoStats (API) → useTodosStatsDashboard hook → Pre-computed items → Component
                  ├─ Calculate percentages
                  ├─ Map status colors to hex
                  └─ Format display data
```

**User Value**:
- **Visual Comparison**: Progress bars allow quick comparison of status distribution
- **Precise Numbers**: Count and percentage provide exact metrics
- **Color Association**: Colors match status badges throughout app
- **Compact Display**: All three statuses visible without scrolling

**Developer Notes**:
- Pure presentational component (receives pre-computed data)
- Hook handles all percentage calculations and color mapping
- Uses theme constants for consistent styling
- Badge colors use conditional logic based on status labels

---

### TopTagsChart
**Location**: `src/public/features/todos/ui/components/TopTagsChart.tsx`

**Purpose**: Displays most frequently used tags as horizontal bar charts.

**Props**:
```typescript
{
  readonly items: readonly TagChartItem[];
}

interface TagChartItem {
  tag: string;
  count: number;
  percentage: number;  // Pre-computed by hook
}
```

**Rendering Example**:
```
Top Tags
───────────────────────────────────────────────────────
firewall      12 (29%)  ████████████████████░░░░░░░░░░
compliance     8 (19%)  ████████████░░░░░░░░░░░░░░░░░░
siem           5 (12%)  ████████░░░░░░░░░░░░░░░░░░░░░░
```

**Chart Layout**:
For each tag item:
1. **Tag Badge**: Tag name in hollow badge (min-width: 120px)
2. **Horizontal Bar**:
   - Width: 100% (flexible)
   - Height: 24px
   - Background: Light gray (`CHART_COLORS.background`)
   - Fill: Primary blue (`CHART_COLORS.primary`)
   - Border radius: 4px
3. **Count Label**: Overlaid on bar
   - Format: "12 (29%)"
   - Position: Left-aligned, 8px from edge
   - Color: White if percentage > 50%, black otherwise (for contrast)
   - Font size: 12px, weight: 600

**Empty State**:
If no tags exist, component returns `null` (no rendering).

**EUI Components Used**:
- `EuiPanel` - Chart container
- `EuiTitle` - Chart title
- `EuiFlexGroup`, `EuiFlexItem` - Layout
- `EuiBadge` - Tag labels (hollow color)
- `EuiSpacer` - Spacing

**User Value**:
- **Tag Usage Insights**: Identify most common categorization patterns
- **Trending Topics**: See which security areas have most activity
- **Normalization Hints**: Spot tag variations that could be consolidated
- **Coverage Gaps**: Missing tags might indicate uncategorized work
- **Reporting**: Export data for management reporting

**Developer Notes**:
- Pure presentational component (receives pre-computed percentages)
- Hook limits to top 10 tags (backend aggregation)
- Bar fill percentage drives width via inline style
- Text color switches based on bar fill to ensure readability
- Uses theme constants from `constants/theme.ts`

---

### AssigneeDistributionChart
**Location**: `src/public/features/todos/ui/components/AssigneeDistributionChart.tsx`

**Purpose**: Shows task distribution across team members with separate unassigned count.

**Props**:
```typescript
{
  readonly assignees: readonly AssigneeChartItem[];
  readonly unassigned: AssigneeChartItem | null;
}

interface AssigneeChartItem {
  assignee: string;
  count: number;
  percentage: number;  // Pre-computed by hook
}
```

**Rendering Example**:
```
Assignee Distribution
──────────────────────────────────────────────────────────
john.doe      10 (24%)  ████████████████░░░░░░░░░░░░░░
jane.smith     8 (19%)  ████████████░░░░░░░░░░░░░░░░░░
bob.jones      5 (12%)  ████████░░░░░░░░░░░░░░░░░░░░░░
Unassigned     3 (7%)   ████░░░░░░░░░░░░░░░░░░░░░░░░░░
```

**Chart Layout**:
For each assignee:
1. **Assignee Badge**: Username in primary badge (min-width: 150px)
2. **Horizontal Bar**: Same styling as TopTagsChart
   - Fill color: Primary blue (`CHART_COLORS.primary`)
3. **Count Label**: "10 (24%)" overlaid on bar

For unassigned tasks:
1. **Badge**: "Unassigned" in default (gray) badge
2. **Bar Fill**: Gray (`CHART_COLORS.empty`)
3. **Count Label**: Same format

**Empty State**:
If no assignees and no unassigned tasks, component returns `null`.

**EUI Components Used**:
- `EuiPanel` - Chart container
- `EuiTitle` - Chart title
- `EuiFlexGroup`, `EuiFlexItem` - Layout
- `EuiBadge` - Assignee labels (primary for assigned, default for unassigned)
- `EuiSpacer` - Spacing

**User Value for Security Teams**:
- **Workload Balancing**: Identify team members with disproportionate task loads
- **Capacity Planning**: See who has bandwidth for new assignments
- **Unassigned Tracking**: Ensure all tasks have clear ownership
- **Team Performance**: Monitor task distribution for equity
- **Resource Allocation**: Data-driven assignment decisions

**Developer Notes**:
- Pure presentational component (receives pre-computed percentages)
- Hook calculates percentages relative to total TODOs (not total assigned)
- Unassigned item is optional (null if no unassigned tasks)
- Uses theme constants for consistent colors
- Bar text color adapts for readability (white on dark, black on light)

---

### ComplianceDashboard
**Location**: `src/public/features/todos/ui/ComplianceDashboard.tsx`

**Purpose**: Advanced analytics for compliance and security task management.

**Props**:
```typescript
{
  data: AnalyticsStats | null;
  loading: boolean;
  error: Error | null;
  onRefresh: () => void;
  onFrameworkChange?: (framework?: string) => void;
}
```

**Hook Used**: `useComplianceDashboard`

**Dashboard Header**:
- **Framework Filter**: Dropdown to filter by specific compliance framework
- **Refresh Button**: Manually refresh analytics data
- **Summary Panel**: Total tasks and last updated timestamp

**Visualizations** (2x2 Grid):

#### 1. Compliance Framework Coverage
- **Component**: `<ComplianceFrameworkChart />`
- **Type**: Pie or donut chart
- **Data**: Distribution of TODOs across compliance frameworks
- **Metrics**: Count per framework, percentage
- **Use Case**: Identify framework coverage gaps

#### 2. Overdue Tasks Table
- **Component**: `<OverdueTasksTable />`
- **Type**: Compact table
- **Data**: TODOs past their due date (status ≠ 'done')
- **Columns**: Title, Priority, Severity, Due Date, Days Overdue
- **Use Case**: Urgent action items requiring immediate attention

#### 3. Priority/Severity Heatmap
- **Component**: `<PrioritySeverityHeatmap />`
- **Type**: 4x4 matrix heatmap
- **Axes**: Priority (Low→Critical) vs. Severity (Low→Critical)
- **Color**: Heat intensity based on task count
- **Use Case**: Risk assessment and resource allocation

#### 4. High/Critical Tasks Chart
- **Component**: `<HighCriticalTasksChart />`
- **Type**: Stacked bar chart
- **Data**: Count of high and critical priority tasks by status
- **Use Case**: Track urgent task completion

**Responsive Layout**: `EuiFlexGroup` with `responsive` prop for mobile support

**User Value for Security Teams**:
- **Compliance Tracking**: Ensure all frameworks have adequate coverage
- **Risk Prioritization**: Heatmap identifies high-priority, high-severity tasks
- **Overdue Awareness**: Critical for security incident response
- **Framework Filtering**: Focus analytics on specific compliance requirements
- **Actionable Insights**: Data supports decision-making on resource allocation

**Developer Notes**:
- Framework filter state managed by `useComplianceDashboard`
- Child chart components are presentational, receiving data as props
- Responsive grid layout adapts to screen size
- All charts could be extracted to separate documentation if needed

---

### Individual Chart Components

#### ComplianceFrameworkChart
**Location**: `src/public/features/todos/ui/ComplianceFrameworkChart.tsx`

**Visualization**: Compliance framework distribution chart

**Props**: `{ data: ComplianceCoverageData[] }`

**Data Format**: `[{ framework: string, count: number }, ...]`

---

#### OverdueTasksTable
**Location**: `src/public/features/todos/ui/OverdueTasksTable.tsx`

**Visualization**: Compact table of overdue tasks

**Props**: `{ data: OverdueTask[] }`

**Columns**: Title, Priority, Severity, Due Date, Days Overdue

**Sorting**: Sortable by priority, severity, days overdue

---

#### PrioritySeverityHeatmap
**Location**: `src/public/features/todos/ui/PrioritySeverityHeatmap.tsx`

**Visualization**: 4x4 heatmap matrix

**Props**: `{ matrixData: PrioritySeverityMatrix }`

**Data Format**: `{ [priority: string]: { [severity: string]: number } }`

**Color Scale**: Gradient from light (few tasks) to dark (many tasks)

---

#### HighCriticalTasksChart
**Location**: `src/public/features/todos/ui/HighCriticalTasksChart.tsx`

**Visualization**: Stacked bar chart of high/critical tasks

**Props**: `{ data: PriorityDistribution }`

**Bars**: Grouped by status (planned, done, error), stacked by priority level

---

## Component Library Usage

The dashboard exclusively uses components from the **Elastic UI (@elastic/eui)** framework to ensure consistency with the OpenSearch Dashboards platform.

### Core Layout Components

| Component | Usage | Purpose |
|-----------|-------|---------|
| `EuiPage` | Page wrapper | Full-page container with max width |
| `EuiPageBody` | Page content | Main content area |
| `EuiPageHeader` | Page header | Title, description, actions |
| `EuiPageContent` | Content container | Card-style content wrapper |
| `EuiFlexGroup` | Flexbox container | Responsive layouts |
| `EuiFlexItem` | Flex item | Flexible grid items |
| `EuiSpacer` | Spacing | Consistent vertical spacing |
| `EuiPanel` | Panel container | Bordered/colored containers |

### Data Display Components

| Component | Usage | Purpose |
|-----------|-------|---------|
| `EuiBasicTable` | TODO list table | Sortable, paginated table |
| `EuiText` | Text display | Styled text with color variants |
| `EuiBadge` | Status, tags | Color-coded labels |
| `EuiLoadingChart` | Loading state | Spinner for chart data |
| `EuiEmptyPrompt` | Empty states | Guided prompts when no data |
| `EuiCallOut` | Errors, warnings | Alert-style messages |

### Form Components

| Component | Usage | Purpose |
|-----------|-------|---------|
| `EuiFlyout` | Form modal | Slide-out panel for forms |
| `EuiForm` | Form container | Semantic form wrapper |
| `EuiFormRow` | Form field row | Label, help text, error display |
| `EuiFieldText` | Text input | Single-line text fields |
| `EuiTextArea` | Multiline input | Description fields |
| `EuiSelect` | Dropdown | Status, priority, severity selectors |
| `EuiComboBox` | Multi-select | Tags, frameworks with autocomplete |
| `EuiSwitch` | Toggle | Overdue filter toggle |
| `EuiDatePicker` | Date input | Date range filters |

### Filter Components

| Component | Usage | Purpose |
|-----------|-------|---------|
| `EuiFieldSearch` | Search input | Full-text search |
| `EuiFilterGroup` | Filter group | Groups filter buttons |
| `EuiFilterButton` | Filter button | Filter with badge count |
| `EuiPopover` | Filter dropdown | Container for filter options |
| `EuiSelectable` | Multi-select list | Checkbox list for filters |
| `EuiAccordion` | Collapsible section | Date filters accordion |

### Action Components

| Component | Usage | Purpose |
|-----------|-------|---------|
| `EuiButton` | Primary actions | Create, submit, refresh |
| `EuiButtonEmpty` | Secondary actions | Cancel, clear filters |
| `EuiConfirmModal` | Delete confirmation | Confirmation dialog |

### Navigation Components

| Component | Usage | Purpose |
|-----------|-------|---------|
| `TopNavMenu` | Top navigation bar | Date range picker and global controls (from `@osd/navigation`) |
| `EuiTabbedContent` | Tab navigation | Switch between table, Kanban, and analytics |

### Drag-and-Drop Components

| Component | Usage | Purpose |
|-----------|-------|---------|
| `EuiDragDropContext` | Kanban board wrapper | Top-level drag-drop provider with `onDragEnd` handler |
| `EuiDroppable` | Kanban column | Drop target area for draggable cards |
| `EuiDraggable` | Kanban card wrapper | Makes TODO cards draggable with custom handle |

### Typography Components

| Component | Usage | Purpose |
|-----------|-------|---------|
| `EuiTitle` | Section titles | Hierarchical headings |
| `EuiText` | Body text | Descriptions, labels |

### Why @elastic/eui?

1. **Platform Consistency**: Matches OpenSearch Dashboards core UI
2. **Accessibility**: WCAG 2.1 AA compliant components
3. **Responsive Design**: Mobile-friendly out of the box
4. **Theming Support**: Respects light/dark mode preferences
5. **Internationalization**: Built-in i18n support
6. **Documentation**: Comprehensive component docs and examples
7. **Maintenance**: Actively maintained by Elastic

---

## User Workflows & View Selection

The TODO Management dashboard provides three distinct views, each optimized for different user workflows and operational contexts. Security professionals can switch between views using the tabbed interface based on their current task focus.

### View Selection Guide

#### When to Use Table View

**Best For**:
- Detailed data review and analysis
- Multi-criteria filtering and sorting
- Bulk data export or reporting
- Precise timestamp tracking
- Viewing full task descriptions

**Key Features**:
- 8 sortable columns with server-side sorting
- Advanced filtering (status, priority, severity, tags, overdue)
- Pagination controls (10/20/50/100 items per page)
- Relative timestamps ("2 days ago") for recent activity
- Inline edit and delete actions

**Typical User Scenarios**:
1. **Daily Task Review**: Security analyst starts shift, sorts by updated date descending, reviews recent changes
2. **Overdue Investigation**: Toggle "Show Overdue Only", sort by due date, identify urgent tasks
3. **Compliance Audit**: Filter by tags (e.g., "PCI-DSS"), export to Excel, generate compliance report
4. **Team Workload Check**: Filter by assignee, review task distribution across team members
5. **Tag Cleanup**: Search for similar tags, identify duplicates, standardize naming

**Performance Characteristics**:
- Scales to thousands of items with server-side pagination
- Efficient for data-heavy operations
- Optimized for keyboard navigation (tab, arrow keys)

---

#### When to Use Kanban Board

**Best For**:
- Active task management and workflow
- Visual status tracking
- Quick status transitions
- Team standup meetings
- Operations center displays
- Agile sprint management

**Key Features**:
- Four-column layout (Planned, In Progress, Done, Error)
- Drag-and-drop status updates with full workflow flexibility
- Rich card metadata (priority, severity, tags, assignee, due date)
- Overdue highlighting on cards (red calendar icon and text)
- Real-time visual feedback and instant API synchronization
- Internationalization support (English/Spanish)

**Typical User Scenarios**:

1. **Daily Standup**:
   - Team gathers around screen, reviews all four columns
   - Analysts discuss tasks in "In Progress" column (what we're working on)
   - Identify blocked tasks in "Error" column for team assistance
   - Pull new tasks from "Planned" to "In Progress" to balance workload

2. **Task Lifecycle Management**:
   - Analyst identifies task in "Planned" column
   - Drags task to "In Progress" to signal work has started
   - Upon completion, drags to "Done" column
   - If issues arise, drags to "Error" for escalation or troubleshooting

3. **Incident Response Workflow**:
   - New firewall incident arrives → Create card in "Planned"
   - Assign to on-call engineer
   - Engineer drags to "In Progress" when starting investigation
   - Moves to "Done" when resolved, or "Error" if escalation needed

4. **Blocked Task Management**:
   - Task hits roadblock → Drag to "Error" column
   - Add comment in description explaining the blocker
   - Team member with expertise reviews "Error" column
   - Once unblocked, drag back to "In Progress" or "Planned"

5. **Sprint Planning**:
   - Review "Planned" column for upcoming sprint candidates
   - Drag high-priority cards to "In Progress" to start sprint
   - Monitor "In Progress" to enforce WIP limits
   - Review "Done" at sprint end for velocity calculation

6. **Workflow Corrections**:
   - Task marked "Done" prematurely → Drag back to "In Progress"
   - Failed task needs retry → Drag from "Error" to "In Progress"
   - Reset task completely → Drag from "Error" or "Done" to "Planned"

**Performance Characteristics**:
- Optimized for up to ~100 visible cards (pagination recommended for larger datasets)
- Instant visual feedback on drag-drop (optimistic UI updates)
- Touch-friendly for tablet use in operations centers
- Ideal for shared displays (large monitors, projectors, wall-mounted screens)
- Responsive layout adapts to screen size

**Kanban Workflow Best Practices**:

1. **Limit WIP (Work in Progress)**:
   - Keep "In Progress" column manageable (≤ 5 active tasks per analyst)
   - Prevents context switching and improves focus
   - Visual indicator: If "In Progress" column is very tall, reduce active tasks

2. **Clear Column Definitions**:
   - **Planned**: Backlog items ready to be started (prioritized, assigned, have enough detail)
   - **In Progress**: Active work currently being executed
   - **Done**: Completed, verified, and ready to close or archive
   - **Error**: Blocked, failed, or requiring escalation/help

3. **Status Transition Rules**:
   - Standard flow: Planned → In Progress → Done
   - For failures: In Progress → Error
   - For retry: Error → In Progress
   - For reset: Error → Planned
   - For reopening: Done → In Progress (if issue found during verification)

4. **Regular Grooming**:
   - Archive or delete "Done" tasks weekly to keep board clean
   - Review "Error" column daily to unblock tasks quickly
   - Reprioritize "Planned" column based on changing threats

5. **Visual Scanning Tips**:
   - Use color coding (priority badges: critical=red, high=orange) to spot urgent tasks
   - Look for red calendar icons to identify overdue tasks
   - Monitor column counts in headers (e.g., "In Progress (12)") to track workload

6. **Internationalization**:
   - Set team's preferred language in OpenSearch Dashboards settings
   - Column titles, tooltips, and messages adapt automatically
   - Useful for multinational security operations centers

---

#### When to Use Analytics View

**Best For**:
- Management reporting
- Trend analysis and forecasting
- Capacity planning
- Compliance coverage tracking
- Team performance reviews

**Key Features**:
- Summary stat cards (total, planned, done, error)
- Status distribution progress bars
- Top tags bar chart
- Assignee distribution chart
- Compliance framework coverage (in Compliance section)
- Priority/severity heatmap (in Compliance section)
- Overdue tasks table (in Compliance section)

**Typical User Scenarios**:
1. **Weekly Manager Standup**: Manager reviews status distribution, checks completion rate (Done %)
2. **Quarterly Compliance Review**: Security officer reviews framework coverage, ensures all frameworks have tasks
3. **Resource Allocation**: Team lead reviews assignee distribution, identifies overloaded analysts
4. **Tag Normalization**: Admin reviews top tags, spots "firewall" and "firewalls" duplication
5. **Risk Assessment**: Analyst reviews priority/severity heatmap, focuses on high-priority + high-severity quadrant
6. **Overdue Escalation**: Manager reviews overdue tasks table, escalates tasks overdue > 7 days

**Analytics Insights**:
- **Status Distribution**: Healthy balance is ~60% Done, ~30% Planned, ~10% Error
- **Assignee Distribution**: Look for 20-30% variance; > 50% indicates workload imbalance
- **Top Tags**: Top 3 tags should represent ~50%+ of all tasks; long tail indicates poor categorization
- **Unassigned Count**: Target < 10% unassigned; higher indicates assignment backlog

**Refresh Behavior**:
- General Statistics: Auto-refreshes when TODOs are created/updated/deleted
- Compliance Analytics: Manual refresh via "Refresh" button (computationally expensive)

---

### View Transition Workflows

Security professionals often switch views during task execution. Common patterns:

#### Pattern 1: Triage → Execute → Report
1. **Start in Table View**: Filter by priority=high, severity=critical, sort by created date
2. **Switch to Kanban**: Drag high-priority tasks from "Planned" to "Done" as work progresses
3. **Switch to Analytics**: Review completion stats, generate weekly report for manager

#### Pattern 2: Planning → Monitoring → Review
1. **Start in Kanban**: Groom board, move tasks from backlog to "Planned"
2. **Monitor in Kanban**: Throughout day, update status via drag-drop
3. **End-of-Day in Analytics**: Review completion trends, identify blockers (high "Error" count)

#### Pattern 3: Audit → Cleanup → Verify
1. **Start in Analytics**: Review top tags, spot duplication ("pci" vs "PCI-DSS")
2. **Switch to Table**: Filter by tag, bulk update tags via edit form
3. **Return to Analytics**: Refresh, verify tag consolidation succeeded

---

### Filtering Across Views

All three views share the same filter controls (via `TodoFilters` component):
- **Full-text search**: Searches title and description
- **Status filter**: Multi-select (Planned, Done, Error)
- **Priority filter**: Multi-select (Low, Medium, High, Critical)
- **Severity filter**: Multi-select (Low, Medium, High, Critical)
- **Tags filter**: Comma-separated AND logic
- **Overdue toggle**: Show only overdue tasks
- **Date range**: TopNavMenu date picker (filters by creation date)

**Filter Persistence**:
- Filters remain active when switching between Table and Kanban views
- Analytics view is **not filtered** (always shows full dataset for accurate statistics)
- Clear filters button resets all filters across views

**Why Analytics is Not Filtered**:
- Statistics must represent complete dataset for accuracy
- Filtering would skew percentages and distributions
- Users can apply filters to Table/Kanban, then switch to Analytics to see impact on overall metrics

---

### Accessibility and Keyboard Navigation

#### Table View
- **Tab**: Navigate between filter controls, table cells, action buttons
- **Arrow Keys**: Navigate table rows and columns
- **Enter**: Activate focused action (edit, delete)
- **Ctrl+F**: Focus search box (browser behavior)
- **Pagination**: Click or use arrow buttons to navigate pages

#### Kanban Board
- **Keyboard Drag-Drop**: Not natively supported (limitation of react-beautiful-dnd)
- **Tab**: Navigate between cards, action buttons
- **Enter**: Open focused card in edit form
- **Recommendation**: Use mouse or touch for drag-drop; use Table view for keyboard-only workflows

#### Analytics View
- **Tab**: Navigate between filter dropdown, refresh button
- **Arrow Keys**: Navigate charts (screen reader support)
- **Charts are static**: No interactive elements (read-only data visualization)

---

### Mobile and Tablet Considerations

#### Table View
- **Mobile**: Horizontal scroll required (table min-width > mobile screen width)
- **Tablet (Portrait)**: Comfortable experience with 8 columns visible
- **Tablet (Landscape)**: Optimal experience, all columns visible
- **Recommendation**: Use Kanban on mobile devices for better experience

#### Kanban Board
- **Mobile**: Columns stack vertically (responsive layout)
- **Tablet**: Three columns side-by-side with horizontal scroll
- **Touch-Friendly**: Drag handles and action buttons optimized for touch (44px tap targets)
- **Recommendation**: Best view for tablet use in operations centers

#### Analytics View
- **Mobile**: Charts stack vertically, full width
- **Tablet**: 2x2 grid layout (responsive)
- **Responsive Charts**: Bar charts scale to container width
- **Recommendation**: Works well on all screen sizes

---

### Performance Considerations

#### Large Datasets (1000+ TODOs)

**Table View**:
- Server-side pagination handles millions of records
- Increase page size to 100 for power users
- Sorting and filtering remain fast (indexed queries)

**Kanban Board**:
- Client-side rendering limits: ~100 cards per column for smooth drag-drop
- Recommendation: Use filters to reduce visible card count
- Example: Filter by assignee + priority=high to focus on actionable subset

**Analytics View**:
- Statistics calculated on server (fast aggregations)
- Compliance analytics may take 1-2 seconds for very large datasets
- Manual refresh prevents unnecessary computation

#### Optimization Tips
1. **Use Table for Search**: Table pagination handles large result sets efficiently
2. **Use Kanban for Focus**: Apply filters to show only actionable tasks (< 50 cards)
3. **Use Analytics Sparingly**: Refresh only when needed (computationally expensive)
4. **Leverage Server-Side Sorting**: Table sorting is fast even with millions of records
5. **Filter Before Switching**: Apply filters in Table, switch to Kanban for focused workflow

---

## Developer Experience

### Working with Presentational Components

#### Component Development Workflow

1. **Identify Required Data**: Determine what data the component needs to render
2. **Create Custom Hook**: Extract all state and logic to a hook
3. **Define Hook Return Structure**:
   ```typescript
   return {
     data: { ... },      // Derived data, API responses
     uiState: { ... },   // UI state (loading, errors, etc.)
     actions: { ... }    // Event handlers
   };
   ```
4. **Implement Component**: Consume hook and render UI
5. **Test Independently**: Test hook logic and component rendering separately

#### Example: Creating a New Component

**Step 1: Create the hook**
```typescript
// src/public/features/todos/hooks/use_my_component.ts
export const useMyComponent = ({ initialValue }) => {
  const [value, setValue] = useState(initialValue);
  const [loading, setLoading] = useState(false);

  const handleChange = useCallback((newValue) => {
    setValue(newValue);
  }, []);

  return {
    data: { value },
    uiState: { loading },
    actions: { handleChange }
  };
};
```

**Step 2: Create the component**
```typescript
// src/public/features/todos/ui/MyComponent.tsx
export const MyComponent: React.FC<Props> = ({ initialValue }) => {
  const { data, uiState, actions } = useMyComponent({ initialValue });

  return (
    <EuiPanel>
      <EuiFieldText
        value={data.value}
        onChange={(e) => actions.handleChange(e.target.value)}
        isLoading={uiState.loading}
      />
    </EuiPanel>
  );
};
```

### Benefits for Developers

#### 1. Easier Debugging
- **Logic Issues**: Debug hooks in isolation with unit tests
- **Rendering Issues**: Inspect component props in React DevTools
- **Clear Boundaries**: Know whether bug is logic or presentation

#### 2. Faster Development
- **Reusable Logic**: Share hooks across components
- **Component Libraries**: Build UI component catalog (Storybook)
- **Parallel Work**: Frontend dev works on UI while backend dev works on hooks

#### 3. Better Testing
- **Hook Testing**: Use `@testing-library/react-hooks` for logic tests
- **Component Testing**: Use `@testing-library/react` with mock props
- **Separation**: No need to mock API calls when testing component rendering

#### 4. Maintainability
- **Change Logic**: Modify hooks without touching JSX
- **Redesign UI**: Change components without affecting business logic
- **Refactor Safely**: TypeScript ensures contracts are maintained

### Common Patterns

#### Pattern 1: Container Hook
Orchestrate multiple sub-hooks into a single interface:

```typescript
export const usePageContainer = () => {
  const { data } = useDataFetching();
  const { createItem } = useCreateItem();
  const { deleteItem } = useDeleteItem();

  // Coordinate refreshes
  const handleCreate = async (item) => {
    await createItem(item);
    await refetch(); // Refresh data after create
  };

  return { data, actions: { handleCreate, deleteItem } };
};
```

#### Pattern 2: Form Hook
Manage complex form state with validation:

```typescript
export const useFormLogic = ({ initialData, onSubmit }) => {
  const [formState, setFormState] = useState(initialData);
  const [errors, setErrors] = useState({});

  const validate = () => { /* validation logic */ };

  const handleSubmit = async () => {
    if (validate()) {
      await onSubmit(formState);
    }
  };

  return { formState, errors, actions: { setFormState, handleSubmit } };
};
```

#### Pattern 3: Filter Hook
Manage complex filter state:

```typescript
export const useFilters = ({ onFilterChange }) => {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState([]);

  const applyFilters = useCallback(() => {
    onFilterChange({ search, status });
  }, [search, status, onFilterChange]);

  return {
    data: { search, status },
    actions: { setSearch, setStatus, applyFilters }
  };
};
```

### Code Organization

```
src/public/features/todos/
├── api/
│   └── todos.client.ts          # API client (HTTP layer)
├── hooks/
│   ├── use_todos.ts             # Data fetching hooks
│   ├── use_create_todo.ts       # CRUD hooks
│   ├── use_todos_page.ts        # Container hooks
│   ├── use_todos_table.ts       # Component hooks
│   └── use_todo_filters.ts      # UI logic hooks
└── ui/
    ├── TodosPage.tsx            # Page components
    ├── TodosTable.tsx           # Table components
    ├── TodoFilters.tsx          # Filter components
    └── TodoForm.tsx             # Form components
```

**Guidelines**:
- **api/**: HTTP clients only, no React hooks
- **hooks/**: All React hooks, no UI rendering
- **ui/**: All React components, minimal logic

---

## Testing Strategy

### Testing Hooks

**Tool**: `@testing-library/react-hooks`

**Example**:
```typescript
import { renderHook, act } from '@testing-library/react-hooks';
import { useTodoFilters } from '../use_todo_filters';

test('should update search text', () => {
  const { result } = renderHook(() => useTodoFilters({ onFiltersChange: jest.fn() }));

  act(() => {
    result.current.actions.handleSearchChange('test');
  });

  expect(result.current.data.localSearchText).toBe('test');
});
```

### Testing Components

**Tool**: `@testing-library/react`

**Example**:
```typescript
import { render, screen } from '@testing-library/react';
import { TodosTable } from '../TodosTable';

test('renders todo items', () => {
  const todos = [{ id: '1', title: 'Test TODO', status: 'planned' }];

  render(
    <TodosTable
      todos={todos}
      pagination={null}
      loading={false}
      onEdit={jest.fn()}
      onDelete={jest.fn()}
      onTableChange={jest.fn()}
    />
  );

  expect(screen.getByText('Test TODO')).toBeInTheDocument();
});
```

### Integration Testing

Test component + hook integration:

```typescript
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TodoForm } from '../TodoForm';

test('submits form with valid data', async () => {
  const onSubmit = jest.fn();
  const client = new TodosClient(mockHttp);

  render(<TodoForm client={client} onSubmit={onSubmit} onClose={jest.fn()} />);

  userEvent.type(screen.getByLabelText(/title/i), 'New TODO');
  userEvent.click(screen.getByText(/create todo/i));

  await waitFor(() => {
    expect(onSubmit).toHaveBeenCalledWith({ title: 'New TODO', status: 'planned' });
  });
});
```

### Test Coverage Goals

- **Hooks**: 90%+ coverage (all logic paths tested)
- **Components**: 80%+ coverage (key user interactions tested)
- **Integration**: Critical workflows tested end-to-end

---

## Summary

The refactored dashboard architecture provides:

1. **Clear Separation**: Presentation (components) vs. Logic (hooks)
2. **Reusability**: Hooks can be shared and composed
3. **Testability**: Independent testing of logic and rendering
4. **Maintainability**: Changes are isolated to specific layers
5. **Developer Experience**: Predictable patterns, easy to understand
6. **Type Safety**: TypeScript enforces contracts between layers
7. **Scalability**: Easy to add features without increasing complexity

### Key Takeaways for Developers

- **Components are dumb**: They receive props and render UI
- **Hooks are smart**: They manage state, side effects, and business logic
- **Structured returns**: Hooks return `{ data, uiState, actions }`
- **Single responsibility**: Each hook/component has one clear purpose
- **Composition**: Build complex features by composing simple hooks
- **Testing**: Test hooks and components independently

This architecture supports long-term maintainability while providing an excellent developer experience and a powerful, user-friendly interface for security professionals.
