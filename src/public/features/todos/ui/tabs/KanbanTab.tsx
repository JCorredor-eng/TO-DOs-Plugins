import React from 'react';
import { EuiSpacer, EuiCallOut } from '@elastic/eui';
import { FormattedMessage } from '@osd/i18n/react';
import { Todo, TodoStatus } from '../../../../common/todo/todo.types';
import { TodoFilters, FiltersState } from '../TodoFilters';
import { KanbanBoard } from '../KanbanBoard';
import { TodosEmptyState } from '../components/TodosEmptyState';

/**
 * Props for KanbanTab component
 */
export interface KanbanTabProps {
  /** Array of TODO items to display */
  readonly todos: readonly Todo[];
  /** Loading state */
  readonly loading: boolean;
  /** Error state */
  readonly error: Error | null;
  /** Filter values */
  readonly filters: FiltersState;
  /** Callback when create button is clicked */
  readonly onCreateClick: () => void;
  /** Callback when status is changed via drag-and-drop */
  readonly onStatusChange: (todoId: string, status: TodoStatus) => Promise<void>;
  /** Callback when edit is triggered */
  readonly onEdit: (todo: Todo) => void;
  /** Callback when delete is triggered */
  readonly onDelete: (id: string) => Promise<void>;
  /** Callback when filters change */
  readonly onFiltersChange: (filters: FiltersState) => void;
}

/**
 * KanbanTab Component
 *
 * Displays TODO items in a Kanban board format with drag-and-drop status changes.
 * Pure presentational component extracted from TodosPage for better maintainability.
 *
 * Following PROJECT RULE #11:
 * - Purely presentational (props in, JSX out)
 * - No business logic or side effects
 * - All state and actions passed via props
 * - Uses EUI components for consistency
 *
 * @param props - Component props
 * @returns React component rendering the Kanban tab content
 */
export const KanbanTab: React.FC<KanbanTabProps> = ({
  todos,
  loading,
  error,
  filters,
  onCreateClick,
  onStatusChange,
  onEdit,
  onDelete,
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
        <TodosEmptyState iconType="visTable" onCreateClick={onCreateClick} />
      ) : (
        <KanbanBoard
          todos={todos}
          loading={loading}
          error={error}
          onStatusChange={onStatusChange}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      )}
    </>
  );
};
