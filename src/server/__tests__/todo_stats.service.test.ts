import { TodoStatsService } from '../services/todo_stats.service';
import { TodosRepository, TodoOpenSearchClient, StatsResult } from '../repositories';
import { ValidationError } from '../errors';
import { TodoStatsQueryParams } from '../../common';
jest.mock('../repositories/todos.repository');
const mockLogger = {
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
  trace: jest.fn(),
  fatal: jest.fn(),
  get: jest.fn().mockReturnThis(),
};
const mockClient = {} as TodoOpenSearchClient;
describe('TodoStatsService', () => {
  let service: TodoStatsService;
  let mockRepository: jest.Mocked<TodosRepository>;
  const sampleStatsResult: StatsResult = {
    total: 100,
    aggregations: {
      by_status: {
        buckets: [
          { key: 'planned', doc_count: 40 },
          { key: 'in_progress', doc_count: 10 },
          { key: 'done', doc_count: 40 },
          { key: 'error', doc_count: 10 },
        ],
      },
      top_tags: {
        buckets: [
          { key: 'pci-dss', doc_count: 30 },
          { key: 'iso-27001', doc_count: 25 },
          { key: 'security', doc_count: 20 },
        ],
      },
      completed_over_time: {
        buckets: [
          { key: '2024-01-01', key_as_string: '2024-01-01', doc_count: 10 },
          { key: '2024-01-02', key_as_string: '2024-01-02', doc_count: 15 },
          { key: '2024-01-03', key_as_string: '2024-01-03', doc_count: 8 },
        ],
      },
      top_assignees: {
        buckets: [
          { key: 'john.doe', doc_count: 35 },
          { key: 'jane.smith', doc_count: 28 },
          { key: 'bob.wilson', doc_count: 22 },
        ],
      },
      unassigned: {
        doc_count: 15,
      },
    },
  };
  beforeEach(() => {
    jest.clearAllMocks();
    mockRepository = new TodosRepository(
      mockLogger as any,
      {} as any
    ) as jest.Mocked<TodosRepository>;
    service = new TodoStatsService(mockLogger as any, mockRepository);
  });
  describe('getStats', () => {
    it('should return aggregated stats with default parameters', async () => {
      mockRepository.getStats.mockResolvedValue(sampleStatsResult);
      const result = await service.getStats(mockClient, {});
      expect(result.total).toBe(100);
      expect(result.byStatus.planned).toBe(40);
      expect(result.byStatus.in_progress).toBe(10);
      expect(result.byStatus.done).toBe(40);
      expect(result.byStatus.error).toBe(10);
      expect(result.topTags).toHaveLength(3);
      expect(result.completedOverTime).toHaveLength(3);
    });
    it('should pass date range filters to repository', async () => {
      mockRepository.getStats.mockResolvedValue(sampleStatsResult);
      const params: TodoStatsQueryParams = {
        createdAfter: '2024-01-01T00:00:00.000Z',
        createdBefore: '2024-01-31T23:59:59.999Z',
      };
      await service.getStats(mockClient, params);
      expect(mockRepository.getStats).toHaveBeenCalledWith(
        mockClient,
        expect.objectContaining({
          createdAfter: '2024-01-01T00:00:00.000Z',
          createdBefore: '2024-01-31T23:59:59.999Z',
        })
      );
    });
    it('should pass time interval to repository', async () => {
      mockRepository.getStats.mockResolvedValue(sampleStatsResult);
      await service.getStats(mockClient, { timeInterval: 'week' });
      expect(mockRepository.getStats).toHaveBeenCalledWith(
        mockClient,
        expect.objectContaining({
          timeInterval: 'week',
        })
      );
    });
    it('should pass topTagsLimit to repository', async () => {
      mockRepository.getStats.mockResolvedValue(sampleStatsResult);
      await service.getStats(mockClient, { topTagsLimit: 5 });
      expect(mockRepository.getStats).toHaveBeenCalledWith(
        mockClient,
        expect.objectContaining({
          topTagsLimit: 5,
        })
      );
    });
    it('should use default values for optional parameters', async () => {
      mockRepository.getStats.mockResolvedValue(sampleStatsResult);
      await service.getStats(mockClient, {});
      expect(mockRepository.getStats).toHaveBeenCalledWith(
        mockClient,
        expect.objectContaining({
          timeInterval: 'day',
          topTagsLimit: 10,
        })
      );
    });
    it('should map status aggregation correctly', async () => {
      mockRepository.getStats.mockResolvedValue(sampleStatsResult);
      const result = await service.getStats(mockClient, {});
      expect(result.byStatus).toEqual({
        planned: 40,
        in_progress: 10,
        done: 40,
        error: 10,
      });
    });
    it('should map top tags aggregation correctly', async () => {
      mockRepository.getStats.mockResolvedValue(sampleStatsResult);
      const result = await service.getStats(mockClient, {});
      expect(result.topTags).toEqual([
        { tag: 'pci-dss', count: 30 },
        { tag: 'iso-27001', count: 25 },
        { tag: 'security', count: 20 },
      ]);
    });
    it('should map completed over time aggregation correctly', async () => {
      mockRepository.getStats.mockResolvedValue(sampleStatsResult);
      const result = await service.getStats(mockClient, {});
      expect(result.completedOverTime).toEqual([
        { date: '2024-01-01', count: 10 },
        { date: '2024-01-02', count: 15 },
        { date: '2024-01-03', count: 8 },
      ]);
    });
    it('should handle empty aggregation buckets', async () => {
      const emptyResult: StatsResult = {
        total: 0,
        aggregations: {
          by_status: { buckets: [] },
          top_tags: { buckets: [] },
          completed_over_time: { buckets: [] },
          top_assignees: { buckets: [] },
          unassigned: { doc_count: 0 },
        },
      };
      mockRepository.getStats.mockResolvedValue(emptyResult);
      const result = await service.getStats(mockClient, {});
      expect(result.total).toBe(0);
      expect(result.byStatus).toEqual({ planned: 0, in_progress: 0, done: 0, error: 0 });
      expect(result.topTags).toEqual([]);
      expect(result.completedOverTime).toEqual([]);
      expect(result.topAssignees).toEqual([]);
      expect(result.unassignedCount).toBe(0);
    });
  });
  describe('validation', () => {
    it('should throw ValidationError for invalid createdAfter date', async () => {
      await expect(
        service.getStats(mockClient, { createdAfter: 'not-a-date' })
      ).rejects.toThrow(ValidationError);
      expect(mockRepository.getStats).not.toHaveBeenCalled();
    });
    it('should throw ValidationError for invalid createdBefore date', async () => {
      await expect(
        service.getStats(mockClient, { createdBefore: 'invalid' })
      ).rejects.toThrow(ValidationError);
      expect(mockRepository.getStats).not.toHaveBeenCalled();
    });
    it('should throw ValidationError when createdAfter is after createdBefore', async () => {
      await expect(
        service.getStats(mockClient, {
          createdAfter: '2024-02-01T00:00:00.000Z',
          createdBefore: '2024-01-01T00:00:00.000Z',
        })
      ).rejects.toThrow(ValidationError);
      expect(mockRepository.getStats).not.toHaveBeenCalled();
    });
    it('should throw ValidationError for invalid timeInterval', async () => {
      await expect(
        service.getStats(mockClient, { timeInterval: 'invalid' as any })
      ).rejects.toThrow(ValidationError);
      expect(mockRepository.getStats).not.toHaveBeenCalled();
    });
    it('should throw ValidationError when topTagsLimit is less than 1', async () => {
      await expect(
        service.getStats(mockClient, { topTagsLimit: 0 })
      ).rejects.toThrow(ValidationError);
      expect(mockRepository.getStats).not.toHaveBeenCalled();
    });
    it('should throw ValidationError when topTagsLimit exceeds 100', async () => {
      await expect(
        service.getStats(mockClient, { topTagsLimit: 101 })
      ).rejects.toThrow(ValidationError);
      expect(mockRepository.getStats).not.toHaveBeenCalled();
    });
    it('should accept valid hour timeInterval', async () => {
      mockRepository.getStats.mockResolvedValue(sampleStatsResult);
      await service.getStats(mockClient, { timeInterval: 'hour' });
      expect(mockRepository.getStats).toHaveBeenCalled();
    });
    it('should accept valid month timeInterval', async () => {
      mockRepository.getStats.mockResolvedValue(sampleStatsResult);
      await service.getStats(mockClient, { timeInterval: 'month' });
      expect(mockRepository.getStats).toHaveBeenCalled();
    });
    it('should accept valid date range', async () => {
      mockRepository.getStats.mockResolvedValue(sampleStatsResult);
      await service.getStats(mockClient, {
        createdAfter: '2024-01-01T00:00:00.000Z',
        createdBefore: '2024-12-31T23:59:59.999Z',
      });
      expect(mockRepository.getStats).toHaveBeenCalled();
    });
  });
});
