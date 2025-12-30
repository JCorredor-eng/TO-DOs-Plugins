import { useState, useCallback } from 'react';
import { i18n } from '@osd/i18n';
import { TodosClient } from '../api/todos.client';
import { UpdateTodoRequest } from '../../../common/todo/todo.dtos';
import { Todo } from '../../../common/todo/todo.types';
import { NotificationsStart } from '../../../../../src/core/public';

interface UseUpdateTodoOptions {
  client: TodosClient;
  notifications: NotificationsStart;
  onSuccess?: (todo: Todo) => void;
}

interface UseUpdateTodoReturn {
  updateTodo: (id: string, request: UpdateTodoRequest) => Promise<Todo | null>;
  loading: boolean;
  error: Error | null;
}

export const useUpdateTodo = ({
  client,
  notifications,
  onSuccess,
}: UseUpdateTodoOptions): UseUpdateTodoReturn => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const updateTodo = useCallback(
    async (id: string, request: UpdateTodoRequest): Promise<Todo | null> => {
      setLoading(true);
      setError(null);

      try {
        const response = await client.update(id, request);
        const todo = response.todo as Todo;

        notifications.toasts.addSuccess({
          title: i18n.translate('customPlugin.toast.updated.title', {
            defaultMessage: 'TODO Updated',
          }),
          text: i18n.translate('customPlugin.toast.updated.text', {
            defaultMessage: 'Successfully updated "{title}"',
            values: { title: todo.title },
          }),
        });

        if (onSuccess) {
          onSuccess(todo);
        }

        return todo;
      } catch (err) {
        const errorInstance = err instanceof Error ? err : new Error('Failed to update TODO');
        setError(errorInstance);

        notifications.toasts.addError(errorInstance, {
          title: i18n.translate('customPlugin.toast.error.updateFailed', {
            defaultMessage: 'Failed to Update TODO',
          }),
        });

        return null;
      } finally {
        setLoading(false);
      }
    },
    [client, notifications, onSuccess]
  );

  return {
    updateTodo,
    loading,
    error,
  };
};
