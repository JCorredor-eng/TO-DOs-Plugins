import { useState, useCallback } from 'react';
import { i18n } from '@osd/i18n';
import { TodosClient } from '../api/todos.client';
import { CreateTodoRequest } from '../../../common/todo/todo.dtos';
import { Todo } from '../../../common/todo/todo.types';
import { NotificationsStart } from '../../../../../src/core/public';

interface UseCreateTodoOptions {
  client: TodosClient;
  notifications: NotificationsStart;
  onSuccess?: (todo: Todo) => void;
}

interface UseCreateTodoReturn {
  createTodo: (request: CreateTodoRequest) => Promise<Todo | null>;
  loading: boolean;
  error: Error | null;
}

export const useCreateTodo = ({
  client,
  notifications,
  onSuccess,
}: UseCreateTodoOptions): UseCreateTodoReturn => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const createTodo = useCallback(
    async (request: CreateTodoRequest): Promise<Todo | null> => {
      setLoading(true);
      setError(null);

      try {
        const response = await client.create(request);
        const todo = response.todo as Todo;

        notifications.toasts.addSuccess({
          title: i18n.translate('customPlugin.toast.created.title', {
            defaultMessage: 'TODO Created',
          }),
          text: i18n.translate('customPlugin.toast.created.text', {
            defaultMessage: 'Successfully created "{title}"',
            values: { title: todo.title },
          }),
        });

        if (onSuccess) {
          onSuccess(todo);
        }

        return todo;
      } catch (err) {
        const errorInstance = err instanceof Error ? err : new Error('Failed to create TODO');
        setError(errorInstance);

        notifications.toasts.addError(errorInstance, {
          title: i18n.translate('customPlugin.toast.error.createFailed', {
            defaultMessage: 'Failed to Create TODO',
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
    createTodo,
    loading,
    error,
  };
};
