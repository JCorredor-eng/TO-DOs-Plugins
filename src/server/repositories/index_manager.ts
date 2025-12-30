import { Logger } from '../../../../src/core/server';
import {
  DEFAULT_INDEX_NAME,
  TODO_INDEX_MAPPING,
  TODO_INDEX_SETTINGS,
} from '../../common';
import { IndexError } from '../errors';
export interface OpenSearchClient {
  indices: {
    exists: (params: { index: string }) => Promise<{ body: boolean }>;
    create: (params: {
      index: string;
      body: {
        settings?: Record<string, unknown>;
        mappings?: Record<string, unknown>;
      };
    }) => Promise<unknown>;
    delete: (params: { index: string }) => Promise<unknown>;
    putMapping: (params: {
      index: string;
      body: Record<string, unknown>;
    }) => Promise<unknown>;
  };
  updateByQuery?: (params: {
    index: string;
    body: {
      query?: Record<string, unknown>;
      script?: {
        source: string;
        lang: string;
      };
    };
    refresh?: boolean | 'wait_for';
    conflicts?: 'abort' | 'proceed';
  }) => Promise<{
    body: {
      updated?: number;
      failures?: unknown[];
      total?: number;
    };
  }>;
}
export class IndexManager {
  private readonly indexName: string;
  private readonly logger: Logger;
  private indexCreated: boolean = false;
  constructor(logger: Logger, indexName: string = DEFAULT_INDEX_NAME) {
    this.logger = logger;
    this.indexName = indexName;
  }
  getIndexName(): string {
    return this.indexName;
  }
  async ensureIndex(client: OpenSearchClient): Promise<void> {
    if (this.indexCreated) {
      return;
    }
    try {
      const exists = await client.indices.exists({
        index: this.indexName,
      });
      if (exists.body) {
        this.logger.debug(`Index '${this.indexName}' already exists`);
        this.indexCreated = true;
        return;
      }
      this.logger.info(`Creating index '${this.indexName}'...`);
      await client.indices.create({
        index: this.indexName,
        body: {
          settings: TODO_INDEX_SETTINGS,
          mappings: TODO_INDEX_MAPPING,
        },
      });
      this.logger.info(`Index '${this.indexName}' created successfully`);
      this.indexCreated = true;
    } catch (error) {
      if (isResourceAlreadyExistsError(error)) {
        this.logger.debug(`Index '${this.indexName}' was created by another process`);
        this.indexCreated = true;
        return;
      }
      this.logger.error(`Failed to ensure index '${this.indexName}'`, error);
      throw new IndexError(`Failed to create index '${this.indexName}'`, {
        originalError: error instanceof Error ? error.message : String(error),
      });
    }
  }
  async migrateExistingDocuments(client: OpenSearchClient): Promise<{
    updated: number;
    errors: number;
    total: number;
  }> {
    if (!client.updateByQuery) {
      this.logger.warn('updateByQuery not available on client, skipping migration');
      return { updated: 0, errors: 0, total: 0 };
    }
    try {
      this.logger.info(`Starting migration for existing documents in '${this.indexName}'...`);
      const result = await client.updateByQuery({
        index: this.indexName,
        body: {
          query: {
            bool: {
              should: [
                { bool: { must_not: { exists: { field: 'priority' } } } },
                { bool: { must_not: { exists: { field: 'severity' } } } },
                { bool: { must_not: { exists: { field: 'compliance_framework' } } } },
              ],
              minimum_should_match: 1,
            },
          },
          script: {
            source: `
              if (!ctx._source.containsKey('priority')) {
                ctx._source.priority = 'medium';
              }
              if (!ctx._source.containsKey('severity')) {
                ctx._source.severity = 'low';
              }
              if (!ctx._source.containsKey('due_date')) {
                ctx._source.due_date = null;
              }
              if (!ctx._source.containsKey('compliance_framework')) {
                ctx._source.compliance_framework = [];
              }
            `,
            lang: 'painless',
          },
        },
        refresh: true,
        conflicts: 'proceed',
      });
      const updated = result.body.updated || 0;
      const errors = result.body.failures?.length || 0;
      const total = result.body.total || 0;
      this.logger.info(
        `Migration completed: ${updated} documents updated, ${errors} errors, ${total} total processed`
      );
      return { updated, errors, total };
    } catch (error) {
      this.logger.error(`Migration failed for index '${this.indexName}'`, error);
      throw new IndexError(`Failed to migrate existing documents in '${this.indexName}'`, {
        originalError: error instanceof Error ? error.message : String(error),
      });
    }
  }
  async indexExists(client: OpenSearchClient): Promise<boolean> {
    try {
      const result = await client.indices.exists({
        index: this.indexName,
      });
      return result.body;
    } catch (error) {
      this.logger.error(`Failed to check index existence`, error);
      throw new IndexError(`Failed to check if index '${this.indexName}' exists`, {
        originalError: error instanceof Error ? error.message : String(error),
      });
    }
  }
  async deleteIndex(client: OpenSearchClient): Promise<void> {
    try {
      const exists = await client.indices.exists({
        index: this.indexName,
      });
      if (!exists.body) {
        this.logger.debug(`Index '${this.indexName}' does not exist, nothing to delete`);
        this.indexCreated = false;
        return;
      }
      await client.indices.delete({
        index: this.indexName,
      });
      this.logger.info(`Index '${this.indexName}' deleted successfully`);
      this.indexCreated = false;
    } catch (error) {
      this.logger.error(`Failed to delete index '${this.indexName}'`, error);
      throw new IndexError(`Failed to delete index '${this.indexName}'`, {
        originalError: error instanceof Error ? error.message : String(error),
      });
    }
  }
  resetState(): void {
    this.indexCreated = false;
  }
}
function isResourceAlreadyExistsError(error: unknown): boolean {
  if (!error || typeof error !== 'object') {
    return false;
  }
  const errorObj = error as {
    body?: {
      error?: {
        type?: string;
      };
    };
    message?: string;
  };
  if (errorObj.body?.error?.type === 'resource_already_exists_exception') {
    return true;
  }
  if (errorObj.message?.includes('resource_already_exists')) {
    return true;
  }
  return false;
}
