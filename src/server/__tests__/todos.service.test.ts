import { TodosService } from '../services/todos.service';
import { TodosRepository, TodoOpenSearchClient } from '../repositories';
import { ValidationError, NotFoundError } from '../errors';
import { Todo, CreateTodoRequest, UpdateTodoRequest } from '../../common';
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
describe('TodosService', () => {
  let service: TodosService;
  let mockRepository: jest.Mocked<TodosRepository>;
  const sampleTodo: Todo = {
    id: 'test-id-123',
    title: 'Test TODO',
    description: 'Test description',
    status: 'planned',
    tags: ['test', 'sample'],
    assignee: 'user1',
    priority: 'medium',
    severity: 'low',
    complianceFrameworks: [],
    createdAt: '2024-01-15T10:00:00.000Z',
    updatedAt: '2024-01-15T10:00:00.000Z',
    completedAt: null,
  };
  beforeEach(() => {
    jest.clearAllMocks();
    mockRepository = new TodosRepository(
      mockLogger as any,
      {} as any
    ) as jest.Mocked<TodosRepository>;
    service = new TodosService(mockLogger as any, mockRepository);
  });
  describe('create', () => {
    it('should create a TODO with required fields', async () => {
      const request: CreateTodoRequest = {
        title: 'New TODO',
      };
      mockRepository.create.mockResolvedValue({
        ...sampleTodo,
        title: 'New TODO',
        description: undefined,
        tags: [],
        assignee: undefined,
      });
      const result = await service.create(mockClient, request);
      expect(result.title).toBe('New TODO');
      expect(mockRepository.create).toHaveBeenCalledTimes(1);
    });
    it('should create a TODO with all optional fields', async () => {
      const request: CreateTodoRequest = {
        title: 'Full TODO',
        description: 'Full description',
        status: 'planned',
        tags: ['tag1', 'tag2'],
        assignee: 'user1',
      };
      mockRepository.create.mockResolvedValue({
        ...sampleTodo,
        ...request,
      });
      const result = await service.create(mockClient, request);
      expect(result.title).toBe('Full TODO');
      expect(result.description).toBe('Full description');
      expect(result.status).toBe('planned');
      expect(mockRepository.create).toHaveBeenCalledTimes(1);
    });
    it('should throw ValidationError if title is empty', async () => {
      const request: CreateTodoRequest = {
        title: '',
      };
      await expect(service.create(mockClient, request)).rejects.toThrow(ValidationError);
      expect(mockRepository.create).not.toHaveBeenCalled();
    });
    it('should throw ValidationError if title is only whitespace', async () => {
      const request: CreateTodoRequest = {
        title: '   ',
      };
      await expect(service.create(mockClient, request)).rejects.toThrow(ValidationError);
      expect(mockRepository.create).not.toHaveBeenCalled();
    });
    it('should throw ValidationError if title exceeds 256 characters', async () => {
      const request: CreateTodoRequest = {
        title: 'a'.repeat(257),
      };
      await expect(service.create(mockClient, request)).rejects.toThrow(ValidationError);
      expect(mockRepository.create).not.toHaveBeenCalled();
    });
    it('should throw ValidationError if description exceeds 4000 characters', async () => {
      const request: CreateTodoRequest = {
        title: 'Test',
        description: 'a'.repeat(4001),
      };
      await expect(service.create(mockClient, request)).rejects.toThrow(ValidationError);
      expect(mockRepository.create).not.toHaveBeenCalled();
    });
    it('should throw ValidationError if invalid status is provided', async () => {
      const request = {
        title: 'Test',
        status: 'invalid' as any,
      };
      await expect(service.create(mockClient, request)).rejects.toThrow(ValidationError);
      expect(mockRepository.create).not.toHaveBeenCalled();
    });
    it('should throw ValidationError if more than 20 tags are provided', async () => {
      const request: CreateTodoRequest = {
        title: 'Test',
        tags: Array(21).fill('tag'),
      };
      await expect(service.create(mockClient, request)).rejects.toThrow(ValidationError);
      expect(mockRepository.create).not.toHaveBeenCalled();
    });
    it('should throw ValidationError if a tag exceeds 50 characters', async () => {
      const request: CreateTodoRequest = {
        title: 'Test',
        tags: ['a'.repeat(51)],
      };
      await expect(service.create(mockClient, request)).rejects.toThrow(ValidationError);
      expect(mockRepository.create).not.toHaveBeenCalled();
    });
    it('should throw ValidationError if assignee exceeds 100 characters', async () => {
      const request: CreateTodoRequest = {
        title: 'Test',
        assignee: 'a'.repeat(101),
      };
      await expect(service.create(mockClient, request)).rejects.toThrow(ValidationError);
      expect(mockRepository.create).not.toHaveBeenCalled();
    });
    describe('Priority Validation', () => {
      it('should create TODO with default priority when not provided', async () => {
        const request: CreateTodoRequest = {
          title: 'Test TODO',
        };
        mockRepository.create.mockResolvedValue({
          ...sampleTodo,
          priority: 'medium',
          severity: 'low',
        });
        const result = await service.create(mockClient, request);
        expect(result.priority).toBe('medium');
        expect(mockRepository.create).toHaveBeenCalledTimes(1);
      });
      it('should create TODO with valid priority values', async () => {
        const priorities: Array<'low' | 'medium' | 'high' | 'critical'> = [
          'low',
          'medium',
          'high',
          'critical',
        ];
        for (const priority of priorities) {
          jest.clearAllMocks();
          const request: CreateTodoRequest = {
            title: 'Test TODO',
            priority,
          };
          mockRepository.create.mockResolvedValue({
            ...sampleTodo,
            priority,
            severity: 'low',
          });
          const result = await service.create(mockClient, request);
          expect(result.priority).toBe(priority);
        }
      });
      it('should throw ValidationError for invalid priority value', async () => {
        const request = {
          title: 'Test',
          priority: 'invalid_priority' as any,
        };
        await expect(service.create(mockClient, request)).rejects.toThrow(ValidationError);
        expect(mockRepository.create).not.toHaveBeenCalled();
      });
    });
    describe('Severity Validation', () => {
      it('should create TODO with default severity when not provided', async () => {
        const request: CreateTodoRequest = {
          title: 'Test TODO',
        };
        mockRepository.create.mockResolvedValue({
          ...sampleTodo,
          priority: 'medium',
          severity: 'low',
        });
        const result = await service.create(mockClient, request);
        expect(result.severity).toBe('low');
        expect(mockRepository.create).toHaveBeenCalledTimes(1);
      });
      it('should create TODO with valid severity values', async () => {
        const severities: Array<'info' | 'low' | 'medium' | 'high' | 'critical'> = [
          'info',
          'low',
          'medium',
          'high',
          'critical',
        ];
        for (const severity of severities) {
          jest.clearAllMocks();
          const request: CreateTodoRequest = {
            title: 'Test TODO',
            severity,
          };
          mockRepository.create.mockResolvedValue({
            ...sampleTodo,
            priority: 'medium',
            severity,
          });
          const result = await service.create(mockClient, request);
          expect(result.severity).toBe(severity);
        }
      });
      it('should throw ValidationError for invalid severity value', async () => {
        const request = {
          title: 'Test',
          severity: 'invalid_severity' as any,
        };
        await expect(service.create(mockClient, request)).rejects.toThrow(ValidationError);
        expect(mockRepository.create).not.toHaveBeenCalled();
      });
    });
    describe('Due Date Validation', () => {
      it('should create TODO with valid ISO 8601 date', async () => {
        const request: CreateTodoRequest = {
          title: 'Test TODO',
          dueDate: '2025-12-31T23:59:59.000Z',
        };
        mockRepository.create.mockResolvedValue({
          ...sampleTodo,
          dueDate: '2025-12-31T23:59:59.000Z',
          priority: 'medium',
          severity: 'low',
        });
        const result = await service.create(mockClient, request);
        expect(result.dueDate).toBe('2025-12-31T23:59:59.000Z');
        expect(mockRepository.create).toHaveBeenCalledTimes(1);
      });
      it('should create TODO without due date when not provided', async () => {
        const request: CreateTodoRequest = {
          title: 'Test TODO',
        };
        mockRepository.create.mockResolvedValue({
          ...sampleTodo,
          priority: 'medium',
          severity: 'low',
        });
        const result = await service.create(mockClient, request);
        expect(result.dueDate).toBeUndefined();
      });
      it('should throw ValidationError for invalid date format', async () => {
        const invalidDates = [
          '2025-12-31',
          '12/31/2025',
          '2025-12-31 23:59:59',
          'invalid-date',
          '2025-12-31T23:59:59', 
        ];
        for (const dueDate of invalidDates) {
          const request: CreateTodoRequest = {
            title: 'Test',
            dueDate,
          };
          await expect(service.create(mockClient, request)).rejects.toThrow(ValidationError);
        }
        expect(mockRepository.create).not.toHaveBeenCalled();
      });
    });
    describe('Compliance Frameworks Validation', () => {
      it('should create TODO with compliance frameworks', async () => {
        const request: CreateTodoRequest = {
          title: 'Test TODO',
          complianceFrameworks: ['PCI-DSS', 'ISO-27001', 'HIPAA'],
        };
        mockRepository.create.mockResolvedValue({
          ...sampleTodo,
          complianceFrameworks: ['PCI-DSS', 'ISO-27001', 'HIPAA'],
          priority: 'medium',
          severity: 'low',
        });
        const result = await service.create(mockClient, request);
        expect(result.complianceFrameworks).toEqual(['PCI-DSS', 'ISO-27001', 'HIPAA']);
        expect(mockRepository.create).toHaveBeenCalledTimes(1);
      });
      it('should create TODO with empty compliance frameworks when not provided', async () => {
        const request: CreateTodoRequest = {
          title: 'Test TODO',
        };
        mockRepository.create.mockResolvedValue({
          ...sampleTodo,
          complianceFrameworks: [],
          priority: 'medium',
          severity: 'low',
        });
        const result = await service.create(mockClient, request);
        expect(result.complianceFrameworks).toEqual([]);
      });
      it('should throw ValidationError when exceeding max compliance frameworks', async () => {
        const request: CreateTodoRequest = {
          title: 'Test',
          complianceFrameworks: Array.from({ length: 11 }, (_, i) => `FRAMEWORK-${i}`),
        };
        await expect(service.create(mockClient, request)).rejects.toThrow(ValidationError);
        expect(mockRepository.create).not.toHaveBeenCalled();
      });
      it('should accept exactly 10 compliance frameworks', async () => {
        const frameworks = Array.from({ length: 10 }, (_, i) => `FRAMEWORK-${i}`);
        const request: CreateTodoRequest = {
          title: 'Test TODO',
          complianceFrameworks: frameworks,
        };
        mockRepository.create.mockResolvedValue({
          ...sampleTodo,
          complianceFrameworks: frameworks,
          priority: 'medium',
          severity: 'low',
        });
        const result = await service.create(mockClient, request);
        expect(result.complianceFrameworks).toEqual(frameworks);
        expect(mockRepository.create).toHaveBeenCalledTimes(1);
      });
      it('should throw ValidationError when framework exceeds max length', async () => {
        const request: CreateTodoRequest = {
          title: 'Test',
          complianceFrameworks: ['a'.repeat(101)],
        };
        await expect(service.create(mockClient, request)).rejects.toThrow(ValidationError);
        expect(mockRepository.create).not.toHaveBeenCalled();
      });
      it('should accept framework at max length', async () => {
        const framework = 'a'.repeat(100);
        const request: CreateTodoRequest = {
          title: 'Test TODO',
          complianceFrameworks: [framework],
        };
        mockRepository.create.mockResolvedValue({
          ...sampleTodo,
          complianceFrameworks: [framework],
          priority: 'medium',
          severity: 'low',
        });
        const result = await service.create(mockClient, request);
        expect(result.complianceFrameworks).toEqual([framework]);
      });
    });
    describe('Combined Analytics Fields', () => {
      it('should create TODO with all analytics fields', async () => {
        const request: CreateTodoRequest = {
          title: 'Full Analytics TODO',
          priority: 'high',
          severity: 'critical',
          dueDate: '2025-12-31T23:59:59.000Z',
          complianceFrameworks: ['PCI-DSS', 'ISO-27001'],
        };
        mockRepository.create.mockResolvedValue({
          ...sampleTodo,
          title: 'Full Analytics TODO',
          priority: 'high',
          severity: 'critical',
          dueDate: '2025-12-31T23:59:59.000Z',
          complianceFrameworks: ['PCI-DSS', 'ISO-27001'],
        });
        const result = await service.create(mockClient, request);
        expect(result.priority).toBe('high');
        expect(result.severity).toBe('critical');
        expect(result.dueDate).toBe('2025-12-31T23:59:59.000Z');
        expect(result.complianceFrameworks).toEqual(['PCI-DSS', 'ISO-27001']);
      });
    });
  });
  describe('getById', () => {
    it('should return a TODO by ID', async () => {
      mockRepository.getById.mockResolvedValue(sampleTodo);
      const result = await service.getById(mockClient, 'test-id-123');
      expect(result).toEqual(sampleTodo);
      expect(mockRepository.getById).toHaveBeenCalledWith(mockClient, 'test-id-123');
    });
    it('should throw ValidationError if ID is empty', async () => {
      await expect(service.getById(mockClient, '')).rejects.toThrow(ValidationError);
      expect(mockRepository.getById).not.toHaveBeenCalled();
    });
    it('should propagate NotFoundError from repository', async () => {
      mockRepository.getById.mockRejectedValue(new NotFoundError('Todo', 'nonexistent'));
      await expect(service.getById(mockClient, 'nonexistent')).rejects.toThrow(NotFoundError);
    });
  });
  describe('list', () => {
    it('should return paginated TODO list', async () => {
      mockRepository.search.mockResolvedValue({
        todos: [sampleTodo],
        total: 1,
      });
      const result = await service.list(mockClient, {});
      expect(result.todos).toHaveLength(1);
      expect(result.pagination.totalItems).toBe(1);
      expect(result.pagination.page).toBe(1);
    });
    it('should apply pagination parameters', async () => {
      mockRepository.search.mockResolvedValue({
        todos: [sampleTodo],
        total: 50,
      });
      const result = await service.list(mockClient, { page: 2, pageSize: 10 });
      expect(result.pagination.page).toBe(2);
      expect(result.pagination.pageSize).toBe(10);
      expect(result.pagination.totalPages).toBe(5);
      expect(result.pagination.hasNextPage).toBe(true);
      expect(result.pagination.hasPreviousPage).toBe(true);
    });
    it('should apply filters to search', async () => {
      mockRepository.search.mockResolvedValue({
        todos: [sampleTodo],
        total: 1,
      });
      await service.list(mockClient, {
        status: 'planned',
        tags: ['test'],
        searchText: 'search',
        assignee: 'user1',
      });
      expect(mockRepository.search).toHaveBeenCalledWith(
        mockClient,
        expect.objectContaining({
          status: 'planned',
          tags: ['test'],
          searchText: 'search',
          assignee: 'user1',
        })
      );
    });
    it('should apply sorting options', async () => {
      mockRepository.search.mockResolvedValue({
        todos: [],
        total: 0,
      });
      await service.list(mockClient, {
        sortField: 'title',
        sortDirection: 'asc',
      });
      expect(mockRepository.search).toHaveBeenCalledWith(
        mockClient,
        expect.objectContaining({
          sortField: 'title',
          sortDirection: 'asc',
        })
      );
    });

    describe('Date Range Filtering', () => {
      it('should filter by dueDate range with both after and before', async () => {
        mockRepository.search.mockResolvedValue({
          todos: [sampleTodo],
          total: 1,
        });
        await service.list(mockClient, {
          dueDateAfter: '2024-01-01T00:00:00.000Z',
          dueDateBefore: '2024-12-31T23:59:59.000Z',
        });
        expect(mockRepository.search).toHaveBeenCalledWith(
          mockClient,
          expect.objectContaining({
            dueDateAfter: '2024-01-01T00:00:00.000Z',
            dueDateBefore: '2024-12-31T23:59:59.000Z',
          })
        );
      });

      it('should filter by dueDate with only dueDateAfter', async () => {
        mockRepository.search.mockResolvedValue({
          todos: [sampleTodo],
          total: 1,
        });
        await service.list(mockClient, {
          dueDateAfter: '2024-01-01T00:00:00.000Z',
        });
        expect(mockRepository.search).toHaveBeenCalledWith(
          mockClient,
          expect.objectContaining({
            dueDateAfter: '2024-01-01T00:00:00.000Z',
            dueDateBefore: undefined,
          })
        );
      });

      it('should filter by dueDate with only dueDateBefore', async () => {
        mockRepository.search.mockResolvedValue({
          todos: [sampleTodo],
          total: 1,
        });
        await service.list(mockClient, {
          dueDateBefore: '2024-12-31T23:59:59.000Z',
        });
        expect(mockRepository.search).toHaveBeenCalledWith(
          mockClient,
          expect.objectContaining({
            dueDateAfter: undefined,
            dueDateBefore: '2024-12-31T23:59:59.000Z',
          })
        );
      });

      it('should combine date filters with other filters', async () => {
        mockRepository.search.mockResolvedValue({
          todos: [sampleTodo],
          total: 1,
        });
        await service.list(mockClient, {
          status: 'planned',
          tags: ['urgent'],
          searchText: 'important',
          dueDateAfter: '2024-01-01T00:00:00.000Z',
          dueDateBefore: '2024-12-31T23:59:59.000Z',
        });
        expect(mockRepository.search).toHaveBeenCalledWith(
          mockClient,
          expect.objectContaining({
            status: 'planned',
            tags: ['urgent'],
            searchText: 'important',
            dueDateAfter: '2024-01-01T00:00:00.000Z',
            dueDateBefore: '2024-12-31T23:59:59.000Z',
          })
        );
      });

      it('should handle isOverdue filter', async () => {
        mockRepository.search.mockResolvedValue({
          todos: [sampleTodo],
          total: 1,
        });
        await service.list(mockClient, {
          isOverdue: true,
        });
        expect(mockRepository.search).toHaveBeenCalledWith(
          mockClient,
          expect.objectContaining({
            isOverdue: true,
          })
        );
      });

      it('should combine isOverdue with other filters', async () => {
        mockRepository.search.mockResolvedValue({
          todos: [sampleTodo],
          total: 1,
        });
        await service.list(mockClient, {
          status: 'planned',
          priority: 'high',
          isOverdue: true,
        });
        expect(mockRepository.search).toHaveBeenCalledWith(
          mockClient,
          expect.objectContaining({
            status: 'planned',
            priority: 'high',
            isOverdue: true,
          })
        );
      });

      it('should return empty results for date range with no matches', async () => {
        mockRepository.search.mockResolvedValue({
          todos: [],
          total: 0,
        });
        const result = await service.list(mockClient, {
          dueDateAfter: '2025-01-01T00:00:00.000Z',
          dueDateBefore: '2025-01-02T00:00:00.000Z',
        });
        expect(result.todos).toHaveLength(0);
        expect(result.pagination.totalItems).toBe(0);
      });
    });
  });
  describe('update', () => {
    it('should update TODO title', async () => {
      mockRepository.getById.mockResolvedValue(sampleTodo);
      mockRepository.update.mockResolvedValue(true);
      const result = await service.update(mockClient, 'test-id-123', {
        title: 'Updated Title',
      });
      expect(result.title).toBe('Updated Title');
      expect(mockRepository.update).toHaveBeenCalled();
    });
    it('should update TODO status to done and set completedAt', async () => {
      mockRepository.getById.mockResolvedValue(sampleTodo);
      mockRepository.update.mockResolvedValue(true);
      const result = await service.update(mockClient, 'test-id-123', {
        status: 'done',
      });
      expect(result.status).toBe('done');
      expect(result.completedAt).not.toBeNull();
    });
    it('should clear completedAt when status changes from done to planned', async () => {
      const completedTodo: Todo = {
        ...sampleTodo,
        status: 'done',
        completedAt: '2024-01-15T12:00:00.000Z',
      };
      mockRepository.getById.mockResolvedValue(completedTodo);
      mockRepository.update.mockResolvedValue(true);
      const result = await service.update(mockClient, 'test-id-123', {
        status: 'planned',
      });
      expect(result.status).toBe('planned');
      expect(result.completedAt).toBeNull();
    });
    it('should update multiple fields at once', async () => {
      mockRepository.getById.mockResolvedValue(sampleTodo);
      mockRepository.update.mockResolvedValue(true);
      const result = await service.update(mockClient, 'test-id-123', {
        title: 'New Title',
        description: 'New Description',
        tags: ['new-tag'],
      });
      expect(result.title).toBe('New Title');
      expect(result.description).toBe('New Description');
      expect(result.tags).toEqual(['new-tag']);
    });
    it('should throw ValidationError if no fields provided', async () => {
      await expect(service.update(mockClient, 'test-id-123', {})).rejects.toThrow(ValidationError);
      expect(mockRepository.update).not.toHaveBeenCalled();
    });
    it('should throw ValidationError if title is empty', async () => {
      mockRepository.getById.mockResolvedValue(sampleTodo);
      await expect(
        service.update(mockClient, 'test-id-123', { title: '' })
      ).rejects.toThrow(ValidationError);
      expect(mockRepository.update).not.toHaveBeenCalled();
    });
    it('should throw ValidationError if title exceeds 256 characters', async () => {
      mockRepository.getById.mockResolvedValue(sampleTodo);
      await expect(
        service.update(mockClient, 'test-id-123', { title: 'a'.repeat(257) })
      ).rejects.toThrow(ValidationError);
      expect(mockRepository.update).not.toHaveBeenCalled();
    });
    it('should throw ValidationError for invalid status', async () => {
      mockRepository.getById.mockResolvedValue(sampleTodo);
      await expect(
        service.update(mockClient, 'test-id-123', { status: 'invalid' as any })
      ).rejects.toThrow(ValidationError);
      expect(mockRepository.update).not.toHaveBeenCalled();
    });
    it('should propagate NotFoundError from repository', async () => {
      mockRepository.getById.mockRejectedValue(new NotFoundError('Todo', 'nonexistent'));
      await expect(
        service.update(mockClient, 'nonexistent', { title: 'New Title' })
      ).rejects.toThrow(NotFoundError);
    });
    describe('Update Priority', () => {
      it('should update TODO priority', async () => {
        mockRepository.getById.mockResolvedValue(sampleTodo);
        mockRepository.update.mockResolvedValue(true);
        const result = await service.update(mockClient, 'test-id-123', {
          priority: 'critical',
        });
        expect(result.priority).toBe('critical');
        expect(mockRepository.update).toHaveBeenCalled();
      });
      it('should throw ValidationError for invalid priority in update', async () => {
        mockRepository.getById.mockResolvedValue(sampleTodo);
        await expect(
          service.update(mockClient, 'test-id-123', { priority: 'invalid' as any })
        ).rejects.toThrow(ValidationError);
        expect(mockRepository.update).not.toHaveBeenCalled();
      });
    });
    describe('Update Severity', () => {
      it('should update TODO severity', async () => {
        mockRepository.getById.mockResolvedValue(sampleTodo);
        mockRepository.update.mockResolvedValue(true);
        const result = await service.update(mockClient, 'test-id-123', {
          severity: 'critical',
        });
        expect(result.severity).toBe('critical');
        expect(mockRepository.update).toHaveBeenCalled();
      });
      it('should throw ValidationError for invalid severity in update', async () => {
        mockRepository.getById.mockResolvedValue(sampleTodo);
        await expect(
          service.update(mockClient, 'test-id-123', { severity: 'invalid' as any })
        ).rejects.toThrow(ValidationError);
        expect(mockRepository.update).not.toHaveBeenCalled();
      });
    });
    describe('Update Due Date', () => {
      it('should update TODO due date', async () => {
        mockRepository.getById.mockResolvedValue(sampleTodo);
        mockRepository.update.mockResolvedValue(true);
        const result = await service.update(mockClient, 'test-id-123', {
          dueDate: '2026-01-15T12:00:00.000Z',
        });
        expect(result.dueDate).toBe('2026-01-15T12:00:00.000Z');
        expect(mockRepository.update).toHaveBeenCalled();
      });
      it('should clear due date when set to null', async () => {
        const todoWithDueDate: Todo = {
          ...sampleTodo,
          dueDate: '2025-12-31T23:59:59.000Z',
        };
        mockRepository.getById.mockResolvedValue(todoWithDueDate);
        mockRepository.update.mockResolvedValue(true);
        const result = await service.update(mockClient, 'test-id-123', {
          dueDate: null,
        });
        expect(result.dueDate).toBeUndefined();
      });
      it('should throw ValidationError for invalid due date format in update', async () => {
        mockRepository.getById.mockResolvedValue(sampleTodo);
        await expect(
          service.update(mockClient, 'test-id-123', { dueDate: 'invalid-date' })
        ).rejects.toThrow(ValidationError);
        expect(mockRepository.update).not.toHaveBeenCalled();
      });
    });
    describe('Update Compliance Frameworks', () => {
      it('should update compliance frameworks', async () => {
        mockRepository.getById.mockResolvedValue(sampleTodo);
        mockRepository.update.mockResolvedValue(true);
        const result = await service.update(mockClient, 'test-id-123', {
          complianceFrameworks: ['SOC2', 'GDPR'],
        });
        expect(result.complianceFrameworks).toEqual(['SOC2', 'GDPR']);
        expect(mockRepository.update).toHaveBeenCalled();
      });
      it('should throw ValidationError when exceeding max frameworks in update', async () => {
        mockRepository.getById.mockResolvedValue(sampleTodo);
        await expect(
          service.update(mockClient, 'test-id-123', {
            complianceFrameworks: Array.from({ length: 11 }, (_, i) => `FRAMEWORK-${i}`),
          })
        ).rejects.toThrow(ValidationError);
        expect(mockRepository.update).not.toHaveBeenCalled();
      });
      it('should throw ValidationError when framework exceeds max length in update', async () => {
        mockRepository.getById.mockResolvedValue(sampleTodo);
        await expect(
          service.update(mockClient, 'test-id-123', {
            complianceFrameworks: ['a'.repeat(101)],
          })
        ).rejects.toThrow(ValidationError);
        expect(mockRepository.update).not.toHaveBeenCalled();
      });
    });
    describe('Update Multiple Analytics Fields', () => {
      it('should update multiple analytics fields at once', async () => {
        mockRepository.getById.mockResolvedValue(sampleTodo);
        mockRepository.update.mockResolvedValue(true);
        const result = await service.update(mockClient, 'test-id-123', {
          priority: 'high',
          severity: 'critical',
          dueDate: '2026-01-01T00:00:00.000Z',
          complianceFrameworks: ['PCI-DSS', 'HIPAA'],
        });
        expect(result.priority).toBe('high');
        expect(result.severity).toBe('critical');
        expect(result.dueDate).toBe('2026-01-01T00:00:00.000Z');
        expect(result.complianceFrameworks).toEqual(['PCI-DSS', 'HIPAA']);
      });
    });
  });
  describe('delete', () => {
    it('should delete a TODO by ID', async () => {
      mockRepository.delete.mockResolvedValue(true);
      const result = await service.delete(mockClient, 'test-id-123');
      expect(result).toBe(true);
      expect(mockRepository.delete).toHaveBeenCalledWith(mockClient, 'test-id-123');
    });
    it('should throw ValidationError if ID is empty', async () => {
      await expect(service.delete(mockClient, '')).rejects.toThrow(ValidationError);
      expect(mockRepository.delete).not.toHaveBeenCalled();
    });
    it('should propagate NotFoundError from repository', async () => {
      mockRepository.delete.mockRejectedValue(new NotFoundError('Todo', 'nonexistent'));
      await expect(service.delete(mockClient, 'nonexistent')).rejects.toThrow(NotFoundError);
    });
  });
});
