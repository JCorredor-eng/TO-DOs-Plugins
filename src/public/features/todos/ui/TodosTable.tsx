import React, { useState, useCallback } from 'react';
import {
  EuiBasicTable,
  EuiBasicTableColumn,
  EuiBadge,
  EuiButtonIcon,
  EuiFlexGroup,
  EuiFlexItem,
  EuiText,
  EuiConfirmModal,
  EuiSpacer,
  CriteriaWithPagination,
} from '@elastic/eui';
import { FormattedMessage } from '@osd/i18n/react';
import { i18n } from '@osd/i18n';
import { Todo, TODO_STATUS_COLORS, TODO_STATUS_LABELS, TodoSortField } from '../../../../common/todo/todo.types';
import { PaginationMeta } from '../../../../common/todo/todo.dtos';

const formatRelativeTime = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffDays > 0) {
    return i18n.translate('customPlugin.time.daysAgo', {
      defaultMessage: '{count, plural, =1 {# day ago} other {# days ago}}',
      values: { count: diffDays },
    });
  }
  if (diffHours > 0) {
    return i18n.translate('customPlugin.time.hoursAgo', {
      defaultMessage: '{count, plural, =1 {# hour ago} other {# hours ago}}',
      values: { count: diffHours },
    });
  }
  if (diffMins > 0) {
    return i18n.translate('customPlugin.time.minutesAgo', {
      defaultMessage: '{count, plural, =1 {# minute ago} other {# minutes ago}}',
      values: { count: diffMins },
    });
  }
  return i18n.translate('customPlugin.time.justNow', {
    defaultMessage: 'just now',
  });
};

interface TodosTableProps {
  todos: Todo[];
  pagination: PaginationMeta | null;
  loading: boolean;
  sortField?: TodoSortField;
  sortDirection?: 'asc' | 'desc';
  onEdit: (todo: Todo) => void;
  onDelete: (id: string) => void;
  onTableChange: (page: number, pageSize: number, sortField?: TodoSortField, sortDirection?: 'asc' | 'desc') => void;
}

export const TodosTable: React.FC<TodosTableProps> = ({
  todos,
  pagination,
  loading,
  sortField = 'createdAt',
  sortDirection = 'desc',
  onEdit,
  onDelete,
  onTableChange,
}) => {
  const [todoToDelete, setTodoToDelete] = useState<Todo | null>(null);

  const handleDelete = useCallback(() => {
    if (todoToDelete) {
      onDelete(todoToDelete.id);
      setTodoToDelete(null);
    }
  }, [todoToDelete, onDelete]);

  const columns: Array<EuiBasicTableColumn<Todo>> = [
    {
      field: 'title',
      name: i18n.translate('customPlugin.table.column.title', { defaultMessage: 'Title' }),
      sortable: true,
      truncateText: true,
      width: '25%',
      render: (title: string, todo: Todo) => (
        <EuiText size="s">
          <strong>{title}</strong>
          {todo.description && (
            <>
              <br />
              <span style={{ color: '#69707D' }}>{todo.description}</span>
            </>
          )}
        </EuiText>
      ),
    },
    {
      field: 'status',
      name: i18n.translate('customPlugin.table.column.status', { defaultMessage: 'Status' }),
      sortable: true,
      width: '10%',
      render: (status: Todo['status']) => (
        <EuiBadge color={TODO_STATUS_COLORS[status]}>{TODO_STATUS_LABELS[status]}</EuiBadge>
      ),
    },
    {
      field: 'tags',
      name: i18n.translate('customPlugin.table.column.tags', { defaultMessage: 'Tags' }),
      width: '15%',
      render: (tags: readonly string[]) => (
        <EuiFlexGroup gutterSize="xs" wrap responsive={false}>
          {tags.slice(0, 3).map((tag) => (
            <EuiFlexItem grow={false} key={tag}>
              <EuiBadge color="hollow">{tag}</EuiBadge>
            </EuiFlexItem>
          ))}
          {tags.length > 3 && (
            <EuiFlexItem grow={false}>
              <EuiBadge color="hollow">+{tags.length - 3}</EuiBadge>
            </EuiFlexItem>
          )}
        </EuiFlexGroup>
      ),
    },
    {
      field: 'assignee',
      name: i18n.translate('customPlugin.table.column.assignee', { defaultMessage: 'Assignee' }),
      width: '12%',
      truncateText: true,
      render: (assignee?: string) => assignee || '-',
    },
    {
      field: 'createdAt',
      name: i18n.translate('customPlugin.table.column.created', { defaultMessage: 'Created' }),
      sortable: true,
      width: '12%',
      render: (createdAt: string) => (
        <EuiText size="s">{formatRelativeTime(createdAt)}</EuiText>
      ),
    },
    {
      field: 'updatedAt',
      name: i18n.translate('customPlugin.table.column.updated', { defaultMessage: 'Updated' }),
      sortable: true,
      width: '12%',
      render: (updatedAt: string) => (
        <EuiText size="s">{formatRelativeTime(updatedAt)}</EuiText>
      ),
    },
    {
      name: i18n.translate('customPlugin.table.column.actions', { defaultMessage: 'Actions' }),
      width: '100px',
      actions: [
        {
          name: i18n.translate('customPlugin.actions.button.edit', { defaultMessage: 'Edit' }),
          description: i18n.translate('customPlugin.actions.description.edit', {
            defaultMessage: 'Edit this TODO',
          }),
          icon: 'pencil',
          type: 'icon',
          onClick: onEdit,
        },
        {
          name: i18n.translate('customPlugin.actions.button.delete', { defaultMessage: 'Delete' }),
          description: i18n.translate('customPlugin.actions.description.delete', {
            defaultMessage: 'Delete this TODO',
          }),
          icon: 'trash',
          type: 'icon',
          color: 'danger',
          onClick: (todo: Todo) => setTodoToDelete(todo),
        },
      ],
    },
  ];

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

  return (
    <>
      <EuiBasicTable
        items={todos}
        columns={columns}
        pagination={paginationConfig}
        sorting={sortingConfig}
        loading={loading}
        onChange={handleTableChange}
        rowHeader="title"
      />

      {todoToDelete && (
        <EuiConfirmModal
          title={
            <FormattedMessage
              id="customPlugin.modal.delete.title"
              defaultMessage="Delete TODO"
            />
          }
          onCancel={() => setTodoToDelete(null)}
          onConfirm={handleDelete}
          cancelButtonText={i18n.translate('customPlugin.modal.delete.cancel', {
            defaultMessage: 'Cancel',
          })}
          confirmButtonText={i18n.translate('customPlugin.modal.delete.confirm', {
            defaultMessage: 'Delete',
          })}
          buttonColor="danger"
          defaultFocusedButton="confirm"
        >
          <p>
            <FormattedMessage
              id="customPlugin.modal.delete.message"
              defaultMessage="Are you sure you want to delete {title}?"
              values={{ title: <strong>{todoToDelete.title}</strong> }}
            />
          </p>
          <p>
            <FormattedMessage
              id="customPlugin.modal.delete.warning"
              defaultMessage="This action cannot be undone."
            />
          </p>
        </EuiConfirmModal>
      )}
    </>
  );
};
