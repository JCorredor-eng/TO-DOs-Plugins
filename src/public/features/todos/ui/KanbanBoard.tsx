import React, { useCallback } from "react";
import {
  EuiFlexGroup,
  EuiFlexItem,
  EuiLoadingSpinner,
  EuiDragDropContext,
  EuiSpacer,
} from "@elastic/eui";
import { Todo, TodoStatus } from "../../../../common/todo/todo.types";
import { useKanbanBoard } from "../hooks/use_kanban_board";
import { KanbanColumn } from "./components/KanbanColumn";

/**
 * Props for KanbanBoard component
 */
export interface KanbanBoardProps {
  /** All todos to display (filtered by parent) */
  readonly todos: Todo[];
  /** Loading state from parent */
  readonly loading: boolean;
  /** Error state from parent */
  readonly error: Error | null;
  /** Function to update a todo's status */
  readonly onStatusChange: (
    todoId: string,
    status: TodoStatus
  ) => Promise<void>;
  /** Callback when edit is clicked */
  readonly onEdit: (todo: Todo) => void;
  /** Callback when delete is clicked */
  readonly onDelete: (todoId: string) => void;
}

/**
 * KanbanBoard Component
 *
 * Main container for the kanban board view.
 * Presentational component that delegates business logic to useKanbanBoard hook.
 * Following PROJECT RULE #11.
 *
 * Features:
 * - 4-column layout (Planned → In Progress → Done → Error)
 * - Drag-and-drop status transitions
 * - Loading state
 * - Responsive layout
 *
 * @param props - Component props
 * @returns React component rendering the kanban board
 */
export const KanbanBoard: React.FC<KanbanBoardProps> = ({
  todos,
  loading,
  error,
  onStatusChange,
  onEdit,
  onDelete,
}) => {
  // Wrapper to match the expected signature for useKanbanBoard
  const handleStatusUpdate = useCallback(
    async (id: string, data: { status: TodoStatus }) => {
      await onStatusChange(id, data.status);
      return null;
    },
    [onStatusChange]
  );

  const { data, actions } = useKanbanBoard({
    todos,
    loading,
    error,
    updateTodo: handleStatusUpdate,
    onEdit,
    onDelete,
  });

  // Show loading spinner while data is being fetched
  if (loading && todos.length === 0) {
    return (
      <div style={{ textAlign: "center", padding: "60px 0" }}>
        <EuiLoadingSpinner size="xl" />
      </div>
    );
  }

  return (
    <>
      <EuiSpacer size="m" />

      <EuiDragDropContext
        onDragStart={actions.handleDragStart}
        onDragUpdate={actions.handleDragUpdate}
        onDragEnd={actions.handleDragEnd}
      >
        <EuiFlexGroup gutterSize="m" alignItems="flexStart" wrap={false}>
          {data.columns.map((column) => (
            <EuiFlexItem key={column.status} style={{ minWidth: "320px" }}>
              <KanbanColumn
                status={column.status}
                title={column.title}
                color={column.color}
                todos={column.todos}
                droppableId={column.droppableId}
                onEdit={actions.handleEdit}
                onDelete={actions.handleDelete}
              />
            </EuiFlexItem>
          ))}
        </EuiFlexGroup>
      </EuiDragDropContext>
    </>
  );
};
