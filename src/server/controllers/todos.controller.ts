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

/**
 * Controller layer for TODO HTTP request handling.
 *
 * Handles HTTP request/response lifecycle, delegates to service layer,
 * and maps errors to appropriate HTTP responses.
 *
 * @remarks
 * This controller implements the request handling layer in the 5-layer architecture:
 * Routes → **Controllers** → Services → Repositories → Mappers
 */
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

  /**
   * Lists TODO items with filtering, pagination, and sorting.
   *
   * @param context - Request handler context with OpenSearch client
   * @param request - HTTP request with query parameters
   * @param response - Response factory for building HTTP responses
   * @returns HTTP response with paginated TODO list or error
   */
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

  /**
   * Retrieves a single TODO item by ID.
   *
   * @param context - Request handler context with OpenSearch client
   * @param request - HTTP request with TODO ID in path parameters
   * @param response - Response factory for building HTTP responses
   * @returns HTTP response with TODO item or error
   */
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

  /**
   * Creates a new TODO item.
   *
   * @param context - Request handler context with OpenSearch client
   * @param request - HTTP request with TODO data in body
   * @param response - Response factory for building HTTP responses
   * @returns HTTP response with created TODO or error
   */
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

  /**
   * Updates an existing TODO item.
   *
   * @param context - Request handler context with OpenSearch client
   * @param request - HTTP request with TODO ID in path and update data in body
   * @param response - Response factory for building HTTP responses
   * @returns HTTP response with updated TODO or error
   */
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

  /**
   * Deletes a TODO item.
   *
   * @param context - Request handler context with OpenSearch client
   * @param request - HTTP request with TODO ID in path parameters
   * @param response - Response factory for building HTTP responses
   * @returns HTTP response with deletion confirmation or error
   */
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

  /**
   * Retrieves aggregated TODO statistics.
   *
   * @param context - Request handler context with OpenSearch client
   * @param request - HTTP request with statistics query parameters
   * @param response - Response factory for building HTTP responses
   * @returns HTTP response with TODO statistics or error
   */
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

  /**
   * Retrieves advanced analytics for compliance and risk assessment.
   *
   * @param context - Request handler context with OpenSearch client
   * @param request - HTTP request with analytics query parameters
   * @param response - Response factory for building HTTP responses
   * @returns HTTP response with analytics data or error
   */
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

  /**
   * Retrieves suggestions for tags and compliance frameworks.
   *
   * @param context - Request handler context with OpenSearch client
   * @param request - HTTP request
   * @param response - Response factory for building HTTP responses
   * @returns HTTP response with suggestion lists or error
   */
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

  /**
   * Extracts the request-scoped OpenSearch client from the request context.
   *
   * @param context - Request handler context
   * @returns OpenSearch client with permissions scoped to the current user
   * @private
   */
  private getOpenSearchClient(context: RequestHandlerContext): TodoOpenSearchClient {
    return context.core.opensearch.client.asCurrentUser as unknown as TodoOpenSearchClient;
  }
}
