import { Logger } from '../../../../src/core/server';
import { AnalyticsStats, TodoAnalyticsQueryParams } from '../../common';
import {
  TodosRepository,
  TodoOpenSearchClient,
  TodoAnalyticsParams,
} from '../repositories';
import { TodosMapper } from '../mappers';
import { ValidationError } from '../errors';
export class TodoAnalyticsService {
  private readonly logger: Logger;
  private readonly repository: TodosRepository;
  constructor(logger: Logger, repository: TodosRepository) {
    this.logger = logger;
    this.repository = repository;
  }
  async getAnalytics(
    client: TodoOpenSearchClient,
    params: TodoAnalyticsQueryParams
  ): Promise<AnalyticsStats> {
    this.validateAnalyticsParams(params);
    const analyticsParams: TodoAnalyticsParams = {
      complianceFramework: params.complianceFramework,
      overdueOnly: params.overdueOnly,
    };
    this.logger.debug('Fetching TODO analytics', { params: analyticsParams });
    const result = await this.repository.getAnalytics(client, analyticsParams);
    return TodosMapper.toAnalyticsStats(result.total, result.aggregations);
  }
  private validateAnalyticsParams(params: TodoAnalyticsQueryParams): void {
    if (params.complianceFramework !== undefined) {
      if (typeof params.complianceFramework !== 'string') {
        throw new ValidationError('complianceFramework must be a string', {
          field: 'complianceFramework',
          value: params.complianceFramework,
        });
      }
      if (params.complianceFramework.length > 100) {
        throw new ValidationError(
          'complianceFramework must not exceed 100 characters',
          {
            field: 'complianceFramework',
            maxLength: 100,
            actualLength: params.complianceFramework.length,
          }
        );
      }
    }
    if (params.overdueOnly !== undefined && typeof params.overdueOnly !== 'boolean') {
      throw new ValidationError('overdueOnly must be a boolean', {
        field: 'overdueOnly',
        value: params.overdueOnly,
      });
    }
  }
}
