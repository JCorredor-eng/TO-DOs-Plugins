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
} from '../../common';
import { TodosRepository, TodoOpenSearchClient, TodoSearchParams } from '../repositories';
import { TodosMapper } from '../mappers';
import { ValidationError } from '../errors';
import { FieldValidators } from './validators/field-validators';

/**
 * Service layer for TODO item business logic.
 *
 * Handles CRUD operations, validation, and business rules for TODO items.
 * Orchestrates repository access and applies domain logic.
 *
 * @remarks
 * This service implements the business logic layer in the 5-layer architecture:
 * Routes → Controllers → **Services** → Repositories → Mappers
 */
export class TodosService {
  private readonly logger: Logger;
  private readonly repository: TodosRepository;

  constructor(logger: Logger, repository: TodosRepository) {
    this.logger = logger;
    this.repository = repository;
  }

  /**
   * Creates a new TODO item.
   *
   * @param client - OpenSearch client with request-scoped permissions
   * @param request - TODO creation request with required fields
   * @returns Created TODO with generated ID and timestamps
   * @throws {ValidationError} If request validation fails
   * @throws {IndexError} If OpenSearch operation fails
   *
   * @example
   * ```typescript
   * const todo = await service.create(client, {
   *   title: 'Fix security vulnerability',
   *   status: 'planned',
   *   priority: 'high',
   *   severity: 'critical'
   * });
   * ```
   */
  async create(client: TodoOpenSearchClient, request: CreateTodoRequest): Promise<Todo> {
    this.validateCreateRequest(request);
    const now = new Date().toISOString();
    const document = TodosMapper.toCreateDocument(request, now);
    this.logger.debug(`Creating TODO: ${request.title}`);
    return this.repository.create(client, document);
  }

  /**
   * Retrieves a TODO item by its ID.
   *
   * @param client - OpenSearch client with request-scoped permissions
   * @param id - Unique identifier of the TODO item
   * @returns TODO item with the specified ID
   * @throws {ValidationError} If ID is invalid
   * @throws {NotFoundError} If TODO with the specified ID does not exist
   * @throws {IndexError} If OpenSearch operation fails
   */
  async getById(client: TodoOpenSearchClient, id: string): Promise<Todo> {
    this.validateId(id);
    return this.repository.getById(client, id);
  }

  /**
   * Lists TODO items with filtering, searching, pagination, and sorting.
   *
   * @param client - OpenSearch client with request-scoped permissions
   * @param params - Query parameters for filtering, pagination, and sorting
   * @returns Paginated list of TODO items matching the query
   * @throws {IndexError} If OpenSearch operation fails
   *
   * @example
   * ```typescript
   * const result = await service.list(client, {
   *   status: ['planned', 'error'],
   *   priority: 'high',
   *   page: 1,
   *   pageSize: 20,
   *   sortField: 'createdAt',
   *   sortDirection: 'desc'
   * });
   * ```
   */
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

  /**
   * Updates an existing TODO item with partial updates.
   *
   * @param client - OpenSearch client with request-scoped permissions
   * @param id - Unique identifier of the TODO item to update
   * @param request - Update request with fields to modify (partial update)
   * @returns Updated TODO item with new values
   * @throws {ValidationError} If ID or update request is invalid
   * @throws {NotFoundError} If TODO with the specified ID does not exist
   * @throws {IndexError} If OpenSearch operation fails
   *
   * @remarks
   * - Automatically manages completedAt timestamp based on status transitions
   * - Sets completedAt when status changes to 'done'
   * - Clears completedAt when status changes from 'done' to another status
   *
   * @example
   * ```typescript
   * const updated = await service.update(client, todoId, {
   *   status: 'done',
   *   description: 'Completed the security fix'
   * });
   * ```
   */
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

  /**
   * Deletes a TODO item permanently.
   *
   * @param client - OpenSearch client with request-scoped permissions
   * @param id - Unique identifier of the TODO item to delete
   * @returns True if the TODO was successfully deleted
   * @throws {ValidationError} If ID is invalid
   * @throws {NotFoundError} If TODO with the specified ID does not exist
   * @throws {IndexError} If OpenSearch operation fails
   */
  async delete(client: TodoOpenSearchClient, id: string): Promise<boolean> {
    this.validateId(id);
    return this.repository.delete(client, id);
  }

  /**
   * Validates a create TODO request.
   *
   * @param request - Create request to validate
   * @throws {ValidationError} If any field fails validation
   * @private
   */
  private validateCreateRequest(request: CreateTodoRequest): void {
    FieldValidators.validateTitle(request.title, true);
    FieldValidators.validateDescription(request.description);
    FieldValidators.validateStatus(request.status);
    FieldValidators.validateTags(request.tags);
    FieldValidators.validateAssignee(request.assignee);
    FieldValidators.validatePriority(request.priority);
    FieldValidators.validateSeverity(request.severity);
    FieldValidators.validateDueDate(request.dueDate, false);
    FieldValidators.validateComplianceFrameworks(request.complianceFrameworks);
  }

  /**
   * Validates an update TODO request.
   *
   * @param request - Update request to validate
   * @throws {ValidationError} If no fields are provided or any field fails validation
   * @private
   */
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

    FieldValidators.validateTitle(request.title, false);
    FieldValidators.validateDescription(request.description);
    FieldValidators.validateStatus(request.status);
    FieldValidators.validateTags(request.tags);
    FieldValidators.validateAssignee(request.assignee);
    FieldValidators.validatePriority(request.priority);
    FieldValidators.validateSeverity(request.severity);
    FieldValidators.validateDueDate(request.dueDate, true);
    FieldValidators.validateComplianceFrameworks(request.complianceFrameworks);
  }

  /**
   * Validates a TODO ID.
   *
   * @param id - ID to validate
   * @throws {ValidationError} If ID is empty or whitespace
   * @private
   */
  private validateId(id: string): void {
    if (!id || id.trim().length === 0) {
      throw new ValidationError('ID is required', { field: 'id' });
    }
  }

  /**
   * Validates a status transition (placeholder for future business rules).
   *
   * @param currentStatus - Current status of the TODO
   * @param newStatus - New status to transition to
   * @private
   */
  private validateStatusTransition(currentStatus: string, newStatus: string): void {
    this.logger.debug(`Status transition: ${currentStatus} -> ${newStatus}`);
  }

  /**
   * Retrieves suggestions for tags and compliance frameworks.
   *
   * @param client - OpenSearch client with request-scoped permissions
   * @returns Lists of unique tags and compliance frameworks currently in use
   * @throws {IndexError} If OpenSearch operation fails
   *
   * @remarks
   * Used to populate autocomplete/suggestion dropdowns in the UI.
   */
  async getSuggestions(client: TodoOpenSearchClient): Promise<{
    tags: string[];
    complianceFrameworks: string[];
  }> {
    return this.repository.getSuggestions(client);
  }

  /**
   * Builds search parameters from query parameters.
   *
   * @param params - List query parameters from HTTP request
   * @returns Normalized search parameters for repository
   * @private
   */
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
