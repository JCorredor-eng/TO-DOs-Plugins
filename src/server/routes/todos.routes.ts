import { IRouter, Logger } from '../../../../src/core/server';
import { schema } from '@osd/config-schema';
import { PLUGIN_ID } from '../../common';
import { TodosController } from '../controllers';
import { TodosService, TodoStatsService, TodoAnalyticsService } from '../services';
import { TodosRepository, IndexManager } from '../repositories';
export function registerTodosRoutes(router: IRouter, logger: Logger): void {
  const indexManager = new IndexManager(logger);
  const repository = new TodosRepository(logger, indexManager);
  const todosService = new TodosService(logger, repository);
  const statsService = new TodoStatsService(logger, repository);
  const analyticsService = new TodoAnalyticsService(logger, repository);
  const controller = new TodosController(logger, todosService, statsService, analyticsService);
  const basePath = `/api/${PLUGIN_ID}/todos`;
  router.get(
    {
      path: basePath,
      validate: {
        query: schema.object({
          page: schema.maybe(schema.number({ min: 1 })),
          pageSize: schema.maybe(schema.number({ min: 1, max: 100 })),
          status: schema.maybe(schema.string()),
          tags: schema.maybe(schema.string()),
          searchText: schema.maybe(schema.string()),
          assignee: schema.maybe(schema.string()),
          priority: schema.maybe(schema.string()),
          severity: schema.maybe(schema.string()),
          complianceFrameworks: schema.maybe(schema.string()),
          dueDateAfter: schema.maybe(schema.string()),
          dueDateBefore: schema.maybe(schema.string()),
          createdAfter: schema.maybe(schema.string()),
          createdBefore: schema.maybe(schema.string()),
          updatedAfter: schema.maybe(schema.string()),
          updatedBefore: schema.maybe(schema.string()),
          completedAfter: schema.maybe(schema.string()),
          completedBefore: schema.maybe(schema.string()),
          isOverdue: schema.maybe(schema.string()),
          sortField: schema.maybe(
            schema.oneOf([
              schema.literal('createdAt'),
              schema.literal('updatedAt'),
              schema.literal('completedAt'),
              schema.literal('title'),
              schema.literal('status'),
              schema.literal('priority'),
              schema.literal('severity'),
              schema.literal('dueDate'),
            ])
          ),
          sortDirection: schema.maybe(
            schema.oneOf([schema.literal('asc'), schema.literal('desc')])
          ),
        }),
      },
    },
    async (context, request, response) => {
      return controller.list(context, request, response);
    }
  );
  router.get(
    {
      path: `${basePath}/_stats`,
      validate: {
        query: schema.object({
          createdAfter: schema.maybe(schema.string()),
          createdBefore: schema.maybe(schema.string()),
          timeInterval: schema.maybe(
            schema.oneOf([
              schema.literal('hour'),
              schema.literal('day'),
              schema.literal('week'),
              schema.literal('month'),
            ])
          ),
          topTagsLimit: schema.maybe(schema.number({ min: 1, max: 100 })),
        }),
      },
    },
    async (context, request, response) => {
      return controller.getStats(context, request, response);
    }
  );
  router.get(
    {
      path: `${basePath}/_analytics`,
      validate: {
        query: schema.object({
          complianceFramework: schema.maybe(schema.string({ maxLength: 100 })),
          overdueOnly: schema.maybe(schema.string()),
        }),
      },
    },
    async (context, request, response) => {
      return controller.getAnalytics(context, request, response);
    }
  );

  router.get(
    {
      path: `${basePath}/_suggestions`,
      validate: false,
    },
    async (context, request, response) => {
      return controller.getSuggestions(context, request, response);
    }
  );

  router.get(
    {
      path: `${basePath}/{id}`,
      validate: {
        params: schema.object({
          id: schema.string({ minLength: 1 }),
        }),
      },
    },
    async (context, request, response) => {
      return controller.getById(context, request, response);
    }
  );
  router.post(
    {
      path: basePath,
      validate: {
        body: schema.object({
          title: schema.string({ minLength: 1, maxLength: 256 }),
          description: schema.maybe(schema.string({ maxLength: 4000 })),
          status: schema.maybe(
            schema.oneOf([
              schema.literal('planned'),
              schema.literal('in_progress'),
              schema.literal('done'),
              schema.literal('error'),
            ])
          ),
          tags: schema.maybe(schema.arrayOf(schema.string({ maxLength: 50 }), { maxSize: 20 })),
          assignee: schema.maybe(schema.string({ maxLength: 100 })),
          priority: schema.maybe(
            schema.oneOf([
              schema.literal('low'),
              schema.literal('medium'),
              schema.literal('high'),
              schema.literal('critical'),
            ])
          ),
          severity: schema.maybe(
            schema.oneOf([
              schema.literal('info'),
              schema.literal('low'),
              schema.literal('medium'),
              schema.literal('high'),
              schema.literal('critical'),
            ])
          ),
          dueDate: schema.maybe(schema.string()),
          complianceFrameworks: schema.maybe(
            schema.arrayOf(schema.string({ maxLength: 100 }), { maxSize: 10 })
          ),
        }),
      },
    },
    async (context, request, response) => {
      return controller.create(context, request, response);
    }
  );
  router.patch(
    {
      path: `${basePath}/{id}`,
      validate: {
        params: schema.object({
          id: schema.string({ minLength: 1 }),
        }),
        body: schema.object({
          title: schema.maybe(schema.string({ minLength: 1, maxLength: 256 })),
          description: schema.maybe(schema.string({ maxLength: 4000 })),
          status: schema.maybe(
            schema.oneOf([
              schema.literal('planned'),
              schema.literal('in_progress'),
              schema.literal('done'),
              schema.literal('error'),
            ])
          ),
          tags: schema.maybe(schema.arrayOf(schema.string({ maxLength: 50 }), { maxSize: 20 })),
          assignee: schema.maybe(schema.string({ maxLength: 100 })),
          priority: schema.maybe(
            schema.oneOf([
              schema.literal('low'),
              schema.literal('medium'),
              schema.literal('high'),
              schema.literal('critical'),
            ])
          ),
          severity: schema.maybe(
            schema.oneOf([
              schema.literal('info'),
              schema.literal('low'),
              schema.literal('medium'),
              schema.literal('high'),
              schema.literal('critical'),
            ])
          ),
          dueDate: schema.maybe(schema.nullable(schema.string())),
          complianceFrameworks: schema.maybe(
            schema.arrayOf(schema.string({ maxLength: 100 }), { maxSize: 10 })
          ),
        }),
      },
    },
    async (context, request, response) => {
      return controller.update(context, request, response);
    }
  );
  router.delete(
    {
      path: `${basePath}/{id}`,
      validate: {
        params: schema.object({
          id: schema.string({ minLength: 1 }),
        }),
      },
    },
    async (context, request, response) => {
      return controller.delete(context, request, response);
    }
  );
  logger.info(`TODO routes registered at ${basePath}`);
}
