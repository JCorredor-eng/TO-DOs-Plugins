import { Logger } from '../../../../src/core/server';
import {
  Todo,
  CreateTodoRequest,
  UpdateTodoRequest,
  ListTodosQueryParams,
  ListTodosResponse,
  PaginationMeta,
  DEFAULT_PAGE_SIZE,
  MAX_PAGE_SIZE,
  TODO_PRIORITY_VALUES,
  TODO_SEVERITY_VALUES,
  MAX_COMPLIANCE_FRAMEWORKS,
  MAX_COMPLIANCE_FRAMEWORK_LENGTH,
} from '../../common';
import { TodosRepository, TodoOpenSearchClient, TodoSearchParams } from '../repositories';
import { TodosMapper } from '../mappers';
import { ValidationError } from '../errors';
export class TodosService {
  private readonly logger: Logger;
  private readonly repository: TodosRepository;
  constructor(logger: Logger, repository: TodosRepository) {
    this.logger = logger;
    this.repository = repository;
  }
  async create(client: TodoOpenSearchClient, request: CreateTodoRequest): Promise<Todo> {
    this.validateCreateRequest(request);
    const now = new Date().toISOString();
    const document = TodosMapper.toCreateDocument(request, now);
    this.logger.debug(`Creating TODO: ${request.title}`);
    return this.repository.create(client, document);
  }
  async getById(client: TodoOpenSearchClient, id: string): Promise<Todo> {
    this.validateId(id);
    return this.repository.getById(client, id);
  }
  async list(client: TodoOpenSearchClient, params: ListTodosQueryParams): Promise<ListTodosResponse> {
    const searchParams = this.buildSearchParams(params);
    const result = await this.repository.search(client, searchParams);
    const page = Math.max(1, params.page || 1);
    const pageSize = Math.min(MAX_PAGE_SIZE, Math.max(1, params.pageSize || DEFAULT_PAGE_SIZE));
    const totalPages = Math.ceil(result.total / pageSize);
    const pagination: PaginationMeta = {
      page,
      pageSize,
      totalItems: result.total,
      totalPages,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
    };
    return {
      todos: result.todos,
      pagination,
    };
  }
  async update(
    client: TodoOpenSearchClient,
    id: string,
    request: UpdateTodoRequest
  ): Promise<Todo> {
    this.validateId(id);
    this.validateUpdateRequest(request);
    const existingTodo = await this.repository.getById(client, id);
    if (request.status !== undefined) {
      this.validateStatusTransition(existingTodo.status, request.status);
    }
    const now = new Date().toISOString();
    const updateDocument = TodosMapper.toUpdateDocument(request, existingTodo, now);
    await this.repository.update(client, id, updateDocument);
    return TodosMapper.mergeUpdate(existingTodo, updateDocument, id);
  }
  async delete(client: TodoOpenSearchClient, id: string): Promise<boolean> {
    this.validateId(id);
    return this.repository.delete(client, id);
  }
  private validateCreateRequest(request: CreateTodoRequest): void {
    if (!request.title || request.title.trim().length === 0) {
      throw new ValidationError('Title is required', { field: 'title' });
    }
    if (request.title.length > 256) {
      throw new ValidationError('Title must not exceed 256 characters', {
        field: 'title',
        maxLength: 256,
        actualLength: request.title.length,
      });
    }
    if (request.description && request.description.length > 4000) {
      throw new ValidationError('Description must not exceed 4000 characters', {
        field: 'description',
        maxLength: 4000,
        actualLength: request.description.length,
      });
    }
    if (request.status && !['planned', 'done', 'error'].includes(request.status)) {
      throw new ValidationError(`Invalid status: ${request.status}`, {
        field: 'status',
        validValues: ['planned', 'done', 'error'],
      });
    }
    if (request.tags) {
      if (request.tags.length > 20) {
        throw new ValidationError('Maximum 20 tags allowed', {
          field: 'tags',
          maxTags: 20,
          actualTags: request.tags.length,
        });
      }
      for (const tag of request.tags) {
        if (tag.length > 50) {
          throw new ValidationError('Each tag must not exceed 50 characters', {
            field: 'tags',
            maxLength: 50,
            tag,
          });
        }
      }
    }
    if (request.assignee && request.assignee.length > 100) {
      throw new ValidationError('Assignee must not exceed 100 characters', {
        field: 'assignee',
        maxLength: 100,
        actualLength: request.assignee.length,
      });
    }
    if (request.priority && !TODO_PRIORITY_VALUES.includes(request.priority)) {
      throw new ValidationError(`Invalid priority: ${request.priority}`, {
        field: 'priority',
        validValues: [...TODO_PRIORITY_VALUES],
      });
    }
    if (request.severity && !TODO_SEVERITY_VALUES.includes(request.severity)) {
      throw new ValidationError(`Invalid severity: ${request.severity}`, {
        field: 'severity',
        validValues: [...TODO_SEVERITY_VALUES],
      });
    }
    if (request.dueDate && !this.isValidISODate(request.dueDate)) {
      throw new ValidationError('Invalid dueDate format. Use ISO 8601 format (e.g., 2025-12-31T23:59:59Z)', {
        field: 'dueDate',
        format: 'ISO 8601',
      });
    }
    if (request.complianceFrameworks) {
      if (request.complianceFrameworks.length > MAX_COMPLIANCE_FRAMEWORKS) {
        throw new ValidationError(`Maximum ${MAX_COMPLIANCE_FRAMEWORKS} compliance frameworks allowed`, {
          field: 'complianceFrameworks',
          maxFrameworks: MAX_COMPLIANCE_FRAMEWORKS,
          actualFrameworks: request.complianceFrameworks.length,
        });
      }
      for (const framework of request.complianceFrameworks) {
        if (framework.length > MAX_COMPLIANCE_FRAMEWORK_LENGTH) {
          throw new ValidationError(`Each compliance framework must not exceed ${MAX_COMPLIANCE_FRAMEWORK_LENGTH} characters`, {
            field: 'complianceFrameworks',
            maxLength: MAX_COMPLIANCE_FRAMEWORK_LENGTH,
            framework,
          });
        }
      }
    }
  }
  private validateUpdateRequest(request: UpdateTodoRequest): void {
    const hasUpdates =
      request.title !== undefined ||
      request.description !== undefined ||
      request.status !== undefined ||
      request.tags !== undefined ||
      request.assignee !== undefined ||
      request.priority !== undefined ||
      request.severity !== undefined ||
      request.dueDate !== undefined ||
      request.complianceFrameworks !== undefined;
    if (!hasUpdates) {
      throw new ValidationError('At least one field must be provided for update');
    }
    if (request.title !== undefined) {
      if (request.title.trim().length === 0) {
        throw new ValidationError('Title cannot be empty', { field: 'title' });
      }
      if (request.title.length > 256) {
        throw new ValidationError('Title must not exceed 256 characters', {
          field: 'title',
          maxLength: 256,
          actualLength: request.title.length,
        });
      }
    }
    if (request.description !== undefined && request.description.length > 4000) {
      throw new ValidationError('Description must not exceed 4000 characters', {
        field: 'description',
        maxLength: 4000,
        actualLength: request.description.length,
      });
    }
    if (request.status !== undefined && !['planned', 'done', 'error'].includes(request.status)) {
      throw new ValidationError(`Invalid status: ${request.status}`, {
        field: 'status',
        validValues: ['planned', 'done', 'error'],
      });
    }
    if (request.tags !== undefined) {
      if (request.tags.length > 20) {
        throw new ValidationError('Maximum 20 tags allowed', {
          field: 'tags',
          maxTags: 20,
          actualTags: request.tags.length,
        });
      }
      for (const tag of request.tags) {
        if (tag.length > 50) {
          throw new ValidationError('Each tag must not exceed 50 characters', {
            field: 'tags',
            maxLength: 50,
            tag,
          });
        }
      }
    }
    if (request.assignee !== undefined && request.assignee.length > 100) {
      throw new ValidationError('Assignee must not exceed 100 characters', {
        field: 'assignee',
        maxLength: 100,
        actualLength: request.assignee.length,
      });
    }
    if (request.priority !== undefined && !TODO_PRIORITY_VALUES.includes(request.priority)) {
      throw new ValidationError(`Invalid priority: ${request.priority}`, {
        field: 'priority',
        validValues: [...TODO_PRIORITY_VALUES],
      });
    }
    if (request.severity !== undefined && !TODO_SEVERITY_VALUES.includes(request.severity)) {
      throw new ValidationError(`Invalid severity: ${request.severity}`, {
        field: 'severity',
        validValues: [...TODO_SEVERITY_VALUES],
      });
    }
    if (request.dueDate !== undefined && request.dueDate !== null) {
      if (!this.isValidISODate(request.dueDate)) {
        throw new ValidationError('Invalid dueDate format. Use ISO 8601 format (e.g., 2025-12-31T23:59:59Z)', {
          field: 'dueDate',
          format: 'ISO 8601',
        });
      }
    }
    if (request.complianceFrameworks !== undefined) {
      if (request.complianceFrameworks.length > MAX_COMPLIANCE_FRAMEWORKS) {
        throw new ValidationError(`Maximum ${MAX_COMPLIANCE_FRAMEWORKS} compliance frameworks allowed`, {
          field: 'complianceFrameworks',
          maxFrameworks: MAX_COMPLIANCE_FRAMEWORKS,
          actualFrameworks: request.complianceFrameworks.length,
        });
      }
      for (const framework of request.complianceFrameworks) {
        if (framework.length > MAX_COMPLIANCE_FRAMEWORK_LENGTH) {
          throw new ValidationError(`Each compliance framework must not exceed ${MAX_COMPLIANCE_FRAMEWORK_LENGTH} characters`, {
            field: 'complianceFrameworks',
            maxLength: MAX_COMPLIANCE_FRAMEWORK_LENGTH,
            framework,
          });
        }
      }
    }
  }
  private validateId(id: string): void {
    if (!id || id.trim().length === 0) {
      throw new ValidationError('ID is required', { field: 'id' });
    }
  }
  private validateStatusTransition(currentStatus: string, newStatus: string): void {
    this.logger.debug(`Status transition: ${currentStatus} -> ${newStatus}`);
  }
  private isValidISODate(dateString: string): boolean {
    try {
      const date = new Date(dateString);
      return !isNaN(date.getTime()) && dateString === date.toISOString();
    } catch {
      return false;
    }
  }
  async getSuggestions(client: TodoOpenSearchClient): Promise<{
    tags: string[];
    complianceFrameworks: string[];
  }> {
    return this.repository.getSuggestions(client);
  }

  private buildSearchParams(params: ListTodosQueryParams): TodoSearchParams {
    return {
      page: params.page,
      pageSize: params.pageSize,
      status: params.status,
      tags: params.tags,
      searchText: params.searchText,
      assignee: params.assignee,
      priority: params.priority,
      severity: params.severity,
      complianceFrameworks: params.complianceFrameworks,
      dueDateAfter: params.dueDateAfter,
      dueDateBefore: params.dueDateBefore,
      createdAfter: params.createdAfter,
      createdBefore: params.createdBefore,
      updatedAfter: params.updatedAfter,
      updatedBefore: params.updatedBefore,
      completedAfter: params.completedAfter,
      completedBefore: params.completedBefore,
      isOverdue: params.isOverdue,
      sortField: params.sortField,
      sortDirection: params.sortDirection,
    };
  }
}
