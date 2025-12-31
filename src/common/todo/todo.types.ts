/**
 * Status of a TODO item.
 * - `planned`: Task is scheduled or pending
 * - `in_progress`: Task is currently being worked on
 * - `done`: Task has been completed
 * - `error`: Task encountered an issue or failed
 */
export type TodoStatus = 'planned' | 'in_progress' | 'done' | 'error';

/**
 * Array of all valid TODO status values.
 */
export const TODO_STATUS_VALUES: readonly TodoStatus[] = ['planned', 'in_progress', 'done', 'error'] as const;

/**
 * Human-readable labels for each TODO status.
 */
export const TODO_STATUS_LABELS: Record<TodoStatus, string> = {
  planned: 'Planned',
  in_progress: 'In Progress',
  done: 'Done',
  error: 'Error',
} as const;

/**
 * EUI color names for each TODO status.
 * Used for badges and visual indicators.
 */
export const TODO_STATUS_COLORS: Record<TodoStatus, string> = {
  planned: 'primary',
  in_progress: 'warning',
  done: 'success',
  error: 'danger',
} as const;
/**
 * Priority level of a TODO item.
 * Indicates the importance and urgency of the task.
 */
export type TodoPriority = 'low' | 'medium' | 'high' | 'critical';

/**
 * Array of all valid TODO priority values in ascending order.
 */
export const TODO_PRIORITY_VALUES: readonly TodoPriority[] = [
  'low',
  'medium',
  'high',
  'critical',
] as const;

/**
 * Human-readable labels for each priority level.
 */
export const TODO_PRIORITY_LABELS: Record<TodoPriority, string> = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
  critical: 'Critical',
} as const;

/**
 * EUI color names for each priority level.
 * Used for badges and visual indicators.
 */
export const TODO_PRIORITY_COLORS: Record<TodoPriority, string> = {
  low: 'default',
  medium: 'primary',
  high: 'warning',
  critical: 'danger',
} as const;
/**
 * Severity level of a TODO item.
 * Indicates the potential impact or seriousness of the task.
 */
export type TodoSeverity = 'info' | 'low' | 'medium' | 'high' | 'critical';

/**
 * Array of all valid TODO severity values in ascending order.
 */
export const TODO_SEVERITY_VALUES: readonly TodoSeverity[] = [
  'info',
  'low',
  'medium',
  'high',
  'critical',
] as const;

/**
 * Human-readable labels for each severity level.
 */
export const TODO_SEVERITY_LABELS: Record<TodoSeverity, string> = {
  info: 'Info',
  low: 'Low',
  medium: 'Medium',
  high: 'High',
  critical: 'Critical',
} as const;

/**
 * EUI color names for each severity level.
 * Used for badges and visual indicators.
 */
export const TODO_SEVERITY_COLORS: Record<TodoSeverity, string> = {
  info: 'default',
  low: 'primary',
  medium: 'warning',
  high: 'danger',
  critical: 'danger',
} as const;
/**
 * Maximum number of compliance frameworks that can be assigned to a TODO item.
 */
export const MAX_COMPLIANCE_FRAMEWORKS = 10;

/**
 * Maximum character length for a compliance framework name.
 */
export const MAX_COMPLIANCE_FRAMEWORK_LENGTH = 100;
/**
 * Represents a TODO item in the system.
 * All properties are readonly to ensure immutability.
 */
export interface Todo {
  /** Unique identifier for the TODO item */
  readonly id: string;

  /** Title or summary of the task */
  readonly title: string;

  /** Optional detailed description of the task */
  readonly description?: string;

  /** Current status of the task */
  readonly status: TodoStatus;

  /** Array of tags for categorization and filtering */
  readonly tags: readonly string[];

  /** Optional username or identifier of the person assigned to this task */
  readonly assignee?: string;

  /** Priority level of the task */
  readonly priority: TodoPriority;

  /** Severity level indicating the impact or seriousness */
  readonly severity: TodoSeverity;

  /** Optional due date in ISO 8601 format */
  readonly dueDate?: string;

  /** Array of compliance frameworks this task relates to (e.g., PCI-DSS, HIPAA) */
  readonly complianceFrameworks: readonly string[];

  /** ISO 8601 timestamp when the TODO was created */
  readonly createdAt: string;

  /** ISO 8601 timestamp when the TODO was last updated */
  readonly updatedAt: string;

  /** ISO 8601 timestamp when the TODO was completed, or null if not completed */
  readonly completedAt: string | null;
}
/**
 * Fields that can be used for sorting TODO items.
 */
export type TodoSortField =
  | 'createdAt'
  | 'updatedAt'
  | 'completedAt'
  | 'title'
  | 'status'
  | 'priority'
  | 'severity'
  | 'dueDate';

/**
 * Sort direction for ordering results.
 * - `asc`: Ascending order (A-Z, 0-9, oldest-newest)
 * - `desc`: Descending order (Z-A, 9-0, newest-oldest)
 */
export type SortDirection = 'asc' | 'desc';

/**
 * Sorting configuration for TODO queries.
 */
export interface TodoSortOptions {
  /** The field to sort by */
  readonly field: TodoSortField;

  /** The direction to sort */
  readonly direction: SortDirection;
}
/**
 * Represents the number of TODOs assigned to a specific person.
 */
export interface AssigneeCount {
  /** Username or identifier of the assignee */
  readonly assignee: string;

  /** Number of TODOs assigned to this person */
  readonly count: number;
}

/**
 * Statistical summary of TODO items.
 * Provides aggregate data for dashboards and analytics.
 */
export interface TodoStats {
  /** Total number of TODO items */
  readonly total: number;

  /** Count of TODOs grouped by status */
  readonly byStatus: Record<TodoStatus, number>;

  /** Most frequently used tags with their counts */
  readonly topTags: readonly TagCount[];

  /** Time-series data showing completion trends over time */
  readonly completedOverTime: readonly TimeSeriesPoint[];

  /** Top assignees by number of tasks assigned */
  readonly topAssignees: readonly AssigneeCount[];

  /** Number of TODOs without an assignee */
  readonly unassignedCount: number;
}

/**
 * Represents the frequency of a specific tag.
 */
export interface TagCount {
  /** The tag name */
  readonly tag: string;

  /** Number of TODOs with this tag */
  readonly count: number;
}

/**
 * Represents a single point in a time-series dataset.
 */
export interface TimeSeriesPoint {
  /** ISO 8601 date string */
  readonly date: string;

  /** Count value at this point in time */
  readonly count: number;
}
/**
 * OpenSearch index mapping definition for TODO items.
 * Defines the data types and indexing behavior for each field.
 */
export const TODO_INDEX_MAPPING = {
  properties: {
    title: {
      type: 'text',
      fields: {
        keyword: {
          type: 'keyword',
          ignore_above: 256,
        },
      },
    },
    description: {
      type: 'text',
    },
    status: {
      type: 'keyword',
    },
    tags: {
      type: 'keyword',
    },
    assignee: {
      type: 'keyword',
    },
    priority: {
      type: 'keyword',
    },
    severity: {
      type: 'keyword',
    },
    due_date: {
      type: 'date',
      format: 'strict_date_optional_time',
    },
    compliance_framework: {
      type: 'keyword',
    },
    created_at: {
      type: 'date',
      format: 'strict_date_optional_time',
    },
    updated_at: {
      type: 'date',
      format: 'strict_date_optional_time',
    },
    completed_at: {
      type: 'date',
      format: 'strict_date_optional_time',
    },
  },
} as const;

/**
 * OpenSearch index settings for TODO items.
 * Configures sharding and replication for the index.
 */
export const TODO_INDEX_SETTINGS = {
  number_of_shards: 1,
  number_of_replicas: 0,
} as const;
/**
 * Statistics for a specific compliance framework.
 * Shows coverage and completion status.
 */
export interface ComplianceCoverageStats {
  /** Name of the compliance framework (e.g., PCI-DSS, HIPAA) */
  readonly framework: string;

  /** Total number of TODOs related to this framework */
  readonly total: number;

  /** Count of TODOs grouped by status for this framework */
  readonly byStatus: Record<TodoStatus, number>;

  /** Percentage of completed TODOs (0-100) */
  readonly completionRate: number;
}

/**
 * Statistics about overdue tasks.
 */
export interface OverdueTaskStats {
  /** Total number of overdue tasks */
  readonly total: number;

  /** Count of overdue tasks grouped by priority */
  readonly byPriority: Record<TodoPriority, number>;

  /** Count of overdue tasks grouped by severity */
  readonly bySeverity: Record<TodoSeverity, number>;
}

/**
 * Generic distribution statistics.
 * Used for representing counts and percentages across different dimensions.
 */
export interface DistributionStats {
  /** Label for this category */
  readonly label: string;

  /** Number of items in this category */
  readonly count: number;

  /** Percentage of total (0-100) */
  readonly percentage: number;
}

/**
 * Represents a single cell in the priority-severity matrix.
 * Shows the intersection of priority and severity levels.
 */
export interface PrioritySeverityMatrixCell {
  /** Priority level for this cell */
  readonly priority: TodoPriority;

  /** Severity level for this cell */
  readonly severity: TodoSeverity;

  /** Number of TODOs matching this priority-severity combination */
  readonly count: number;

  /** Percentage of total TODOs (0-100) */
  readonly percentage: number;
}

/**
 * Advanced analytics data for TODO items.
 * Provides comprehensive insights for compliance and risk management.
 */
export interface AnalyticsStats {
  /** ISO 8601 timestamp when these analytics were computed */
  readonly computedAt: string;

  /** Total number of tasks included in these analytics */
  readonly totalTasks: number;

  /** Compliance framework coverage statistics */
  readonly complianceCoverage: readonly ComplianceCoverageStats[];

  /** Statistics about overdue tasks */
  readonly overdueTasks: OverdueTaskStats;

  /** Distribution of tasks by priority level */
  readonly priorityDistribution: readonly DistributionStats[];

  /** Distribution of tasks by severity level */
  readonly severityDistribution: readonly DistributionStats[];

  /** Matrix showing task count for each priority-severity combination */
  readonly prioritySeverityMatrix: readonly PrioritySeverityMatrixCell[];
}
