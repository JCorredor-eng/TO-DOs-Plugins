
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { KanbanCard } from '../ui/components/KanbanCard';
import { Todo } from '../../../../common/todo/todo.types';
import { IntlProvider } from 'react-intl';

// Wrapper component for i18n
const renderWithIntl = (component: React.ReactElement) => {
  return render(<IntlProvider locale="en">{component}</IntlProvider>);
};

describe('KanbanCard', () => {
  const mockTodo: Todo = {
    id: '1',
    title: 'Test TODO Title',
    description: 'Test TODO description with some details',
    status: 'planned',
    tags: ['tag1', 'tag2', 'tag3'],
    priority: 'high',
    severity: 'critical',
    assignee: 'john.doe',
    dueDate: '2025-12-31',
    complianceFrameworks: ['PCI-DSS'],
    createdAt: '2025-01-01T00:00:00.000Z',
    updatedAt: '2025-01-10T00:00:00.000Z',
    completedAt: null,
  };

  const mockOnEdit = jest.fn();
  const mockOnDelete = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render todo title', () => {
      renderWithIntl(
        <KanbanCard
          todo={mockTodo}
          index={0}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />
      );

      expect(screen.getByText('Test TODO Title')).toBeInTheDocument();
    });

    it('should render todo description', () => {
      renderWithIntl(
        <KanbanCard
          todo={mockTodo}
          index={0}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />
      );

      expect(screen.getByText('Test TODO description with some details')).toBeInTheDocument();
    });

    it('should not render description if not provided', () => {
      const todoWithoutDescription = { ...mockTodo, description: undefined };

      renderWithIntl(
        <KanbanCard
          todo={todoWithoutDescription}
          index={0}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />
      );

      expect(screen.queryByText(/description/i)).not.toBeInTheDocument();
    });
  });

  describe('Badges', () => {
    it('should render priority badge with correct label', () => {
      renderWithIntl(
        <KanbanCard
          todo={mockTodo}
          index={0}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />
      );

      expect(screen.getByText('High')).toBeInTheDocument();
    });

    it('should render severity badge with correct label', () => {
      renderWithIntl(
        <KanbanCard
          todo={mockTodo}
          index={0}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />
      );

      expect(screen.getByText('Critical')).toBeInTheDocument();
    });

    it('should render all priority levels correctly', () => {
      const priorities: Array<{ priority: 'low' | 'medium' | 'high' | 'critical'; label: string }> = [
        { priority: 'low', label: 'Low' },
        { priority: 'medium', label: 'Medium' },
        { priority: 'high', label: 'High' },
        { priority: 'critical', label: 'Critical' },
      ];

      priorities.forEach(({ priority, label }) => {
        const { unmount } = renderWithIntl(
          <KanbanCard
            todo={{ ...mockTodo, priority, severity: 'info' }}
            index={0}
            onEdit={mockOnEdit}
            onDelete={mockOnDelete}
          />
        );

        expect(screen.getByText(label)).toBeInTheDocument();
        unmount();
      });
    });
  });

  describe('Tags', () => {
    it('should render first 3 tags', () => {
      renderWithIntl(
        <KanbanCard
          todo={mockTodo}
          index={0}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />
      );

      expect(screen.getByText('tag1')).toBeInTheDocument();
      expect(screen.getByText('tag2')).toBeInTheDocument();
      expect(screen.getByText('tag3')).toBeInTheDocument();
    });

    it('should show "+N" indicator for additional tags', () => {
      const todoWithManyTags = {
        ...mockTodo,
        tags: ['tag1', 'tag2', 'tag3', 'tag4', 'tag5'],
      };

      renderWithIntl(
        <KanbanCard
          todo={todoWithManyTags}
          index={0}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />
      );

      expect(screen.getByText('+2')).toBeInTheDocument();
    });

    it('should not show "+N" indicator if 3 or fewer tags', () => {
      const todoWithFewTags = {
        ...mockTodo,
        tags: ['tag1', 'tag2'],
      };

      renderWithIntl(
        <KanbanCard
          todo={todoWithFewTags}
          index={0}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />
      );

      expect(screen.queryByText(/^\+/)).not.toBeInTheDocument();
    });

    it('should handle empty tags array', () => {
      const todoWithNoTags = { ...mockTodo, tags: [] };

      renderWithIntl(
        <KanbanCard
          todo={todoWithNoTags}
          index={0}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />
      );

      expect(screen.queryByText('tag1')).not.toBeInTheDocument();
    });
  });

  describe('Assignee', () => {
    it('should render assignee when provided', () => {
      renderWithIntl(
        <KanbanCard
          todo={mockTodo}
          index={0}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />
      );

      expect(screen.getByText('john.doe')).toBeInTheDocument();
    });

    it('should not render assignee section if not provided', () => {
      const todoWithoutAssignee = { ...mockTodo, assignee: undefined };

      renderWithIntl(
        <KanbanCard
          todo={todoWithoutAssignee}
          index={0}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />
      );

      expect(screen.queryByText('john.doe')).not.toBeInTheDocument();
    });
  });

  describe('Due Date', () => {
    it('should render due date when provided', () => {
      renderWithIntl(
        <KanbanCard
          todo={mockTodo}
          index={0}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />
      );

      expect(screen.getByText(/Dec 31, 2025/)).toBeInTheDocument();
    });

    it('should not render due date section if not provided', () => {
      const todoWithoutDueDate = { ...mockTodo, dueDate: undefined };

      renderWithIntl(
        <KanbanCard
          todo={todoWithoutDueDate}
          index={0}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />
      );

      expect(screen.queryByText(/Dec/)).not.toBeInTheDocument();
    });

    it('should highlight overdue tasks', () => {
      const overdueTodo = {
        ...mockTodo,
        dueDate: '2020-01-01', // Past date
        status: 'planned' as const,
      };

      renderWithIntl(
        <KanbanCard
          todo={overdueTodo}
          index={0}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />
      );

      expect(screen.getByText(/Overdue/i)).toBeInTheDocument();
    });

    it('should not highlight completed tasks as overdue', () => {
      const completedOverdueTodo = {
        ...mockTodo,
        dueDate: '2020-01-01', // Past date
        status: 'done' as const,
      };

      renderWithIntl(
        <KanbanCard
          todo={completedOverdueTodo}
          index={0}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />
      );

      expect(screen.queryByText(/Overdue/i)).not.toBeInTheDocument();
    });
  });

  describe('Action Buttons', () => {
    it('should call onEdit when edit button is clicked', () => {
      renderWithIntl(
        <KanbanCard
          todo={mockTodo}
          index={0}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />
      );

      const editButton = screen.getByLabelText(/edit todo/i);
      fireEvent.click(editButton);

      expect(mockOnEdit).toHaveBeenCalledWith(mockTodo);
      expect(mockOnEdit).toHaveBeenCalledTimes(1);
    });

    it('should call onDelete when delete button is clicked', () => {
      renderWithIntl(
        <KanbanCard
          todo={mockTodo}
          index={0}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />
      );

      const deleteButton = screen.getByLabelText(/delete todo/i);
      fireEvent.click(deleteButton);

      expect(mockOnDelete).toHaveBeenCalledWith('1');
      expect(mockOnDelete).toHaveBeenCalledTimes(1);
    });
  });

  describe('Drag Handle', () => {
    it('should render drag handle area', () => {
      const { container } = renderWithIntl(
        <KanbanCard
          todo={mockTodo}
          index={0}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />
      );

      // Check that tooltip for drag handle is rendered
      const tooltip = container.querySelector('.euiToolTipAnchor');
      expect(tooltip).toBeInTheDocument();
    });

    it('should apply dragHandleProps when provided', () => {
      const mockDragHandleProps = {
        'data-testid': 'drag-handle',
        tabIndex: 0,
      };

      renderWithIntl(
        <KanbanCard
          todo={mockTodo}
          index={0}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
          dragHandleProps={mockDragHandleProps}
        />
      );

      expect(screen.getByTestId('drag-handle')).toBeInTheDocument();
    });
  });
});
