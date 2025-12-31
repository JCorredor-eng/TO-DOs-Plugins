import {
  Todo,
  TodoStatus,
  TodoPriority,
  TodoSeverity,
  TodoStats,
  TagCount,
  TimeSeriesPoint,
  AssigneeCount,
  CreateTodoRequest,
  UpdateTodoRequest,
  AnalyticsStats,
  ComplianceCoverageStats,
  OverdueTaskStats,
  DistributionStats,
  PrioritySeverityMatrixCell,
  TODO_STATUS_VALUES,
  TODO_PRIORITY_VALUES,
  TODO_SEVERITY_VALUES,
} from '../../common';
import { OpenSearchAnalyticsAggregations } from '../repositories';
/**
 * Internal representation of a TODO document in OpenSearch.
 * Uses snake_case field names as per OpenSearch conventions.
 *
 * @remarks
 * This interface represents the raw document structure stored in OpenSearch.
 * It should be mapped to/from the {@link Todo} type using {@link TodosMapper}.
 */
export interface TodoDocument {
  /** Title of the TODO item */
  title: string;

  /** Optional description */
  description?: string;

  /** Current status */
  status: TodoStatus;

  /** Array of tags (snake_case stored in OpenSearch) */
  tags: string[];

  /** Optional assignee */
  assignee?: string;

  /** Priority level */
  priority: TodoPriority;

  /** Severity level */
  severity: TodoSeverity;

  /** Due date in ISO 8601 format, or null if not set */
  due_date: string | null;

  /** Array of compliance frameworks */
  compliance_framework: string[];

  /** Creation timestamp in ISO 8601 format */
  created_at: string;

  /** Last update timestamp in ISO 8601 format */
  updated_at: string;

  /** Completion timestamp in ISO 8601 format, or null if not completed */
  completed_at: string | null;
}
/**
 * Represents a single search result hit from OpenSearch.
 *
 * @typeParam T - The type of the document source
 */
export interface OpenSearchHit<T> {
  /** Document ID */
  _id: string;

  /** Document source data */
  _source: T;

  /** Relevance score (if applicable) */
  _score?: number;
}

/**
 * Represents an OpenSearch search response.
 *
 * @typeParam T - The type of the document source
 */
export interface OpenSearchSearchResponse<T> {
  /** Search results */
  hits: {
    /** Total hits information */
    total: {
      /** Number of matching documents */
      value: number;

      /** Relation type ('eq' for exact, 'gte' for approximate) */
      relation: string;
    };

    /** Array of matching documents */
    hits: Array<OpenSearchHit<T>>;
  };
}

/**
 * Represents an OpenSearch aggregation bucket.
 */
export interface OpenSearchBucket {
  /** Bucket key (category value) */
  key: string;

  /** Number of documents in this bucket */
  doc_count: number;

  /** Human-readable key (for date buckets) */
  key_as_string?: string;
}

/**
 * Aggregation results for TODO statistics queries.
 */
export interface OpenSearchStatsAggregations {
  /** Buckets grouped by status */
  by_status: {
    buckets: OpenSearchBucket[];
  };

  /** Top tags by frequency */
  top_tags: {
    buckets: OpenSearchBucket[];
  };

  /** Completion timeline buckets */
  completed_over_time: {
    buckets: OpenSearchBucket[];
  };

  /** Top assignees by task count */
  top_assignees: {
    buckets: OpenSearchBucket[];
  };

  /** Count of unassigned tasks */
  unassigned: {
    doc_count: number;
  };
}
/**
 * Mapper class for transforming data between different layers.
 *
 * @remarks
 * This class handles bidirectional mapping between:
 * - OpenSearch documents ({@link TodoDocument}) ↔ Domain entities ({@link Todo})
 * - API requests ({@link CreateTodoRequest}, {@link UpdateTodoRequest}) → OpenSearch documents
 * - OpenSearch aggregations → Statistics DTOs ({@link TodoStats}, {@link AnalyticsStats})
 *
 * This is the final layer in the 5-layer architecture:
 * Routes → Controllers → Services → Repositories → **Mappers**
 */
export class TodosMapper {
  /** Number of decimal places for percentage calculations */
  private static readonly PERCENTAGE_PRECISION = 2;

  /**
   * Calculates a percentage with specified precision.
   *
   * @param count - The numerator (part)
   * @param total - The denominator (whole)
   * @returns Percentage rounded to PERCENTAGE_PRECISION decimal places, or 0 if total is 0
   */
  private static calculatePercentage(count: number, total: number): number {
    if (total === 0) return 0;
    const multiplier = Math.pow(10, this.PERCENTAGE_PRECISION);
    return Math.round((count / total) * 100 * multiplier) / multiplier;
  }

  /**
   * Converts an OpenSearch hit to a TODO domain entity.
   *
   * @param hit - The OpenSearch search hit
   * @returns A TODO domain entity
   */
  static fromOpenSearchHit(hit: OpenSearchHit<TodoDocument>): Todo {
    const source = hit._source;
    return {
      id: hit._id,
      title: source.title,
      description: source.description,
      status: source.status,
      tags: source.tags || [],
      assignee: source.assignee,
      priority: source.priority,
      severity: source.severity,
      dueDate: source.due_date || undefined,
      complianceFrameworks: source.compliance_framework || [],
      createdAt: source.created_at,
      updatedAt: source.updated_at,
      completedAt: source.completed_at,
    };
  }
  /**
   * Converts multiple OpenSearch hits to TODO domain entities.
   *
   * @param hits - Array of OpenSearch search hits
   * @returns Array of TODO domain entities
   */
  static fromOpenSearchHits(hits: Array<OpenSearchHit<TodoDocument>>): Todo[] {
    return hits.map((hit) => TodosMapper.fromOpenSearchHit(hit));
  }

  /**
   * Converts a create request to an OpenSearch document.
   *
   * @param request - The create TODO request
   * @param now - Current timestamp in ISO 8601 format
   * @returns OpenSearch document ready for indexing
   */
  static toCreateDocument(request: CreateTodoRequest, now: string): TodoDocument {
    const status = request.status || 'planned';
    const completedAt = status === 'done' ? now : null;
    return {
      title: request.title.trim(),
      description: request.description?.trim(),
      status,
      tags: TodosMapper.normalizeTags(request.tags),
      assignee: request.assignee?.trim(),
      priority: request.priority || 'medium',
      severity: request.severity || 'low',
      due_date: request.dueDate || null,
      compliance_framework: TodosMapper.normalizeComplianceFrameworks(
        request.complianceFrameworks
      ),
      created_at: now,
      updated_at: now,
      completed_at: completedAt,
    };
  }
  /**
   * Converts an update request to a partial OpenSearch document.
   *
   * @param request - The update TODO request
   * @param existingTodo - The existing TODO entity
   * @param now - Current timestamp in ISO 8601 format
   * @returns Partial OpenSearch document containing only the fields to update
   */
  static toUpdateDocument(
    request: UpdateTodoRequest,
    existingTodo: Todo,
    now: string
  ): Partial<TodoDocument> {
    const updates: Partial<TodoDocument> = {
      updated_at: now,
    };
    if (request.title !== undefined) {
      updates.title = request.title.trim();
    }
    if (request.description !== undefined) {
      updates.description = request.description === '' ? undefined : request.description.trim();
    }
    if (request.status !== undefined) {
      updates.status = request.status;
      if (request.status === 'done' && existingTodo.status !== 'done') {
        updates.completed_at = now;
      }
      if (request.status !== 'done' && existingTodo.status === 'done') {
        updates.completed_at = null;
      }
    }
    if (request.tags !== undefined) {
      updates.tags = TodosMapper.normalizeTags(request.tags);
    }
    if (request.assignee !== undefined) {
      updates.assignee = request.assignee === '' ? undefined : request.assignee.trim();
    }
    if (request.priority !== undefined) {
      updates.priority = request.priority;
    }
    if (request.severity !== undefined) {
      updates.severity = request.severity;
    }
    if (request.dueDate !== undefined) {
      updates.due_date = request.dueDate;
    }
    if (request.complianceFrameworks !== undefined) {
      updates.compliance_framework = TodosMapper.normalizeComplianceFrameworks(
        request.complianceFrameworks
      );
    }
    return updates;
  }
  /**
   * Normalizes an array of tags.
   * - Trims whitespace
   * - Converts to lowercase
   * - Removes empty strings
   * - Removes duplicates
   *
   * @param tags - Array of tags to normalize
   * @returns Normalized array of unique tags
   */
  static normalizeTags(tags?: readonly string[]): string[] {
    if (!tags || tags.length === 0) {
      return [];
    }
    const normalized = tags
      .map((tag) => tag.trim().toLowerCase())
      .filter((tag) => tag.length > 0);
    return [...new Set(normalized)];
  }

  /**
   * Normalizes an array of compliance frameworks.
   * - Trims whitespace
   * - Removes empty strings
   * - Removes duplicates
   *
   * @param frameworks - Array of compliance frameworks to normalize
   * @returns Normalized array of unique frameworks
   */
  static normalizeComplianceFrameworks(frameworks?: readonly string[]): string[] {
    if (!frameworks || frameworks.length === 0) {
      return [];
    }
    const normalized = frameworks
      .map((framework) => framework.trim())
      .filter((framework) => framework.length > 0);
    return [...new Set(normalized)];
  }

  /**
   * Converts OpenSearch aggregations to TODO statistics.
   *
   * @param total - Total number of TODOs
   * @param aggregations - OpenSearch aggregation results
   * @returns TODO statistics DTO
   */
  static toTodoStats(total: number, aggregations: OpenSearchStatsAggregations): TodoStats {
    const byStatus: Record<string, number> = {
      planned: 0,
      in_progress: 0,
      done: 0,
      error: 0,
    };
    for (const bucket of aggregations.by_status.buckets) {
      if (bucket.key in byStatus) {
        byStatus[bucket.key] = bucket.doc_count;
      }
    }
    const topTags: TagCount[] = aggregations.top_tags.buckets.map((bucket) => ({
      tag: bucket.key,
      count: bucket.doc_count,
    }));
    const completedOverTime: TimeSeriesPoint[] = aggregations.completed_over_time.buckets.map(
      (bucket) => ({
        date: bucket.key_as_string || bucket.key,
        count: bucket.doc_count,
      })
    );
    const topAssignees: AssigneeCount[] = aggregations.top_assignees.buckets.map((bucket) => ({
      assignee: bucket.key,
      count: bucket.doc_count,
    }));
    const unassignedCount = aggregations.unassigned.doc_count;
    return {
      total,
      byStatus: byStatus as Record<'planned' | 'in_progress' | 'done' | 'error', number>,
      topTags,
      completedOverTime,
      topAssignees,
      unassignedCount,
    };
  }
  /**
   * Merges an update document with an existing TODO.
   *
   * @param existingTodo - The existing TODO entity
   * @param updateDoc - Partial document with updates
   * @param id - The TODO ID
   * @returns Updated TODO entity with merged values
   */
  static mergeUpdate(existingTodo: Todo, updateDoc: Partial<TodoDocument>, id: string): Todo {
    return {
      id,
      title: updateDoc.title ?? existingTodo.title,
      description: updateDoc.description ?? existingTodo.description,
      status: updateDoc.status ?? existingTodo.status,
      tags: updateDoc.tags ?? [...existingTodo.tags],
      assignee: updateDoc.assignee ?? existingTodo.assignee,
      priority: updateDoc.priority ?? existingTodo.priority,
      severity: updateDoc.severity ?? existingTodo.severity,
      dueDate:
        updateDoc.due_date !== undefined
          ? updateDoc.due_date || undefined
          : existingTodo.dueDate,
      complianceFrameworks: updateDoc.compliance_framework ?? [
        ...existingTodo.complianceFrameworks,
      ],
      createdAt: existingTodo.createdAt,
      updatedAt: updateDoc.updated_at ?? existingTodo.updatedAt,
      completedAt:
        updateDoc.completed_at !== undefined ? updateDoc.completed_at : existingTodo.completedAt,
    };
  }
  /**
   * Converts OpenSearch aggregations to advanced analytics statistics.
   *
   * @param total - Total number of TODOs
   * @param aggregations - OpenSearch analytics aggregation results
   * @returns Advanced analytics DTO
   */
  static toAnalyticsStats(
    total: number,
    aggregations: OpenSearchAnalyticsAggregations
  ): AnalyticsStats {
    const now = new Date().toISOString();
    const complianceCoverage = TodosMapper.mapComplianceCoverage(
      aggregations.compliance_coverage.buckets
    );
    const overdueTasks = TodosMapper.mapOverdueTasks(aggregations.overdue_tasks);
    const priorityDistribution = TodosMapper.mapDistribution(
      aggregations.priority_distribution.buckets,
      total,
      TODO_PRIORITY_VALUES as readonly string[]
    );
    const severityDistribution = TodosMapper.mapDistribution(
      aggregations.severity_distribution.buckets,
      total,
      TODO_SEVERITY_VALUES as readonly string[]
    );
    const prioritySeverityMatrix = TodosMapper.mapPrioritySeverityMatrix(
      aggregations.priority_severity_matrix.buckets,
      total
    );
    return {
      computedAt: now,
      totalTasks: total,
      complianceCoverage,
      overdueTasks,
      priorityDistribution,
      severityDistribution,
      prioritySeverityMatrix,
    };
  }
  private static mapComplianceCoverage(
    buckets: OpenSearchAnalyticsAggregations['compliance_coverage']['buckets']
  ): ComplianceCoverageStats[] {
    return buckets.map((bucket) => {
      const byStatus: Record<TodoStatus, number> = {
        planned: 0,
        in_progress: 0,
        done: 0,
        error: 0,
      };
      for (const statusBucket of bucket.by_status.buckets) {
        const status = statusBucket.key as TodoStatus;
        if (TODO_STATUS_VALUES.includes(status)) {
          byStatus[status] = statusBucket.doc_count;
        }
      }
      const total = bucket.doc_count;
      const doneCount = byStatus.done;
      const completionRate = TodosMapper.calculatePercentage(doneCount, total);
      return {
        framework: bucket.key,
        total,
        byStatus,
        completionRate,
      };
    });
  }
  private static mapOverdueTasks(
    overdueAgg: OpenSearchAnalyticsAggregations['overdue_tasks']
  ): OverdueTaskStats {
    const byPriority: Record<TodoPriority, number> = {
      low: 0,
      medium: 0,
      high: 0,
      critical: 0,
    };
    for (const bucket of overdueAgg.by_priority.buckets) {
      const priority = bucket.key as TodoPriority;
      if (TODO_PRIORITY_VALUES.includes(priority)) {
        byPriority[priority] = bucket.doc_count;
      }
    }
    const bySeverity: Record<TodoSeverity, number> = {
      info: 0,
      low: 0,
      medium: 0,
      high: 0,
      critical: 0,
    };
    for (const bucket of overdueAgg.by_severity.buckets) {
      const severity = bucket.key as TodoSeverity;
      if (TODO_SEVERITY_VALUES.includes(severity)) {
        bySeverity[severity] = bucket.doc_count;
      }
    }
    return {
      total: overdueAgg.doc_count,
      byPriority,
      bySeverity,
    };
  }
  private static mapDistribution(
    buckets: Array<{ key: string; doc_count: number }>,
    total: number,
    allValues: readonly string[]
  ): DistributionStats[] {
    const bucketMap = new Map<string, number>();
    for (const bucket of buckets) {
      bucketMap.set(bucket.key, bucket.doc_count);
    }
    return allValues.map((label) => {
      const count = bucketMap.get(label) || 0;
      const percentage = TodosMapper.calculatePercentage(count, total);
      return {
        label,
        count,
        percentage,
      };
    });
  }

  private static mapPrioritySeverityMatrix(
    buckets: OpenSearchAnalyticsAggregations['priority_severity_matrix']['buckets'],
    total: number
  ): PrioritySeverityMatrixCell[] {
    const matrix: PrioritySeverityMatrixCell[] = [];

    for (const priorityBucket of buckets) {
      const priority = priorityBucket.key as TodoPriority;
      if (!TODO_PRIORITY_VALUES.includes(priority)) {
        continue;
      }

      for (const severityBucket of priorityBucket.by_severity.buckets) {
        const severity = severityBucket.key as TodoSeverity;
        if (!TODO_SEVERITY_VALUES.includes(severity)) {
          continue;
        }

        const count = severityBucket.doc_count;
        const percentage = TodosMapper.calculatePercentage(count, total);

        matrix.push({
          priority,
          severity,
          count,
          percentage,
        });
      }
    }

    return matrix;
  }
}
