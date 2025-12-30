import { Logger } from '../../../../src/core/server';
import {
  Todo,
  TodoStatus,
  TodoPriority,
  TodoSeverity,
  TodoSortField,
  SortDirection,
  DEFAULT_INDEX_NAME,
  DEFAULT_PAGE_SIZE,
  MAX_PAGE_SIZE,
} from '../../common';
import {
  TodosMapper,
  TodoDocument,
  OpenSearchSearchResponse,
  OpenSearchStatsAggregations,
  OpenSearchHit,
} from '../mappers';
import { NotFoundError, IndexError } from '../errors';
import { IndexManager, OpenSearchClient } from './index_manager';
export interface TodoOpenSearchClient extends OpenSearchClient {
  index: (params: {
    index: string;
    id?: string;
    body: Record<string, unknown>;
    refresh?: boolean | 'wait_for';
  }) => Promise<{ body: { _id: string } }>;
  get: (params: {
    index: string;
    id: string;
  }) => Promise<{ body: OpenSearchHit<TodoDocument> }>;
  update: (params: {
    index: string;
    id: string;
    body: { doc: Record<string, unknown> };
    refresh?: boolean | 'wait_for';
  }) => Promise<{ body: { result: string } }>;
  delete: (params: {
    index: string;
    id: string;
    refresh?: boolean | 'wait_for';
  }) => Promise<{ body: { result: string } }>;
  search: <T = unknown>(params: {
    index: string;
    body: Record<string, unknown>;
  }) => Promise<{ body: T }>;
}
export interface TodoSearchParams {
  page?: number;
  pageSize?: number;
  status?: TodoStatus | readonly TodoStatus[];
  tags?: readonly string[];
  searchText?: string;
  assignee?: string;
  priority?: TodoPriority | readonly TodoPriority[];
  severity?: TodoSeverity | readonly TodoSeverity[];
  complianceFrameworks?: readonly string[];
  dueDateAfter?: string;
  dueDateBefore?: string;
  isOverdue?: boolean;
  sortField?: TodoSortField;
  sortDirection?: SortDirection;
}
export interface TodoStatsParams {
  createdAfter?: string;
  createdBefore?: string;
  timeInterval?: 'hour' | 'day' | 'week' | 'month';
  topTagsLimit?: number;
}
export interface SearchResult {
  todos: Todo[];
  total: number;
}
export interface StatsResult {
  total: number;
  aggregations: OpenSearchStatsAggregations;
}
export interface TodoAnalyticsParams {
  complianceFramework?: string;
  overdueOnly?: boolean;
}
export interface OpenSearchAnalyticsAggregations {
  compliance_coverage: {
    buckets: Array<{
      key: string;
      doc_count: number;
      by_status: {
        buckets: Array<{
          key: string;
          doc_count: number;
        }>;
      };
    }>;
  };
  overdue_tasks: {
    doc_count: number;
    by_priority: {
      buckets: Array<{
        key: string;
        doc_count: number;
      }>;
    };
    by_severity: {
      buckets: Array<{
        key: string;
        doc_count: number;
      }>;
    };
  };
  priority_distribution: {
    buckets: Array<{
      key: string;
      doc_count: number;
    }>;
  };
  severity_distribution: {
    buckets: Array<{
      key: string;
      doc_count: number;
    }>;
  };
  priority_severity_matrix: {
    buckets: Array<{
      key: string;
      doc_count: number;
      by_severity: {
        buckets: Array<{
          key: string;
          doc_count: number;
        }>;
      };
    }>;
  };
}
export interface AnalyticsResult {
  total: number;
  aggregations: OpenSearchAnalyticsAggregations;
}
export class TodosRepository {
  private readonly indexName: string;
  private readonly logger: Logger;
  private readonly indexManager: IndexManager;
  constructor(logger: Logger, indexManager: IndexManager, indexName: string = DEFAULT_INDEX_NAME) {
    this.logger = logger;
    this.indexManager = indexManager;
    this.indexName = indexName;
  }
  private async ensureIndex(client: TodoOpenSearchClient): Promise<void> {
    await this.indexManager.ensureIndex(client);
  }
  async create(client: TodoOpenSearchClient, document: TodoDocument): Promise<Todo> {
    await this.ensureIndex(client);
    try {
      const result = await client.index({
        index: this.indexName,
        body: document as unknown as Record<string, unknown>,
        refresh: 'wait_for',
      });
      const id = result.body._id;
      this.logger.debug(`Created TODO with id '${id}'`);
      return TodosMapper.fromOpenSearchHit({
        _id: id,
        _source: document,
      });
    } catch (error) {
      this.logger.error('Failed to create TODO', error);
      throw new IndexError('Failed to create TODO document', {
        originalError: error instanceof Error ? error.message : String(error),
      });
    }
  }
  async getById(client: TodoOpenSearchClient, id: string): Promise<Todo> {
    await this.ensureIndex(client);
    try {
      const result = await client.get({
        index: this.indexName,
        id,
      });
      return TodosMapper.fromOpenSearchHit(result.body);
    } catch (error) {
      if (isNotFoundError(error)) {
        throw new NotFoundError('Todo', id);
      }
      this.logger.error(`Failed to get TODO '${id}'`, error);
      throw new IndexError(`Failed to get TODO '${id}'`, {
        originalError: error instanceof Error ? error.message : String(error),
      });
    }
  }
  async update(
    client: TodoOpenSearchClient,
    id: string,
    updates: Partial<TodoDocument>
  ): Promise<boolean> {
    await this.ensureIndex(client);
    try {
      const result = await client.update({
        index: this.indexName,
        id,
        body: { doc: updates as Record<string, unknown> },
        refresh: 'wait_for',
      });
      this.logger.debug(`Updated TODO '${id}', result: ${result.body.result}`);
      return result.body.result === 'updated' || result.body.result === 'noop';
    } catch (error) {
      if (isNotFoundError(error)) {
        throw new NotFoundError('Todo', id);
      }
      this.logger.error(`Failed to update TODO '${id}'`, error);
      throw new IndexError(`Failed to update TODO '${id}'`, {
        originalError: error instanceof Error ? error.message : String(error),
      });
    }
  }
  async delete(client: TodoOpenSearchClient, id: string): Promise<boolean> {
    await this.ensureIndex(client);
    try {
      const result = await client.delete({
        index: this.indexName,
        id,
        refresh: 'wait_for',
      });
      this.logger.debug(`Deleted TODO '${id}', result: ${result.body.result}`);
      return result.body.result === 'deleted';
    } catch (error) {
      if (isNotFoundError(error)) {
        throw new NotFoundError('Todo', id);
      }
      this.logger.error(`Failed to delete TODO '${id}'`, error);
      throw new IndexError(`Failed to delete TODO '${id}'`, {
        originalError: error instanceof Error ? error.message : String(error),
      });
    }
  }
  async search(client: TodoOpenSearchClient, params: TodoSearchParams): Promise<SearchResult> {
    await this.ensureIndex(client);
    const page = Math.max(1, params.page || 1);
    const pageSize = Math.min(MAX_PAGE_SIZE, Math.max(1, params.pageSize || DEFAULT_PAGE_SIZE));
    const from = (page - 1) * pageSize;
    const query = this.buildSearchQuery(params);
    const sort = this.buildSort(params.sortField, params.sortDirection);
    try {
      const result = await client.search<OpenSearchSearchResponse<TodoDocument>>({
        index: this.indexName,
        body: {
          query,
          sort,
          from,
          size: pageSize,
        },
      });
      const todos = TodosMapper.fromOpenSearchHits(result.body.hits.hits);
      const total = result.body.hits.total.value;
      return { todos, total };
    } catch (error) {
      this.logger.error('Failed to search TODOs', error);
      throw new IndexError('Failed to search TODO documents', {
        originalError: error instanceof Error ? error.message : String(error),
      });
    }
  }
  async getStats(client: TodoOpenSearchClient, params: TodoStatsParams): Promise<StatsResult> {
    await this.ensureIndex(client);
    const query = this.buildStatsQuery(params);
    const aggs = this.buildStatsAggregations(params);
    try {
      const result = await client.search<
        OpenSearchSearchResponse<TodoDocument> & { aggregations: OpenSearchStatsAggregations }
      >({
        index: this.indexName,
        body: {
          query,
          size: 0, 
          aggs,
        },
      });
      return {
        total: result.body.hits.total.value,
        aggregations: result.body.aggregations,
      };
    } catch (error) {
      this.logger.error('Failed to get TODO stats', error);
      throw new IndexError('Failed to get TODO statistics', {
        originalError: error instanceof Error ? error.message : String(error),
      });
    }
  }
  private buildSearchQuery(params: TodoSearchParams): Record<string, unknown> {
    const must: unknown[] = [];
    const filter: unknown[] = [];
    if (params.searchText && params.searchText.trim()) {
      must.push({
        multi_match: {
          query: params.searchText.trim(),
          fields: ['title^2', 'description'],
          type: 'best_fields',
          fuzziness: 'AUTO',
        },
      });
    }
    if (params.status) {
      const statusValues = Array.isArray(params.status) ? params.status : [params.status];
      if (statusValues.length === 1) {
        filter.push({ term: { status: statusValues[0] } });
      } else if (statusValues.length > 1) {
        filter.push({ terms: { status: statusValues } });
      }
    }
    if (params.tags && params.tags.length > 0) {
      for (const tag of params.tags) {
        filter.push({ term: { tags: tag.toLowerCase() } });
      }
    }
    if (params.assignee) {
      filter.push({ term: { assignee: params.assignee } });
    }
    if (params.priority) {
      const priorityValues = Array.isArray(params.priority) ? params.priority : [params.priority];
      if (priorityValues.length === 1) {
        filter.push({ term: { priority: priorityValues[0] } });
      } else if (priorityValues.length > 1) {
        filter.push({ terms: { priority: priorityValues } });
      }
    }
    if (params.severity) {
      const severityValues = Array.isArray(params.severity) ? params.severity : [params.severity];
      if (severityValues.length === 1) {
        filter.push({ term: { severity: severityValues[0] } });
      } else if (severityValues.length > 1) {
        filter.push({ terms: { severity: severityValues } });
      }
    }
    if (params.complianceFrameworks && params.complianceFrameworks.length > 0) {
      filter.push({ terms: { compliance_framework: params.complianceFrameworks } });
    }
    if (params.dueDateAfter || params.dueDateBefore) {
      const range: Record<string, string> = {};
      if (params.dueDateAfter) {
        range.gte = params.dueDateAfter;
      }
      if (params.dueDateBefore) {
        range.lte = params.dueDateBefore;
      }
      filter.push({ range: { due_date: range } });
    }
    if (params.isOverdue) {
      filter.push({
        bool: {
          must: [
            { range: { due_date: { lt: 'now' } } },
            { exists: { field: 'due_date' } },
          ],
          must_not: [{ term: { status: 'done' } }],
        },
      });
    }
    if (must.length === 0 && filter.length === 0) {
      return { match_all: {} };
    }
    return {
      bool: {
        ...(must.length > 0 && { must }),
        ...(filter.length > 0 && { filter }),
      },
    };
  }
  private buildSort(
    sortField?: TodoSortField,
    sortDirection?: SortDirection
  ): Array<Record<string, unknown>> {
    const field = sortField || 'createdAt';
    const direction = sortDirection || 'desc';
    const fieldMapping: Record<string, string> = {
      createdAt: 'created_at',
      updatedAt: 'updated_at',
      completedAt: 'completed_at',
      title: 'title.keyword',
      status: 'status',
      priority: 'priority',
      severity: 'severity',
      dueDate: 'due_date',
    };
    const mappedField = fieldMapping[field] || 'created_at';
    return [{ [mappedField]: { order: direction } }];
  }
  private buildStatsQuery(params: TodoStatsParams): Record<string, unknown> {
    const filter: unknown[] = [];
    if (params.createdAfter || params.createdBefore) {
      const range: Record<string, string> = {};
      if (params.createdAfter) {
        range.gte = params.createdAfter;
      }
      if (params.createdBefore) {
        range.lte = params.createdBefore;
      }
      filter.push({ range: { created_at: range } });
    }
    if (filter.length === 0) {
      return { match_all: {} };
    }
    return { bool: { filter } };
  }
  private buildStatsAggregations(params: TodoStatsParams): Record<string, unknown> {
    const interval = params.timeInterval || 'day';
    const topTagsLimit = params.topTagsLimit || 10;
    const intervalMapping: Record<string, string> = {
      hour: '1h',
      day: '1d',
      week: '1w',
      month: '1M',
    };
    return {
      by_status: {
        terms: {
          field: 'status',
          size: 10,
        },
      },
      top_tags: {
        terms: {
          field: 'tags',
          size: topTagsLimit,
        },
      },
      completed_over_time: {
        date_histogram: {
          field: 'completed_at',
          fixed_interval: intervalMapping[interval],
          format: 'yyyy-MM-dd',
          min_doc_count: 0,
        },
      },
    };
  }
  async getAnalytics(
    client: TodoOpenSearchClient,
    params: TodoAnalyticsParams
  ): Promise<AnalyticsResult> {
    await this.ensureIndex(client);
    const query = this.buildAnalyticsQuery(params);
    const aggs = this.buildAnalyticsAggregations();
    try {
      const result = await client.search<
        OpenSearchSearchResponse<TodoDocument> & { aggregations: OpenSearchAnalyticsAggregations }
      >({
        index: this.indexName,
        body: {
          query,
          size: 0,
          aggs,
        },
      });
      return {
        total: result.body.hits.total.value,
        aggregations: result.body.aggregations,
      };
    } catch (error) {
      this.logger.error('Failed to get TODO analytics', error);
      throw new IndexError('Failed to get TODO analytics', {
        originalError: error instanceof Error ? error.message : String(error),
      });
    }
  }
  private buildAnalyticsQuery(params: TodoAnalyticsParams): Record<string, unknown> {
    const filter: unknown[] = [];
    if (params.complianceFramework) {
      filter.push({ term: { compliance_framework: params.complianceFramework } });
    }
    if (params.overdueOnly) {
      filter.push({
        bool: {
          must: [
            { range: { due_date: { lt: 'now' } } },
            { exists: { field: 'due_date' } },
          ],
          must_not: [{ term: { status: 'done' } }],
        },
      });
    }
    if (filter.length === 0) {
      return { match_all: {} };
    }
    return { bool: { filter } };
  }
  private buildAnalyticsAggregations(): Record<string, unknown> {
    return {
      compliance_coverage: {
        terms: {
          field: 'compliance_framework',
          size: 50, 
        },
        aggs: {
          by_status: {
            terms: {
              field: 'status',
              size: 10,
            },
          },
        },
      },
      overdue_tasks: {
        filter: {
          bool: {
            must: [
              { range: { due_date: { lt: 'now' } } },
              { exists: { field: 'due_date' } },
            ],
            must_not: [{ term: { status: 'done' } }],
          },
        },
        aggs: {
          by_priority: {
            terms: {
              field: 'priority',
              size: 10,
            },
          },
          by_severity: {
            terms: {
              field: 'severity',
              size: 10,
            },
          },
        },
      },
      priority_distribution: {
        terms: {
          field: 'priority',
          size: 10,
        },
      },
      severity_distribution: {
        terms: {
          field: 'severity',
          size: 10,
        },
      },
      priority_severity_matrix: {
        terms: {
          field: 'priority',
          size: 10,
        },
        aggs: {
          by_severity: {
            terms: {
              field: 'severity',
              size: 10,
            },
          },
        },
      },
    };
  }

  async getSuggestions(client: TodoOpenSearchClient): Promise<{
    tags: string[];
    complianceFrameworks: string[];
  }> {
    await this.ensureIndex(client);

    try {
      const result = await client.search({
        index: this.indexName,
        body: {
          size: 0,
          aggs: {
            unique_tags: {
              terms: {
                field: 'tags',
                size: 100,
              },
            },
            unique_compliance_frameworks: {
              terms: {
                field: 'compliance_framework',
                size: 100,
              },
            },
          },
        },
      });

      const tags = result.body.aggregations?.unique_tags?.buckets?.map(
        (bucket: { key: string }) => bucket.key
      ) || [];

      const complianceFrameworks = result.body.aggregations?.unique_compliance_frameworks?.buckets?.map(
        (bucket: { key: string }) => bucket.key
      ) || [];

      return {
        tags,
        complianceFrameworks,
      };
    } catch (error) {
      this.logger.error('Failed to get suggestions', error);
      throw new IndexError('Failed to get suggestions', {
        originalError: error instanceof Error ? error.message : String(error),
      });
    }
  }
}
function isNotFoundError(error: unknown): boolean {
  if (!error || typeof error !== 'object') {
    return false;
  }
  const errorObj = error as { statusCode?: number; meta?: { statusCode?: number } };
  if (errorObj.statusCode === 404) {
    return true;
  }
  if (errorObj.meta?.statusCode === 404) {
    return true;
  }
  return false;
}
