import { useState, useCallback } from 'react';
import { i18n } from '@osd/i18n';
import { TodosClient } from '../api/todos.client';
import { NotificationsStart } from '../../../../../src/core/public';

interface UseDeleteTodoOptions {
  client: TodosClient;
  notifications: NotificationsStart;
  onSuccess?: (id: string) => void;
}

interface UseDeleteTodoReturn {
  deleteTodo: (id: string) => Promise<boolean>;
  loading: boolean;
  error: Error | null;
}

export const useDeleteTodo = ({
  client,
  notifications,
  onSuccess,
}: UseDeleteTodoOptions): UseDeleteTodoReturn => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const deleteTodo = useCallback(
    async (id: string): Promise<boolean> => {
      setLoading(true);
      setError(null);

      try {
        const response = await client.delete(id);

        if (response.deleted) {
          notifications.toasts.addSuccess({
            title: i18n.translate('customPlugin.toast.deleted.title', {
              defaultMessage: 'TODO Deleted',
            }),
            text: i18n.translate('customPlugin.toast.deleted.text', {
              defaultMessage: 'Successfully deleted the TODO item',
            }),
          });

          if (onSuccess) {
            onSuccess(id);
          }

          return true;
        }

        return false;
      } catch (err) {
        const errorInstance = err instanceof Error ? err : new Error('Failed to delete TODO');
        setError(errorInstance);

        notifications.toasts.addError(errorInstance, {
          title: i18n.translate('customPlugin.toast.error.deleteFailed', {
            defaultMessage: 'Failed to Delete TODO',
          }),
        });

        return false;
      } finally {
        setLoading(false);
      }
    },
    [client, notifications, onSuccess]
  );

  return {
    deleteTodo,
    loading,
    error,
  };
};
