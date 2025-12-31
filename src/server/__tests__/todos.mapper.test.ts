import {
  TodosMapper,
  TodoDocument,
  OpenSearchHit,
  OpenSearchStatsAggregations,
} from '../mappers/todos.mapper';
import { Todo, CreateTodoRequest, UpdateTodoRequest } from '../../common';
describe('TodosMapper', () => {
  describe('fromOpenSearchHit', () => {
    it('should map an OpenSearch hit to a Todo entity', () => {
      const hit: OpenSearchHit<TodoDocument> = {
        _id: 'test-123',
        _source: {
          title: 'Test Todo',
          description: 'Test description',
          status: 'planned',
          tags: ['tag1', 'tag2'],
          assignee: 'user1',
          priority: 'high',
          severity: 'medium',
          due_date: '2025-12-31T23:59:59.000Z',
          compliance_framework: ['PCI-DSS', 'ISO-27001'],
          created_at: '2024-01-15T10:00:00.000Z',
          updated_at: '2024-01-15T11:00:00.000Z',
          completed_at: null,
        },
      };
      const result = TodosMapper.fromOpenSearchHit(hit);
      expect(result).toEqual({
        id: 'test-123',
        title: 'Test Todo',
        description: 'Test description',
        status: 'planned',
        tags: ['tag1', 'tag2'],
        assignee: 'user1',
        priority: 'high',
        severity: 'medium',
        dueDate: '2025-12-31T23:59:59.000Z',
        complianceFrameworks: ['PCI-DSS', 'ISO-27001'],
        createdAt: '2024-01-15T10:00:00.000Z',
        updatedAt: '2024-01-15T11:00:00.000Z',
        completedAt: null,
      });
    });
    it('should handle missing optional fields', () => {
      const hit: OpenSearchHit<TodoDocument> = {
        _id: 'test-456',
        _source: {
          title: 'Minimal Todo',
          status: 'planned',
          tags: [],
          priority: 'medium',
          severity: 'low',
          due_date: null,
          compliance_framework: [],
          created_at: '2024-01-15T10:00:00.000Z',
          updated_at: '2024-01-15T10:00:00.000Z',
          completed_at: null,
        },
      };
      const result = TodosMapper.fromOpenSearchHit(hit);
      expect(result.id).toBe('test-456');
      expect(result.description).toBeUndefined();
      expect(result.assignee).toBeUndefined();
      expect(result.tags).toEqual([]);
      expect(result.priority).toBe('medium');
      expect(result.severity).toBe('low');
      expect(result.dueDate).toBeUndefined();
      expect(result.complianceFrameworks).toEqual([]);
    });
    it('should handle null tags array', () => {
      const hit: OpenSearchHit<TodoDocument> = {
        _id: 'test-789',
        _source: {
          title: 'Test',
          status: 'planned',
          tags: null as any,
          created_at: '2024-01-15T10:00:00.000Z',
          updated_at: '2024-01-15T10:00:00.000Z',
          completed_at: null,
        },
      };
      const result = TodosMapper.fromOpenSearchHit(hit);
      expect(result.tags).toEqual([]);
    });
  });
  describe('fromOpenSearchHits', () => {
    it('should map multiple hits to Todo entities', () => {
      const hits: OpenSearchHit<TodoDocument>[] = [
        {
          _id: 'id-1',
          _source: {
            title: 'Todo 1',
            status: 'planned',
            tags: ['a'],
            created_at: '2024-01-01T00:00:00.000Z',
            updated_at: '2024-01-01T00:00:00.000Z',
            completed_at: null,
          },
        },
        {
          _id: 'id-2',
          _source: {
            title: 'Todo 2',
            status: 'done',
            tags: ['b'],
            created_at: '2024-01-02T00:00:00.000Z',
            updated_at: '2024-01-02T00:00:00.000Z',
            completed_at: '2024-01-02T12:00:00.000Z',
          },
        },
      ];
      const result = TodosMapper.fromOpenSearchHits(hits);
      expect(result).toHaveLength(2);
      expect(result[0].id).toBe('id-1');
      expect(result[1].id).toBe('id-2');
    });
    it('should return empty array for empty hits', () => {
      const result = TodosMapper.fromOpenSearchHits([]);
      expect(result).toEqual([]);
    });
  });
  describe('toCreateDocument', () => {
    it('should create a document with all fields', () => {
      const request: CreateTodoRequest = {
        title: '  Test Todo  ',
        description: '  Test description  ',
        status: 'planned',
        tags: ['Tag1', '  TAG2  ', 'tag1'],
        assignee: '  user1  ',
        priority: 'high',
        severity: 'critical',
        dueDate: '2025-12-31T23:59:59.000Z',
        complianceFrameworks: ['PCI-DSS', '  ISO-27001  ', 'PCI-DSS'],
      };
      const now = '2024-01-15T10:00:00.000Z';
      const result = TodosMapper.toCreateDocument(request, now);
      expect(result.title).toBe('Test Todo');
      expect(result.description).toBe('Test description');
      expect(result.status).toBe('planned');
      expect(result.tags).toEqual(['tag1', 'tag2']); 
      expect(result.assignee).toBe('user1');
      expect(result.priority).toBe('high');
      expect(result.severity).toBe('critical');
      expect(result.due_date).toBe('2025-12-31T23:59:59.000Z');
      expect(result.compliance_framework).toEqual(['PCI-DSS', 'ISO-27001']); 
      expect(result.created_at).toBe(now);
      expect(result.updated_at).toBe(now);
      expect(result.completed_at).toBeNull();
    });
    it('should default status to planned', () => {
      const request: CreateTodoRequest = {
        title: 'Test',
      };
      const result = TodosMapper.toCreateDocument(request, '2024-01-15T10:00:00.000Z');
      expect(result.status).toBe('planned');
      expect(result.completed_at).toBeNull();
    });
    it('should default priority and severity when not provided', () => {
      const request: CreateTodoRequest = {
        title: 'Test',
      };
      const result = TodosMapper.toCreateDocument(request, '2024-01-15T10:00:00.000Z');
      expect(result.priority).toBe('medium');
      expect(result.severity).toBe('low');
    });
    it('should handle null due_date when not provided', () => {
      const request: CreateTodoRequest = {
        title: 'Test',
      };
      const result = TodosMapper.toCreateDocument(request, '2024-01-15T10:00:00.000Z');
      expect(result.due_date).toBeNull();
    });
    it('should handle empty compliance_framework when not provided', () => {
      const request: CreateTodoRequest = {
        title: 'Test',
      };
      const result = TodosMapper.toCreateDocument(request, '2024-01-15T10:00:00.000Z');
      expect(result.compliance_framework).toEqual([]);
    });
    it('should set completed_at when status is done', () => {
      const request: CreateTodoRequest = {
        title: 'Test',
        status: 'done',
      };
      const now = '2024-01-15T10:00:00.000Z';
      const result = TodosMapper.toCreateDocument(request, now);
      expect(result.status).toBe('done');
      expect(result.completed_at).toBe(now);
    });
    it('should handle empty tags array', () => {
      const request: CreateTodoRequest = {
        title: 'Test',
        tags: [],
      };
      const result = TodosMapper.toCreateDocument(request, '2024-01-15T10:00:00.000Z');
      expect(result.tags).toEqual([]);
    });
  });
  describe('toUpdateDocument', () => {
    const existingTodo: Todo = {
      id: 'test-123',
      title: 'Old Title',
      description: 'Old Description',
      status: 'planned',
      tags: ['old-tag'],
      assignee: 'old-user',
      priority: 'medium',
      severity: 'low',
      dueDate: '2025-06-01T00:00:00.000Z',
      complianceFrameworks: ['PCI-DSS'],
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-01T00:00:00.000Z',
      completedAt: null,
    };
    const now = '2024-01-15T10:00:00.000Z';
    it('should only include provided fields', () => {
      const request: UpdateTodoRequest = {
        title: 'New Title',
      };
      const result = TodosMapper.toUpdateDocument(request, existingTodo, now);
      expect(result.title).toBe('New Title');
      expect(result.updated_at).toBe(now);
      expect(result.description).toBeUndefined();
      expect(result.status).toBeUndefined();
    });
    it('should set completed_at when status changes to done', () => {
      const request: UpdateTodoRequest = {
        status: 'done',
      };
      const result = TodosMapper.toUpdateDocument(request, existingTodo, now);
      expect(result.status).toBe('done');
      expect(result.completed_at).toBe(now);
    });
    it('should clear completed_at when status changes from done', () => {
      const doneTodo: Todo = {
        ...existingTodo,
        status: 'done',
        completedAt: '2024-01-10T00:00:00.000Z',
      };
      const request: UpdateTodoRequest = {
        status: 'planned',
      };
      const result = TodosMapper.toUpdateDocument(request, doneTodo, now);
      expect(result.status).toBe('planned');
      expect(result.completed_at).toBeNull();
    });
    it('should clear description with empty string', () => {
      const request: UpdateTodoRequest = {
        description: '',
      };
      const result = TodosMapper.toUpdateDocument(request, existingTodo, now);
      expect(result.description).toBeUndefined();
    });
    it('should clear assignee with empty string', () => {
      const request: UpdateTodoRequest = {
        assignee: '',
      };
      const result = TodosMapper.toUpdateDocument(request, existingTodo, now);
      expect(result.assignee).toBeUndefined();
    });
    it('should normalize tags', () => {
      const request: UpdateTodoRequest = {
        tags: ['  TAG1  ', 'Tag2', 'tag1'],
      };
      const result = TodosMapper.toUpdateDocument(request, existingTodo, now);
      expect(result.tags).toEqual(['tag1', 'tag2']);
    });
    it('should update priority field', () => {
      const request: UpdateTodoRequest = {
        priority: 'critical',
      };
      const result = TodosMapper.toUpdateDocument(request, existingTodo, now);
      expect(result.priority).toBe('critical');
      expect(result.updated_at).toBe(now);
    });
    it('should update severity field', () => {
      const request: UpdateTodoRequest = {
        severity: 'high',
      };
      const result = TodosMapper.toUpdateDocument(request, existingTodo, now);
      expect(result.severity).toBe('high');
      expect(result.updated_at).toBe(now);
    });
    it('should update dueDate field', () => {
      const request: UpdateTodoRequest = {
        dueDate: '2026-12-31T23:59:59.000Z',
      };
      const result = TodosMapper.toUpdateDocument(request, existingTodo, now);
      expect(result.due_date).toBe('2026-12-31T23:59:59.000Z');
      expect(result.updated_at).toBe(now);
    });
    it('should clear dueDate when set to null', () => {
      const request: UpdateTodoRequest = {
        dueDate: null,
      };
      const result = TodosMapper.toUpdateDocument(request, existingTodo, now);
      expect(result.due_date).toBeNull();
    });
    it('should update complianceFrameworks field', () => {
      const request: UpdateTodoRequest = {
        complianceFrameworks: ['ISO-27001', 'SOC2', 'GDPR'],
      };
      const result = TodosMapper.toUpdateDocument(request, existingTodo, now);
      expect(result.compliance_framework).toEqual(['ISO-27001', 'SOC2', 'GDPR']);
      expect(result.updated_at).toBe(now);
    });
    it('should normalize complianceFrameworks on update', () => {
      const request: UpdateTodoRequest = {
        complianceFrameworks: ['  PCI-DSS  ', 'ISO-27001', 'PCI-DSS', '  HIPAA  '],
      };
      const result = TodosMapper.toUpdateDocument(request, existingTodo, now);
      expect(result.compliance_framework).toEqual(['PCI-DSS', 'ISO-27001', 'HIPAA']);
    });
    it('should update all analytics fields at once', () => {
      const request: UpdateTodoRequest = {
        priority: 'high',
        severity: 'critical',
        dueDate: '2026-01-01T00:00:00.000Z',
        complianceFrameworks: ['SOC2', 'GDPR'],
      };
      const result = TodosMapper.toUpdateDocument(request, existingTodo, now);
      expect(result.priority).toBe('high');
      expect(result.severity).toBe('critical');
      expect(result.due_date).toBe('2026-01-01T00:00:00.000Z');
      expect(result.compliance_framework).toEqual(['SOC2', 'GDPR']);
      expect(result.updated_at).toBe(now);
    });
  });
  describe('normalizeTags', () => {
    it('should trim and lowercase tags', () => {
      const result = TodosMapper.normalizeTags(['  Tag1  ', 'TAG2', 'tag3']);
      expect(result).toEqual(['tag1', 'tag2', 'tag3']);
    });
    it('should remove duplicates', () => {
      const result = TodosMapper.normalizeTags(['tag1', 'TAG1', 'Tag1', 'tag2']);
      expect(result).toEqual(['tag1', 'tag2']);
    });
    it('should filter out empty strings', () => {
      const result = TodosMapper.normalizeTags(['tag1', '', '   ', 'tag2']);
      expect(result).toEqual(['tag1', 'tag2']);
    });
    it('should return empty array for undefined input', () => {
      const result = TodosMapper.normalizeTags(undefined);
      expect(result).toEqual([]);
    });
    it('should return empty array for empty input', () => {
      const result = TodosMapper.normalizeTags([]);
      expect(result).toEqual([]);
    });
  });
  describe('normalizeComplianceFrameworks', () => {
    it('should trim compliance frameworks', () => {
      const result = TodosMapper.normalizeComplianceFrameworks([
        '  PCI-DSS  ',
        'ISO-27001',
        '  HIPAA  ',
      ]);
      expect(result).toEqual(['PCI-DSS', 'ISO-27001', 'HIPAA']);
    });
    it('should remove duplicates while preserving case', () => {
      const result = TodosMapper.normalizeComplianceFrameworks([
        'PCI-DSS',
        'PCI-DSS',
        'ISO-27001',
        'PCI-DSS',
      ]);
      expect(result).toEqual(['PCI-DSS', 'ISO-27001']);
    });
    it('should filter out empty strings', () => {
      const result = TodosMapper.normalizeComplianceFrameworks(['PCI-DSS', '', '   ', 'HIPAA']);
      expect(result).toEqual(['PCI-DSS', 'HIPAA']);
    });
    it('should return empty array for undefined input', () => {
      const result = TodosMapper.normalizeComplianceFrameworks(undefined);
      expect(result).toEqual([]);
    });
    it('should return empty array for empty input', () => {
      const result = TodosMapper.normalizeComplianceFrameworks([]);
      expect(result).toEqual([]);
    });
    it('should preserve case sensitivity', () => {
      const result = TodosMapper.normalizeComplianceFrameworks(['PCI-DSS', 'pci-dss']);
      expect(result).toEqual(['PCI-DSS', 'pci-dss']);
    });
  });
  describe('toTodoStats', () => {
    it('should map aggregations to TodoStats', () => {
      const aggregations: OpenSearchStatsAggregations = {
        by_status: {
          buckets: [
            { key: 'planned', doc_count: 50 },
            { key: 'done', doc_count: 30 },
            { key: 'error', doc_count: 20 },
          ],
        },
        top_tags: {
          buckets: [
            { key: 'security', doc_count: 40 },
            { key: 'compliance', doc_count: 35 },
          ],
        },
        completed_over_time: {
          buckets: [
            { key: '2024-01-01', key_as_string: '2024-01-01', doc_count: 10 },
            { key: '2024-01-02', key_as_string: '2024-01-02', doc_count: 15 },
          ],
        },
        top_assignees: {
          buckets: [
            { key: 'john.doe', doc_count: 25 },
            { key: 'jane.smith', doc_count: 20 },
          ],
        },
        unassigned: {
          doc_count: 15,
        },
      };
      const result = TodosMapper.toTodoStats(100, aggregations);
      expect(result.total).toBe(100);
      expect(result.byStatus).toEqual({
        planned: 50,
        done: 30,
        error: 20,
      });
      expect(result.topTags).toEqual([
        { tag: 'security', count: 40 },
        { tag: 'compliance', count: 35 },
      ]);
      expect(result.completedOverTime).toEqual([
        { date: '2024-01-01', count: 10 },
        { date: '2024-01-02', count: 15 },
      ]);
      expect(result.topAssignees).toEqual([
        { assignee: 'john.doe', count: 25 },
        { assignee: 'jane.smith', count: 20 },
      ]);
      expect(result.unassignedCount).toBe(15);
    });
    it('should handle empty buckets', () => {
      const aggregations: OpenSearchStatsAggregations = {
        by_status: { buckets: [] },
        top_tags: { buckets: [] },
        completed_over_time: { buckets: [] },
        top_assignees: { buckets: [] },
        unassigned: { doc_count: 0 },
      };
      const result = TodosMapper.toTodoStats(0, aggregations);
      expect(result.total).toBe(0);
      expect(result.byStatus).toEqual({
        planned: 0,
        done: 0,
        error: 0,
      });
      expect(result.topTags).toEqual([]);
      expect(result.completedOverTime).toEqual([]);
      expect(result.topAssignees).toEqual([]);
      expect(result.unassignedCount).toBe(0);
    });
    it('should use key if key_as_string is missing', () => {
      const aggregations: OpenSearchStatsAggregations = {
        by_status: { buckets: [] },
        top_tags: { buckets: [] },
        completed_over_time: {
          buckets: [{ key: '2024-01-01', doc_count: 5 }],
        },
        top_assignees: { buckets: [] },
        unassigned: { doc_count: 0 },
      };
      const result = TodosMapper.toTodoStats(5, aggregations);
      expect(result.completedOverTime).toEqual([{ date: '2024-01-01', count: 5 }]);
    });
  });
  describe('mergeUpdate', () => {
    const existingTodo: Todo = {
      id: 'test-123',
      title: 'Original Title',
      description: 'Original Description',
      status: 'planned',
      tags: ['original'],
      assignee: 'original-user',
      priority: 'medium',
      severity: 'low',
      dueDate: '2025-12-31T23:59:59.000Z',
      complianceFrameworks: ['PCI-DSS'],
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-01T00:00:00.000Z',
      completedAt: null,
    };
    it('should merge updates into existing todo', () => {
      const updateDoc = {
        title: 'Updated Title',
        updated_at: '2024-01-15T10:00:00.000Z',
      };
      const result = TodosMapper.mergeUpdate(existingTodo, updateDoc, 'test-123');
      expect(result.title).toBe('Updated Title');
      expect(result.description).toBe('Original Description');
      expect(result.updatedAt).toBe('2024-01-15T10:00:00.000Z');
      expect(result.createdAt).toBe('2024-01-01T00:00:00.000Z');
    });
    it('should handle completed_at update', () => {
      const updateDoc = {
        status: 'done' as const,
        completed_at: '2024-01-15T10:00:00.000Z',
        updated_at: '2024-01-15T10:00:00.000Z',
      };
      const result = TodosMapper.mergeUpdate(existingTodo, updateDoc, 'test-123');
      expect(result.status).toBe('done');
      expect(result.completedAt).toBe('2024-01-15T10:00:00.000Z');
    });
    it('should handle clearing completed_at', () => {
      const doneTodo: Todo = {
        ...existingTodo,
        status: 'done',
        completedAt: '2024-01-10T00:00:00.000Z',
      };
      const updateDoc = {
        status: 'planned' as const,
        completed_at: null,
        updated_at: '2024-01-15T10:00:00.000Z',
      };
      const result = TodosMapper.mergeUpdate(doneTodo, updateDoc, 'test-123');
      expect(result.status).toBe('planned');
      expect(result.completedAt).toBeNull();
    });
    it('should merge priority update', () => {
      const updateDoc = {
        priority: 'critical' as const,
        updated_at: '2024-01-15T10:00:00.000Z',
      };
      const result = TodosMapper.mergeUpdate(existingTodo, updateDoc, 'test-123');
      expect(result.priority).toBe('critical');
      expect(result.severity).toBe('low'); 
    });
    it('should merge severity update', () => {
      const updateDoc = {
        severity: 'high' as const,
        updated_at: '2024-01-15T10:00:00.000Z',
      };
      const result = TodosMapper.mergeUpdate(existingTodo, updateDoc, 'test-123');
      expect(result.severity).toBe('high');
      expect(result.priority).toBe('medium'); 
    });
    it('should merge dueDate update', () => {
      const updateDoc = {
        due_date: '2026-12-31T23:59:59.000Z',
        updated_at: '2024-01-15T10:00:00.000Z',
      };
      const result = TodosMapper.mergeUpdate(existingTodo, updateDoc, 'test-123');
      expect(result.dueDate).toBe('2026-12-31T23:59:59.000Z');
    });
    it('should clear dueDate when set to null in merge', () => {
      const updateDoc = {
        due_date: null,
        updated_at: '2024-01-15T10:00:00.000Z',
      };
      const result = TodosMapper.mergeUpdate(existingTodo, updateDoc, 'test-123');
      expect(result.dueDate).toBeUndefined();
    });
    it('should merge complianceFrameworks update', () => {
      const updateDoc = {
        compliance_framework: ['ISO-27001', 'SOC2', 'GDPR'],
        updated_at: '2024-01-15T10:00:00.000Z',
      };
      const result = TodosMapper.mergeUpdate(existingTodo, updateDoc, 'test-123');
      expect(result.complianceFrameworks).toEqual(['ISO-27001', 'SOC2', 'GDPR']);
    });
    it('should merge all analytics fields together', () => {
      const updateDoc = {
        priority: 'high' as const,
        severity: 'critical' as const,
        due_date: '2026-01-01T00:00:00.000Z',
        compliance_framework: ['SOC2', 'GDPR'],
        updated_at: '2024-01-15T10:00:00.000Z',
      };
      const result = TodosMapper.mergeUpdate(existingTodo, updateDoc, 'test-123');
      expect(result.priority).toBe('high');
      expect(result.severity).toBe('critical');
      expect(result.dueDate).toBe('2026-01-01T00:00:00.000Z');
      expect(result.complianceFrameworks).toEqual(['SOC2', 'GDPR']);
      expect(result.updatedAt).toBe('2024-01-15T10:00:00.000Z');
    });
  });
});
