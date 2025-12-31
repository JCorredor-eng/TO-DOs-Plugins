import { QueryParamsBuilder, createQueryBuilder, buildQueryParams } from '../query-params.builder';

describe('QueryParamsBuilder', () => {
  describe('addIfDefined', () => {
    it('should add string parameter when defined', () => {
      const result = new QueryParamsBuilder()
        .addIfDefined('key', 'value')
        .build();

      expect(result).toEqual({ key: 'value' });
    });

    it('should add number parameter when defined', () => {
      const result = new QueryParamsBuilder()
        .addIfDefined('page', 1)
        .build();

      expect(result).toEqual({ page: 1 });
    });

    it('should not add parameter when undefined', () => {
      const result = new QueryParamsBuilder()
        .addIfDefined('key', undefined)
        .build();

      expect(result).toEqual({});
    });

    it('should not add parameter when null', () => {
      const result = new QueryParamsBuilder()
        .addIfDefined('key', null as any)
        .build();

      expect(result).toEqual({});
    });

    it('should not add parameter when empty string', () => {
      const result = new QueryParamsBuilder()
        .addIfDefined('key', '')
        .build();

      expect(result).toEqual({});
    });

    it('should add zero as valid number', () => {
      const result = new QueryParamsBuilder()
        .addIfDefined('count', 0)
        .build();

      expect(result).toEqual({ count: 0 });
    });
  });

  describe('addArray', () => {
    it('should add array as comma-separated string', () => {
      const result = new QueryParamsBuilder()
        .addArray('tags', ['urgent', 'security', 'compliance'])
        .build();

      expect(result).toEqual({ tags: 'urgent,security,compliance' });
    });

    it('should not add empty array', () => {
      const result = new QueryParamsBuilder()
        .addArray('tags', [])
        .build();

      expect(result).toEqual({});
    });

    it('should not add undefined array', () => {
      const result = new QueryParamsBuilder()
        .addArray('tags', undefined)
        .build();

      expect(result).toEqual({});
    });

    it('should handle single-item array', () => {
      const result = new QueryParamsBuilder()
        .addArray('tags', ['urgent'])
        .build();

      expect(result).toEqual({ tags: 'urgent' });
    });
  });

  describe('addArrayOrString', () => {
    it('should add array as comma-separated string', () => {
      const result = new QueryParamsBuilder()
        .addArrayOrString('status', ['planned', 'done'])
        .build();

      expect(result).toEqual({ status: 'planned,done' });
    });

    it('should add single string as-is', () => {
      const result = new QueryParamsBuilder()
        .addArrayOrString('status', 'planned')
        .build();

      expect(result).toEqual({ status: 'planned' });
    });

    it('should not add undefined value', () => {
      const result = new QueryParamsBuilder()
        .addArrayOrString('status', undefined)
        .build();

      expect(result).toEqual({});
    });

    it('should not add null value', () => {
      const result = new QueryParamsBuilder()
        .addArrayOrString('status', null as any)
        .build();

      expect(result).toEqual({});
    });
  });

  describe('addBoolean', () => {
    it('should add true as string', () => {
      const result = new QueryParamsBuilder()
        .addBoolean('isOverdue', true)
        .build();

      expect(result).toEqual({ isOverdue: 'true' });
    });

    it('should add false as string', () => {
      const result = new QueryParamsBuilder()
        .addBoolean('isOverdue', false)
        .build();

      expect(result).toEqual({ isOverdue: 'false' });
    });

    it('should not add undefined boolean', () => {
      const result = new QueryParamsBuilder()
        .addBoolean('isOverdue', undefined)
        .build();

      expect(result).toEqual({});
    });

    it('should not add null boolean', () => {
      const result = new QueryParamsBuilder()
        .addBoolean('isOverdue', null as any)
        .build();

      expect(result).toEqual({});
    });
  });

  describe('fluent interface', () => {
    it('should chain multiple operations', () => {
      const result = new QueryParamsBuilder()
        .addIfDefined('page', 1)
        .addIfDefined('pageSize', 20)
        .addIfDefined('searchText', 'security')
        .addArray('tags', ['urgent', 'review'])
        .addArrayOrString('status', ['planned', 'done'])
        .addBoolean('isOverdue', true)
        .build();

      expect(result).toEqual({
        page: 1,
        pageSize: 20,
        searchText: 'security',
        tags: 'urgent,review',
        status: 'planned,done',
        isOverdue: 'true',
      });
    });

    it('should skip undefined values in chain', () => {
      const result = new QueryParamsBuilder()
        .addIfDefined('page', 1)
        .addIfDefined('searchText', undefined)
        .addArray('tags', [])
        .addBoolean('isOverdue', undefined)
        .addIfDefined('sortField', 'createdAt')
        .build();

      expect(result).toEqual({
        page: 1,
        sortField: 'createdAt',
      });
    });
  });

  describe('createQueryBuilder', () => {
    it('should create a new builder instance', () => {
      const builder = createQueryBuilder();
      expect(builder).toBeInstanceOf(QueryParamsBuilder);
    });

    it('should create independent builder instances', () => {
      const builder1 = createQueryBuilder().addIfDefined('key1', 'value1');
      const builder2 = createQueryBuilder().addIfDefined('key2', 'value2');

      expect(builder1.build()).toEqual({ key1: 'value1' });
      expect(builder2.build()).toEqual({ key2: 'value2' });
    });
  });

  describe('buildQueryParams', () => {
    it('should build query params using configurator function', () => {
      const result = buildQueryParams((builder) => {
        builder
          .addIfDefined('page', 1)
          .addArray('tags', ['urgent'])
          .addBoolean('isOverdue', true);
      });

      expect(result).toEqual({
        page: 1,
        tags: 'urgent',
        isOverdue: 'true',
      });
    });

    it('should handle empty configurator', () => {
      const result = buildQueryParams(() => {});

      expect(result).toEqual({});
    });

    it('should build complex query params', () => {
      const params = {
        page: 2,
        pageSize: 50,
        searchText: 'vulnerability',
        status: ['planned', 'done'] as string[],
        tags: ['security', 'compliance'],
        priority: 'high' as string,
        isOverdue: true,
      };

      const result = buildQueryParams((builder) => {
        builder
          .addIfDefined('page', params.page)
          .addIfDefined('pageSize', params.pageSize)
          .addIfDefined('searchText', params.searchText)
          .addArrayOrString('status', params.status)
          .addArray('tags', params.tags)
          .addArrayOrString('priority', params.priority)
          .addBoolean('isOverdue', params.isOverdue);
      });

      expect(result).toEqual({
        page: 2,
        pageSize: 50,
        searchText: 'vulnerability',
        status: 'planned,done',
        tags: 'security,compliance',
        priority: 'high',
        isOverdue: 'true',
      });
    });
  });

  describe('real-world scenarios', () => {
    it('should build list todos query params', () => {
      const listParams = {
        page: 1,
        pageSize: 20,
        searchText: 'patch management',
        status: ['planned', 'done'],
        tags: ['security'],
        sortField: 'createdAt',
        sortDirection: 'desc',
        isOverdue: false,
      };

      const result = buildQueryParams((builder) => {
        builder
          .addIfDefined('page', listParams.page)
          .addIfDefined('pageSize', listParams.pageSize)
          .addIfDefined('searchText', listParams.searchText)
          .addArrayOrString('status', listParams.status)
          .addArray('tags', listParams.tags)
          .addIfDefined('sortField', listParams.sortField)
          .addIfDefined('sortDirection', listParams.sortDirection)
          .addBoolean('isOverdue', listParams.isOverdue);
      });

      expect(result).toEqual({
        page: 1,
        pageSize: 20,
        searchText: 'patch management',
        status: 'planned,done',
        tags: 'security',
        sortField: 'createdAt',
        sortDirection: 'desc',
        isOverdue: 'false',
      });
    });

    it('should build stats query params', () => {
      const statsParams = {
        createdAfter: '2024-01-01',
        createdBefore: '2024-12-31',
        timeInterval: 'day',
        topTagsLimit: 10,
      };

      const result = buildQueryParams((builder) => {
        builder
          .addIfDefined('createdAfter', statsParams.createdAfter)
          .addIfDefined('createdBefore', statsParams.createdBefore)
          .addIfDefined('timeInterval', statsParams.timeInterval)
          .addIfDefined('topTagsLimit', statsParams.topTagsLimit);
      });

      expect(result).toEqual({
        createdAfter: '2024-01-01',
        createdBefore: '2024-12-31',
        timeInterval: 'day',
        topTagsLimit: 10,
      });
    });

    it('should build analytics query params', () => {
      const analyticsParams = {
        complianceFramework: 'PCI-DSS',
        overdueOnly: true,
      };

      const result = buildQueryParams((builder) => {
        builder
          .addIfDefined('complianceFramework', analyticsParams.complianceFramework)
          .addBoolean('overdueOnly', analyticsParams.overdueOnly);
      });

      expect(result).toEqual({
        complianceFramework: 'PCI-DSS',
        overdueOnly: 'true',
      });
    });

    it('should handle optional params being undefined', () => {
      const result = buildQueryParams((builder) => {
        builder
          .addIfDefined('page', undefined)
          .addIfDefined('searchText', undefined)
          .addArray('tags', undefined)
          .addBoolean('isOverdue', undefined);
      });

      expect(result).toEqual({});
    });
  });
});
