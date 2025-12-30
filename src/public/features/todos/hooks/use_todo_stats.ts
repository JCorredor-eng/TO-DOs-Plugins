import { useState, useEffect, useCallback } from 'react';
import { TodosClient } from '../api/todos.client';
import { TodoStatsQueryParams } from '../../../common/todo/todo.dtos';
import { TodoStats } from '../../../common/todo/todo.types';
interface UseTodoStatsOptions {
  client: TodosClient;
  params?: TodoStatsQueryParams;
  autoFetch?: boolean;
}
interface UseTodoStatsReturn {
  stats: TodoStats | null;
  loading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
}
export const useTodoStats = ({
  client,
  params,
  autoFetch = true,
}: UseTodoStatsOptions): UseTodoStatsReturn => {
  const [stats, setStats] = useState<TodoStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const fetchStats = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await client.getStats(params);
      setStats(response.stats as TodoStats);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch TODO statistics'));
      setStats(null);
    } finally {
      setLoading(false);
    }
  }, [client, params]);
  useEffect(() => {
    if (autoFetch) {
      fetchStats();
    }
  }, [fetchStats, autoFetch]);
  return {
    stats,
    loading,
    error,
    refresh: fetchStats,
  };
};
