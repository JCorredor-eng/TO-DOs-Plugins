
import { useMemo, useCallback, useState } from 'react';
import { i18n } from '@osd/i18n';
import {
  Todo,
  TodoStatus,
  TODO_STATUS_VALUES,
  TODO_STATUS_COLORS,
} from '../../../../common/todo/todo.types';

/**
 * Represents a single kanban column with its metadata and todos
 */
export interface KanbanColumnData {
  /** Status value for this column */
  readonly status: TodoStatus;
  /** Display title for the column header */
  readonly title: string;
  /** EUI color for visual accent */
  readonly color: string;
  /** Unique ID for drag-drop library */
  readonly droppableId: string;
  /** Todos to display in this column */
  readonly todos: readonly Todo[];
  /** Count of todos in this column */
  readonly count: number;
}

/**
 * Drop result from EUI drag-drop context
 */
export interface DropResult {
  draggableId: string;
  type: string;
  source: {
    index: number;
    droppableId: string;
  };
  destination: {
    index: number;
    droppableId: string;
  } | null;
  reason: string;
}

/**
 * Parameters for useKanbanBoard hook
 */
export interface UseKanbanBoardOptions {
  /** All todos to display (filtered by parent) */
  readonly todos: Todo[];
  /** Loading state from parent */
  readonly loading: boolean;
  /** Error state from parent */
  readonly error: Error | null;
  /** Function to update a todo's status */
  readonly updateTodo: (id: string, data: { status: TodoStatus }) => Promise<Todo | null>;
  /** Callback when edit is clicked */
  readonly onEdit: (todo: Todo) => void;
  /** Callback when delete is clicked */
  readonly onDelete: (todoId: string) => void;
}

/**
 * Return type for useKanbanBoard hook
 */
export interface UseKanbanBoardReturn {
  /** Pre-computed data for UI */
  readonly data: {
    readonly columns: readonly KanbanColumnData[];
  };
  /** UI state flags */
  readonly uiState: {
    readonly isDragging: boolean;
    readonly hasError: boolean;
    readonly isEmpty: boolean;
  };
  /** User action handlers */
  readonly actions: {
    readonly handleDragStart: () => void;
    readonly handleDragUpdate: () => void;
    readonly handleDragEnd: (result: DropResult) => Promise<void>;
    readonly handleEdit: (todo: Todo) => void;
    readonly handleDelete: (todoId: string) => void;
  };
}

/**
 * Custom hook for kanban board business logic
 *
 * Following PROJECT RULE #11:
 * - Encapsulates all business logic (grouping, drag-drop handling)
 * - Returns UI-friendly contract: { data, uiState, actions }
 * - Component remains purely presentational
 *
 * @param options - Hook configuration options
 * @returns Kanban board data, state, and actions
 */
export const useKanbanBoard = ({
  todos,
  loading,
  error,
  updateTodo,
  onEdit,
  onDelete,
}: UseKanbanBoardOptions): UseKanbanBoardReturn => {
  // Track drag state for UI feedback
  const [isDragging, setIsDragging] = useState(false);

  /**
   * Group todos by status
   * Memoized to prevent unnecessary re-computation
   */
  const groupedTodos = useMemo(() => {
    const groups: Record<TodoStatus, Todo[]> = {
      planned: [],
      in_progress: [],
      done: [],
      error: [],
    };

    todos.forEach((todo) => {
      if (groups[todo.status]) {
        groups[todo.status].push(todo);
      }
    });

    return groups;
  }, [todos]);

  /**
   * Calculate column metadata
   * Memoized to prevent unnecessary re-computation
   */
  const columns = useMemo((): readonly KanbanColumnData[] => {
    return TODO_STATUS_VALUES.map((status) => ({
      status,
      title: i18n.translate(`customPlugin.status.${status}`, {
        defaultMessage: status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' '),
      }),
      color: TODO_STATUS_COLORS[status],
      droppableId: status,
      todos: groupedTodos[status],
      count: groupedTodos[status].length,
    }));
  }, [groupedTodos]);

  /**
   * Handle drag start event
   * Sets dragging state for UI feedback
   */
  const handleDragStart = useCallback(() => {
    setIsDragging(true);
  }, []);

  /**
   * Handle drag update event
   * Can be used for additional UI feedback during drag
   */
  const handleDragUpdate = useCallback(() => {
    // Optional: Add visual feedback during drag
  }, []);

  /**
   * Handle drag end event from EuiDragDropContext
   * Validates drop target and updates todo status
   */
  const handleDragEnd = useCallback(
    async (result: DropResult) => {
      setIsDragging(false);

      // Dropped outside a droppable area
      if (!result.destination) {
        return;
      }

      const sourceStatus = result.source.droppableId as TodoStatus;
      const destStatus = result.destination.droppableId as TodoStatus;

      // Dropped in same column, no status change
      if (sourceStatus === destStatus) {
        return;
      }

      const todoId = result.draggableId;

      try {
        // Call API to update status
        // Note: updateTodo hook already handles:
        // - Loading state
        // - Success toast notification
        // - Refresh callback (refetches todos, stats, analytics)
        await updateTodo(todoId, { status: destStatus });
      } catch (err) {
        // Error already handled by updateTodo hook (shows error toast)
        console.error('Failed to update todo status:', err);
      }
    },
    [updateTodo]
  );

  /**
   * Handle edit action
   * Delegates to parent-provided callback
   */
  const handleEdit = useCallback(
    (todo: Todo) => {
      onEdit(todo);
    },
    [onEdit]
  );

  /**
   * Handle delete action
   * Delegates to parent-provided callback
   */
  const handleDelete = useCallback(
    (todoId: string) => {
      onDelete(todoId);
    },
    [onDelete]
  );

  // Calculate UI state flags
  const isEmpty = useMemo(() => todos.length === 0, [todos.length]);
  const hasError = useMemo(() => error !== null, [error]);

  return {
    data: {
      columns,
    },
    uiState: {
      isDragging,
      hasError,
      isEmpty,
    },
    actions: {
      handleDragStart,
      handleDragUpdate,
      handleDragEnd,
      handleEdit,
      handleDelete,
    },
  };
};
