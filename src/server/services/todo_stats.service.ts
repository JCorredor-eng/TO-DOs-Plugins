import { Logger } from '../../../../src/core/server';
import { TodoStats, TodoStatsQueryParams } from '../../common';
import { TodosRepository, TodoOpenSearchClient, TodoStatsParams } from '../repositories';
import { TodosMapper } from '../mappers';
import { ValidationError } from '../errors';
export class TodoStatsService {
  private readonly logger: Logger;
  private readonly repository: TodosRepository;
  constructor(logger: Logger, repository: TodosRepository) {
    this.logger = logger;
    this.repository = repository;
  }
  async getStats(client: TodoOpenSearchClient, params: TodoStatsQueryParams): Promise<TodoStats> {
    this.validateStatsParams(params);
    const statsParams: TodoStatsParams = {
      createdAfter: params.createdAfter,
      createdBefore: params.createdBefore,
      timeInterval: params.timeInterval || 'day',
      topTagsLimit: params.topTagsLimit || 10,
    };
    this.logger.debug('Fetching TODO stats', { params: statsParams });
    const result = await this.repository.getStats(client, statsParams);
    return TodosMapper.toTodoStats(result.total, result.aggregations);
  }
  private validateStatsParams(params: TodoStatsQueryParams): void {
    if (params.createdAfter && !this.isValidDate(params.createdAfter)) {
      throw new ValidationError('Invalid createdAfter date format. Use ISO 8601 format.', {
        field: 'createdAfter',
        value: params.createdAfter,
      });
    }
    if (params.createdBefore && !this.isValidDate(params.createdBefore)) {
      throw new ValidationError('Invalid createdBefore date format. Use ISO 8601 format.', {
        field: 'createdBefore',
        value: params.createdBefore,
      });
    }
    if (params.createdAfter && params.createdBefore) {
      const after = new Date(params.createdAfter);
      const before = new Date(params.createdBefore);
      if (after > before) {
        throw new ValidationError('createdAfter must be before createdBefore', {
          createdAfter: params.createdAfter,
          createdBefore: params.createdBefore,
        });
      }
    }
    if (params.timeInterval && !['hour', 'day', 'week', 'month'].includes(params.timeInterval)) {
      throw new ValidationError(`Invalid timeInterval: ${params.timeInterval}`, {
        field: 'timeInterval',
        validValues: ['hour', 'day', 'week', 'month'],
      });
    }
    if (params.topTagsLimit !== undefined) {
      if (params.topTagsLimit < 1 || params.topTagsLimit > 100) {
        throw new ValidationError('topTagsLimit must be between 1 and 100', {
          field: 'topTagsLimit',
          min: 1,
          max: 100,
          value: params.topTagsLimit,
        });
      }
    }
  }
  private isValidDate(dateString: string): boolean {
    const date = new Date(dateString);
    return !isNaN(date.getTime());
  }
}
