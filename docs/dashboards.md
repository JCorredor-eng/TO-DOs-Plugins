# Dashboard Components & UI Architecture

## Table of Contents
1. [Overview](#overview)
2. [Presentational Architecture](#presentational-architecture)
3. [Custom Hooks Reference](#custom-hooks-reference)
4. [Page Components](#page-components)
5. [Table Components](#table-components)
6. [Filter Components](#filter-components)
7. [Form Components](#form-components)
8. [Chart & Analytics Components](#chart--analytics-components)
9. [Component Library Usage](#component-library-usage)
10. [Developer Experience](#developer-experience)
11. [Testing Strategy](#testing-strategy)

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
- **Context Switching**: Easy switch between data view and analytics
- **Quick Actions**: Create button always visible in header
- **Date-Based Filtering**: Works seamlessly with TopNavMenu date picker
- **Error Feedback**: Clear error messages guide users when issues occur
- **Empty State Guidance**: Helpful prompts when starting fresh

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

**Purpose**: Displays general statistics about all TODO items.

**Props**:
```typescript
{
  stats: TodoStats | null;
  loading: boolean;
  error: Error | null;
}
```

**Visualizations**:

#### 1. Status Distribution
- **Type**: Horizontal progress bars with counts
- **Metrics**:
  - Total TODOs
  - Planned count (blue)
  - Done count (green)
  - Error count (red)
- **Format**: "N / Total (XX%)"

#### 2. Top Tags Bar Chart
- **Type**: Horizontal bar chart
- **Data**: Most frequently used tags
- **Limit**: Top 10 tags
- **Display**: Tag name, count, percentage bar

**Loading State**: `EuiLoadingChart` centered

**Error State**: `EuiCallOut` with error message

**Empty State**: `EuiEmptyPrompt` guiding user to create TODOs

**User Value**:
- **Quick Overview**: Status distribution shows workload at a glance
- **Tag Insights**: Identify most common categorizations
- **Completion Tracking**: Percentage of done vs. planned tasks

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
| `EuiTabbedContent` | Tab navigation | Switch between table and analytics |

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
