# Features Documentation

## Table of Contents

- [Overview](#overview)
- [Feature Catalog](#feature-catalog)
- [Core CRUD Operations](#core-crud-operations)
- [Search and Filtering](#search-and-filtering)
- [Analytics and Visualizations](#analytics-and-visualizations)
- [Data Models](#data-models)
- [User Workflows](#user-workflows)
- [API Endpoints](#api-endpoints)
- [Limitations and Constraints](#limitations-and-constraints)

## Overview

The TODO Management Plugin provides a comprehensive task management system with advanced analytics, compliance tracking, and security-focused features. This document describes all functional capabilities, user workflows, and technical specifications.

### Primary Use Cases

1. **Task Management**: Create, organize, and track TODO items with rich metadata
2. **Visual Workflow Management**: Kanban board with drag-and-drop for intuitive status transitions
3. **Compliance Tracking**: Associate tasks with regulatory frameworks (PCI-DSS, ISO-27001, HIPAA, etc.)
4. **Priority Management**: Classify tasks by urgency and impact for risk-based workflows
5. **Team Collaboration**: Assign tasks to team members and track completion
6. **Analytics**: Visualize task distribution, overdue items, and compliance coverage

## Feature Catalog

### Core Functionality

| Feature | Description | Status |
|---------|-------------|--------|
| **Create TODO** | Create new TODO items with title, description, status, tags, assignee, priority, severity, due date, and compliance frameworks | ✅ Implemented |
| **List TODOs** | View paginated list of TODOs with server-side pagination (10/20/50/100 items per page) | ✅ Implemented |
| **View TODO Details** | Display all TODO metadata including timestamps, tags, and compliance frameworks | ✅ Implemented |
| **Update TODO** | Modify existing TODOs with partial updates (PATCH) | ✅ Implemented |
| **Delete TODO** | Delete TODOs with confirmation dialog | ✅ Implemented |

### Search and Filtering

| Feature | Description | Status |
|---------|-------------|--------|
| **Full-Text Search** | Search across title and description fields with fuzzy matching | ✅ Implemented |
| **Status Filter** | Filter by status (planned, in_progress, done, error) with multi-select | ✅ Implemented |
| **Tag Filter** | Filter by tags (AND logic - must have all specified tags) | ✅ Implemented |
| **Priority Filter** | Filter by priority levels (low, medium, high, critical) | ✅ Implemented |
| **Severity Filter** | Filter by severity levels (info, low, medium, high, critical) | ✅ Implemented |
| **Date Range Filter** | Filter by creation date using TopNavMenu date picker with quick select options (Last 7 days default) | ✅ Implemented |
| **Overdue Filter** | Show only overdue tasks (past due date AND not completed) | ✅ Implemented |
| **Multi-Filter Combination** | Apply multiple filters simultaneously with real-time results | ✅ Implemented |

### Sorting

| Feature | Description | Status |
|---------|-------------|--------|
| **Sort by Created Date** | Ascending/descending order | ✅ Implemented |
| **Sort by Updated Date** | Ascending/descending order | ✅ Implemented |
| **Sort by Completed Date** | Ascending/descending order | ✅ Implemented |
| **Sort by Title** | Alphabetical ascending/descending | ✅ Implemented |
| **Sort by Status** | Alphabetical ascending/descending | ✅ Implemented |
| **Sort by Priority** | Priority level ascending/descending | ✅ Implemented |
| **Sort by Severity** | Severity level ascending/descending | ✅ Implemented |
| **Sort by Due Date** | Chronological ascending/descending | ✅ Implemented |

### Analytics and Visualizations

| Feature | Description | Status |
|---------|-------------|--------|
| **General Statistics** | Total, planned, in-progress, done, error counts | ✅ Implemented |
| **Status Distribution** | Visual breakdown with progress bars | ✅ Implemented |
| **Top Tags Chart** | Bar chart showing most used tags | ✅ Implemented |
| **Compliance Framework Coverage** | Tasks per compliance framework | ✅ Implemented |
| **Priority/Severity Matrix** | Heatmap of priority vs. severity distribution | ✅ Implemented |
| **Overdue Tasks Table** | List of tasks past their due date | ✅ Implemented |
| **High/Critical Tasks Chart** | Distribution of high-priority and critical tasks | ✅ Implemented |
| **Framework Filter** | Filter analytics by specific compliance framework | ✅ Implemented |

### Kanban Board View

| Feature | Description | Status |
|---------|-------------|--------|
| **3-Column Layout** | Visual kanban board with Planned, Done, Error columns | ✅ Implemented |
| **Drag-and-Drop** | Drag TODO cards between columns to update status | ✅ Implemented |
| **Card Display** | Rich card view with title, description, priority, severity, tags, assignee, due date | ✅ Implemented |
| **Status Transitions** | Change status by dragging cards to different columns | ✅ Implemented |
| **Overdue Highlighting** | Overdue tasks show red due date indicator | ✅ Implemented |
| **Tag Display** | Shows first 3 tags + overflow count (e.g., "+5") | ✅ Implemented |
| **Inline Actions** | Edit/delete buttons on each card | ✅ Implemented |
| **Empty State** | Each column shows helpful empty state when no tasks | ✅ Implemented |
| **Responsive Layout** | Minimum column width of 320px with horizontal scroll | ✅ Implemented |

### Internationalization

| Feature | Description | Status |
|---------|-------------|--------|
| **English Language** | Full UI in English | ✅ Implemented |
| **Spanish Language** | Full UI in Spanish | ✅ Implemented |
| **Language Selector** | Dynamic language switching without page reload | ✅ Implemented |
| **Relative Time Formatting** | "2 hours ago", "3 days ago" in selected language | ✅ Implemented |

## Core CRUD Operations

### Create TODO

**Purpose**: Create a new TODO item with rich metadata.

**Required Fields**:
- `title` (string, max 256 characters)
- `status` (enum: planned, in_progress, done, error)

**Optional Fields**:
- `description` (string, max 4000 characters)
- `tags` (array of strings, max 20 tags)
- `assignee` (string, max 100 characters)
- `priority` (enum: low, medium, high, critical, default: medium)
- `severity` (enum: info, low, medium, high, critical, default: low)
- `dueDate` (ISO 8601 date string)
- `complianceFrameworks` (array of strings, max 10 frameworks, max 100 chars each)

**Automatic Fields**:
- `id` (UUID v4, generated by backend)
- `createdAt` (ISO 8601 timestamp)
- `updatedAt` (ISO 8601 timestamp)
- `completedAt` (ISO 8601 timestamp, set when status = 'done')

**User Workflow**:
1. Click "Create TODO" button (top-right corner)
2. Fill form in flyout modal:
   - Enter title (required)
   - Optionally add description (markdown-friendly)
   - Select status (default: planned)
   - Add tags (autocomplete with existing tags)
   - Enter assignee username
   - Select priority and severity
   - Pick due date from calendar
   - Add compliance frameworks (autocomplete with existing frameworks)
3. Click "Create TODO" button
4. Modal closes, table refreshes, success notification appears

**Validation Rules**:
- Title: 1-256 characters (required)
- Description: 0-4000 characters
- Tags: 0-20 tags
- Assignee: 0-100 characters
- Due date: Valid ISO 8601 date
- Compliance frameworks: 0-10 frameworks, each 1-100 characters

**Example Request**:

```json
{
  "title": "Implement multi-factor authentication",
  "description": "Add MFA support for all user accounts to meet PCI-DSS requirements",
  "status": "planned",
  "tags": ["security", "authentication", "Q1-2025"],
  "assignee": "john.doe",
  "priority": "high",
  "severity": "high",
  "dueDate": "2025-03-31T23:59:59.000Z",
  "complianceFrameworks": ["PCI-DSS", "ISO-27001"]
}
```

**Example Response**:

```json
{
  "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "title": "Implement multi-factor authentication",
  "description": "Add MFA support for all user accounts to meet PCI-DSS requirements",
  "status": "planned",
  "tags": ["security", "authentication", "Q1-2025"],
  "assignee": "john.doe",
  "priority": "high",
  "severity": "high",
  "dueDate": "2025-03-31T23:59:59.000Z",
  "complianceFrameworks": ["PCI-DSS", "ISO-27001"],
  "createdAt": "2025-01-15T10:30:00.000Z",
  "updatedAt": "2025-01-15T10:30:00.000Z",
  "completedAt": null
}
```

### List TODOs

**Purpose**: Retrieve a paginated, filtered, and sorted list of TODOs.

**Query Parameters**:

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `page` | number | 1 | Page number (1-indexed) |
| `pageSize` | number | 20 | Items per page (1-100) |
| `searchText` | string | - | Full-text search query |
| `status` | array | - | Filter by status (planned, in_progress, done, error) |
| `tags` | array | - | Filter by tags (AND logic) |
| `priority` | array | - | Filter by priority |
| `severity` | array | - | Filter by severity |
| `isOverdue` | boolean | - | Show only overdue tasks |
| `createdAfter` | string | - | ISO 8601 date |
| `createdBefore` | string | - | ISO 8601 date |
| `updatedAfter` | string | - | ISO 8601 date |
| `updatedBefore` | string | - | ISO 8601 date |
| `completedAfter` | string | - | ISO 8601 date |
| `completedBefore` | string | - | ISO 8601 date |
| `dueDateAfter` | string | - | ISO 8601 date |
| `dueDateBefore` | string | - | ISO 8601 date |
| `sortField` | string | createdAt | Field to sort by |
| `sortDirection` | string | desc | asc or desc |

**Response**:

```json
{
  "data": [
    {
      "id": "...",
      "title": "...",
      // ... full TODO object
    }
  ],
  "pagination": {
    "page": 1,
    "pageSize": 20,
    "totalItems": 150,
    "totalPages": 8
  }
}
```

**User Workflow**:
1. Navigate to "Table View" tab
2. Set date range in top navigation bar (default: "Last 7 days")
3. Use search bar for full-text search
4. Apply filters:
   - Click "Status" filter button → select statuses
   - Click "Priority" filter button → select priorities
   - Click "Severity" filter button → select severities
   - Enter comma-separated tags in "Tags" field
   - Toggle "Overdue only" switch
5. Click column headers to sort
6. Use pagination controls to navigate pages
7. Select page size (10, 20, 50, 100) from dropdown

**Filter Behavior**:
- All filters are combined with AND logic
- Search uses fuzzy matching (typo-tolerant)
- Tag filter requires ALL specified tags (AND logic)
- Date filters create inclusive ranges
- Overdue filter checks: `dueDate < now AND status != 'done'`

### Update TODO

**Purpose**: Modify an existing TODO item.

**HTTP Method**: PATCH (partial update)

**Allowed Fields**:
- `title` (string, max 256 characters)
- `description` (string, max 4000 characters)
- `status` (enum: planned, in_progress, done, error)
- `tags` (array of strings, max 20 tags)
- `assignee` (string, max 100 characters)
- `priority` (enum: low, medium, high, critical)
- `severity` (enum: info, low, medium, high, critical)
- `dueDate` (ISO 8601 date string or null)
- `complianceFrameworks` (array of strings, max 10 frameworks)

**Automatic Updates**:
- `updatedAt` (always updated to current timestamp)
- `completedAt` (set to current timestamp when status changes to 'done', cleared when changed from 'done')

**User Workflow**:
1. Click "Edit" icon (pencil) in table row actions
2. Form flyout opens pre-filled with current values
3. Modify desired fields
4. Click "Save Changes" button
5. Modal closes, table refreshes, success notification appears

**Example Request**:

```json
{
  "status": "done",
  "assignee": "jane.smith"
}
```

**Business Rules**:
- Only send changed fields (partial update)
- When `status` changes to `done`, `completedAt` is automatically set
- When `status` changes from `done` to another status, `completedAt` is cleared
- Cannot update `id`, `createdAt` (immutable)

### Delete TODO

**Purpose**: Permanently delete a TODO item.

**HTTP Method**: DELETE

**User Workflow**:
1. Click "Delete" icon (trash) in table row actions
2. Confirmation modal appears:
   - Title: "Delete TODO"
   - Message: "Are you sure you want to delete {title}?"
   - Warning: "This action cannot be undone."
3. Click "Delete" button (or "Cancel" to abort)
4. TODO is deleted, table refreshes, success notification appears

**Response**: 204 No Content

**Error Handling**:
- Returns 404 if TODO not found
- Returns 500 for unexpected errors

### View TODO Details

**Purpose**: Display full TODO metadata in the table row.

**Display Format**:
- **Title & Description**: Title in bold, description in subdued color
- **Status Badge**: Color-coded badge (planned=primary, in_progress=warning, done=success, error=danger)
- **Tags**: Up to 3 visible tags as badges, "+N" for remaining
- **Assignee**: Username or "-" if not assigned
- **Timestamps**: Relative time (e.g., "2 hours ago", "3 days ago")
- **Due Date**: Formatted date with "(overdue)" warning if past due
- **Priority/Severity**: Visible in expanded view

## Search and Filtering

### Full-Text Search

**Scope**: Searches across `title` and `description` fields.

**Search Algorithm**:
- Uses OpenSearch's match query with fuzziness
- Supports typos (edit distance of 2)
- Relevance scoring (matches in title ranked higher)

**User Interface**:
- Search bar at top of filters panel
- Placeholder: "Search TODOs..."
- Clear button (X) to reset search
- Live search on input change

**Example Queries**:
- `"authentication"` → finds "multi-factor authentication", "auth module"
- `"securty"` → finds "security" (typo correction)
- `"PCI compliance"` → finds tasks mentioning PCI-DSS or compliance

### Multi-Filter Combination

**Filter Panel Components**:

1. **Search Bar** (full-text search)
2. **Status Filter** (multi-select popover)
3. **Priority Filter** (multi-select popover)
4. **Severity Filter** (multi-select popover)
5. **Tags Input** (comma-separated)
6. **Overdue Toggle** (switch)

**Filter State Management**:
- All filters are managed by `useTodoFilters` hook
- Filters are applied on change (real-time results)
- Active filter count shown on "Clear All" button

**Clear Filters**:
- "Clear All" button removes all filters
- Individual filter popovers have selection checkboxes

### Date Range Filtering

**Location**: Top navigation bar (TopNavMenu)

**Default Range**: "Last 7 days" (now-7d to now)

**Date Picker Integration**:
- **Component**: OpenSearch Dashboards TopNavMenu with built-in date range picker
- **Visibility**: Always visible in top navigation (not hidden in accordions)
- **Position**: Prominent placement in header, next to search bar
- **Behavior**: Standard OSD date picker with quick select options

**Quick Select Options**:
- Last 15 minutes
- Last 30 minutes
- Last 1 hour
- Last 4 hours
- Last 12 hours
- Last 24 hours
- Last 7 days (default)
- Last 30 days
- Last 60 days
- Last 90 days
- Custom range (absolute or relative dates)

**Filtering Scope**:
- **Current Implementation**: Filters TODOs by creation date (createdAt field)
- **Date Range Conversion**: Relative dates (e.g., "now-7d") are converted to absolute ISO 8601 timestamps
- **Applied Filters**: Translates to `createdAfter` and `createdBefore` query parameters

**User Workflow**:
1. User opens TODO Management page
2. Top navigation bar shows date range picker with "Last 7 days" selected
3. Click date picker to open date range selector
4. Choose from quick select options OR set custom date range
5. Click "Update" to apply date range
6. TODO table automatically refreshes with items created within selected range
7. Other filters (status, tags, priority, severity) continue to work in combination

**User Value**:
- **Always Visible**: No longer hidden in a collapsible accordion
- **Standard UX Pattern**: Consistent with Wazuh and other security applications
- **Quick Access**: Common date filtering requires fewer clicks
- **Professional Appearance**: Matches OpenSearch Dashboards platform conventions
- **Flexible Ranges**: Quick selects for common scenarios, custom ranges for specific needs

**Technical Details**:
- Date range state managed in `CustomPluginApp` component
- Passed as prop to `TodosPage` component via `dateRange` parameter
- Converted to absolute dates using moment.js in `useTodosPage` hook
- Applied to TODO list query as `createdAfter` and `createdBefore` filters

**Future Enhancements** (API supports but not exposed in UI):
- Filter by updated date range (`updatedAfter`, `updatedBefore`)
- Filter by completed date range (`completedAfter`, `completedBefore`)
- Filter by due date range (`dueDateAfter`, `dueDateBefore`)
- Advanced date filter UI for selecting specific date field to filter

### Overdue Detection

**Overdue Logic**:

```typescript
isOverdue = (dueDate !== null) AND (dueDate < currentDate) AND (status !== 'done')
```

**Visual Indicators**:
- Due date column shows "(overdue)" in red text
- Overdue tasks highlighted in table
- Overdue count shown in analytics dashboard

**Filter Behavior**:
- Toggle "Overdue only" switch in filter panel
- Shows only tasks meeting overdue criteria
- Combines with other filters (e.g., "overdue + high priority")

## Analytics and Visualizations

### General Statistics Dashboard

**Location**: Analytics tab → General Statistics section

**Metrics Displayed**:

1. **Total Tasks**: Count of all TODO items
2. **Planned**: Count of tasks with status = 'planned'
3. **Done**: Count of tasks with status = 'done'
4. **Error**: Count of tasks with status = 'error'

**Visualizations**:

1. **Status Distribution Progress Bars**:
   - Planned: Default color
   - Done: Success (green)
   - Error: Danger (red)
   - Shows percentage and count

2. **Top Tags Bar Chart**:
   - Horizontal bar chart
   - Shows top 10 most used tags
   - Displays count and percentage
   - Sorted by frequency (descending)

**Real-Time Updates**:
- Statistics refresh after every CRUD operation
- Manual refresh button available
- Loading state during data fetch

### Compliance & Security Analytics

**Location**: Analytics tab → Compliance & Security Analytics section

**Framework Filter**:
- Dropdown selector: "All Frameworks" or specific framework
- Filters all analytics charts by selected framework
- Available frameworks populated from existing TODOs

**Visualizations**:

1. **Compliance Framework Coverage Chart**:
   - Bar chart showing task count per framework
   - Sorted by task count (descending)
   - Shows frameworks: PCI-DSS, ISO-27001, SOX, HIPAA, GDPR, etc.
   - Click to filter dashboard by framework

2. **Overdue Tasks Table**:
   - Sortable table of tasks past due date
   - Columns: Title, Priority, Severity, Due Date, Days Overdue
   - Color-coded priority badges
   - Empty state if no overdue tasks

3. **Priority/Severity Heatmap**:
   - 2D matrix: Priority (Y-axis) × Severity (X-axis)
   - Cell color intensity = task count
   - Hover shows exact count
   - Highlights high-risk combinations (high priority + high severity)

4. **High/Critical Tasks Chart**:
   - Donut chart showing distribution of high and critical priority tasks
   - Segments: High Priority, Critical Priority
   - Shows count and percentage

**Analytics Metadata**:
- Total tasks count
- Last updated timestamp
- Refresh button

**User Workflow**:
1. Navigate to "Analytics" tab
2. View general statistics (status, tags)
3. Scroll to compliance section
4. Select compliance framework (optional)
5. Review compliance coverage, overdue tasks, priority/severity distribution
6. Click refresh to update data

## Data Models

### Todo Entity

**Domain Model** (`src/common/todo/todo.types.ts`):

```typescript
export interface Todo {
  // Identity
  id: string;

  // Core Fields
  title: string;
  description?: string;
  status: TodoStatus;

  // Organization
  tags?: readonly string[];
  assignee?: string;

  // Analytics Fields
  priority?: TodoPriority;
  severity?: TodoSeverity;
  dueDate?: string;
  complianceFrameworks?: readonly string[];

  // Timestamps
  createdAt: string;
  updatedAt: string;
  completedAt: string | null;
}
```

### Enumerations

**TodoStatus**:

```typescript
export type TodoStatus = 'planned' | 'in_progress' | 'done' | 'error';

export const TODO_STATUS_LABELS = {
  planned: 'Planned',
  in_progress: 'In Progress',
  done: 'Done',
  error: 'Error',
};

export const TODO_STATUS_COLORS = {
  planned: 'primary',
  in_progress: 'warning',
  done: 'success',
  error: 'danger',
};
```

**TodoPriority**:

```typescript
export type TodoPriority = 'low' | 'medium' | 'high' | 'critical';

export const TODO_PRIORITY_LABELS = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
  critical: 'Critical',
};
```

**TodoSeverity**:

```typescript
export type TodoSeverity = 'info' | 'low' | 'medium' | 'high' | 'critical';

export const TODO_SEVERITY_LABELS = {
  info: 'Info',
  low: 'Low',
  medium: 'Medium',
  high: 'High',
  critical: 'Critical',
};
```

**TodoSortField**:

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

### DTOs (Data Transfer Objects)

**CreateTodoRequest** (`src/common/todo/todo.dtos.ts`):

```typescript
export interface CreateTodoRequest {
  title: string;                          // Required
  status: TodoStatus;                     // Required
  description?: string;
  tags?: string[];
  assignee?: string;
  priority?: TodoPriority;
  severity?: TodoSeverity;
  dueDate?: string;
  complianceFrameworks?: string[];
}
```

**UpdateTodoRequest**:

```typescript
export interface UpdateTodoRequest {
  title?: string;
  description?: string;
  status?: TodoStatus;
  tags?: string[];
  assignee?: string;
  priority?: TodoPriority;
  severity?: TodoSeverity;
  dueDate?: string | null;                // null to clear
  complianceFrameworks?: string[];
}
```

**TodoResponse**:

```typescript
export interface TodoResponse {
  id: string;
  title: string;
  description: string;
  status: TodoStatus;
  tags: readonly string[];
  assignee?: string;
  priority: TodoPriority;
  severity: TodoSeverity;
  dueDate?: string;
  complianceFrameworks: readonly string[];
  createdAt: string;
  updatedAt: string;
  completedAt: string | null;
}
```

**ListTodosRequest**:

```typescript
export interface ListTodosRequest {
  page?: number;
  pageSize?: number;
  searchText?: string;
  status?: TodoStatus[];
  tags?: string[];
  priority?: TodoPriority[];
  severity?: TodoSeverity[];
  isOverdue?: boolean;
  createdAfter?: string;
  createdBefore?: string;
  updatedAfter?: string;
  updatedBefore?: string;
  completedAfter?: string;
  completedBefore?: string;
  dueDateAfter?: string;
  dueDateBefore?: string;
  sortField?: TodoSortField;
  sortDirection?: 'asc' | 'desc';
}
```

**ListTodosResponse**:

```typescript
export interface ListTodosResponse {
  data: TodoResponse[];
  pagination: PaginationMeta;
}

export interface PaginationMeta {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
}
```

### Analytics Models

**TodoStats**:

```typescript
export interface TodoStats {
  total: number;
  planned: number;
  done: number;
  error: number;
  topTags: Array<{ tag: string; count: number; percentage: number }>;
}
```

**AnalyticsStats**:

```typescript
export interface AnalyticsStats {
  totalTasks: number;
  computedAt: string;
  complianceCoverage: Array<{
    framework: string;
    count: number;
  }>;
  priorityDistribution: Array<{
    priority: TodoPriority;
    count: number;
  }>;
  overdueTasks: Array<{
    id: string;
    title: string;
    priority: TodoPriority;
    severity: TodoSeverity;
    dueDate: string;
    daysOverdue: number;
  }>;
  prioritySeverityMatrix: Array<{
    priority: TodoPriority;
    severity: TodoSeverity;
    count: number;
  }>;
}
```

## User Workflows

### Workflow 1: Create and Track a Security Task

**Scenario**: Security team needs to implement MFA for PCI-DSS compliance.

**Steps**:

1. **Create Task**:
   - Click "Create TODO" button
   - Enter title: "Implement multi-factor authentication"
   - Add description: "Add MFA support for all user accounts to meet PCI-DSS requirements"
   - Select status: "Planned"
   - Add tags: "security", "authentication", "Q1-2025"
   - Assign to: "john.doe"
   - Set priority: "High"
   - Set severity: "High"
   - Set due date: March 31, 2025
   - Add compliance framework: "PCI-DSS"
   - Click "Create TODO"

2. **Track Progress**:
   - View task in table (sorted by priority)
   - Use filters to see all "security" tagged tasks
   - Check analytics for PCI-DSS compliance coverage

3. **Mark as Done**:
   - Click "Edit" on task
   - Change status to "Done"
   - Click "Save Changes"
   - `completedAt` automatically set

4. **Verify Completion**:
   - Task moves to "Done" section in status distribution
   - Compliance analytics updated
   - No longer appears in overdue tasks

### Workflow 2: Find All Overdue High-Priority Tasks

**Scenario**: Manager needs to review overdue high-priority tasks.

**Steps**:

1. Navigate to "Table View"
2. Click "Priority" filter → Select "High" and "Critical"
3. Toggle "Overdue only" switch
4. Sort by "Due Date" (ascending) to see oldest first
5. Review results in table
6. Export or assign tasks as needed

**Alternative**:

1. Navigate to "Analytics" tab
2. Scroll to "Overdue Tasks Table"
3. Sort by "Days Overdue" (descending)
4. Review critical overdue tasks

### Workflow 3: Analyze Compliance Framework Coverage

**Scenario**: Compliance officer needs to see PCI-DSS task distribution.

**Steps**:

1. Navigate to "Analytics" tab
2. Scroll to "Compliance & Security Analytics"
3. Select "PCI-DSS" from framework filter dropdown
4. Review visualizations:
   - Compliance Framework Coverage Chart (shows PCI-DSS task count)
   - Priority/Severity Heatmap (filtered to PCI-DSS tasks only)
   - High/Critical Tasks Chart (PCI-DSS subset)
5. Identify gaps (e.g., low task count = low coverage)
6. Return to table view, filter by "PCI-DSS" tags, create missing tasks

### Workflow 4: Bulk Update Tasks by Tag

**Scenario**: Need to reassign all "authentication" tasks to new team member.

**Steps**:

1. Navigate to "Table View"
2. Enter "authentication" in Tags filter
3. Review filtered results
4. For each task:
   - Click "Edit" icon
   - Change assignee to "jane.smith"
   - Click "Save Changes"

**Note**: Bulk update is not implemented; requires individual updates.

### Workflow 5: Manage Tasks with Kanban Board

**Scenario**: Team lead wants to visualize task status and quickly move tasks through workflow stages.

**Steps**:

1. **View Kanban Board**:
   - Navigate to "Kanban View" tab
   - Board displays 3 columns: Planned, Done, Error
   - Each column shows count of tasks (e.g., "Planned (12)")

2. **Review Task Details**:
   - Each card displays:
     - Title and description (truncated)
     - Priority and severity badges (color-coded)
     - First 3 tags (with "+N" for overflow)
     - Assignee icon and name
     - Due date (red if overdue)
     - Edit and delete action buttons

3. **Move Task to Different Status** (Drag-and-Drop):
   - Hover over a card in "Planned" column
   - Click and hold the drag handle (grab icon) at top-left
   - Drag card to "Done" column
   - Release to drop
   - Backend automatically updates status to "done"
   - `completedAt` timestamp automatically set
   - Success notification appears
   - Card remains in "Done" column

4. **Quick Edit**:
   - Click edit button (pencil icon) on any card
   - Modal opens with full form
   - Make changes (assignee, priority, tags, etc.)
   - Save changes
   - Card updates in place

5. **Quick Delete**:
   - Click delete button (trash icon) on card
   - Confirmation modal appears
   - Confirm deletion
   - Card removed from board

**Kanban Board Features**:
- **Visual Workflow**: See task distribution across 3 statuses at a glance
- **Drag-and-Drop**: Intuitive status changes without opening forms
- **Rich Cards**: All relevant task info visible without clicking
- **Empty States**: Helpful messages when columns are empty
- **Responsive**: Horizontal scroll for narrow screens (min 320px per column)
- **Real-time**: Changes persist immediately to OpenSearch

**Benefits**:
- Faster status updates than table view (no modal required)
- Better visual representation of workflow stages
- Easy to spot bottlenecks (too many tasks in one column)
- Ideal for daily standups and team meetings

**When to Use Kanban vs. Table**:
- **Use Kanban** for: Visual workflow management, quick status updates, team collaboration
- **Use Table** for: Detailed filtering, bulk viewing, sorting by multiple fields

## API Endpoints

### Overview

All API endpoints follow REST conventions and return JSON responses.

**Base Path**: `/api/custom_plugin`

**Authentication**: Inherits from OpenSearch Dashboards session (required).

**Error Format**:

```json
{
  "message": "Error description",
  "statusCode": 400
}
```

### Endpoint Reference

#### 1. List TODOs

**Endpoint**: `GET /api/custom_plugin/todos`

**Query Parameters**: See [List TODOs](#list-todos) section.

**Success Response**: `200 OK`

```json
{
  "data": [ /* array of TodoResponse */ ],
  "pagination": { /* PaginationMeta */ }
}
```

**Error Responses**:
- `400 Bad Request`: Invalid query parameters
- `500 Internal Server Error`: Server error

#### 2. Get TODO by ID

**Endpoint**: `GET /api/custom_plugin/todos/:id`

**URL Parameters**:
- `id` (string): TODO identifier

**Success Response**: `200 OK`

```json
{
  "id": "...",
  "title": "...",
  // ... full TodoResponse
}
```

**Error Responses**:
- `404 Not Found`: TODO not found
- `500 Internal Server Error`: Server error

#### 3. Create TODO

**Endpoint**: `POST /api/custom_plugin/todos`

**Request Body**: See `CreateTodoRequest` in [Data Models](#data-models).

**Success Response**: `201 Created`

```json
{
  "id": "...",
  "title": "...",
  // ... full TodoResponse
}
```

**Error Responses**:
- `400 Bad Request`: Validation error (title too long, too many tags, etc.)
- `500 Internal Server Error`: Server error

#### 4. Update TODO

**Endpoint**: `PATCH /api/custom_plugin/todos/:id`

**URL Parameters**:
- `id` (string): TODO identifier

**Request Body**: See `UpdateTodoRequest` in [Data Models](#data-models).

**Success Response**: `200 OK`

```json
{
  "id": "...",
  "title": "...",
  // ... full TodoResponse with updated fields
}
```

**Error Responses**:
- `400 Bad Request`: Validation error
- `404 Not Found`: TODO not found
- `500 Internal Server Error`: Server error

#### 5. Delete TODO

**Endpoint**: `DELETE /api/custom_plugin/todos/:id`

**URL Parameters**:
- `id` (string): TODO identifier

**Success Response**: `204 No Content`

**Error Responses**:
- `404 Not Found`: TODO not found
- `500 Internal Server Error`: Server error

#### 6. Get TODO Statistics

**Endpoint**: `GET /api/custom_plugin/todos/stats`

**Query Parameters**: None

**Success Response**: `200 OK`

```json
{
  "total": 150,
  "planned": 80,
  "done": 60,
  "error": 10,
  "topTags": [
    { "tag": "security", "count": 45, "percentage": 30.0 },
    { "tag": "authentication", "count": 30, "percentage": 20.0 }
  ]
}
```

**Error Responses**:
- `500 Internal Server Error`: Server error

#### 7. Get TODO Analytics

**Endpoint**: `GET /api/custom_plugin/todos/analytics`

**Query Parameters**:
- `complianceFramework` (string, optional): Filter by compliance framework

**Success Response**: `200 OK`

```json
{
  "totalTasks": 150,
  "computedAt": "2025-01-15T10:30:00.000Z",
  "complianceCoverage": [ /* ... */ ],
  "priorityDistribution": [ /* ... */ ],
  "overdueTasks": [ /* ... */ ],
  "prioritySeverityMatrix": [ /* ... */ ]
}
```

**Error Responses**:
- `500 Internal Server Error`: Server error

## Limitations and Constraints

### Technical Constraints

1. **Pagination Limits**:
   - Maximum page size: 100 items
   - Minimum page size: 1 item
   - No "view all" option (performance consideration)

2. **Field Length Limits**:
   - Title: 256 characters
   - Description: 4,000 characters
   - Assignee: 100 characters
   - Compliance framework name: 100 characters

3. **Collection Limits**:
   - Maximum tags per TODO: 20
   - Maximum compliance frameworks per TODO: 10
   - Top tags chart: Shows top 10 only

4. **Search Limitations**:
   - Full-text search limited to title and description fields
   - Fuzzy matching edit distance: 2 characters
   - No search in tags or assignee (use filters instead)

5. **Date Handling**:
   - All dates stored in ISO 8601 format (UTC)
   - Date pickers use browser locale for display
   - Relative time formatting available in English and Spanish

### Functional Limitations

1. **No Bulk Operations**:
   - No bulk create, update, or delete
   - Must operate on one TODO at a time

2. **No Task Dependencies**:
   - Cannot link TODOs as parent/child or dependencies
   - No task hierarchies

3. **No Attachments**:
   - Cannot attach files or images to TODOs
   - Description is text-only (no markdown rendering)

4. **No Comments or Audit Trail**:
   - No commenting system
   - No visible change history (only latest version)

5. **No Notifications**:
   - No email or in-app notifications for due dates
   - No reminders for overdue tasks

6. **No Recurring Tasks**:
   - Cannot create recurring TODOs
   - Must manually create each instance

7. **No Custom Fields**:
   - Fixed schema; cannot add custom metadata
   - Cannot extend TODO model without code changes

### Performance Considerations

1. **Index Size**:
   - Performance degrades with >100,000 TODOs
   - Consider archiving completed tasks

2. **Search Performance**:
   - Fuzzy matching is resource-intensive
   - Searching large datasets (>50,000) may be slow

3. **Analytics Computation**:
   - Statistics computed on-demand (not cached)
   - Large datasets may increase load time

### Security Considerations

1. **Authorization**:
   - No row-level security (all users see all TODOs)
   - Assignee field is informational only (no access control)

2. **Input Sanitization**:
   - All input validated, but no XSS protection in description field
   - Avoid entering untrusted HTML/JavaScript

3. **Data Privacy**:
   - All data stored in OpenSearch (no encryption at rest by default)
   - Consider sensitive data carefully

### Known Issues

1. **Tag Filter Logic**:
   - Tag filter uses AND logic (must have ALL tags)
   - No OR logic option (e.g., "tag1 OR tag2")

2. **Completion Timestamp Behavior**:
   - `completedAt` is set when status = 'done', but changing status back to 'planned' clears it
   - No history of multiple completions

3. **Sorting with Null Values**:
   - Fields like `completedAt` or `dueDate` may be null
   - Nulls appear first (ascending) or last (descending)

4. **Analytics Refresh**:
   - Analytics do not auto-refresh
   - Must manually click refresh button after CRUD operations

---

**Last Updated**: 2025-12-30
**Plugin Version**: 1.0.0
**Feature Count**: 50+ implemented features
**API Endpoints**: 7 REST endpoints
