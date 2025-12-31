import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { IntlProvider } from 'react-intl';
import { TodosPage } from '../ui/TodosPage';
import { TodosClient } from '../api/todos.client';
import { useTodos } from '../hooks/use_todos';
import { useCreateTodo } from '../hooks/use_create_todo';
import { useUpdateTodo } from '../hooks/use_update_todo';
import { useDeleteTodo } from '../hooks/use_delete_todo';
import { useTodoStats } from '../hooks/use_todo_stats';
import { useTodoAnalytics } from '../hooks/use_todo_analytics';
import { Todo, TodoStats, AnalyticsStats } from '../../../../common/todo/todo.types';
import { PaginationMeta } from '../../../../common/todo/todo.dtos';

jest.mock('../hooks/use_todos');
jest.mock('../hooks/use_create_todo');
jest.mock('../hooks/use_update_todo');
jest.mock('../hooks/use_delete_todo');
jest.mock('../hooks/use_todo_stats');
jest.mock('../hooks/use_todo_analytics');

jest.mock('../ui/TodosTable', () => ({
  TodosTable: ({ todos, onEdit, onDelete }: any) => (
    <div data-testid="todos-table">
      <div>TodosTable with {todos.length} items</div>
      {todos.map((todo: Todo) => (
        <div key={todo.id}>
          <span>{todo.title}</span>
          <button onClick={() => onEdit(todo)}>Edit {todo.title}</button>
          <button onClick={() => onDelete(todo.id)}>Delete {todo.id}</button>
        </div>
      ))}
    </div>
  ),
}));

jest.mock('../ui/TodosStatsDashboard', () => ({
  TodosStatsDashboard: ({ stats }: any) => (
    <div data-testid="todos-stats-dashboard">
      TodosStatsDashboard with {stats?.total || 0} total tasks
    </div>
  ),
}));

jest.mock('../ui/ComplianceDashboard', () => ({
  ComplianceDashboard: ({ data }: any) => (
    <div data-testid="compliance-dashboard">
      ComplianceDashboard with {data?.totalTasks || 0} tasks
    </div>
  ),
}));

jest.mock('../ui/TodoFilters', () => ({
  TodoFilters: ({ onFiltersChange }: any) => (
    <div data-testid="todo-filters">
      <button onClick={() => onFiltersChange({ searchText: 'test' })}>
        Apply Filter
      </button>
    </div>
  ),
}));

jest.mock('../ui/TodoForm', () => ({
  TodoForm: ({ todo, onSubmit, onClose }: any) => (
    <div data-testid="todo-form">
      <h2>{todo ? 'Edit TODO' : 'Create TODO'}</h2>
      <button onClick={() => onSubmit({ title: 'Test Task', status: 'planned' })}>
        Submit
      </button>
      <button onClick={onClose}>Close</button>
    </div>
  ),
}));

jest.mock('../../../components/language-selector', () => ({
  LanguageSelector: () => <div data-testid="language-selector">Language Selector</div>,
}));

const renderWithIntl = (component: React.ReactElement) => {
  return render(
    <IntlProvider locale="en" defaultLocale="en" messages={{}}>
      {component}
    </IntlProvider>
  );
};

describe('TodosPage', () => {
  const mockHttp = {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    patch: jest.fn(),
    delete: jest.fn(),
  } as any;

  const mockNotifications = {
    toasts: {
      addSuccess: jest.fn(),
      addDanger: jest.fn(),
      addWarning: jest.fn(),
      addError: jest.fn(),
    },
  } as any;

  const mockTodos: Todo[] = [
    {
      id: 'todo-1',
      title: 'First TODO',
      description: 'First description',
      status: 'planned',
      tags: ['tag1'],
      assignee: 'user1',
      createdAt: '2024-01-15T10:00:00.000Z',
      updatedAt: '2024-01-15T10:00:00.000Z',
      completedAt: null,
    },
    {
      id: 'todo-2',
      title: 'Second TODO',
      status: 'done',
      tags: [],
      createdAt: '2024-01-15T08:00:00.000Z',
      updatedAt: '2024-01-15T09:00:00.000Z',
      completedAt: '2024-01-15T09:00:00.000Z',
    },
  ];

  const mockPagination: PaginationMeta = {
    page: 1,
    pageSize: 20,
    totalItems: 2,
    totalPages: 1,
    hasNextPage: false,
    hasPreviousPage: false,
  };

  const mockStats: TodoStats = {
    total: 100,
    byStatus: {
      planned: 40,
      done: 50,
      error: 10,
    },
    statusDistribution: [
      { label: 'planned', count: 40, percentage: 40 },
      { label: 'done', count: 50, percentage: 50 },
      { label: 'error', count: 10, percentage: 10 },
    ],
    topTags: [
      { tag: 'urgent', count: 30 },
      { tag: 'review', count: 20 },
    ],
    completionTimeline: [],
  };

  const mockAnalytics: AnalyticsStats = {
    computedAt: '2024-01-15T12:00:00.000Z',
    totalTasks: 100,
    complianceCoverage: [
      {
        framework: 'PCI-DSS',
        total: 30,
        byStatus: { planned: 10, done: 15, error: 5 },
        completionRate: 50,
      },
    ],
    overdueTasks: {
      total: 20,
      byPriority: { low: 5, medium: 8, high: 5, critical: 2 },
      bySeverity: { info: 3, low: 7, medium: 6, high: 3, critical: 1 },
    },
    priorityDistribution: [
      { label: 'low', count: 20, percentage: 20 },
      { label: 'medium', count: 40, percentage: 40 },
      { label: 'high', count: 30, percentage: 30 },
      { label: 'critical', count: 10, percentage: 10 },
    ],
    severityDistribution: [
      { label: 'info', count: 10, percentage: 10 },
      { label: 'low', count: 30, percentage: 30 },
      { label: 'medium', count: 40, percentage: 40 },
      { label: 'high', count: 15, percentage: 15 },
      { label: 'critical', count: 5, percentage: 5 },
    ],
  };

  const mockRefresh = jest.fn();
  const mockCreateTodo = jest.fn();
  const mockUpdateTodo = jest.fn();
  const mockDeleteTodo = jest.fn();
  const mockRefreshStats = jest.fn();
  const mockRefreshAnalytics = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    (useTodos as jest.Mock).mockReturnValue({
      todos: mockTodos,
      pagination: mockPagination,
      loading: false,
      error: null,
      refresh: mockRefresh,
    });

    (useCreateTodo as jest.Mock).mockReturnValue({
      createTodo: mockCreateTodo,
      loading: false,
    });

    (useUpdateTodo as jest.Mock).mockReturnValue({
      updateTodo: mockUpdateTodo,
      loading: false,
    });

    (useDeleteTodo as jest.Mock).mockReturnValue({
      deleteTodo: mockDeleteTodo,
    });

    (useTodoStats as jest.Mock).mockReturnValue({
      stats: mockStats,
      loading: false,
      error: null,
      refresh: mockRefreshStats,
    });

    (useTodoAnalytics as jest.Mock).mockReturnValue({
      data: mockAnalytics,
      loading: false,
      error: null,
      refresh: mockRefreshAnalytics,
    });
  });

  describe('Page Structure', () => {
    it('should render the page title', () => {
      renderWithIntl(<TodosPage http={mockHttp} notifications={mockNotifications} />);
      expect(screen.getByText('TODO Management')).toBeInTheDocument();
    });

    it('should render the page description', () => {
      renderWithIntl(<TodosPage http={mockHttp} notifications={mockNotifications} />);
      expect(
        screen.getByText('Manage your TODO items, track progress, and view statistics.')
      ).toBeInTheDocument();
    });

    it('should render the Create TODO button in header', () => {
      renderWithIntl(<TodosPage http={mockHttp} notifications={mockNotifications} />);
      const createButtons = screen.getAllByText('Create TODO');
      expect(createButtons.length).toBeGreaterThan(0);
    });

    it('should render the language selector', () => {
      renderWithIntl(<TodosPage http={mockHttp} notifications={mockNotifications} />);
      expect(screen.getByTestId('language-selector')).toBeInTheDocument();
    });
  });

  describe('Tab Structure - 2 Tabs', () => {
    it('should render exactly 2 tabs', () => {
      renderWithIntl(<TodosPage http={mockHttp} notifications={mockNotifications} />);

      expect(screen.getByText('Table View')).toBeInTheDocument();

      expect(screen.getByText('Analytics')).toBeInTheDocument();
    });

    it('should NOT render 3 separate tabs', () => {
      renderWithIntl(<TodosPage http={mockHttp} notifications={mockNotifications} />);

      const statisticsTexts = screen.queryAllByText('Statistics');
      const complianceTexts = screen.queryAllByText('Compliance Dashboard');

      expect(statisticsTexts.length).toBe(0);
      expect(complianceTexts.length).toBe(0);
    });

    it('should default to Table View tab', () => {
      renderWithIntl(<TodosPage http={mockHttp} notifications={mockNotifications} />);

      expect(screen.getByTestId('todo-filters')).toBeInTheDocument();
      expect(screen.getByTestId('todos-table')).toBeInTheDocument();
    });

    it('should show Table View content in first tab', () => {
      renderWithIntl(<TodosPage http={mockHttp} notifications={mockNotifications} />);

      expect(screen.getByTestId('todos-table')).toBeInTheDocument();
      expect(screen.getByTestId('todo-filters')).toBeInTheDocument();
      expect(screen.getByText('TodosTable with 2 items')).toBeInTheDocument();
    });
  });

  describe('Analytics Tab - Combined Statistics and Compliance', () => {
    it('should switch to Analytics tab when clicked', () => {
      renderWithIntl(<TodosPage http={mockHttp} notifications={mockNotifications} />);

      const analyticsTab = screen.getByText('Analytics');
      fireEvent.click(analyticsTab);

      waitFor(() => {
        expect(screen.getByTestId('todos-chart')).toBeInTheDocument();
        expect(screen.getByTestId('compliance-dashboard')).toBeInTheDocument();
      });
    });

    it('should render both TodosStatsDashboard and ComplianceDashboard in Analytics tab', () => {
      renderWithIntl(<TodosPage http={mockHttp} notifications={mockNotifications} />);

      const analyticsTab = screen.getByText('Analytics');
      fireEvent.click(analyticsTab);

      waitFor(() => {

        expect(screen.getByTestId('todos-chart')).toBeInTheDocument();
        expect(screen.getByTestId('compliance-dashboard')).toBeInTheDocument();
      });
    });

    it('should pass stats data to TodosStatsDashboard', () => {
      renderWithIntl(<TodosPage http={mockHttp} notifications={mockNotifications} />);

      const analyticsTab = screen.getByText('Analytics');
      fireEvent.click(analyticsTab);

      waitFor(() => {
        expect(screen.getByText('TodosStatsDashboard with 100 total tasks')).toBeInTheDocument();
      });
    });

    it('should pass analytics data to ComplianceDashboard', () => {
      renderWithIntl(<TodosPage http={mockHttp} notifications={mockNotifications} />);

      const analyticsTab = screen.getByText('Analytics');
      fireEvent.click(analyticsTab);

      waitFor(() => {
        expect(screen.getByText('ComplianceDashboard with 100 tasks')).toBeInTheDocument();
      });
    });

    it('should hide Table View when Analytics tab is active', () => {
      renderWithIntl(<TodosPage http={mockHttp} notifications={mockNotifications} />);

      expect(screen.getByTestId('todos-table')).toBeInTheDocument();

      const analyticsTab = screen.getByText('Analytics');
      fireEvent.click(analyticsTab);

      waitFor(() => {
        expect(screen.queryByTestId('todos-table')).not.toBeInTheDocument();
      });
    });
  });

  describe('Data Fetching Hooks', () => {
    it('should call useTodos hook with correct parameters', () => {
      renderWithIntl(<TodosPage http={mockHttp} notifications={mockNotifications} />);

      expect(useTodos).toHaveBeenCalledWith(
        expect.objectContaining({
          client: expect.any(TodosClient),
          initialParams: expect.objectContaining({
            page: 1,
            pageSize: 20,
          }),
        })
      );
    });

    it('should call useTodoStats hook', () => {
      renderWithIntl(<TodosPage http={mockHttp} notifications={mockNotifications} />);

      expect(useTodoStats).toHaveBeenCalledWith(
        expect.objectContaining({
          client: expect.any(TodosClient),
        })
      );
    });

    it('should call useTodoAnalytics hook', () => {
      renderWithIntl(<TodosPage http={mockHttp} notifications={mockNotifications} />);

      expect(useTodoAnalytics).toHaveBeenCalledWith(
        expect.objectContaining({
          client: expect.any(TodosClient),
        })
      );
    });

    it('should call useCreateTodo hook with notifications', () => {
      renderWithIntl(<TodosPage http={mockHttp} notifications={mockNotifications} />);

      expect(useCreateTodo).toHaveBeenCalledWith(
        expect.objectContaining({
          client: expect.any(TodosClient),
          notifications: mockNotifications,
          onSuccess: expect.any(Function),
        })
      );
    });

    it('should call useUpdateTodo hook with notifications', () => {
      renderWithIntl(<TodosPage http={mockHttp} notifications={mockNotifications} />);

      expect(useUpdateTodo).toHaveBeenCalledWith(
        expect.objectContaining({
          client: expect.any(TodosClient),
          notifications: mockNotifications,
          onSuccess: expect.any(Function),
        })
      );
    });

    it('should call useDeleteTodo hook with notifications', () => {
      renderWithIntl(<TodosPage http={mockHttp} notifications={mockNotifications} />);

      expect(useDeleteTodo).toHaveBeenCalledWith(
        expect.objectContaining({
          client: expect.any(TodosClient),
          notifications: mockNotifications,
          onSuccess: expect.any(Function),
        })
      );
    });
  });

  describe('Loading States', () => {
    it('should handle loading state for todos', () => {
      (useTodos as jest.Mock).mockReturnValue({
        todos: [],
        pagination: null,
        loading: true,
        error: null,
        refresh: mockRefresh,
      });

      renderWithIntl(<TodosPage http={mockHttp} notifications={mockNotifications} />);

      expect(screen.getByTestId('todos-table')).toBeInTheDocument();
    });

    it('should handle loading state for stats in Analytics tab', () => {
      (useTodoStats as jest.Mock).mockReturnValue({
        stats: null,
        loading: true,
        error: null,
        refresh: mockRefreshStats,
      });

      renderWithIntl(<TodosPage http={mockHttp} notifications={mockNotifications} />);

      const analyticsTab = screen.getByText('Analytics');
      fireEvent.click(analyticsTab);

      waitFor(() => {
        expect(screen.getByTestId('todos-chart')).toBeInTheDocument();
      });
    });

    it('should handle loading state for analytics in Analytics tab', () => {
      (useTodoAnalytics as jest.Mock).mockReturnValue({
        data: null,
        loading: true,
        error: null,
        refresh: mockRefreshAnalytics,
      });

      renderWithIntl(<TodosPage http={mockHttp} notifications={mockNotifications} />);

      const analyticsTab = screen.getByText('Analytics');
      fireEvent.click(analyticsTab);

      waitFor(() => {
        expect(screen.getByTestId('compliance-dashboard')).toBeInTheDocument();
      });
    });
  });

  describe('Error States', () => {
    it('should display error message when todos fail to load', () => {
      (useTodos as jest.Mock).mockReturnValue({
        todos: [],
        pagination: null,
        loading: false,
        error: new Error('Failed to fetch todos'),
        refresh: mockRefresh,
      });

      renderWithIntl(<TodosPage http={mockHttp} notifications={mockNotifications} />);

      expect(screen.getByText('Error Loading TODOs')).toBeInTheDocument();
      expect(screen.getByText('Failed to fetch todos')).toBeInTheDocument();
    });

    it('should show empty state when no todos exist', () => {
      (useTodos as jest.Mock).mockReturnValue({
        todos: [],
        pagination: mockPagination,
        loading: false,
        error: null,
        refresh: mockRefresh,
      });

      renderWithIntl(<TodosPage http={mockHttp} notifications={mockNotifications} />);

      expect(screen.getByText('No TODOs Found')).toBeInTheDocument();
      expect(screen.getByText('Create your first TODO item to get started.')).toBeInTheDocument();
    });

    it('should handle stats error in Analytics tab', () => {
      (useTodoStats as jest.Mock).mockReturnValue({
        stats: null,
        loading: false,
        error: new Error('Stats fetch failed'),
        refresh: mockRefreshStats,
      });

      renderWithIntl(<TodosPage http={mockHttp} notifications={mockNotifications} />);

      const analyticsTab = screen.getByText('Analytics');
      fireEvent.click(analyticsTab);

      waitFor(() => {
        expect(screen.getByTestId('todos-chart')).toBeInTheDocument();
      });
    });

    it('should handle analytics error in Analytics tab', () => {
      (useTodoAnalytics as jest.Mock).mockReturnValue({
        data: null,
        loading: false,
        error: new Error('Analytics fetch failed'),
        refresh: mockRefreshAnalytics,
      });

      renderWithIntl(<TodosPage http={mockHttp} notifications={mockNotifications} />);

      const analyticsTab = screen.getByText('Analytics');
      fireEvent.click(analyticsTab);

      waitFor(() => {
        expect(screen.getByTestId('compliance-dashboard')).toBeInTheDocument();
      });
    });
  });

  describe('CRUD Operations', () => {
    it('should open create form when Create TODO button is clicked', () => {
      renderWithIntl(<TodosPage http={mockHttp} notifications={mockNotifications} />);

      const createButton = screen.getAllByRole('button', { name: /create todo/i })[0];
      fireEvent.click(createButton);

      expect(screen.getByTestId('todo-form')).toBeInTheDocument();
      expect(screen.getByRole('heading', { name: /create todo/i })).toBeInTheDocument();
    });

    it('should open edit form when edit button in table is clicked', () => {
      renderWithIntl(<TodosPage http={mockHttp} notifications={mockNotifications} />);

      const editButton = screen.getByText('Edit First TODO');
      fireEvent.click(editButton);

      expect(screen.getByTestId('todo-form')).toBeInTheDocument();
      expect(screen.getByText('Edit TODO')).toBeInTheDocument();
    });

    it('should call createTodo when form is submitted in create mode', async () => {
      mockCreateTodo.mockResolvedValue(undefined);

      renderWithIntl(<TodosPage http={mockHttp} notifications={mockNotifications} />);

      const createButtons = screen.getAllByText('Create TODO');
      fireEvent.click(createButtons[0]);

      const submitButton = screen.getByText('Submit');
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockCreateTodo).toHaveBeenCalledWith({
          title: 'Test Task',
          status: 'planned',
        });
      });
    });

    it('should call updateTodo when form is submitted in edit mode', async () => {
      mockUpdateTodo.mockResolvedValue(undefined);

      renderWithIntl(<TodosPage http={mockHttp} notifications={mockNotifications} />);

      const editButton = screen.getByText('Edit First TODO');
      fireEvent.click(editButton);

      const submitButton = screen.getByText('Submit');
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockUpdateTodo).toHaveBeenCalledWith('todo-1', {
          title: 'Test Task',
          status: 'planned',
        });
      });
    });

    it('should call deleteTodo when delete button is clicked', () => {
      renderWithIntl(<TodosPage http={mockHttp} notifications={mockNotifications} />);

      const deleteButton = screen.getByText('Delete todo-1');
      fireEvent.click(deleteButton);

      expect(mockDeleteTodo).toHaveBeenCalledWith('todo-1');
    });

    it('should close form when close button is clicked', () => {
      renderWithIntl(<TodosPage http={mockHttp} notifications={mockNotifications} />);

      const createButtons = screen.getAllByText('Create TODO');
      fireEvent.click(createButtons[0]);

      expect(screen.getByTestId('todo-form')).toBeInTheDocument();

      const closeButton = screen.getByText('Close');
      fireEvent.click(closeButton);

      expect(screen.queryByTestId('todo-form')).not.toBeInTheDocument();
    });

    it('should refresh todos and stats after successful create', async () => {
      const onSuccessCallback = jest.fn();
      mockCreateTodo.mockImplementation(async () => {

        onSuccessCallback();
      });

      (useCreateTodo as jest.Mock).mockReturnValue({
        createTodo: mockCreateTodo,
        loading: false,
      });

      renderWithIntl(<TodosPage http={mockHttp} notifications={mockNotifications} />);

      const createButton = screen.getAllByRole('button', { name: /create todo/i })[0];
      fireEvent.click(createButton);

      const submitButton = screen.getByText('Submit');
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockCreateTodo).toHaveBeenCalled();
      });
    });

    it('should refresh todos and stats after successful update', async () => {
      const onSuccessCallback = jest.fn();
      mockUpdateTodo.mockImplementation(async () => {

        onSuccessCallback();
      });

      (useUpdateTodo as jest.Mock).mockReturnValue({
        updateTodo: mockUpdateTodo,
        loading: false,
      });

      renderWithIntl(<TodosPage http={mockHttp} notifications={mockNotifications} />);

      const editButton = screen.getByText('Edit First TODO');
      fireEvent.click(editButton);

      const submitButton = screen.getByText('Submit');
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockUpdateTodo).toHaveBeenCalled();
      });
    });

    it('should refresh todos and stats after successful delete', () => {
      renderWithIntl(<TodosPage http={mockHttp} notifications={mockNotifications} />);

      const deleteButton = screen.getByText('Delete todo-1');
      fireEvent.click(deleteButton);

      expect(mockDeleteTodo).toHaveBeenCalledWith('todo-1');
    });
  });

  describe('Filters', () => {
    it('should render TodoFilters component', () => {
      renderWithIntl(<TodosPage http={mockHttp} notifications={mockNotifications} />);

      expect(screen.getByTestId('todo-filters')).toBeInTheDocument();
    });

    it('should handle filter changes', () => {
      renderWithIntl(<TodosPage http={mockHttp} notifications={mockNotifications} />);

      const applyFilterButton = screen.getByText('Apply Filter');
      fireEvent.click(applyFilterButton);

      expect(useTodos).toHaveBeenCalled();
    });

    it('should reset to page 1 when filters change', async () => {
      const { rerender } = renderWithIntl(
        <TodosPage http={mockHttp} notifications={mockNotifications} />
      );

      const applyFilterButton = screen.getByText('Apply Filter');
      fireEvent.click(applyFilterButton);

      rerender(
        <IntlProvider locale="en" defaultLocale="en" messages={{}}>
          <TodosPage http={mockHttp} notifications={mockNotifications} />
        </IntlProvider>
      );

      await waitFor(() => {
        expect(useTodos).toHaveBeenCalledWith(
          expect.objectContaining({
            initialParams: expect.objectContaining({
              page: 1,
            }),
          })
        );
      });
    });
  });

  describe('Pagination', () => {
    it('should pass pagination data to TodosTable', () => {
      renderWithIntl(<TodosPage http={mockHttp} notifications={mockNotifications} />);

      expect(screen.getByTestId('todos-table')).toBeInTheDocument();

    });

    it('should handle page size changes', () => {
      renderWithIntl(<TodosPage http={mockHttp} notifications={mockNotifications} />);

      expect(useTodos).toHaveBeenCalledWith(
        expect.objectContaining({
          initialParams: expect.objectContaining({
            pageSize: 20,
          }),
        })
      );
    });
  });

  describe('Sorting', () => {
    it('should default to sorting by createdAt desc', () => {
      renderWithIntl(<TodosPage http={mockHttp} notifications={mockNotifications} />);

      expect(useTodos).toHaveBeenCalledWith(
        expect.objectContaining({
          initialParams: expect.objectContaining({
            sortField: 'createdAt',
            sortDirection: 'desc',
          }),
        })
      );
    });
  });

  describe('Edge Cases', () => {
    it('should handle null pagination', () => {
      (useTodos as jest.Mock).mockReturnValue({
        todos: mockTodos,
        pagination: null,
        loading: false,
        error: null,
        refresh: mockRefresh,
      });

      renderWithIntl(<TodosPage http={mockHttp} notifications={mockNotifications} />);

      expect(screen.getByTestId('todos-table')).toBeInTheDocument();
    });

    it('should handle null stats', () => {
      (useTodoStats as jest.Mock).mockReturnValue({
        stats: null,
        loading: false,
        error: null,
        refresh: mockRefreshStats,
      });

      renderWithIntl(<TodosPage http={mockHttp} notifications={mockNotifications} />);

      const analyticsTab = screen.getByText('Analytics');
      fireEvent.click(analyticsTab);

      waitFor(() => {
        expect(screen.getByText('TodosStatsDashboard with 0 total tasks')).toBeInTheDocument();
      });
    });

    it('should handle null analytics data', () => {
      (useTodoAnalytics as jest.Mock).mockReturnValue({
        data: null,
        loading: false,
        error: null,
        refresh: mockRefreshAnalytics,
      });

      renderWithIntl(<TodosPage http={mockHttp} notifications={mockNotifications} />);

      const analyticsTab = screen.getByText('Analytics');
      fireEvent.click(analyticsTab);

      waitFor(() => {
        expect(screen.getByText('ComplianceDashboard with 0 tasks')).toBeInTheDocument();
      });
    });

    it('should handle empty todos array', () => {
      (useTodos as jest.Mock).mockReturnValue({
        todos: [],
        pagination: mockPagination,
        loading: false,
        error: null,
        refresh: mockRefresh,
      });

      renderWithIntl(<TodosPage http={mockHttp} notifications={mockNotifications} />);

      expect(screen.getByText('No TODOs Found')).toBeInTheDocument();
    });

    it('should handle multiple rapid tab switches', () => {
      renderWithIntl(<TodosPage http={mockHttp} notifications={mockNotifications} />);

      const analyticsTab = screen.getByText('Analytics');
      const tableViewTab = screen.getByText('Table View');

      fireEvent.click(analyticsTab);
      fireEvent.click(tableViewTab);
      fireEvent.click(analyticsTab);

      waitFor(() => {
        expect(screen.getByTestId('todos-chart')).toBeInTheDocument();
        expect(screen.getByTestId('compliance-dashboard')).toBeInTheDocument();
      });
    });
  });

  describe('Component Integration', () => {
    it('should render all major components in correct order', () => {
      const { container } = renderWithIntl(
        <TodosPage http={mockHttp} notifications={mockNotifications} />
      );

      expect(screen.getByText('TODO Management')).toBeInTheDocument();
      expect(screen.getByText('Table View')).toBeInTheDocument();
      expect(screen.getByText('Analytics')).toBeInTheDocument();
      expect(screen.getByTestId('todos-table')).toBeInTheDocument();
    });

    it('should maintain state across tab switches', () => {
      renderWithIntl(<TodosPage http={mockHttp} notifications={mockNotifications} />);

      const createButtons = screen.getAllByText('Create TODO');
      fireEvent.click(createButtons[0]);

      expect(screen.getByTestId('todo-form')).toBeInTheDocument();

      const analyticsTab = screen.getByText('Analytics');
      fireEvent.click(analyticsTab);

      expect(screen.getByTestId('todo-form')).toBeInTheDocument();
    });

    it('should use the same TodosClient instance across hooks', () => {
      renderWithIntl(<TodosPage http={mockHttp} notifications={mockNotifications} />);

      expect(useTodos).toHaveBeenCalledWith(
        expect.objectContaining({
          client: expect.any(TodosClient),
        })
      );

      expect(useTodoStats).toHaveBeenCalledWith(
        expect.objectContaining({
          client: expect.any(TodosClient),
        })
      );

      expect(useTodoAnalytics).toHaveBeenCalledWith(
        expect.objectContaining({
          client: expect.any(TodosClient),
        })
      );
    });
  });
});
