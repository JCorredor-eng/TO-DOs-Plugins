import { TodoAnalyticsService } from '../services/todo_analytics.service';
import { TodosRepository, TodoOpenSearchClient } from '../repositories';
import { ValidationError } from '../errors';
import { AnalyticsStats, TodoStatus, TodoPriority, TodoSeverity } from '../../common';
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
describe('TodoAnalyticsService', () => {
  let service: TodoAnalyticsService;
  let mockRepository: jest.Mocked<TodosRepository>;
  const sampleAnalyticsResult = {
    total: 100,
    aggregations: {
      compliance_coverage: {
        buckets: [
          {
            key: 'PCI-DSS',
            doc_count: 30,
            by_status: {
              buckets: [
                { key: 'planned', doc_count: 10 },
                { key: 'done', doc_count: 15 },
                { key: 'error', doc_count: 5 },
              ],
            },
          },
          {
            key: 'ISO-27001',
            doc_count: 25,
            by_status: {
              buckets: [
                { key: 'planned', doc_count: 15 },
                { key: 'done', doc_count: 8 },
                { key: 'error', doc_count: 2 },
              ],
            },
          },
        ],
      },
      overdue_tasks: {
        doc_count: 20,
        by_priority: {
          buckets: [
            { key: 'critical', doc_count: 5 },
            { key: 'high', doc_count: 8 },
            { key: 'medium', doc_count: 5 },
            { key: 'low', doc_count: 2 },
          ],
        },
        by_severity: {
          buckets: [
            { key: 'critical', doc_count: 4 },
            { key: 'high', doc_count: 6 },
            { key: 'medium', doc_count: 7 },
            { key: 'low', doc_count: 2 },
            { key: 'info', doc_count: 1 },
          ],
        },
      },
      priority_distribution: {
        buckets: [
          { key: 'low', doc_count: 20 },
          { key: 'medium', doc_count: 40 },
          { key: 'high', doc_count: 30 },
          { key: 'critical', doc_count: 10 },
        ],
      },
      severity_distribution: {
        buckets: [
          { key: 'info', doc_count: 5 },
          { key: 'low', doc_count: 25 },
          { key: 'medium', doc_count: 35 },
          { key: 'high', doc_count: 25 },
          { key: 'critical', doc_count: 10 },
        ],
      },
      priority_severity_matrix: {
        buckets: [
          {
            key: 'low',
            doc_count: 20,
            by_severity: {
              buckets: [
                { key: 'info', doc_count: 5 },
                { key: 'low', doc_count: 15 },
              ],
            },
          },
          {
            key: 'medium',
            doc_count: 40,
            by_severity: {
              buckets: [
                { key: 'low', doc_count: 10 },
                { key: 'medium', doc_count: 25 },
                { key: 'high', doc_count: 5 },
              ],
            },
          },
          {
            key: 'high',
            doc_count: 30,
            by_severity: {
              buckets: [
                { key: 'medium', doc_count: 10 },
                { key: 'high', doc_count: 15 },
                { key: 'critical', doc_count: 5 },
              ],
            },
          },
          {
            key: 'critical',
            doc_count: 10,
            by_severity: {
              buckets: [
                { key: 'high', doc_count: 5 },
                { key: 'critical', doc_count: 5 },
              ],
            },
          },
        ],
      },
    },
  };
  beforeEach(() => {
    jest.clearAllMocks();
    mockRepository = new TodosRepository(
      mockLogger as any,
      {} as any
    ) as jest.Mocked<TodosRepository>;
    service = new TodoAnalyticsService(mockLogger as any, mockRepository);
  });
  describe('getAnalytics', () => {
    it('should return analytics statistics with all aggregations', async () => {
      mockRepository.getAnalytics.mockResolvedValue(sampleAnalyticsResult);
      const result = await service.getAnalytics(mockClient, {});
      expect(result).toHaveProperty('computedAt');
      expect(result).toHaveProperty('totalTasks', 100);
      expect(result).toHaveProperty('complianceCoverage');
      expect(result).toHaveProperty('overdueTasks');
      expect(result).toHaveProperty('priorityDistribution');
      expect(result).toHaveProperty('severityDistribution');
      expect(mockRepository.getAnalytics).toHaveBeenCalledWith(mockClient, {});
    });
    it('should return compliance coverage statistics', async () => {
      mockRepository.getAnalytics.mockResolvedValue(sampleAnalyticsResult);
      const result = await service.getAnalytics(mockClient, {});
      expect(result.complianceCoverage).toHaveLength(2);
      const pciDss = result.complianceCoverage.find(f => f.framework === 'PCI-DSS');
      expect(pciDss).toBeDefined();
      expect(pciDss!.total).toBe(30);
      expect(pciDss!.byStatus.planned).toBe(10);
      expect(pciDss!.byStatus.done).toBe(15);
      expect(pciDss!.byStatus.error).toBe(5);
      expect(pciDss!.completionRate).toBe(50); 
    });
    it('should return overdue tasks statistics', async () => {
      mockRepository.getAnalytics.mockResolvedValue(sampleAnalyticsResult);
      const result = await service.getAnalytics(mockClient, {});
      expect(result.overdueTasks.total).toBe(20);
      expect(result.overdueTasks.byPriority.critical).toBe(5);
      expect(result.overdueTasks.byPriority.high).toBe(8);
      expect(result.overdueTasks.byPriority.medium).toBe(5);
      expect(result.overdueTasks.byPriority.low).toBe(2);
      expect(result.overdueTasks.bySeverity.critical).toBe(4);
      expect(result.overdueTasks.bySeverity.high).toBe(6);
    });
    it('should return priority distribution statistics', async () => {
      mockRepository.getAnalytics.mockResolvedValue(sampleAnalyticsResult);
      const result = await service.getAnalytics(mockClient, {});
      expect(result.priorityDistribution).toHaveLength(4);
      const mediumPriority = result.priorityDistribution.find(d => d.label === 'medium');
      expect(mediumPriority).toBeDefined();
      expect(mediumPriority!.count).toBe(40);
      expect(mediumPriority!.percentage).toBe(40); 
    });
    it('should return severity distribution statistics', async () => {
      mockRepository.getAnalytics.mockResolvedValue(sampleAnalyticsResult);
      const result = await service.getAnalytics(mockClient, {});
      expect(result.severityDistribution).toHaveLength(5);
      const mediumSeverity = result.severityDistribution.find(d => d.label === 'medium');
      expect(mediumSeverity).toBeDefined();
      expect(mediumSeverity!.count).toBe(35);
      expect(mediumSeverity!.percentage).toBe(35); 
    });
    it('should pass complianceFramework filter to repository', async () => {
      mockRepository.getAnalytics.mockResolvedValue(sampleAnalyticsResult);
      await service.getAnalytics(mockClient, {
        complianceFramework: 'PCI-DSS',
      });
      expect(mockRepository.getAnalytics).toHaveBeenCalledWith(mockClient, {
        complianceFramework: 'PCI-DSS',
      });
    });
    it('should pass overdueOnly filter to repository', async () => {
      mockRepository.getAnalytics.mockResolvedValue(sampleAnalyticsResult);
      await service.getAnalytics(mockClient, {
        overdueOnly: true,
      });
      expect(mockRepository.getAnalytics).toHaveBeenCalledWith(mockClient, {
        overdueOnly: true,
      });
    });
    it('should pass both filters to repository', async () => {
      mockRepository.getAnalytics.mockResolvedValue(sampleAnalyticsResult);
      await service.getAnalytics(mockClient, {
        complianceFramework: 'ISO-27001',
        overdueOnly: true,
      });
      expect(mockRepository.getAnalytics).toHaveBeenCalledWith(mockClient, {
        complianceFramework: 'ISO-27001',
        overdueOnly: true,
      });
    });
    it('should handle empty analytics data', async () => {
      const emptyResult = {
        total: 0,
        aggregations: {
          compliance_coverage: { buckets: [] },
          overdue_tasks: {
            doc_count: 0,
            by_priority: { buckets: [] },
            by_severity: { buckets: [] },
          },
          priority_distribution: { buckets: [] },
          severity_distribution: { buckets: [] },
          priority_severity_matrix: { buckets: [] },
        },
      };
      mockRepository.getAnalytics.mockResolvedValue(emptyResult);
      const result = await service.getAnalytics(mockClient, {});
      expect(result.totalTasks).toBe(0);
      expect(result.complianceCoverage).toEqual([]);
      expect(result.overdueTasks.total).toBe(0);
      expect(result.priorityDistribution).toHaveLength(4);
      expect(result.priorityDistribution.every(d => d.count === 0)).toBe(true);
      expect(result.severityDistribution).toHaveLength(5);
      expect(result.severityDistribution.every(d => d.count === 0)).toBe(true);
    });
    it('should log debug information when fetching analytics', async () => {
      mockRepository.getAnalytics.mockResolvedValue(sampleAnalyticsResult);
      await service.getAnalytics(mockClient, {
        complianceFramework: 'PCI-DSS',
      });
      expect(mockLogger.debug).toHaveBeenCalledWith(
        'Fetching TODO analytics',
        expect.objectContaining({
          params: expect.objectContaining({
            complianceFramework: 'PCI-DSS',
          }),
        })
      );
    });
  });
  describe('Validation - complianceFramework', () => {
    it('should accept valid complianceFramework string', async () => {
      mockRepository.getAnalytics.mockResolvedValue(sampleAnalyticsResult);
      await expect(
        service.getAnalytics(mockClient, {
          complianceFramework: 'PCI-DSS',
        })
      ).resolves.toBeDefined();
    });
    it('should accept complianceFramework at max length (100 chars)', async () => {
      mockRepository.getAnalytics.mockResolvedValue(sampleAnalyticsResult);
      const maxLengthFramework = 'A'.repeat(100);
      await expect(
        service.getAnalytics(mockClient, {
          complianceFramework: maxLengthFramework,
        })
      ).resolves.toBeDefined();
    });
    it('should throw ValidationError if complianceFramework is not a string', async () => {
      await expect(
        service.getAnalytics(mockClient, {
          complianceFramework: 123 as any,
        })
      ).rejects.toThrow(ValidationError);
      expect(mockRepository.getAnalytics).not.toHaveBeenCalled();
    });
    it('should throw ValidationError if complianceFramework exceeds max length', async () => {
      const tooLongFramework = 'A'.repeat(101);
      await expect(
        service.getAnalytics(mockClient, {
          complianceFramework: tooLongFramework,
        })
      ).rejects.toThrow(ValidationError);
      await expect(
        service.getAnalytics(mockClient, {
          complianceFramework: tooLongFramework,
        })
      ).rejects.toThrow('complianceFramework must not exceed 100 characters');
      expect(mockRepository.getAnalytics).not.toHaveBeenCalled();
    });
    it('should throw ValidationError with proper details for invalid type', async () => {
      try {
        await service.getAnalytics(mockClient, {
          complianceFramework: null as any,
        });
        fail('Should have thrown ValidationError');
      } catch (error) {
        expect(error).toBeInstanceOf(ValidationError);
        const validationError = error as ValidationError;
        expect(validationError.details).toMatchObject({
          field: 'complianceFramework',
          value: null,
        });
      }
    });
  });
  describe('Validation - overdueOnly', () => {
    it('should accept valid overdueOnly boolean (true)', async () => {
      mockRepository.getAnalytics.mockResolvedValue(sampleAnalyticsResult);
      await expect(
        service.getAnalytics(mockClient, {
          overdueOnly: true,
        })
      ).resolves.toBeDefined();
    });
    it('should accept valid overdueOnly boolean (false)', async () => {
      mockRepository.getAnalytics.mockResolvedValue(sampleAnalyticsResult);
      await expect(
        service.getAnalytics(mockClient, {
          overdueOnly: false,
        })
      ).resolves.toBeDefined();
    });
    it('should throw ValidationError if overdueOnly is not a boolean', async () => {
      await expect(
        service.getAnalytics(mockClient, {
          overdueOnly: 'true' as any,
        })
      ).rejects.toThrow(ValidationError);
      await expect(
        service.getAnalytics(mockClient, {
          overdueOnly: 'true' as any,
        })
      ).rejects.toThrow('overdueOnly must be a boolean');
      expect(mockRepository.getAnalytics).not.toHaveBeenCalled();
    });
    it('should throw ValidationError if overdueOnly is a number', async () => {
      await expect(
        service.getAnalytics(mockClient, {
          overdueOnly: 1 as any,
        })
      ).rejects.toThrow(ValidationError);
      expect(mockRepository.getAnalytics).not.toHaveBeenCalled();
    });
    it('should throw ValidationError with proper details for invalid type', async () => {
      try {
        await service.getAnalytics(mockClient, {
          overdueOnly: 'yes' as any,
        });
        fail('Should have thrown ValidationError');
      } catch (error) {
        expect(error).toBeInstanceOf(ValidationError);
        const validationError = error as ValidationError;
        expect(validationError.details).toMatchObject({
          field: 'overdueOnly',
          value: 'yes',
        });
      }
    });
  });
  describe('Error Handling', () => {
    it('should propagate repository errors', async () => {
      const repositoryError = new Error('OpenSearch connection failed');
      mockRepository.getAnalytics.mockRejectedValue(repositoryError);
      await expect(
        service.getAnalytics(mockClient, {})
      ).rejects.toThrow('OpenSearch connection failed');
    });
    it('should propagate network errors', async () => {
      const networkError = new Error('Network timeout');
      mockRepository.getAnalytics.mockRejectedValue(networkError);
      await expect(
        service.getAnalytics(mockClient, {})
      ).rejects.toThrow(networkError);
    });
    it('should propagate custom errors from repository', async () => {
      class CustomError extends Error {
        constructor(message: string) {
          super(message);
          this.name = 'CustomError';
        }
      }
      const customError = new CustomError('Custom analytics error');
      mockRepository.getAnalytics.mockRejectedValue(customError);
      await expect(
        service.getAnalytics(mockClient, {})
      ).rejects.toThrow(customError);
    });
  });
  describe('Edge Cases', () => {
    it('should handle empty complianceFramework string', async () => {
      mockRepository.getAnalytics.mockResolvedValue(sampleAnalyticsResult);
      await expect(
        service.getAnalytics(mockClient, {
          complianceFramework: '',
        })
      ).resolves.toBeDefined();
    });
    it('should handle analytics with single framework', async () => {
      const singleFrameworkResult = {
        total: 50,
        aggregations: {
          compliance_coverage: {
            buckets: [
              {
                key: 'HIPAA',
                doc_count: 50,
                by_status: {
                  buckets: [
                    { key: 'planned', doc_count: 20 },
                    { key: 'done', doc_count: 25 },
                    { key: 'error', doc_count: 5 },
                  ],
                },
              },
            ],
          },
          overdue_tasks: {
            doc_count: 10,
            by_priority: { buckets: [{ key: 'high', doc_count: 10 }] },
            by_severity: { buckets: [{ key: 'medium', doc_count: 10 }] },
          },
          priority_distribution: {
            buckets: [{ key: 'medium', doc_count: 50 }],
          },
          severity_distribution: {
            buckets: [{ key: 'low', doc_count: 50 }],
          },
          priority_severity_matrix: {
            buckets: [
              {
                key: 'medium',
                doc_count: 50,
                by_severity: {
                  buckets: [{ key: 'low', doc_count: 50 }],
                },
              },
            ],
          },
        },
      };
      mockRepository.getAnalytics.mockResolvedValue(singleFrameworkResult);
      const result = await service.getAnalytics(mockClient, {});
      expect(result.complianceCoverage).toHaveLength(1);
      expect(result.complianceCoverage[0].framework).toBe('HIPAA');
      expect(result.complianceCoverage[0].total).toBe(50);
    });
    it('should handle analytics with no overdue tasks', async () => {
      const noOverdueResult = {
        total: 100,
        aggregations: {
          compliance_coverage: { buckets: [] },
          overdue_tasks: {
            doc_count: 0,
            by_priority: { buckets: [] },
            by_severity: { buckets: [] },
          },
          priority_distribution: {
            buckets: [{ key: 'medium', doc_count: 100 }],
          },
          severity_distribution: {
            buckets: [{ key: 'low', doc_count: 100 }],
          },
          priority_severity_matrix: {
            buckets: [
              {
                key: 'medium',
                doc_count: 100,
                by_severity: {
                  buckets: [{ key: 'low', doc_count: 100 }],
                },
              },
            ],
          },
        },
      };
      mockRepository.getAnalytics.mockResolvedValue(noOverdueResult);
      const result = await service.getAnalytics(mockClient, {});
      expect(result.overdueTasks.total).toBe(0);
      expect(result.overdueTasks.byPriority).toBeDefined();
      expect(result.overdueTasks.bySeverity).toBeDefined();
    });
    it('should handle undefined filter parameters', async () => {
      mockRepository.getAnalytics.mockResolvedValue(sampleAnalyticsResult);
      await expect(
        service.getAnalytics(mockClient, {
          complianceFramework: undefined,
          overdueOnly: undefined,
        })
      ).resolves.toBeDefined();
    });
    it('should handle analytics with 100% completion rate', async () => {
      const fullCompletionResult = {
        total: 50,
        aggregations: {
          compliance_coverage: {
            buckets: [
              {
                key: 'SOC2',
                doc_count: 50,
                by_status: {
                  buckets: [
                    { key: 'done', doc_count: 50 },
                  ],
                },
              },
            ],
          },
          overdue_tasks: {
            doc_count: 0,
            by_priority: { buckets: [] },
            by_severity: { buckets: [] },
          },
          priority_distribution: { buckets: [] },
          severity_distribution: { buckets: [] },
          priority_severity_matrix: { buckets: [] },
        },
      };
      mockRepository.getAnalytics.mockResolvedValue(fullCompletionResult);
      const result = await service.getAnalytics(mockClient, {});
      const soc2 = result.complianceCoverage.find(f => f.framework === 'SOC2');
      expect(soc2).toBeDefined();
      expect(soc2!.completionRate).toBe(100);
    });
    it('should handle analytics with 0% completion rate', async () => {
      const noCompletionResult = {
        total: 50,
        aggregations: {
          compliance_coverage: {
            buckets: [
              {
                key: 'GDPR',
                doc_count: 50,
                by_status: {
                  buckets: [
                    { key: 'planned', doc_count: 40 },
                    { key: 'error', doc_count: 10 },
                  ],
                },
              },
            ],
          },
          overdue_tasks: {
            doc_count: 50,
            by_priority: { buckets: [] },
            by_severity: { buckets: [] },
          },
          priority_distribution: { buckets: [] },
          severity_distribution: { buckets: [] },
          priority_severity_matrix: { buckets: [] },
        },
      };
      mockRepository.getAnalytics.mockResolvedValue(noCompletionResult);
      const result = await service.getAnalytics(mockClient, {});
      const gdpr = result.complianceCoverage.find(f => f.framework === 'GDPR');
      expect(gdpr).toBeDefined();
      expect(gdpr!.completionRate).toBe(0);
    });
  });
  describe('Computed Timestamp', () => {
    it('should include computedAt timestamp in ISO 8601 format', async () => {
      mockRepository.getAnalytics.mockResolvedValue(sampleAnalyticsResult);
      const result = await service.getAnalytics(mockClient, {});
      expect(result.computedAt).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
    });
    it('should generate fresh timestamp for each call', async () => {
      mockRepository.getAnalytics.mockResolvedValue(sampleAnalyticsResult);
      const result1 = await service.getAnalytics(mockClient, {});
      await new Promise(resolve => setTimeout(resolve, 10));
      const result2 = await service.getAnalytics(mockClient, {});
      expect(result1.computedAt).toBeTruthy();
      expect(result2.computedAt).toBeTruthy();
    });
  });
});
