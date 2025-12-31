import { useState, useCallback } from 'react';
import { CriteriaWithPagination } from '@elastic/eui';
import { Todo, TodoSortField } from '../../../../common/todo/todo.types';
import { PaginationMeta } from '../../../../common/todo/todo.dtos';

interface UseTodosTableParams {
  pagination: PaginationMeta | null;
  sortField: TodoSortField;
  sortDirection: 'asc' | 'desc';
  onDelete: (id: string) => void;
  onTableChange: (page: number, pageSize: number, sortField?: TodoSortField, sortDirection?: 'asc' | 'desc') => void;
}

export const useTodosTable = ({
  pagination,
  sortField,
  sortDirection,
  onDelete,
  onTableChange,
}: UseTodosTableParams) => {
  const [todoToDelete, setTodoToDelete] = useState<Todo | null>(null);

  const handleDeleteClick = useCallback((todo: Todo) => {
    setTodoToDelete(todo);
  }, []);

  const handleDeleteConfirm = useCallback(() => {
    if (todoToDelete) {
      onDelete(todoToDelete.id);
      setTodoToDelete(null);
    }
  }, [todoToDelete, onDelete]);

  const handleDeleteCancel = useCallback(() => {
    setTodoToDelete(null);
  }, []);

  const handleTableChange = useCallback(
    ({ page, sort }: CriteriaWithPagination<Todo>) => {
      const pageIndex = page?.index ?? 0;
      const pageSize = page?.size ?? 20;
      const newSortField = sort?.field as TodoSortField | undefined;
      const newSortDirection = sort?.direction;

      onTableChange(pageIndex + 1, pageSize, newSortField, newSortDirection);
    },
    [onTableChange]
  );

  const paginationConfig = pagination
    ? {
        pageIndex: pagination.page - 1,
        pageSize: pagination.pageSize,
        totalItemCount: pagination.totalItems,
        pageSizeOptions: [10, 20, 50, 100],
      }
    : undefined;

  const sortingConfig = {
    sort: {
      field: sortField,
      direction: sortDirection,
    },
  };

  return {
    data: {
      todoToDelete,
      paginationConfig,
      sortingConfig,
    },
    actions: {
      handleDeleteClick,
      handleDeleteConfirm,
      handleDeleteCancel,
      handleTableChange,
    },
  };
};
