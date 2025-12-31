import { TodosRepository, TodoOpenSearchClient, TodoSearchParams } from '../repositories/todos.repository';
import { IndexManager } from '../repositories/index_manager';
import { Todo } from '../../common/todo/todo.types';
import { NotFoundError, IndexError } from '../errors';

const mockLogger = {
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
  trace: jest.fn(),
  fatal: jest.fn(),
  get: jest.fn().mockReturnThis(),
};

const MOCK_NOW = new Date('2024-01-15T12:00:00.000Z');

describe('TodosRepository', () => {
  let repository: TodosRepository;
  let mockClient: jest.Mocked<TodoOpenSearchClient>;
  let mockIndexManager: jest.Mocked<IndexManager>;

  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(MOCK_NOW);
    jest.clearAllMocks();

    mockIndexManager = {
      ensureIndex: jest.fn().mockResolvedValue(undefined),
    } as any;

    mockClient = {
      index: jest.fn(),
      get: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      search: jest.fn(),
    } as any;

    repository = new TodosRepository(mockLogger as any, mockIndexManager, 'test-index');
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('search with date range filters', () => {
    it('should build query with dueDate range filter (both after and before)', async () => {
      const searchParams: TodoSearchParams = {
        dueDateAfter: '2024-01-01T00:00:00.000Z',
        dueDateBefore: '2024-12-31T23:59:59.000Z',
      };

      mockClient.search.mockResolvedValue({
        body: {
          hits: {
            hits: [],
            total: { value: 0 },
          },
        },
      } as any);

      await repository.search(mockClient, searchParams);

      expect(mockClient.search).toHaveBeenCalledWith({
        index: 'test-index',
        body: expect.objectContaining({
          query: expect.objectContaining({
            bool: expect.objectContaining({
              filter: expect.arrayContaining([
                {
                  range: {
                    due_date: {
                      gte: '2024-01-01T00:00:00.000Z',
                      lte: '2024-12-31T23:59:59.000Z',
                    },
                  },
                },
              ]),
            }),
          }),
        }),
      });
    });

    it('should build query with only dueDateAfter', async () => {
      const searchParams: TodoSearchParams = {
        dueDateAfter: '2024-01-01T00:00:00.000Z',
      };

      mockClient.search.mockResolvedValue({
        body: {
          hits: {
            hits: [],
            total: { value: 0 },
          },
        },
      } as any);

      await repository.search(mockClient, searchParams);

      expect(mockClient.search).toHaveBeenCalledWith({
        index: 'test-index',
        body: expect.objectContaining({
          query: expect.objectContaining({
            bool: expect.objectContaining({
              filter: expect.arrayContaining([
                {
                  range: {
                    due_date: {
                      gte: '2024-01-01T00:00:00.000Z',
                    },
                  },
                },
              ]),
            }),
          }),
        }),
      });
    });

    it('should build query with only dueDateBefore', async () => {
      const searchParams: TodoSearchParams = {
        dueDateBefore: '2024-12-31T23:59:59.000Z',
      };

      mockClient.search.mockResolvedValue({
        body: {
          hits: {
            hits: [],
            total: { value: 0 },
          },
        },
      } as any);

      await repository.search(mockClient, searchParams);

      expect(mockClient.search).toHaveBeenCalledWith({
        index: 'test-index',
        body: expect.objectContaining({
          query: expect.objectContaining({
            bool: expect.objectContaining({
              filter: expect.arrayContaining([
                {
                  range: {
                    due_date: {
                      lte: '2024-12-31T23:59:59.000Z',
                    },
                  },
                },
              ]),
            }),
          }),
        }),
      });
    });

    it('should combine dueDate filters with status filter', async () => {
      const searchParams: TodoSearchParams = {
        status: 'planned',
        dueDateAfter: '2024-01-01T00:00:00.000Z',
        dueDateBefore: '2024-12-31T23:59:59.000Z',
      };

      mockClient.search.mockResolvedValue({
        body: {
          hits: {
            hits: [],
            total: { value: 0 },
          },
        },
      } as any);

      await repository.search(mockClient, searchParams);

      expect(mockClient.search).toHaveBeenCalledWith({
        index: 'test-index',
        body: expect.objectContaining({
          query: expect.objectContaining({
            bool: expect.objectContaining({
              filter: expect.arrayContaining([
                { term: { status: 'planned' } },
                {
                  range: {
                    due_date: {
                      gte: '2024-01-01T00:00:00.000Z',
                      lte: '2024-12-31T23:59:59.000Z',
                    },
                  },
                },
              ]),
            }),
          }),
        }),
      });
    });

    it('should combine dueDate filters with tags filter', async () => {
      const searchParams: TodoSearchParams = {
        tags: ['urgent', 'important'],
        dueDateAfter: '2024-01-01T00:00:00.000Z',
      };

      mockClient.search.mockResolvedValue({
        body: {
          hits: {
            hits: [],
            total: { value: 0 },
          },
        },
      } as any);

      await repository.search(mockClient, searchParams);

      expect(mockClient.search).toHaveBeenCalledWith({
        index: 'test-index',
        body: expect.objectContaining({
          query: expect.objectContaining({
            bool: expect.objectContaining({
              filter: expect.arrayContaining([
                { term: { tags: 'urgent' } },
                { term: { tags: 'important' } },
                {
                  range: {
                    due_date: {
                      gte: '2024-01-01T00:00:00.000Z',
                    },
                  },
                },
              ]),
            }),
          }),
        }),
      });
    });

    it('should combine dueDate filters with search text', async () => {
      const searchParams: TodoSearchParams = {
        searchText: 'important task',
        dueDateAfter: '2024-01-01T00:00:00.000Z',
        dueDateBefore: '2024-12-31T23:59:59.000Z',
      };

      mockClient.search.mockResolvedValue({
        body: {
          hits: {
            hits: [],
            total: { value: 0 },
          },
        },
      } as any);

      await repository.search(mockClient, searchParams);

      expect(mockClient.search).toHaveBeenCalledWith({
        index: 'test-index',
        body: expect.objectContaining({
          query: expect.objectContaining({
            bool: expect.objectContaining({
              must: expect.arrayContaining([
                {
                  multi_match: {
                    query: 'important task',
                    fields: ['title^2', 'description'],
                    type: 'best_fields',
                    fuzziness: 'AUTO',
                  },
                },
              ]),
              filter: expect.arrayContaining([
                {
                  range: {
                    due_date: {
                      gte: '2024-01-01T00:00:00.000Z',
                      lte: '2024-12-31T23:59:59.000Z',
                    },
                  },
                },
              ]),
            }),
          }),
        }),
      });
    });

    it('should handle isOverdue filter', async () => {
      const searchParams: TodoSearchParams = {
        isOverdue: true,
      };

      mockClient.search.mockResolvedValue({
        body: {
          hits: {
            hits: [],
            total: { value: 0 },
          },
        },
      } as any);

      await repository.search(mockClient, searchParams);

      expect(mockClient.search).toHaveBeenCalledWith({
        index: 'test-index',
        body: expect.objectContaining({
          query: expect.objectContaining({
            bool: expect.objectContaining({
              filter: expect.arrayContaining([
                {
                  bool: {
                    must: [
                      { range: { due_date: { lt: 'now' } } },
                      { exists: { field: 'due_date' } },
                    ],
                    must_not: [{ term: { status: 'done' } }],
                  },
                },
              ]),
            }),
          }),
        }),
      });
    });

    it('should combine isOverdue with other filters', async () => {
      const searchParams: TodoSearchParams = {
        status: 'planned',
        priority: 'high',
        isOverdue: true,
      };

      mockClient.search.mockResolvedValue({
        body: {
          hits: {
            hits: [],
            total: { value: 0 },
          },
        },
      } as any);

      await repository.search(mockClient, searchParams);

      expect(mockClient.search).toHaveBeenCalledWith({
        index: 'test-index',
        body: expect.objectContaining({
          query: expect.objectContaining({
            bool: expect.objectContaining({
              filter: expect.arrayContaining([
                { term: { status: 'planned' } },
                { term: { priority: 'high' } },
                {
                  bool: {
                    must: [
                      { range: { due_date: { lt: 'now' } } },
                      { exists: { field: 'due_date' } },
                    ],
                    must_not: [{ term: { status: 'done' } }],
                  },
                },
              ]),
            }),
          }),
        }),
      });
    });
  });

  describe('sorting with date fields', () => {
    it('should sort by createdAt', async () => {
      const searchParams: TodoSearchParams = {
        sortField: 'createdAt',
        sortDirection: 'desc',
      };

      mockClient.search.mockResolvedValue({
        body: {
          hits: {
            hits: [],
            total: { value: 0 },
          },
        },
      } as any);

      await repository.search(mockClient, searchParams);

      expect(mockClient.search).toHaveBeenCalledWith({
        index: 'test-index',
        body: expect.objectContaining({
          sort: [{ created_at: { order: 'desc' } }],
        }),
      });
    });

    it('should sort by updatedAt', async () => {
      const searchParams: TodoSearchParams = {
        sortField: 'updatedAt',
        sortDirection: 'asc',
      };

      mockClient.search.mockResolvedValue({
        body: {
          hits: {
            hits: [],
            total: { value: 0 },
          },
        },
      } as any);

      await repository.search(mockClient, searchParams);

      expect(mockClient.search).toHaveBeenCalledWith({
        index: 'test-index',
        body: expect.objectContaining({
          sort: [{ updated_at: { order: 'asc' } }],
        }),
      });
    });

    it('should sort by completedAt', async () => {
      const searchParams: TodoSearchParams = {
        sortField: 'completedAt',
        sortDirection: 'desc',
      };

      mockClient.search.mockResolvedValue({
        body: {
          hits: {
            hits: [],
            total: { value: 0 },
          },
        },
      } as any);

      await repository.search(mockClient, searchParams);

      expect(mockClient.search).toHaveBeenCalledWith({
        index: 'test-index',
        body: expect.objectContaining({
          sort: [{ completed_at: { order: 'desc' } }],
        }),
      });
    });

    it('should sort by dueDate', async () => {
      const searchParams: TodoSearchParams = {
        sortField: 'dueDate',
        sortDirection: 'asc',
      };

      mockClient.search.mockResolvedValue({
        body: {
          hits: {
            hits: [],
            total: { value: 0 },
          },
        },
      } as any);

      await repository.search(mockClient, searchParams);

      expect(mockClient.search).toHaveBeenCalledWith({
        index: 'test-index',
        body: expect.objectContaining({
          sort: [{ due_date: { order: 'asc' } }],
        }),
      });
    });

    it('should default to createdAt desc when no sort specified', async () => {
      const searchParams: TodoSearchParams = {};

      mockClient.search.mockResolvedValue({
        body: {
          hits: {
            hits: [],
            total: { value: 0 },
          },
        },
      } as any);

      await repository.search(mockClient, searchParams);

      expect(mockClient.search).toHaveBeenCalledWith({
        index: 'test-index',
        body: expect.objectContaining({
          sort: [{ created_at: { order: 'desc' } }],
        }),
      });
    });
  });

  describe('error handling', () => {
    it('should throw IndexError when search fails', async () => {
      mockClient.search.mockRejectedValue(new Error('OpenSearch connection failed'));

      await expect(repository.search(mockClient, {})).rejects.toThrow(IndexError);
      expect(mockLogger.error).toHaveBeenCalledWith(
        'Failed to search TODOs',
        expect.any(Error)
      );
    });

    it('should handle empty search results', async () => {
      mockClient.search.mockResolvedValue({
        body: {
          hits: {
            hits: [],
            total: { value: 0 },
          },
        },
      } as any);

      const result = await repository.search(mockClient, {
        dueDateAfter: '2025-01-01T00:00:00.000Z',
        dueDateBefore: '2025-01-02T00:00:00.000Z',
      });

      expect(result.todos).toEqual([]);
      expect(result.total).toBe(0);
    });
  });

  describe('pagination with date filters', () => {
    it('should apply pagination with date filters', async () => {
      const searchParams: TodoSearchParams = {
        page: 2,
        pageSize: 10,
        dueDateAfter: '2024-01-01T00:00:00.000Z',
        dueDateBefore: '2024-12-31T23:59:59.000Z',
      };

      mockClient.search.mockResolvedValue({
        body: {
          hits: {
            hits: [],
            total: { value: 0 },
          },
        },
      } as any);

      await repository.search(mockClient, searchParams);

      expect(mockClient.search).toHaveBeenCalledWith({
        index: 'test-index',
        body: expect.objectContaining({
          from: 10,
          size: 10,
          query: expect.objectContaining({
            bool: expect.objectContaining({
              filter: expect.arrayContaining([
                {
                  range: {
                    due_date: {
                      gte: '2024-01-01T00:00:00.000Z',
                      lte: '2024-12-31T23:59:59.000Z',
                    },
                  },
                },
              ]),
            }),
          }),
        }),
      });
    });
  });
});
