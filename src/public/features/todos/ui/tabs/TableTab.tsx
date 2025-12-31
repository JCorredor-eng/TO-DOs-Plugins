import React from 'react';
import { EuiSpacer, EuiCallOut } from '@elastic/eui';
import { FormattedMessage } from '@osd/i18n/react';
import { Todo, PaginationData } from '../../../../common/todo/todo.types';
import { TodoFilters, FiltersState } from '../TodoFilters';
import { TodosTable } from '../TodosTable';
import { TodosEmptyState } from '../components/TodosEmptyState';

/**
 * Props for TableTab component
 */
export interface TableTabProps {
  /** Array of TODO items to display */
  readonly todos: readonly Todo[];
  /** Pagination metadata */
  readonly pagination: PaginationData | null;
  /** Loading state */
  readonly loading: boolean;
  /** Error state */
  readonly error: Error | null;
  /** Current sort field */
  readonly sortField: string;
  /** Current sort direction */
  readonly sortDirection: 'asc' | 'desc';
  /** Filter values */
  readonly filters: FiltersState;
  /** Callback when create button is clicked */
  readonly onCreateClick: () => void;
  /** Callback when edit is triggered */
  readonly onEdit: (todo: Todo) => void;
  /** Callback when delete is triggered */
  readonly onDelete: (id: string) => Promise<void>;
  /** Callback when table state changes (pagination, sort) */
  readonly onTableChange: (criteria: any) => void;
  /** Callback when filters change */
  readonly onFiltersChange: (filters: FiltersState) => void;
}

/**
 * TableTab Component
 *
 * Displays TODO items in a table format with filters and pagination.
 * Pure presentational component extracted from TodosPage for better maintainability.
 *
 * Following PROJECT RULE #11:
 * - Purely presentational (props in, JSX out)
 * - No business logic or side effects
 * - All state and actions passed via props
 * - Uses EUI components for consistency
 *
 * @param props - Component props
 * @returns React component rendering the table tab content
 */
export const TableTab: React.FC<TableTabProps> = ({
  todos,
  pagination,
  loading,
  error,
  sortField,
  sortDirection,
  filters,
  onCreateClick,
  onEdit,
  onDelete,
  onTableChange,
  onFiltersChange,
}) => {
  return (
    <>
      <EuiSpacer size="m" />
      <TodoFilters
        searchText={filters.searchText}
        selectedStatuses={filters.selectedStatuses}
        selectedTags={filters.selectedTags}
        selectedPriorities={filters.selectedPriorities}
        selectedSeverities={filters.selectedSeverities}
        showOverdueOnly={filters.showOverdueOnly}
        dateFilters={filters.dateFilters}
        onFiltersChange={onFiltersChange}
      />
      {error ? (
        <EuiCallOut
          title={
            <FormattedMessage
              id="customPlugin.error.loadingTodos"
              defaultMessage="Error Loading TODOs"
            />
          }
          color="danger"
          iconType="alert"
        >
          <p>{error.message}</p>
        </EuiCallOut>
      ) : todos.length === 0 && !loading ? (
        <TodosEmptyState iconType="document" onCreateClick={onCreateClick} />
      ) : (
        <TodosTable
          todos={todos}
          pagination={pagination}
          loading={loading}
          sortField={sortField}
          sortDirection={sortDirection}
          onEdit={onEdit}
          onDelete={onDelete}
          onTableChange={onTableChange}
        />
      )}
    </>
  );
};
