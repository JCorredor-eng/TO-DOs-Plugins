export type TodoStatus = 'planned' | 'done' | 'error';
export const TODO_STATUS_VALUES: readonly TodoStatus[] = ['planned', 'done', 'error'] as const;
export const TODO_STATUS_LABELS: Record<TodoStatus, string> = {
  planned: 'Planned',
  done: 'Done',
  error: 'Error',
} as const;
export const TODO_STATUS_COLORS: Record<TodoStatus, string> = {
  planned: 'primary',
  done: 'success',
  error: 'danger',
} as const;
export type TodoPriority = 'low' | 'medium' | 'high' | 'critical';
export const TODO_PRIORITY_VALUES: readonly TodoPriority[] = [
  'low',
  'medium',
  'high',
  'critical',
] as const;
export const TODO_PRIORITY_LABELS: Record<TodoPriority, string> = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
  critical: 'Critical',
} as const;
export const TODO_PRIORITY_COLORS: Record<TodoPriority, string> = {
  low: 'default',
  medium: 'primary',
  high: 'warning',
  critical: 'danger',
} as const;
export type TodoSeverity = 'info' | 'low' | 'medium' | 'high' | 'critical';
export const TODO_SEVERITY_VALUES: readonly TodoSeverity[] = [
  'info',
  'low',
  'medium',
  'high',
  'critical',
] as const;
export const TODO_SEVERITY_LABELS: Record<TodoSeverity, string> = {
  info: 'Info',
  low: 'Low',
  medium: 'Medium',
  high: 'High',
  critical: 'Critical',
} as const;
export const TODO_SEVERITY_COLORS: Record<TodoSeverity, string> = {
  info: 'default',
  low: 'primary',
  medium: 'warning',
  high: 'danger',
  critical: 'danger',
} as const;
export const MAX_COMPLIANCE_FRAMEWORKS = 10;
export const MAX_COMPLIANCE_FRAMEWORK_LENGTH = 100;
export interface Todo {
  readonly id: string;
  readonly title: string;
  readonly description?: string;
  readonly status: TodoStatus;
  readonly tags: readonly string[];
  readonly assignee?: string;
  readonly priority: TodoPriority;
  readonly severity: TodoSeverity;
  readonly dueDate?: string;
  readonly complianceFrameworks: readonly string[];
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly completedAt: string | null;
}
export type TodoSortField =
  | 'createdAt'
  | 'updatedAt'
  | 'completedAt'
  | 'title'
  | 'status'
  | 'priority'
  | 'severity'
  | 'dueDate';
export type SortDirection = 'asc' | 'desc';
export interface TodoSortOptions {
  readonly field: TodoSortField;
  readonly direction: SortDirection;
}
export interface TodoStats {
  readonly total: number;
  readonly byStatus: Record<TodoStatus, number>;
  readonly topTags: readonly TagCount[];
  readonly completedOverTime: readonly TimeSeriesPoint[];
}
export interface TagCount {
  readonly tag: string;
  readonly count: number;
}
export interface TimeSeriesPoint {
  readonly date: string;
  readonly count: number;
}
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
export const TODO_INDEX_SETTINGS = {
  number_of_shards: 1,
  number_of_replicas: 0,
} as const;
export interface ComplianceCoverageStats {
  readonly framework: string;
  readonly total: number;
  readonly byStatus: Record<TodoStatus, number>;
  readonly completionRate: number;
}
export interface OverdueTaskStats {
  readonly total: number;
  readonly byPriority: Record<TodoPriority, number>;
  readonly bySeverity: Record<TodoSeverity, number>;
}
export interface DistributionStats {
  readonly label: string;
  readonly count: number;
  readonly percentage: number;
}

export interface PrioritySeverityMatrixCell {
  readonly priority: TodoPriority;
  readonly severity: TodoSeverity;
  readonly count: number;
  readonly percentage: number;
}

export interface AnalyticsStats {
  readonly computedAt: string;
  readonly totalTasks: number;
  readonly complianceCoverage: readonly ComplianceCoverageStats[];
  readonly overdueTasks: OverdueTaskStats;
  readonly priorityDistribution: readonly DistributionStats[];
  readonly severityDistribution: readonly DistributionStats[];
  readonly prioritySeverityMatrix: readonly PrioritySeverityMatrixCell[];
}
