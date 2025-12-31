import {
  CreateTodoRequest,
  UpdateTodoRequest,
  ListTodosQueryParams,
  TodoStatsQueryParams,
  TodoAnalyticsQueryParams,
  TodoStatus,
  TodoPriority,
  TodoSeverity,
  TodoSortField,
  SortDirection,
} from '../../common';
import { Logger } from '../../../../src/core/server';

export class RequestParser {
  constructor(private readonly logger: Logger) {}

  parseListQueryParams(query: Record<string, unknown>): ListTodosQueryParams {
    return {
      ...(query.page !== undefined && { page: this.parseNumber(query.page, 'page') }),
      ...(query.pageSize !== undefined && { pageSize: this.parseNumber(query.pageSize, 'pageSize') }),
      ...(query.status !== undefined && { status: this.parseStatus(query.status) }),
      ...(query.tags !== undefined && { tags: this.parseTags(query.tags) }),
      ...(query.searchText !== undefined && typeof query.searchText === 'string' && { searchText: query.searchText }),
      ...(query.assignee !== undefined && typeof query.assignee === 'string' && { assignee: query.assignee }),
      ...(query.priority !== undefined && { priority: this.parsePriority(query.priority) }),
      ...(query.severity !== undefined && { severity: this.parseSeverity(query.severity) }),
      ...(query.complianceFrameworks !== undefined && { complianceFrameworks: this.parseComplianceFrameworks(query.complianceFrameworks) }),
      ...(query.dueDateAfter !== undefined && typeof query.dueDateAfter === 'string' && { dueDateAfter: query.dueDateAfter }),
      ...(query.dueDateBefore !== undefined && typeof query.dueDateBefore === 'string' && { dueDateBefore: query.dueDateBefore }),
      ...(query.isOverdue !== undefined && { isOverdue: this.parseBoolean(query.isOverdue) }),
      ...(query.sortField !== undefined && { sortField: this.parseSortField(query.sortField) }),
      ...(query.sortDirection !== undefined && { sortDirection: this.parseSortDirection(query.sortDirection) }),
    };
  }

  parseCreateRequest(body: unknown): CreateTodoRequest {
    if (!body || typeof body !== 'object') {
      return { title: '' };
    }
    const obj = body as Record<string, unknown>;
    return {
      title: typeof obj.title === 'string' ? obj.title : '',
      ...(typeof obj.description === 'string' && { description: obj.description }),
      ...(this.parseOptionalStatus(obj.status) && { status: this.parseOptionalStatus(obj.status) }),
      ...(this.parseOptionalTags(obj.tags) && { tags: this.parseOptionalTags(obj.tags) }),
      ...(typeof obj.assignee === 'string' && { assignee: obj.assignee }),
      ...(this.parseOptionalPriority(obj.priority) && { priority: this.parseOptionalPriority(obj.priority) }),
      ...(this.parseOptionalSeverity(obj.severity) && { severity: this.parseOptionalSeverity(obj.severity) }),
      ...(typeof obj.dueDate === 'string' && { dueDate: obj.dueDate }),
      ...(this.parseOptionalComplianceFrameworks(obj.complianceFrameworks) && { complianceFrameworks: this.parseOptionalComplianceFrameworks(obj.complianceFrameworks) }),
    };
  }

  parseUpdateRequest(body: unknown): UpdateTodoRequest {
    if (!body || typeof body !== 'object') {
      return {};
    }
    const obj = body as Record<string, unknown>;
    return {
      ...(obj.title !== undefined && { title: typeof obj.title === 'string' ? obj.title : '' }),
      ...(obj.description !== undefined && { description: typeof obj.description === 'string' ? obj.description : '' }),
      ...(obj.status !== undefined && { status: this.parseOptionalStatus(obj.status) }),
      ...(obj.tags !== undefined && { tags: this.parseOptionalTags(obj.tags) }),
      ...(obj.assignee !== undefined && { assignee: typeof obj.assignee === 'string' ? obj.assignee : '' }),
      ...(obj.priority !== undefined && { priority: this.parseOptionalPriority(obj.priority) }),
      ...(obj.severity !== undefined && { severity: this.parseOptionalSeverity(obj.severity) }),
      ...(obj.dueDate !== undefined && { dueDate: obj.dueDate === null ? null : typeof obj.dueDate === 'string' ? obj.dueDate : undefined }),
      ...(obj.complianceFrameworks !== undefined && { complianceFrameworks: this.parseOptionalComplianceFrameworks(obj.complianceFrameworks) }),
    };
  }

  parseStatsQueryParams(query: Record<string, unknown>): TodoStatsQueryParams {
    return {
      ...(query.createdAfter !== undefined && typeof query.createdAfter === 'string' && { createdAfter: query.createdAfter }),
      ...(query.createdBefore !== undefined && typeof query.createdBefore === 'string' && { createdBefore: query.createdBefore }),
      ...(query.timeInterval !== undefined &&
          typeof query.timeInterval === 'string' &&
          ['hour', 'day', 'week', 'month'].includes(query.timeInterval) &&
          { timeInterval: query.timeInterval as 'hour' | 'day' | 'week' | 'month' }),
      ...(query.topTagsLimit !== undefined && { topTagsLimit: this.parseNumber(query.topTagsLimit, 'topTagsLimit') }),
    };
  }

  parseAnalyticsQueryParams(query: Record<string, unknown>): TodoAnalyticsQueryParams {
    return {
      ...(query.complianceFramework !== undefined && typeof query.complianceFramework === 'string' && { complianceFramework: query.complianceFramework }),
      ...(query.overdueOnly !== undefined && { overdueOnly: this.parseBoolean(query.overdueOnly) }),
    };
  }

  private parseNumber(value: unknown, field: string): number {
    if (typeof value === 'number') {
      return value;
    }
    if (typeof value === 'string') {
      const num = parseInt(value, 10);
      if (!isNaN(num)) {
        return num;
      }
    }
    this.logger.warn(`Invalid number for field ${field}: ${value}`);
    return 1;
  }

  private parseStatus(value: unknown): TodoStatus | TodoStatus[] | undefined {
    if (typeof value === 'string') {
      if (value.includes(',')) {
        return value
          .split(',')
          .map((s) => s.trim())
          .filter((s): s is TodoStatus => ['planned', 'done', 'error'].includes(s));
      }
      if (['planned', 'done', 'error'].includes(value)) {
        return value as TodoStatus;
      }
    }
    if (Array.isArray(value)) {
      return value.filter((s): s is TodoStatus =>
        typeof s === 'string' && ['planned', 'done', 'error'].includes(s)
      );
    }
    return undefined;
  }

  private parseOptionalStatus(value: unknown): TodoStatus | undefined {
    if (typeof value === 'string' && ['planned', 'done', 'error'].includes(value)) {
      return value as TodoStatus;
    }
    return undefined;
  }

  private parseTags(value: unknown): readonly string[] | undefined {
    if (typeof value === 'string') {
      return value.split(',').map((t) => t.trim()).filter((t) => t.length > 0);
    }
    if (Array.isArray(value)) {
      return value.filter((t): t is string => typeof t === 'string' && t.length > 0);
    }
    return undefined;
  }

  private parseOptionalTags(value: unknown): readonly string[] | undefined {
    if (Array.isArray(value)) {
      return value.filter((t): t is string => typeof t === 'string');
    }
    return undefined;
  }

  private parseSortField(value: unknown): TodoSortField | undefined {
    const validFields: TodoSortField[] = [
      'createdAt',
      'updatedAt',
      'completedAt',
      'title',
      'status',
      'priority',
      'severity',
      'dueDate',
    ];
    if (typeof value === 'string' && validFields.includes(value as TodoSortField)) {
      return value as TodoSortField;
    }
    return undefined;
  }

  private parseSortDirection(value: unknown): SortDirection | undefined {
    if (typeof value === 'string' && ['asc', 'desc'].includes(value)) {
      return value as SortDirection;
    }
    return undefined;
  }

  private parsePriority(value: unknown): TodoPriority | TodoPriority[] | undefined {
    const validPriorities: TodoPriority[] = ['low', 'medium', 'high', 'critical'];
    if (typeof value === 'string') {
      if (value.includes(',')) {
        return value
          .split(',')
          .map((s) => s.trim())
          .filter((s): s is TodoPriority => validPriorities.includes(s as TodoPriority));
      }
      if (validPriorities.includes(value as TodoPriority)) {
        return value as TodoPriority;
      }
    }
    if (Array.isArray(value)) {
      return value.filter((s): s is TodoPriority =>
        typeof s === 'string' && validPriorities.includes(s as TodoPriority)
      );
    }
    return undefined;
  }

  private parseOptionalPriority(value: unknown): TodoPriority | undefined {
    const validPriorities: TodoPriority[] = ['low', 'medium', 'high', 'critical'];
    if (typeof value === 'string' && validPriorities.includes(value as TodoPriority)) {
      return value as TodoPriority;
    }
    return undefined;
  }

  private parseSeverity(value: unknown): TodoSeverity | TodoSeverity[] | undefined {
    const validSeverities: TodoSeverity[] = ['info', 'low', 'medium', 'high', 'critical'];
    if (typeof value === 'string') {
      if (value.includes(',')) {
        return value
          .split(',')
          .map((s) => s.trim())
          .filter((s): s is TodoSeverity => validSeverities.includes(s as TodoSeverity));
      }
      if (validSeverities.includes(value as TodoSeverity)) {
        return value as TodoSeverity;
      }
    }
    if (Array.isArray(value)) {
      return value.filter((s): s is TodoSeverity =>
        typeof s === 'string' && validSeverities.includes(s as TodoSeverity)
      );
    }
    return undefined;
  }

  private parseOptionalSeverity(value: unknown): TodoSeverity | undefined {
    const validSeverities: TodoSeverity[] = ['info', 'low', 'medium', 'high', 'critical'];
    if (typeof value === 'string' && validSeverities.includes(value as TodoSeverity)) {
      return value as TodoSeverity;
    }
    return undefined;
  }

  private parseComplianceFrameworks(value: unknown): readonly string[] | undefined {
    if (typeof value === 'string') {
      return value.split(',').map((f) => f.trim()).filter((f) => f.length > 0);
    }
    if (Array.isArray(value)) {
      return value.filter((f): f is string => typeof f === 'string' && f.length > 0);
    }
    return undefined;
  }

  private parseOptionalComplianceFrameworks(value: unknown): readonly string[] | undefined {
    if (Array.isArray(value)) {
      return value.filter((f): f is string => typeof f === 'string');
    }
    return undefined;
  }

  private parseBoolean(value: unknown): boolean | undefined {
    if (typeof value === 'boolean') {
      return value;
    }
    if (typeof value === 'string') {
      const lower = value.toLowerCase();
      if (lower === 'true' || lower === '1') {
        return true;
      }
      if (lower === 'false' || lower === '0') {
        return false;
      }
    }
    return undefined;
  }
}
