import { useState, useEffect } from 'react';
import { TodosClient } from '../api/todos.client';

interface UseTodoSuggestionsOptions {
  readonly client: TodosClient;
}

interface UseTodoSuggestionsReturn {
  readonly tags: readonly string[];
  readonly complianceFrameworks: readonly string[];
  readonly loading: boolean;
  readonly error: Error | null;
}

export const useTodoSuggestions = (options: UseTodoSuggestionsOptions): UseTodoSuggestionsReturn => {
  const { client } = options;

  const [tags, setTags] = useState<readonly string[]>([]);
  const [complianceFrameworks, setComplianceFrameworks] = useState<readonly string[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchSuggestions = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await client.getSuggestions();
        setTags(response.tags);
        setComplianceFrameworks(response.complianceFrameworks);
      } catch (err) {
        const errorMessage = err instanceof Error ? err : new Error('Failed to fetch suggestions');
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    void fetchSuggestions();
  }, [client]);

  return {
    tags,
    complianceFrameworks,
    loading,
    error,
  };
};
