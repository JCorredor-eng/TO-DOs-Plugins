import { HttpSetup } from "../../../../../src/core/public";
import {
  CreateTodoRequest,
  CreateTodoResponse,
  UpdateTodoRequest,
  UpdateTodoResponse,
  DeleteTodoResponse,
  GetTodoResponse,
  ListTodosQueryParams,
  ListTodosResponse,
  TodoStatsQueryParams,
  TodoStatsResponse,
  TodoAnalyticsQueryParams,
  TodoAnalyticsResponse,
  TodoSuggestionsResponse,
} from "../../../../common/todo/todo.dtos";
import { buildQueryParams } from "./query-params.builder";

/**
 * HTTP client for TODO API operations.
 *
 * @remarks
 * This class provides a type-safe interface for all TODO-related API calls.
 * It follows PROJECT RULE #4: Frontend must call only the plugin BFF endpoints.
 *
 * All methods return promises that resolve to typed responses or reject with HTTP errors.
 *
 * @example
 * ```typescript
 * const client = new TodosClient(http);
 * const response = await client.list({ page: 1, pageSize: 20 });
 * ```
 */
export class TodosClient {
  private readonly basePath = "/api/customPlugin/todos";

  /**
   * Creates a new TodosClient instance.
   *
   * @param http - OpenSearch Dashboards HTTP setup for making API calls
   */
  constructor(private readonly http: HttpSetup) {}

  /**
   * Lists TODO items with optional filtering, pagination, and sorting.
   *
   * @param params - Optional query parameters for filtering and pagination
   * @returns Promise resolving to paginated list of TODOs
   *
   * @example
   * ```typescript
   * // List all TODOs
   * const all = await client.list();
   *
   * // List with filters
   * const filtered = await client.list({
   *   status: 'planned',
   *   priority: ['high', 'critical'],
   *   page: 1,
   *   pageSize: 20
   * });
   * ```
   */
  async list(params?: ListTodosQueryParams): Promise<ListTodosResponse> {
    const query = buildQueryParams((builder) => {
      builder
        .addIfDefined("page", params?.page)
        .addIfDefined("pageSize", params?.pageSize)
        .addIfDefined("searchText", params?.searchText)
        .addIfDefined("assignee", params?.assignee)
        .addIfDefined("sortField", params?.sortField)
        .addIfDefined("sortDirection", params?.sortDirection)
        .addArrayOrString("status", params?.status)
        .addArray("tags", params?.tags)
        .addArrayOrString("priority", params?.priority)
        .addArrayOrString("severity", params?.severity)
        .addArray("complianceFrameworks", params?.complianceFrameworks)
        .addIfDefined("dueDateAfter", params?.dueDateAfter)
        .addIfDefined("dueDateBefore", params?.dueDateBefore)
        .addIfDefined("createdAfter", params?.createdAfter)
        .addIfDefined("createdBefore", params?.createdBefore)
        .addIfDefined("updatedAfter", params?.updatedAfter)
        .addIfDefined("updatedBefore", params?.updatedBefore)
        .addIfDefined("completedAfter", params?.completedAfter)
        .addIfDefined("completedBefore", params?.completedBefore)
        .addBoolean("isOverdue", params?.isOverdue);
    });

    return this.http.get<ListTodosResponse>(this.basePath, { query });
  }

  /**
   * Fetches a single TODO item by ID.
   *
   * @param id - The TODO ID
   * @returns Promise resolving to the TODO item
   * @throws {Error} If the TODO is not found (404)
   *
   * @example
   * ```typescript
   * const response = await client.getById('abc123');
   * console.log(response.todo.title);
   * ```
   */
  async getById(id: string): Promise<GetTodoResponse> {
    return this.http.get<GetTodoResponse>(`${this.basePath}/${id}`);
  }

  /**
   * Creates a new TODO item.
   *
   * @param request - The TODO creation request
   * @returns Promise resolving to the created TODO
   * @throws {Error} If validation fails (400)
   *
   * @example
   * ```typescript
   * const response = await client.create({
   *   title: 'Fix security vulnerability',
   *   priority: 'high',
   *   severity: 'critical',
   *   complianceFrameworks: ['PCI-DSS']
   * });
   * ```
   */
  async create(request: CreateTodoRequest): Promise<CreateTodoResponse> {
    return this.http.post<CreateTodoResponse>(this.basePath, {
      body: JSON.stringify(request),
    });
  }

  /**
   * Updates an existing TODO item.
   *
   * @param id - The TODO ID
   * @param request - The update request with fields to modify
   * @returns Promise resolving to the updated TODO
   * @throws {Error} If the TODO is not found (404) or validation fails (400)
   *
   * @example
   * ```typescript
   * const response = await client.update('abc123', {
   *   status: 'done',
   *   assignee: 'john.doe'
   * });
   * ```
   */
  async update(
    id: string,
    request: UpdateTodoRequest
  ): Promise<UpdateTodoResponse> {
    return this.http.patch<UpdateTodoResponse>(`${this.basePath}/${id}`, {
      body: JSON.stringify(request),
    });
  }

  /**
   * Deletes a TODO item.
   *
   * @param id - The TODO ID
   * @returns Promise resolving to deletion confirmation
   * @throws {Error} If the TODO is not found (404)
   *
   * @example
   * ```typescript
   * const response = await client.delete('abc123');
   * if (response.deleted) {
   *   console.log('TODO deleted successfully');
   * }
   * ```
   */
  async delete(id: string): Promise<DeleteTodoResponse> {
    return this.http.delete<DeleteTodoResponse>(`${this.basePath}/${id}`);
  }

  /**
   * Fetches TODO statistics.
   *
   * @param params - Optional query parameters for filtering statistics
   * @returns Promise resolving to TODO statistics
   *
   * @example
   * ```typescript
   * const response = await client.getStats({
   *   createdAfter: '2024-01-01',
   *   timeInterval: 'day'
   * });
   * console.log(response.stats.total);
   * ```
   */
  async getStats(params?: TodoStatsQueryParams): Promise<TodoStatsResponse> {
    const query = buildQueryParams((builder) => {
      builder
        .addIfDefined("createdAfter", params?.createdAfter)
        .addIfDefined("createdBefore", params?.createdBefore)
        .addIfDefined("timeInterval", params?.timeInterval)
        .addIfDefined("topTagsLimit", params?.topTagsLimit);
    });

    return this.http.get<TodoStatsResponse>(`${this.basePath}/_stats`, {
      query,
    });
  }

  /**
   * Fetches advanced analytics data.
   *
   * @param params - Optional query parameters for filtering analytics
   * @returns Promise resolving to advanced analytics
   *
   * @example
   * ```typescript
   * const response = await client.getAnalytics({
   *   complianceFramework: 'PCI-DSS',
   *   overdueOnly: true
   * });
   * console.log(response.analytics.complianceCoverage);
   * ```
   */
  async getAnalytics(
    params?: TodoAnalyticsQueryParams
  ): Promise<TodoAnalyticsResponse> {
    const query = buildQueryParams((builder) => {
      builder
        .addIfDefined("complianceFramework", params?.complianceFramework)
        .addBoolean("overdueOnly", params?.overdueOnly);
    });

    return this.http.get<TodoAnalyticsResponse>(`${this.basePath}/_analytics`, {
      query,
    });
  }

  /**
   * Fetches autocomplete suggestions for tags and compliance frameworks.
   *
   * @returns Promise resolving to available tags and frameworks
   *
   * @example
   * ```typescript
   * const response = await client.getSuggestions();
   * console.log(response.tags); // ['security', 'compliance', ...]
   * console.log(response.complianceFrameworks); // ['PCI-DSS', 'HIPAA', ...]
   * ```
   */
  async getSuggestions(): Promise<TodoSuggestionsResponse> {
    return this.http.get<TodoSuggestionsResponse>(
      `${this.basePath}/_suggestions`
    );
  }
}
