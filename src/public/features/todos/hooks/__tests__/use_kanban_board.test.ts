
import { renderHook, act } from '@testing-library/react-hooks';
import { useKanbanBoard, DropResult } from '../use_kanban_board';
import { Todo } from '../../../../../common/todo/todo.types';

describe('useKanbanBoard', () => {
  const mockTodos: Todo[] = [
    {
      id: '1',
      title: 'Planned Task 1',
      description: 'Description 1',
      status: 'planned',
      tags: ['tag1'],
      priority: 'high',
      severity: 'medium',
      complianceFrameworks: [],
      createdAt: '2025-01-01T00:00:00.000Z',
      updatedAt: '2025-01-01T00:00:00.000Z',
      completedAt: null,
    },
    {
      id: '2',
      title: 'Planned Task 2',
      description: 'Description 2',
      status: 'planned',
      tags: ['tag2'],
      priority: 'medium',
      severity: 'low',
      complianceFrameworks: [],
      createdAt: '2025-01-02T00:00:00.000Z',
      updatedAt: '2025-01-02T00:00:00.000Z',
      completedAt: null,
    },
    {
      id: '3',
      title: 'Done Task',
      description: 'Description 3',
      status: 'done',
      tags: ['tag3'],
      priority: 'low',
      severity: 'info',
      complianceFrameworks: [],
      createdAt: '2025-01-03T00:00:00.000Z',
      updatedAt: '2025-01-03T00:00:00.000Z',
      completedAt: '2025-01-03T12:00:00.000Z',
    },
    {
      id: '4',
      title: 'Error Task',
      description: 'Description 4',
      status: 'error',
      tags: ['tag4'],
      priority: 'critical',
      severity: 'critical',
      complianceFrameworks: [],
      createdAt: '2025-01-04T00:00:00.000Z',
      updatedAt: '2025-01-04T00:00:00.000Z',
      completedAt: null,
    },
  ];

  const mockUpdateTodo = jest.fn();
  const mockOnEdit = jest.fn();
  const mockOnDelete = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Data Grouping', () => {
    it('should group todos by all 4 statuses correctly', () => {
      const { result } = renderHook(() =>
        useKanbanBoard({
          todos: mockTodos,
          loading: false,
          error: null,
          updateTodo: mockUpdateTodo,
          onEdit: mockOnEdit,
          onDelete: mockOnDelete,
        })
      );

      // Verify all 4 columns are created
      expect(result.current.data.columns).toHaveLength(4);

      const plannedColumn = result.current.data.columns.find((col) => col.status === 'planned');
      const inProgressColumn = result.current.data.columns.find((col) => col.status === 'in_progress');
      const doneColumn = result.current.data.columns.find((col) => col.status === 'done');
      const errorColumn = result.current.data.columns.find((col) => col.status === 'error');

      // Planned column
      expect(plannedColumn?.todos).toHaveLength(2);
      expect(plannedColumn?.count).toBe(2);
      expect(plannedColumn?.title).toBe('Planned');
      expect(plannedColumn?.color).toBe('primary');

      // In Progress column
      expect(inProgressColumn?.todos).toHaveLength(0);
      expect(inProgressColumn?.count).toBe(0);
      expect(inProgressColumn?.title).toBe('In progress');
      expect(inProgressColumn?.color).toBe('warning');

      // Done column
      expect(doneColumn?.todos).toHaveLength(1);
      expect(doneColumn?.count).toBe(1);
      expect(doneColumn?.title).toBe('Done');
      expect(doneColumn?.color).toBe('success');

      // Error column
      expect(errorColumn?.todos).toHaveLength(1);
      expect(errorColumn?.count).toBe(1);
      expect(errorColumn?.title).toBe('Error');
      expect(errorColumn?.color).toBe('danger');
    });

    it('should handle empty todos array', () => {
      const { result } = renderHook(() =>
        useKanbanBoard({
          todos: [],
          loading: false,
          error: null,
          updateTodo: mockUpdateTodo,
          onEdit: mockOnEdit,
          onDelete: mockOnDelete,
        })
      );

      expect(result.current.uiState.isEmpty).toBe(true);
      expect(result.current.data.columns).toHaveLength(4);

      result.current.data.columns.forEach((col) => {
        expect(col.todos).toHaveLength(0);
        expect(col.count).toBe(0);
      });
    });

    it('should update grouping when todos change', () => {
      const { result, rerender } = renderHook(
        ({ todos }) =>
          useKanbanBoard({
            todos,
            loading: false,
            error: null,
            updateTodo: mockUpdateTodo,
            onEdit: mockOnEdit,
            onDelete: mockOnDelete,
          }),
        { initialProps: { todos: mockTodos } }
      );

      expect(result.current.data.columns[0].count).toBe(2); // planned

      const newTodos = [
        ...mockTodos,
        {
          id: '5',
          title: 'New Planned Task',
          status: 'planned' as const,
          tags: [],
          priority: 'low' as const,
          severity: 'info' as const,
          complianceFrameworks: [],
          createdAt: '2025-01-05T00:00:00.000Z',
          updatedAt: '2025-01-05T00:00:00.000Z',
          completedAt: null,
        },
      ];

      rerender({ todos: newTodos });

      expect(result.current.data.columns[0].count).toBe(3); // planned + new
    });

    it('should correctly group todos with in_progress status', () => {
      const todosWithInProgress: Todo[] = [
        {
          id: '1',
          title: 'In Progress Task 1',
          status: 'in_progress',
          tags: [],
          priority: 'high',
          severity: 'medium',
          complianceFrameworks: [],
          createdAt: '2025-01-01T00:00:00.000Z',
          updatedAt: '2025-01-01T00:00:00.000Z',
          completedAt: null,
        },
        {
          id: '2',
          title: 'In Progress Task 2',
          status: 'in_progress',
          tags: [],
          priority: 'medium',
          severity: 'low',
          complianceFrameworks: [],
          createdAt: '2025-01-02T00:00:00.000Z',
          updatedAt: '2025-01-02T00:00:00.000Z',
          completedAt: null,
        },
      ];

      const { result } = renderHook(() =>
        useKanbanBoard({
          todos: todosWithInProgress,
          loading: false,
          error: null,
          updateTodo: mockUpdateTodo,
          onEdit: mockOnEdit,
          onDelete: mockOnDelete,
        })
      );

      const inProgressColumn = result.current.data.columns.find((col) => col.status === 'in_progress');
      expect(inProgressColumn?.todos).toHaveLength(2);
      expect(inProgressColumn?.count).toBe(2);
      expect(inProgressColumn?.todos[0].id).toBe('1');
      expect(inProgressColumn?.todos[1].id).toBe('2');
    });
  });

  describe('Column Metadata', () => {
    it('should provide correct droppable IDs for all 4 statuses', () => {
      const { result } = renderHook(() =>
        useKanbanBoard({
          todos: mockTodos,
          loading: false,
          error: null,
          updateTodo: mockUpdateTodo,
          onEdit: mockOnEdit,
          onDelete: mockOnDelete,
        })
      );

      const droppableIds = result.current.data.columns.map((col) => col.droppableId);
      expect(droppableIds).toEqual(['planned', 'in_progress', 'done', 'error']);
    });

    it('should maintain column order (planned, in_progress, done, error)', () => {
      const { result } = renderHook(() =>
        useKanbanBoard({
          todos: mockTodos,
          loading: false,
          error: null,
          updateTodo: mockUpdateTodo,
          onEdit: mockOnEdit,
          onDelete: mockOnDelete,
        })
      );

      expect(result.current.data.columns[0].status).toBe('planned');
      expect(result.current.data.columns[1].status).toBe('in_progress');
      expect(result.current.data.columns[2].status).toBe('done');
      expect(result.current.data.columns[3].status).toBe('error');
    });

    it('should assign correct colors to each column', () => {
      const { result } = renderHook(() =>
        useKanbanBoard({
          todos: mockTodos,
          loading: false,
          error: null,
          updateTodo: mockUpdateTodo,
          onEdit: mockOnEdit,
          onDelete: mockOnDelete,
        })
      );

      expect(result.current.data.columns[0].color).toBe('primary'); // planned
      expect(result.current.data.columns[1].color).toBe('warning'); // in_progress
      expect(result.current.data.columns[2].color).toBe('success'); // done
      expect(result.current.data.columns[3].color).toBe('danger'); // error
    });
  });

  describe('Drag End Handler', () => {
    it('should call updateTodo when dragging from planned to in_progress', async () => {
      mockUpdateTodo.mockResolvedValue({ id: '1', status: 'in_progress' });

      const { result } = renderHook(() =>
        useKanbanBoard({
          todos: mockTodos,
          loading: false,
          error: null,
          updateTodo: mockUpdateTodo,
          onEdit: mockOnEdit,
          onDelete: mockOnDelete,
        })
      );

      const dropResult: DropResult = {
        draggableId: '1',
        type: 'DEFAULT',
        source: { droppableId: 'planned', index: 0 },
        destination: { droppableId: 'in_progress', index: 0 },
        reason: 'DROP',
      };

      await act(async () => {
        await result.current.actions.handleDragEnd(dropResult);
      });

      expect(mockUpdateTodo).toHaveBeenCalledWith('1', { status: 'in_progress' });
      expect(mockUpdateTodo).toHaveBeenCalledTimes(1);
    });

    it('should call updateTodo when dragging from planned to done', async () => {
      mockUpdateTodo.mockResolvedValue({ id: '1', status: 'done' });

      const { result } = renderHook(() =>
        useKanbanBoard({
          todos: mockTodos,
          loading: false,
          error: null,
          updateTodo: mockUpdateTodo,
          onEdit: mockOnEdit,
          onDelete: mockOnDelete,
        })
      );

      const dropResult: DropResult = {
        draggableId: '1',
        type: 'DEFAULT',
        source: { droppableId: 'planned', index: 0 },
        destination: { droppableId: 'done', index: 0 },
        reason: 'DROP',
      };

      await act(async () => {
        await result.current.actions.handleDragEnd(dropResult);
      });

      expect(mockUpdateTodo).toHaveBeenCalledWith('1', { status: 'done' });
      expect(mockUpdateTodo).toHaveBeenCalledTimes(1);
    });

    it('should call updateTodo when dragging from planned to error', async () => {
      mockUpdateTodo.mockResolvedValue({ id: '1', status: 'error' });

      const { result } = renderHook(() =>
        useKanbanBoard({
          todos: mockTodos,
          loading: false,
          error: null,
          updateTodo: mockUpdateTodo,
          onEdit: mockOnEdit,
          onDelete: mockOnDelete,
        })
      );

      const dropResult: DropResult = {
        draggableId: '1',
        type: 'DEFAULT',
        source: { droppableId: 'planned', index: 0 },
        destination: { droppableId: 'error', index: 0 },
        reason: 'DROP',
      };

      await act(async () => {
        await result.current.actions.handleDragEnd(dropResult);
      });

      expect(mockUpdateTodo).toHaveBeenCalledWith('1', { status: 'error' });
      expect(mockUpdateTodo).toHaveBeenCalledTimes(1);
    });

    it('should call updateTodo when dragging from in_progress to done', async () => {
      mockUpdateTodo.mockResolvedValue({ id: '2', status: 'done' });

      const todosWithInProgress: Todo[] = [
        {
          ...mockTodos[0],
          id: '2',
          status: 'in_progress',
        },
      ];

      const { result } = renderHook(() =>
        useKanbanBoard({
          todos: todosWithInProgress,
          loading: false,
          error: null,
          updateTodo: mockUpdateTodo,
          onEdit: mockOnEdit,
          onDelete: mockOnDelete,
        })
      );

      const dropResult: DropResult = {
        draggableId: '2',
        type: 'DEFAULT',
        source: { droppableId: 'in_progress', index: 0 },
        destination: { droppableId: 'done', index: 0 },
        reason: 'DROP',
      };

      await act(async () => {
        await result.current.actions.handleDragEnd(dropResult);
      });

      expect(mockUpdateTodo).toHaveBeenCalledWith('2', { status: 'done' });
      expect(mockUpdateTodo).toHaveBeenCalledTimes(1);
    });

    it('should call updateTodo when dragging from in_progress to error', async () => {
      mockUpdateTodo.mockResolvedValue({ id: '2', status: 'error' });

      const todosWithInProgress: Todo[] = [
        {
          ...mockTodos[0],
          id: '2',
          status: 'in_progress',
        },
      ];

      const { result } = renderHook(() =>
        useKanbanBoard({
          todos: todosWithInProgress,
          loading: false,
          error: null,
          updateTodo: mockUpdateTodo,
          onEdit: mockOnEdit,
          onDelete: mockOnDelete,
        })
      );

      const dropResult: DropResult = {
        draggableId: '2',
        type: 'DEFAULT',
        source: { droppableId: 'in_progress', index: 0 },
        destination: { droppableId: 'error', index: 0 },
        reason: 'DROP',
      };

      await act(async () => {
        await result.current.actions.handleDragEnd(dropResult);
      });

      expect(mockUpdateTodo).toHaveBeenCalledWith('2', { status: 'error' });
      expect(mockUpdateTodo).toHaveBeenCalledTimes(1);
    });

    it('should call updateTodo when dragging from error back to planned', async () => {
      mockUpdateTodo.mockResolvedValue({ id: '4', status: 'planned' });

      const { result } = renderHook(() =>
        useKanbanBoard({
          todos: mockTodos,
          loading: false,
          error: null,
          updateTodo: mockUpdateTodo,
          onEdit: mockOnEdit,
          onDelete: mockOnDelete,
        })
      );

      const dropResult: DropResult = {
        draggableId: '4',
        type: 'DEFAULT',
        source: { droppableId: 'error', index: 0 },
        destination: { droppableId: 'planned', index: 0 },
        reason: 'DROP',
      };

      await act(async () => {
        await result.current.actions.handleDragEnd(dropResult);
      });

      expect(mockUpdateTodo).toHaveBeenCalledWith('4', { status: 'planned' });
      expect(mockUpdateTodo).toHaveBeenCalledTimes(1);
    });

    it('should call updateTodo when dragging from done back to in_progress', async () => {
      mockUpdateTodo.mockResolvedValue({ id: '3', status: 'in_progress' });

      const { result } = renderHook(() =>
        useKanbanBoard({
          todos: mockTodos,
          loading: false,
          error: null,
          updateTodo: mockUpdateTodo,
          onEdit: mockOnEdit,
          onDelete: mockOnDelete,
        })
      );

      const dropResult: DropResult = {
        draggableId: '3',
        type: 'DEFAULT',
        source: { droppableId: 'done', index: 0 },
        destination: { droppableId: 'in_progress', index: 0 },
        reason: 'DROP',
      };

      await act(async () => {
        await result.current.actions.handleDragEnd(dropResult);
      });

      expect(mockUpdateTodo).toHaveBeenCalledWith('3', { status: 'in_progress' });
      expect(mockUpdateTodo).toHaveBeenCalledTimes(1);
    });

    it('should not call updateTodo if dropped in same column', async () => {
      const { result } = renderHook(() =>
        useKanbanBoard({
          todos: mockTodos,
          loading: false,
          error: null,
          updateTodo: mockUpdateTodo,
          onEdit: mockOnEdit,
          onDelete: mockOnDelete,
        })
      );

      const dropResult: DropResult = {
        draggableId: '1',
        type: 'DEFAULT',
        source: { droppableId: 'planned', index: 0 },
        destination: { droppableId: 'planned', index: 1 },
        reason: 'DROP',
      };

      await act(async () => {
        await result.current.actions.handleDragEnd(dropResult);
      });

      expect(mockUpdateTodo).not.toHaveBeenCalled();
    });

    it('should not call updateTodo if dropped outside droppable', async () => {
      const { result } = renderHook(() =>
        useKanbanBoard({
          todos: mockTodos,
          loading: false,
          error: null,
          updateTodo: mockUpdateTodo,
          onEdit: mockOnEdit,
          onDelete: mockOnDelete,
        })
      );

      const dropResult: DropResult = {
        draggableId: '1',
        type: 'DEFAULT',
        source: { droppableId: 'planned', index: 0 },
        destination: null,
        reason: 'CANCEL',
      };

      await act(async () => {
        await result.current.actions.handleDragEnd(dropResult);
      });

      expect(mockUpdateTodo).not.toHaveBeenCalled();
    });

    it('should handle error from updateTodo gracefully', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      mockUpdateTodo.mockRejectedValue(new Error('Update failed'));

      const { result } = renderHook(() =>
        useKanbanBoard({
          todos: mockTodos,
          loading: false,
          error: null,
          updateTodo: mockUpdateTodo,
          onEdit: mockOnEdit,
          onDelete: mockOnDelete,
        })
      );

      const dropResult: DropResult = {
        draggableId: '1',
        type: 'DEFAULT',
        source: { droppableId: 'planned', index: 0 },
        destination: { droppableId: 'done', index: 0 },
        reason: 'DROP',
      };

      await act(async () => {
        await result.current.actions.handleDragEnd(dropResult);
      });

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        '[Kanban] Failed to update todo status:',
        expect.any(Error)
      );

      consoleErrorSpy.mockRestore();
    });

    it('should reset isDragging state after drop', async () => {
      mockUpdateTodo.mockResolvedValue({ id: '1', status: 'done' });

      const { result } = renderHook(() =>
        useKanbanBoard({
          todos: mockTodos,
          loading: false,
          error: null,
          updateTodo: mockUpdateTodo,
          onEdit: mockOnEdit,
          onDelete: mockOnDelete,
        })
      );

      const dropResult: DropResult = {
        draggableId: '1',
        type: 'DEFAULT',
        source: { droppableId: 'planned', index: 0 },
        destination: { droppableId: 'done', index: 0 },
        reason: 'DROP',
      };

      await act(async () => {
        await result.current.actions.handleDragEnd(dropResult);
      });

      expect(result.current.uiState.isDragging).toBe(false);
    });
  });

  describe('Action Handlers', () => {
    it('should call onEdit when handleEdit is called', () => {
      const { result } = renderHook(() =>
        useKanbanBoard({
          todos: mockTodos,
          loading: false,
          error: null,
          updateTodo: mockUpdateTodo,
          onEdit: mockOnEdit,
          onDelete: mockOnDelete,
        })
      );

      act(() => {
        result.current.actions.handleEdit(mockTodos[0]);
      });

      expect(mockOnEdit).toHaveBeenCalledWith(mockTodos[0]);
      expect(mockOnEdit).toHaveBeenCalledTimes(1);
    });

    it('should call onDelete when handleDelete is called', () => {
      const { result } = renderHook(() =>
        useKanbanBoard({
          todos: mockTodos,
          loading: false,
          error: null,
          updateTodo: mockUpdateTodo,
          onEdit: mockOnEdit,
          onDelete: mockOnDelete,
        })
      );

      act(() => {
        result.current.actions.handleDelete('1');
      });

      expect(mockOnDelete).toHaveBeenCalledWith('1');
      expect(mockOnDelete).toHaveBeenCalledTimes(1);
    });
  });

  describe('UI State', () => {
    it('should set isEmpty to true when no todos', () => {
      const { result } = renderHook(() =>
        useKanbanBoard({
          todos: [],
          loading: false,
          error: null,
          updateTodo: mockUpdateTodo,
          onEdit: mockOnEdit,
          onDelete: mockOnDelete,
        })
      );

      expect(result.current.uiState.isEmpty).toBe(true);
    });

    it('should set isEmpty to false when todos exist', () => {
      const { result } = renderHook(() =>
        useKanbanBoard({
          todos: mockTodos,
          loading: false,
          error: null,
          updateTodo: mockUpdateTodo,
          onEdit: mockOnEdit,
          onDelete: mockOnDelete,
        })
      );

      expect(result.current.uiState.isEmpty).toBe(false);
    });

    it('should set hasError to true when error exists', () => {
      const { result } = renderHook(() =>
        useKanbanBoard({
          todos: mockTodos,
          loading: false,
          error: new Error('Test error'),
          updateTodo: mockUpdateTodo,
          onEdit: mockOnEdit,
          onDelete: mockOnDelete,
        })
      );

      expect(result.current.uiState.hasError).toBe(true);
    });

    it('should set hasError to false when no error', () => {
      const { result } = renderHook(() =>
        useKanbanBoard({
          todos: mockTodos,
          loading: false,
          error: null,
          updateTodo: mockUpdateTodo,
          onEdit: mockOnEdit,
          onDelete: mockOnDelete,
        })
      );

      expect(result.current.uiState.hasError).toBe(false);
    });
  });
});
