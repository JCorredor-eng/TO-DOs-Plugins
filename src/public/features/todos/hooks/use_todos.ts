import { useState, useEffect, useCallback } from 'react';
import { TodosClient } from '../api/todos.client';
import { ListTodosQueryParams, ListTodosResponse } from '../../../common/todo/todo.dtos';
import { Todo } from '../../../common/todo/todo.types';
interface UseTodosOptions {
  client: TodosClient;
  initialParams?: ListTodosQueryParams;
  autoFetch?: boolean;
}
interface UseTodosReturn {
  todos: Todo[];
  pagination: ListTodosResponse['pagination'] | null;
  loading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
  setParams: (params: ListTodosQueryParams) => void;
  params: ListTodosQueryParams;
}
export const useTodos = ({
  client,
  initialParams = {},
  autoFetch = true,
}: UseTodosOptions): UseTodosReturn => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [pagination, setPagination] = useState<ListTodosResponse['pagination'] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [params, setParams] = useState<ListTodosQueryParams>(initialParams);
  useEffect(() => {
    setParams(initialParams);
  }, [initialParams]);
  const fetchTodos = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await client.list(params);
      setTodos(response.todos as Todo[]);
      setPagination(response.pagination);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch TODOs'));
      setTodos([]);
      setPagination(null);
    } finally {
      setLoading(false);
    }
  }, [client, params]);
  useEffect(() => {
    if (autoFetch) {
      fetchTodos();
    }
  }, [fetchTodos, autoFetch]);
  return {
    todos,
    pagination,
    loading,
    error,
    refresh: fetchTodos,
    setParams,
    params,
  };
};
