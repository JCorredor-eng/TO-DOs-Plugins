import { useState, useEffect, useCallback } from 'react';
import { TodosClient } from '../api/todos.client';
import { TodoAnalyticsQueryParams } from '../../../../common/todo/todo.dtos';
import { AnalyticsStats } from '../../../../common/todo/todo.types';
interface UseTodoAnalyticsOptions {
  readonly client: TodosClient;
  readonly filters?: TodoAnalyticsQueryParams;
  readonly autoFetch?: boolean;
}
interface UseTodoAnalyticsReturn {
  readonly data: AnalyticsStats | null;
  readonly loading: boolean;
  readonly error: Error | null;
  readonly refresh: () => Promise<void>;
}
export const useTodoAnalytics = (options: UseTodoAnalyticsOptions): UseTodoAnalyticsReturn => {
  const { client, filters, autoFetch = true } = options;
  const [data, setData] = useState<AnalyticsStats | null>(null);
  const [loading, setLoading] = useState<boolean>(autoFetch);
  const [error, setError] = useState<Error | null>(null);
  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await client.getAnalytics(filters);
      setData(response.analytics);
    } catch (err) {
      const errorMessage = err instanceof Error ? err : new Error('Failed to fetch analytics data');
      setError(errorMessage);
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [client, filters]);
  useEffect(() => {
    if (autoFetch) {
      refresh();
    }
  }, [autoFetch, refresh]);
  return {
    data,
    loading,
    error,
    refresh,
  };
};
