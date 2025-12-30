import { HttpSetup } from '../../../../../src/core/public';
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
} from '../../../common/todo/todo.dtos';
export class TodosClient {
  private readonly basePath = '/api/customPlugin/todos';
  constructor(private readonly http: HttpSetup) {}
  async list(params?: ListTodosQueryParams): Promise<ListTodosResponse> {
    const queryParams: Record<string, string | number | boolean> = {};
    if (params?.page) queryParams.page = params.page;
    if (params?.pageSize) queryParams.pageSize = params.pageSize;
    if (params?.searchText) queryParams.searchText = params.searchText;
    if (params?.assignee) queryParams.assignee = params.assignee;
    if (params?.sortField) queryParams.sortField = params.sortField;
    if (params?.sortDirection) queryParams.sortDirection = params.sortDirection;
    if (params?.status) {
      queryParams.status = Array.isArray(params.status)
        ? params.status.join(',')
        : params.status;
    }
    if (params?.tags && params.tags.length > 0) {
      queryParams.tags = params.tags.join(',');
    }
    if (params?.priority) {
      queryParams.priority = Array.isArray(params.priority)
        ? params.priority.join(',')
        : params.priority;
    }
    if (params?.severity) {
      queryParams.severity = Array.isArray(params.severity)
        ? params.severity.join(',')
        : params.severity;
    }
    if (params?.complianceFrameworks && params.complianceFrameworks.length > 0) {
      queryParams.complianceFrameworks = params.complianceFrameworks.join(',');
    }
    if (params?.dueDateAfter) queryParams.dueDateAfter = params.dueDateAfter;
    if (params?.dueDateBefore) queryParams.dueDateBefore = params.dueDateBefore;
    if (params?.isOverdue !== undefined) {
      queryParams.isOverdue = params.isOverdue.toString();
    }
    return this.http.get<ListTodosResponse>(this.basePath, {
      query: queryParams,
    });
  }
  async getById(id: string): Promise<GetTodoResponse> {
    return this.http.get<GetTodoResponse>(`${this.basePath}/${id}`);
  }
  async create(request: CreateTodoRequest): Promise<CreateTodoResponse> {
    return this.http.post<CreateTodoResponse>(this.basePath, {
      body: JSON.stringify(request),
    });
  }
  async update(id: string, request: UpdateTodoRequest): Promise<UpdateTodoResponse> {
    return this.http.patch<UpdateTodoResponse>(`${this.basePath}/${id}`, {
      body: JSON.stringify(request),
    });
  }
  async delete(id: string): Promise<DeleteTodoResponse> {
    return this.http.delete<DeleteTodoResponse>(`${this.basePath}/${id}`);
  }
  async getStats(params?: TodoStatsQueryParams): Promise<TodoStatsResponse> {
    const queryParams: Record<string, string | number> = {};
    if (params?.createdAfter) queryParams.createdAfter = params.createdAfter;
    if (params?.createdBefore) queryParams.createdBefore = params.createdBefore;
    if (params?.timeInterval) queryParams.timeInterval = params.timeInterval;
    if (params?.topTagsLimit) queryParams.topTagsLimit = params.topTagsLimit;
    return this.http.get<TodoStatsResponse>(`${this.basePath}/_stats`, {
      query: queryParams,
    });
  }
  async getAnalytics(params?: TodoAnalyticsQueryParams): Promise<TodoAnalyticsResponse> {
    const queryParams: Record<string, string | boolean> = {};
    if (params?.complianceFramework) queryParams.complianceFramework = params.complianceFramework;
    if (params?.overdueOnly !== undefined) queryParams.overdueOnly = params.overdueOnly;
    return this.http.get<TodoAnalyticsResponse>(`${this.basePath}/_analytics`, {
      query: queryParams,
    });
  }

  async getSuggestions(): Promise<TodoSuggestionsResponse> {
    return this.http.get<TodoSuggestionsResponse>(`${this.basePath}/_suggestions`);
  }
}
