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
} from "../../../common/todo/todo.dtos";
import { buildQueryParams } from "./query-params.builder";

export class TodosClient {
  private readonly basePath = "/api/customPlugin/todos";

  constructor(private readonly http: HttpSetup) {}

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

  async getById(id: string): Promise<GetTodoResponse> {
    return this.http.get<GetTodoResponse>(`${this.basePath}/${id}`);
  }

  async create(request: CreateTodoRequest): Promise<CreateTodoResponse> {
    return this.http.post<CreateTodoResponse>(this.basePath, {
      body: JSON.stringify(request),
    });
  }

  async update(
    id: string,
    request: UpdateTodoRequest
  ): Promise<UpdateTodoResponse> {
    return this.http.patch<UpdateTodoResponse>(`${this.basePath}/${id}`, {
      body: JSON.stringify(request),
    });
  }

  async delete(id: string): Promise<DeleteTodoResponse> {
    return this.http.delete<DeleteTodoResponse>(`${this.basePath}/${id}`);
  }

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

  async getSuggestions(): Promise<TodoSuggestionsResponse> {
    return this.http.get<TodoSuggestionsResponse>(
      `${this.basePath}/_suggestions`
    );
  }
}
