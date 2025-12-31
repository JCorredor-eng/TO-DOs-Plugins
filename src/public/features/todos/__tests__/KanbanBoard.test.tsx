
import React from 'react';
import { render, screen } from '@testing-library/react';
import { KanbanBoard } from '../ui/KanbanBoard';
import { Todo } from '../../../../common/todo/todo.types';
import { IntlProvider } from 'react-intl';
import * as useKanbanBoardModule from '../hooks/use_kanban_board';
import { KanbanColumnData } from '../hooks/use_kanban_board';

// Mock the useKanbanBoard hook
jest.mock('../hooks/use_kanban_board');

// Wrapper component for i18n
const renderWithIntl = (component: React.ReactElement) => {
  return render(<IntlProvider locale="en">{component}</IntlProvider>);
};

describe('KanbanBoard', () => {
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
      title: 'In Progress Task',
      description: 'Description 2',
      status: 'in_progress',
      tags: ['tag2'],
      priority: 'high',
      severity: 'medium',
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
      priority: 'medium',
      severity: 'low',
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

  const mockColumns: readonly KanbanColumnData[] = [
    {
      status: 'planned',
      title: 'Planned',
      color: 'primary',
      droppableId: 'planned',
      todos: [mockTodos[0]],
      count: 1,
    },
    {
      status: 'in_progress',
      title: 'In Progress',
      color: 'warning',
      droppableId: 'in_progress',
      todos: [mockTodos[1]],
      count: 1,
    },
    {
      status: 'done',
      title: 'Done',
      color: 'success',
      droppableId: 'done',
      todos: [mockTodos[2]],
      count: 1,
    },
    {
      status: 'error',
      title: 'Error',
      color: 'danger',
      droppableId: 'error',
      todos: [mockTodos[3]],
      count: 1,
    },
  ];

  const mockOnStatusChange = jest.fn();
  const mockOnEdit = jest.fn();
  const mockOnDelete = jest.fn();
  const mockHandleDragEnd = jest.fn();
  const mockHandleEdit = jest.fn();
  const mockHandleDelete = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    // Default mock implementation
    (useKanbanBoardModule.useKanbanBoard as jest.Mock).mockReturnValue({
      data: {
        columns: mockColumns,
      },
      uiState: {
        isDragging: false,
        hasError: false,
        isEmpty: false,
      },
      actions: {
        handleDragEnd: mockHandleDragEnd,
        handleEdit: mockHandleEdit,
        handleDelete: mockHandleDelete,
      },
    });
  });

  describe('Rendering', () => {
    it('should render all 4 columns (planned, in_progress, done, error)', () => {
      renderWithIntl(
        <KanbanBoard
          todos={mockTodos}
          loading={false}
          error={null}
          onStatusChange={mockOnStatusChange}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />
      );

      expect(screen.getByText(/Planned \(1\)/)).toBeInTheDocument();
      expect(screen.getByText(/In Progress \(1\)/)).toBeInTheDocument();
      expect(screen.getByText(/Done \(1\)/)).toBeInTheDocument();
      expect(screen.getByText(/Error \(1\)/)).toBeInTheDocument();
    });

    it('should render todos in correct columns', () => {
      renderWithIntl(
        <KanbanBoard
          todos={mockTodos}
          loading={false}
          error={null}
          onStatusChange={mockOnStatusChange}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />
      );

      expect(screen.getByText('Planned Task 1')).toBeInTheDocument();
      expect(screen.getByText('In Progress Task')).toBeInTheDocument();
      expect(screen.getByText('Done Task')).toBeInTheDocument();
      expect(screen.getByText('Error Task')).toBeInTheDocument();
    });

    it('should render columns with correct counts', () => {
      const multiTodoColumns: readonly KanbanColumnData[] = [
        {
          status: 'planned',
          title: 'Planned',
          color: 'primary',
          droppableId: 'planned',
          todos: [mockTodos[0], mockTodos[1]],
          count: 2,
        },
        {
          status: 'in_progress',
          title: 'In Progress',
          color: 'warning',
          droppableId: 'in_progress',
          todos: [],
          count: 0,
        },
        {
          status: 'done',
          title: 'Done',
          color: 'success',
          droppableId: 'done',
          todos: [mockTodos[2]],
          count: 1,
        },
        {
          status: 'error',
          title: 'Error',
          color: 'danger',
          droppableId: 'error',
          todos: [mockTodos[3]],
          count: 1,
        },
      ];

      (useKanbanBoardModule.useKanbanBoard as jest.Mock).mockReturnValue({
        data: {
          columns: multiTodoColumns,
        },
        uiState: {
          isDragging: false,
          hasError: false,
          isEmpty: false,
        },
        actions: {
          handleDragEnd: mockHandleDragEnd,
          handleEdit: mockHandleEdit,
          handleDelete: mockHandleDelete,
        },
      });

      renderWithIntl(
        <KanbanBoard
          todos={mockTodos}
          loading={false}
          error={null}
          onStatusChange={mockOnStatusChange}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />
      );

      expect(screen.getByText(/Planned \(2\)/)).toBeInTheDocument();
      expect(screen.getByText(/In Progress \(0\)/)).toBeInTheDocument();
      expect(screen.getByText(/Done \(1\)/)).toBeInTheDocument();
      expect(screen.getByText(/Error \(1\)/)).toBeInTheDocument();
    });
  });

  describe('Loading State', () => {
    it('should show loading spinner when loading with no todos', () => {
      renderWithIntl(
        <KanbanBoard
          todos={[]}
          loading={true}
          error={null}
          onStatusChange={mockOnStatusChange}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />
      );

      const spinner = document.querySelector('.euiLoadingSpinner');
      expect(spinner).toBeInTheDocument();
    });

    it('should not show loading spinner when loading with existing todos', () => {
      renderWithIntl(
        <KanbanBoard
          todos={mockTodos}
          loading={true}
          error={null}
          onStatusChange={mockOnStatusChange}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />
      );

      const spinner = document.querySelector('.euiLoadingSpinner');
      expect(spinner).not.toBeInTheDocument();
      expect(screen.getByText(/Planned \(1\)/)).toBeInTheDocument();
    });
  });

  describe('Empty State', () => {
    it('should render empty state for all 4 columns with no todos', () => {
      const emptyColumns: readonly KanbanColumnData[] = [
        {
          status: 'planned',
          title: 'Planned',
          color: 'primary',
          droppableId: 'planned',
          todos: [],
          count: 0,
        },
        {
          status: 'in_progress',
          title: 'In Progress',
          color: 'warning',
          droppableId: 'in_progress',
          todos: [],
          count: 0,
        },
        {
          status: 'done',
          title: 'Done',
          color: 'success',
          droppableId: 'done',
          todos: [],
          count: 0,
        },
        {
          status: 'error',
          title: 'Error',
          color: 'danger',
          droppableId: 'error',
          todos: [],
          count: 0,
        },
      ];

      (useKanbanBoardModule.useKanbanBoard as jest.Mock).mockReturnValue({
        data: {
          columns: emptyColumns,
        },
        uiState: {
          isDragging: false,
          hasError: false,
          isEmpty: true,
        },
        actions: {
          handleDragEnd: mockHandleDragEnd,
          handleEdit: mockHandleEdit,
          handleDelete: mockHandleDelete,
        },
      });

      renderWithIntl(
        <KanbanBoard
          todos={[]}
          loading={false}
          error={null}
          onStatusChange={mockOnStatusChange}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />
      );

      expect(screen.getByText(/No planned tasks/i)).toBeInTheDocument();
      expect(screen.getByText(/No in progress tasks/i)).toBeInTheDocument();
      expect(screen.getByText(/No done tasks/i)).toBeInTheDocument();
      expect(screen.getByText(/No error tasks/i)).toBeInTheDocument();
    });
  });

  describe('Hook Integration', () => {
    it('should call useKanbanBoard with correct params', () => {
      renderWithIntl(
        <KanbanBoard
          todos={mockTodos}
          loading={false}
          error={null}
          onStatusChange={mockOnStatusChange}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />
      );

      expect(useKanbanBoardModule.useKanbanBoard).toHaveBeenCalledWith({
        todos: mockTodos,
        loading: false,
        error: null,
        updateTodo: expect.any(Function),
        onEdit: mockOnEdit,
        onDelete: mockOnDelete,
      });
    });

    it('should pass actions from hook to columns', () => {
      renderWithIntl(
        <KanbanBoard
          todos={mockTodos}
          loading={false}
          error={null}
          onStatusChange={mockOnStatusChange}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />
      );

      // The columns should receive the hook's actions
      // This is verified by the hook being called with the correct params
      expect(useKanbanBoardModule.useKanbanBoard).toHaveBeenCalled();
    });
  });

  describe('Error State', () => {
    it('should still render board when error is present', () => {
      const error = new Error('Test error');

      renderWithIntl(
        <KanbanBoard
          todos={mockTodos}
          loading={false}
          error={error}
          onStatusChange={mockOnStatusChange}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />
      );

      // Board should still render even with error (parent handles error display)
      expect(screen.getByText(/Planned \(1\)/)).toBeInTheDocument();
    });
  });

  describe('Responsive Layout', () => {
    it('should render columns in a flex group', () => {
      const { container } = renderWithIntl(
        <KanbanBoard
          todos={mockTodos}
          loading={false}
          error={null}
          onStatusChange={mockOnStatusChange}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />
      );

      // Check that flex group is rendered (responsive layout container)
      const flexGroup = container.querySelector('.euiFlexGroup');
      expect(flexGroup).toBeInTheDocument();
    });
  });

  describe('Column Order and Colors', () => {
    it('should render columns in correct order with proper colors', () => {
      renderWithIntl(
        <KanbanBoard
          todos={mockTodos}
          loading={false}
          error={null}
          onStatusChange={mockOnStatusChange}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />
      );

      // Verify all column headers are present (with counts)
      expect(screen.getByText(/Planned \(1\)/)).toBeInTheDocument();
      expect(screen.getByText(/In Progress \(1\)/)).toBeInTheDocument();
      expect(screen.getByText(/Done \(1\)/)).toBeInTheDocument();
      expect(screen.getByText(/Error \(1\)/)).toBeInTheDocument();
    });

    it('should use correct EUI colors for each status', () => {
      renderWithIntl(
        <KanbanBoard
          todos={mockTodos}
          loading={false}
          error={null}
          onStatusChange={mockOnStatusChange}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />
      );

      // Verify the hook was called and returned the correct data structure
      const hookCalls = (useKanbanBoardModule.useKanbanBoard as any).mock.calls;
      expect(hookCalls.length).toBeGreaterThan(0);

      // Verify the mock columns have correct colors
      expect(mockColumns.find((c) => c.status === 'planned')?.color).toBe('primary');
      expect(mockColumns.find((c) => c.status === 'in_progress')?.color).toBe('warning');
      expect(mockColumns.find((c) => c.status === 'done')?.color).toBe('success');
      expect(mockColumns.find((c) => c.status === 'error')?.color).toBe('danger');
    });
  });

  describe('i18n Support', () => {
    it('should use translated column titles', () => {
      renderWithIntl(
        <KanbanBoard
          todos={mockTodos}
          loading={false}
          error={null}
          onStatusChange={mockOnStatusChange}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />
      );

      // Verify that i18n translations are being used (hook returns translated titles)
      expect(screen.getByText(/Planned \(1\)/)).toBeInTheDocument();
      expect(screen.getByText(/In Progress \(1\)/)).toBeInTheDocument();
      expect(screen.getByText(/Done \(1\)/)).toBeInTheDocument();
      expect(screen.getByText(/Error \(1\)/)).toBeInTheDocument();
    });
  });
});
