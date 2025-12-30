import {
  OpenSearchDashboardsRequest,
  OpenSearchDashboardsResponseFactory,
  RequestHandlerContext,
  Logger,
} from '../../../../src/core/server';
import {
  CreateTodoRequest,
  UpdateTodoRequest,
  ListTodosQueryParams,
  TodoStatsQueryParams,
  TodoAnalyticsQueryParams,
  CreateTodoResponse,
  UpdateTodoResponse,
  GetTodoResponse,
  DeleteTodoResponse,
  ListTodosResponse,
  TodoStatsResponse,
  TodoAnalyticsResponse,
  TodoSuggestionsResponse,
} from '../../common';
import { TodosService, TodoStatsService, TodoAnalyticsService } from '../services';
import { TodoOpenSearchClient } from '../repositories';
import { mapErrorToHttpResponse } from '../errors';
import { RequestParser } from '../utils';
export class TodosController {
  private readonly logger: Logger;
  private readonly todosService: TodosService;
  private readonly statsService: TodoStatsService;
  private readonly analyticsService: TodoAnalyticsService;
  private readonly requestParser: RequestParser;

  constructor(
    logger: Logger,
    todosService: TodosService,
    statsService: TodoStatsService,
    analyticsService: TodoAnalyticsService
  ) {
    this.logger = logger;
    this.todosService = todosService;
    this.statsService = statsService;
    this.analyticsService = analyticsService;
    this.requestParser = new RequestParser(logger);
  }
  async list(
    context: RequestHandlerContext,
    request: OpenSearchDashboardsRequest<unknown, ListTodosQueryParams>,
    response: OpenSearchDashboardsResponseFactory
  ) {
    try {
      const client = this.getOpenSearchClient(context);
      const params = this.requestParser.parseListQueryParams(request.query);
      const result: ListTodosResponse = await this.todosService.list(client, params);
      return response.ok({ body: result });
    } catch (error) {
      return mapErrorToHttpResponse(error, response, this.logger);
    }
  }
  async getById(
    context: RequestHandlerContext,
    request: OpenSearchDashboardsRequest<{ id: string }>,
    response: OpenSearchDashboardsResponseFactory
  ) {
    try {
      const client = this.getOpenSearchClient(context);
      const { id } = request.params;
      const todo = await this.todosService.getById(client, id);
      const responseBody: GetTodoResponse = { todo };
      return response.ok({ body: responseBody });
    } catch (error) {
      return mapErrorToHttpResponse(error, response, this.logger);
    }
  }
  async create(
    context: RequestHandlerContext,
    request: OpenSearchDashboardsRequest<unknown, unknown, CreateTodoRequest>,
    response: OpenSearchDashboardsResponseFactory
  ) {
    try {
      const client = this.getOpenSearchClient(context);
      const createRequest = this.requestParser.parseCreateRequest(request.body);
      const todo = await this.todosService.create(client, createRequest);
      const responseBody: CreateTodoResponse = { todo };
      return response.ok({ body: responseBody });
    } catch (error) {
      return mapErrorToHttpResponse(error, response, this.logger);
    }
  }
  async update(
    context: RequestHandlerContext,
    request: OpenSearchDashboardsRequest<{ id: string }, unknown, UpdateTodoRequest>,
    response: OpenSearchDashboardsResponseFactory
  ) {
    try {
      const client = this.getOpenSearchClient(context);
      const { id } = request.params;
      const updateRequest = this.requestParser.parseUpdateRequest(request.body);
      const todo = await this.todosService.update(client, id, updateRequest);
      const responseBody: UpdateTodoResponse = { todo };
      return response.ok({ body: responseBody });
    } catch (error) {
      return mapErrorToHttpResponse(error, response, this.logger);
    }
  }
  async delete(
    context: RequestHandlerContext,
    request: OpenSearchDashboardsRequest<{ id: string }>,
    response: OpenSearchDashboardsResponseFactory
  ) {
    try {
      const client = this.getOpenSearchClient(context);
      const { id } = request.params;
      await this.todosService.delete(client, id);
      const responseBody: DeleteTodoResponse = { id, deleted: true };
      return response.ok({ body: responseBody });
    } catch (error) {
      return mapErrorToHttpResponse(error, response, this.logger);
    }
  }
  async getStats(
    context: RequestHandlerContext,
    request: OpenSearchDashboardsRequest<unknown, TodoStatsQueryParams>,
    response: OpenSearchDashboardsResponseFactory
  ) {
    try {
      const client = this.getOpenSearchClient(context);
      const params = this.requestParser.parseStatsQueryParams(request.query);
      const stats = await this.statsService.getStats(client, params);
      const responseBody: TodoStatsResponse = { stats };
      return response.ok({ body: responseBody });
    } catch (error) {
      return mapErrorToHttpResponse(error, response, this.logger);
    }
  }
  async getAnalytics(
    context: RequestHandlerContext,
    request: OpenSearchDashboardsRequest<unknown, TodoAnalyticsQueryParams>,
    response: OpenSearchDashboardsResponseFactory
  ) {
    try {
      const client = this.getOpenSearchClient(context);
      const params = this.requestParser.parseAnalyticsQueryParams(request.query);
      const analytics = await this.analyticsService.getAnalytics(client, params);
      const responseBody: TodoAnalyticsResponse = { analytics };
      return response.ok({ body: responseBody });
    } catch (error) {
      return mapErrorToHttpResponse(error, response, this.logger);
    }
  }

  async getSuggestions(
    context: RequestHandlerContext,
    request: OpenSearchDashboardsRequest,
    response: OpenSearchDashboardsResponseFactory
  ) {
    try {
      const client = this.getOpenSearchClient(context);
      const suggestions = await this.todosService.getSuggestions(client);
      const responseBody: TodoSuggestionsResponse = {
        tags: suggestions.tags,
        complianceFrameworks: suggestions.complianceFrameworks,
      };
      return response.ok({ body: responseBody });
    } catch (error) {
      return mapErrorToHttpResponse(error, response, this.logger);
    }
  }

  private getOpenSearchClient(context: RequestHandlerContext): TodoOpenSearchClient {
    return context.core.opensearch.client.asCurrentUser as unknown as TodoOpenSearchClient;
  }
}
