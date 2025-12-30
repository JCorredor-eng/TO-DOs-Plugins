import {
  Todo,
  TodoStatus,
  TodoPriority,
  TodoSeverity,
  TodoStats,
  TagCount,
  TimeSeriesPoint,
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
export interface TodoDocument {
  title: string;
  description?: string;
  status: TodoStatus;
  tags: string[];
  assignee?: string;
  priority: TodoPriority;
  severity: TodoSeverity;
  due_date: string | null;
  compliance_framework: string[];
  created_at: string;
  updated_at: string;
  completed_at: string | null;
}
export interface OpenSearchHit<T> {
  _id: string;
  _source: T;
  _score?: number;
}
export interface OpenSearchSearchResponse<T> {
  hits: {
    total: {
      value: number;
      relation: string;
    };
    hits: Array<OpenSearchHit<T>>;
  };
}
export interface OpenSearchBucket {
  key: string;
  doc_count: number;
  key_as_string?: string;
}
export interface OpenSearchStatsAggregations {
  by_status: {
    buckets: OpenSearchBucket[];
  };
  top_tags: {
    buckets: OpenSearchBucket[];
  };
  completed_over_time: {
    buckets: OpenSearchBucket[];
  };
}
export class TodosMapper {
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
  static fromOpenSearchHits(hits: Array<OpenSearchHit<TodoDocument>>): Todo[] {
    return hits.map((hit) => TodosMapper.fromOpenSearchHit(hit));
  }
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
  static normalizeTags(tags?: readonly string[]): string[] {
    if (!tags || tags.length === 0) {
      return [];
    }
    const normalized = tags
      .map((tag) => tag.trim().toLowerCase())
      .filter((tag) => tag.length > 0);
    return [...new Set(normalized)];
  }
  static normalizeComplianceFrameworks(frameworks?: readonly string[]): string[] {
    if (!frameworks || frameworks.length === 0) {
      return [];
    }
    const normalized = frameworks
      .map((framework) => framework.trim())
      .filter((framework) => framework.length > 0);
    return [...new Set(normalized)];
  }
  static toTodoStats(total: number, aggregations: OpenSearchStatsAggregations): TodoStats {
    const byStatus: Record<string, number> = {
      planned: 0,
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
    return {
      total,
      byStatus: byStatus as Record<'planned' | 'done' | 'error', number>,
      topTags,
      completedOverTime,
    };
  }
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
      const completionRate = total > 0 ? Math.round((doneCount / total) * 100 * 100) / 100 : 0;
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
      const percentage = total > 0 ? Math.round((count / total) * 100 * 100) / 100 : 0;
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
        const percentage = total > 0 ? Math.round((count / total) * 100 * 100) / 100 : 0;

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
