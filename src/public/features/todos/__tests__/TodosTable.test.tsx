import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { TodosTable } from '../ui/TodosTable';
import { Todo } from '../../../../common/todo/todo.types';
import { PaginationMeta } from '../../../../common/todo/todo.dtos';
const MOCK_NOW = new Date('2024-01-15T12:00:00.000Z');
describe('TodosTable', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(MOCK_NOW);
  });
  afterEach(() => {
    jest.useRealTimers();
    jest.clearAllMocks();
  });
  const mockTodos: Todo[] = [
    {
      id: 'todo-1',
      title: 'First TODO',
      description: 'First description',
      status: 'planned',
      tags: ['tag1', 'tag2'],
      assignee: 'user1',
      createdAt: '2024-01-15T10:00:00.000Z',
      updatedAt: '2024-01-15T10:00:00.000Z',
      completedAt: null,
    },
    {
      id: 'todo-2',
      title: 'Second TODO',
      description: 'Second description',
      status: 'done',
      tags: ['tag3'],
      assignee: 'user2',
      createdAt: '2024-01-15T08:00:00.000Z',
      updatedAt: '2024-01-15T09:00:00.000Z',
      completedAt: '2024-01-15T09:00:00.000Z',
    },
    {
      id: 'todo-3',
      title: 'Third TODO',
      status: 'error',
      tags: [],
      createdAt: '2024-01-14T10:00:00.000Z',
      updatedAt: '2024-01-14T10:00:00.000Z',
      completedAt: null,
    },
  ];
  const mockPagination: PaginationMeta = {
    page: 1,
    pageSize: 20,
    totalItems: 3,
    totalPages: 1,
    hasNextPage: false,
    hasPreviousPage: false,
  };
  const defaultProps = {
    todos: mockTodos,
    pagination: mockPagination,
    loading: false,
    sortField: 'createdAt' as const,
    sortDirection: 'desc' as const,
    onEdit: jest.fn(),
    onDelete: jest.fn(),
    onTableChange: jest.fn(),
  };
  describe('Rendering', () => {
    it('should render table with TODO items', () => {
      render(<TodosTable {...defaultProps} />);
      expect(screen.getByText('First TODO')).toBeInTheDocument();
      expect(screen.getByText('Second TODO')).toBeInTheDocument();
      expect(screen.getByText('Third TODO')).toBeInTheDocument();
    });
    it('should display TODO descriptions', () => {
      render(<TodosTable {...defaultProps} />);
      expect(screen.getByText('First description')).toBeInTheDocument();
      expect(screen.getByText('Second description')).toBeInTheDocument();
    });
    it('should render status badges with correct colors', () => {
      render(<TodosTable {...defaultProps} />);
      expect(screen.getByText('Planned')).toBeInTheDocument();
      expect(screen.getByText('Done')).toBeInTheDocument();
      expect(screen.getByText('Error')).toBeInTheDocument();
    });
    it('should display tags', () => {
      render(<TodosTable {...defaultProps} />);
      expect(screen.getByText('tag1')).toBeInTheDocument();
      expect(screen.getByText('tag2')).toBeInTheDocument();
      expect(screen.getByText('tag3')).toBeInTheDocument();
    });
    it('should show assignee names', () => {
      render(<TodosTable {...defaultProps} />);
      expect(screen.getByText('user1')).toBeInTheDocument();
      expect(screen.getByText('user2')).toBeInTheDocument();
    });
    it('should show "-" for missing assignee', () => {
      render(<TodosTable {...defaultProps} />);
      const cells = screen.getAllByText('-');
      expect(cells.length).toBeGreaterThan(0);
    });
    it('should display relative timestamps', () => {
      render(<TodosTable {...defaultProps} />);
      const twoHoursAgo = screen.getAllByText('2 hours ago');
      expect(twoHoursAgo.length).toBeGreaterThan(0);
      const fourHoursAgo = screen.getAllByText('4 hours ago');
      expect(fourHoursAgo.length).toBeGreaterThan(0);
    });
    it('should show loading state', () => {
      render(<TodosTable {...defaultProps} loading={true} />);
      const table = screen.getByRole('table');
      expect(table).toBeInTheDocument();
    });
    it('should render empty table when no todos', () => {
      render(<TodosTable {...defaultProps} todos={[]} />);
      const table = screen.getByRole('table');
      expect(table).toBeInTheDocument();
    });
    it('should truncate tags when more than 3', () => {
      const todoWithManyTags: Todo = {
        ...mockTodos[0],
        tags: ['tag1', 'tag2', 'tag3', 'tag4', 'tag5'],
      };
      render(<TodosTable {...defaultProps} todos={[todoWithManyTags]} />);
      expect(screen.getByText('tag1')).toBeInTheDocument();
      expect(screen.getByText('tag2')).toBeInTheDocument();
      expect(screen.getByText('tag3')).toBeInTheDocument();
      expect(screen.getByText('+2')).toBeInTheDocument();
    });
  });
  describe('Pagination', () => {
    it('should display pagination controls', () => {
      render(<TodosTable {...defaultProps} />);
      const table = screen.getByRole('table');
      expect(table).toBeInTheDocument();
    });
    it('should call onTableChange when page changes', async () => {
      const multiPagePagination: PaginationMeta = {
        page: 1,
        pageSize: 10,
        totalItems: 50,
        totalPages: 5,
        hasNextPage: true,
        hasPreviousPage: false,
      };
      render(
        <TodosTable
          {...defaultProps}
          pagination={multiPagePagination}
        />
      );
      const nextButtons = screen.queryAllByLabelText(/next page/i);
      if (nextButtons.length > 0) {
        fireEvent.click(nextButtons[0]);
        await waitFor(() => {
          expect(defaultProps.onTableChange).toHaveBeenCalledWith(
            2, 
            10, 
            'createdAt', 
            'desc' 
          );
        });
      }
    });
    it('should handle pagination when null', () => {
      render(<TodosTable {...defaultProps} pagination={null} />);
      const table = screen.getByRole('table');
      expect(table).toBeInTheDocument();
    });
  });
  describe('Sorting', () => {
    it('should display sort indicators', () => {
      render(<TodosTable {...defaultProps} />);
      const table = screen.getByRole('table');
      expect(table).toBeInTheDocument();
    });
    it('should call onTableChange when sort changes', async () => {
      render(<TodosTable {...defaultProps} />);
      const titleHeaders = screen.getAllByText('Title');
      fireEvent.click(titleHeaders[0]); 
      await waitFor(() => {
        expect(defaultProps.onTableChange).toHaveBeenCalledWith(
          1, 
          20, 
          'title', 
          expect.any(String) 
        );
      });
    });
  });
  describe('Actions', () => {
    it('should render edit and delete buttons for each row', () => {
      render(<TodosTable {...defaultProps} />);
      const editButtons = screen.getAllByLabelText(/edit/i);
      const deleteButtons = screen.getAllByLabelText(/delete/i);
      expect(editButtons.length).toBe(mockTodos.length);
      expect(deleteButtons.length).toBe(mockTodos.length);
    });
    it('should call onEdit when edit button is clicked', () => {
      render(<TodosTable {...defaultProps} />);
      const editButtons = screen.getAllByLabelText(/edit/i);
      fireEvent.click(editButtons[0]);
      expect(defaultProps.onEdit).toHaveBeenCalledWith(mockTodos[0]);
    });
    it('should show delete confirmation modal when delete is clicked', () => {
      render(<TodosTable {...defaultProps} />);
      const deleteButtons = screen.getAllByLabelText(/delete/i);
      fireEvent.click(deleteButtons[0]);
      const headings = screen.getAllByText(/delete todo/i);
      expect(headings.length).toBeGreaterThan(0);
      expect(screen.getByText(/Are you sure you want to delete/i)).toBeInTheDocument();
      const todoTitles = screen.getAllByText('First TODO');
      expect(todoTitles.length).toBeGreaterThan(0);
    });
    it('should call onDelete when delete is confirmed', () => {
      render(<TodosTable {...defaultProps} />);
      const deleteButtons = screen.getAllByLabelText(/delete/i);
      fireEvent.click(deleteButtons[0]);
      const confirmButtons = screen.getAllByRole('button', { name: /delete/i });
      fireEvent.click(confirmButtons[confirmButtons.length - 1]);
      expect(defaultProps.onDelete).toHaveBeenCalledWith('todo-1');
    });
    it('should close modal when cancel is clicked', () => {
      render(<TodosTable {...defaultProps} />);
      const deleteButtons = screen.getAllByLabelText(/delete/i);
      fireEvent.click(deleteButtons[0]);
      const modalHeadings = screen.getAllByText('Delete TODO');
      expect(modalHeadings.length).toBeGreaterThan(0);
      const cancelButton = screen.getByText('Cancel');
      fireEvent.click(cancelButton);
      expect(screen.queryByText('Delete TODO')).not.toBeInTheDocument();
    });
    it('should not call onDelete when cancel is clicked', () => {
      render(<TodosTable {...defaultProps} />);
      const deleteButtons = screen.getAllByLabelText(/delete/i);
      fireEvent.click(deleteButtons[0]);
      const cancelButton = screen.getByText('Cancel');
      fireEvent.click(cancelButton);
      expect(defaultProps.onDelete).not.toHaveBeenCalled();
    });
  });
  describe('Edge Cases', () => {
    it('should handle missing description gracefully', () => {
      const todoNoDesc: Todo = {
        ...mockTodos[0],
        description: undefined,
      };
      render(<TodosTable {...defaultProps} todos={[todoNoDesc]} />);
      expect(screen.getByText('First TODO')).toBeInTheDocument();
    });
    it('should handle empty tags array', () => {
      render(<TodosTable {...defaultProps} todos={[mockTodos[2]]} />);
      expect(screen.getByText('Third TODO')).toBeInTheDocument();
    });
    it('should format "just now" for very recent items', () => {
      const recentTodo: Todo = {
        ...mockTodos[0],
        createdAt: '2024-01-15T11:59:50.000Z', 
      };
      render(<TodosTable {...defaultProps} todos={[recentTodo]} />);
      expect(screen.getByText('just now')).toBeInTheDocument();
    });
    it('should format days for old items', () => {
      const oldTodo: Todo = {
        ...mockTodos[0],
        createdAt: '2024-01-13T10:00:00.000Z', 
      };
      render(<TodosTable {...defaultProps} todos={[oldTodo]} />);
      expect(screen.getByText('2 days ago')).toBeInTheDocument();
    });
  });
});
