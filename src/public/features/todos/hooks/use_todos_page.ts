import { useState, useCallback, useMemo, useEffect } from 'react';
import { HttpSetup, NotificationsStart } from '../../../../../src/core/public';
import { TodosClient } from '../api/todos.client';
import { useTodos } from './use_todos';
import { useCreateTodo } from './use_create_todo';
import { useUpdateTodo } from './use_update_todo';
import { useDeleteTodo } from './use_delete_todo';
import { useTodoStats } from './use_todo_stats';
import { useTodoAnalytics } from './use_todo_analytics';
import { Todo, TodoStatus, TodoPriority, TodoSeverity, TodoSortField } from '../../../../common/todo/todo.types';
import { CreateTodoRequest, UpdateTodoRequest } from '../../../../common/todo/todo.dtos';
import { DateRangeFilters } from '../ui/TodoFilters';
import moment from 'moment';

interface UseTodosPageParams {
  http: HttpSetup;
  notifications: NotificationsStart;
  dateRange?: {
    from: string;
    to: string;
  };
}

export const useTodosPage = ({ http, notifications, dateRange }: UseTodosPageParams) => {
  const client = useMemo(() => new TodosClient(http), [http]);

  // UI State
  const [selectedTab, setSelectedTab] = useState<'table' | 'analytics' | 'kanban'>('table');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [todoToEdit, setTodoToEdit] = useState<Todo | null>(null);
  const [complianceFrameworkFilter, setComplianceFrameworkFilter] = useState<string | undefined>(undefined);

  // Filter State
  const [searchText, setSearchText] = useState<string>('');
  const [selectedStatuses, setSelectedStatuses] = useState<TodoStatus[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedPriorities, setSelectedPriorities] = useState<TodoPriority[]>([]);
  const [selectedSeverities, setSelectedSeverities] = useState<TodoSeverity[]>([]);
  const [showOverdueOnly, setShowOverdueOnly] = useState<boolean>(false);
  const [dateFilters, setDateFilters] = useState<DateRangeFilters>({});

  // Pagination and Sorting State
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [sortField, setSortField] = useState<TodoSortField>('createdAt');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  // Convert dateRange from TopNavMenu to createdAfter/createdBefore filters
  useEffect(() => {
    if (dateRange) {
      const from = moment(dateRange.from, moment.ISO_8601, true);
      const to = moment(dateRange.to, moment.ISO_8601, true);

      if (from.isValid() && to.isValid()) {
        setDateFilters({
          createdAfter: from.toISOString(),
          createdBefore: to.toISOString(),
        });
      }
    }
  }, [dateRange]);

  // Build query params
  const queryParams = useMemo(
    () => ({
      page: currentPage,
      pageSize,
      searchText,
      status: selectedStatuses.length > 0 ? selectedStatuses : undefined,
      tags: selectedTags.length > 0 ? selectedTags : undefined,
      priority: selectedPriorities.length > 0 ? selectedPriorities : undefined,
      severity: selectedSeverities.length > 0 ? selectedSeverities : undefined,
      isOverdue: showOverdueOnly ? true : undefined,
      createdAfter: dateFilters.createdAfter,
      createdBefore: dateFilters.createdBefore,
      updatedAfter: dateFilters.updatedAfter,
      updatedBefore: dateFilters.updatedBefore,
      completedAfter: dateFilters.completedAfter,
      completedBefore: dateFilters.completedBefore,
      dueDateAfter: dateFilters.dueDateAfter,
      dueDateBefore: dateFilters.dueDateBefore,
      sortField,
      sortDirection,
    }),
    [currentPage, pageSize, searchText, selectedStatuses, selectedTags, selectedPriorities, selectedSeverities, showOverdueOnly, dateFilters, sortField, sortDirection]
  );

  // Data hooks
  const { todos, pagination, loading, error, refresh } = useTodos({
    client,
    initialParams: queryParams,
  });

  const { stats, loading: statsLoading, error: statsError, refresh: refreshStats } = useTodoStats({
    client,
  });

  const analyticsFilters = useMemo(
    () => (complianceFrameworkFilter ? { complianceFramework: complianceFrameworkFilter } : undefined),
    [complianceFrameworkFilter]
  );

  const { data: analytics, loading: analyticsLoading, error: analyticsError, refresh: refreshAnalytics } = useTodoAnalytics({
    client,
    filters: analyticsFilters,
  });

  // CRUD hooks
  const { createTodo, loading: createLoading } = useCreateTodo({
    client,
    notifications,
    onSuccess: () => {
      setIsFormOpen(false);
      refresh();
      refreshStats();
      refreshAnalytics();
    },
  });

  const { updateTodo, loading: updateLoading } = useUpdateTodo({
    client,
    notifications,
    onSuccess: () => {
      setIsFormOpen(false);
      setTodoToEdit(null);
      refresh();
      refreshStats();
      refreshAnalytics();
    },
  });

  const { deleteTodo } = useDeleteTodo({
    client,
    notifications,
    onSuccess: () => {
      refresh();
      refreshStats();
      refreshAnalytics();
    },
  });

  // Action handlers
  const handleFiltersChange = useCallback(
    (filters: {
      searchText?: string;
      status?: TodoStatus[];
      tags?: string[];
      priority?: TodoPriority[];
      severity?: TodoSeverity[];
      isOverdue?: boolean;
      dateFilters?: DateRangeFilters;
    }) => {
      setSearchText(filters.searchText);
      setSelectedStatuses(filters.status || []);
      setSelectedTags(filters.tags || []);
      setSelectedPriorities(filters.priority || []);
      setSelectedSeverities(filters.severity || []);
      setShowOverdueOnly(filters.isOverdue || false);
      setDateFilters(filters.dateFilters || {});
      setCurrentPage(1);
    },
    []
  );

  const handleTableChange = useCallback(
    (page: number, newPageSize: number, newSortField?: TodoSortField, newSortDirection?: 'asc' | 'desc') => {
      setCurrentPage(page);
      setPageSize(newPageSize);
      if (newSortField) setSortField(newSortField);
      if (newSortDirection) setSortDirection(newSortDirection);
    },
    []
  );

  const handleCreateClick = useCallback(() => {
    setTodoToEdit(null);
    setIsFormOpen(true);
  }, []);

  const handleEditClick = useCallback((todo: Todo) => {
    setTodoToEdit(todo);
    setIsFormOpen(true);
  }, []);

  const handleFormClose = useCallback(() => {
    setIsFormOpen(false);
    setTodoToEdit(null);
  }, []);

  const handleFormSubmit = useCallback(
    async (data: CreateTodoRequest | UpdateTodoRequest) => {
      if (todoToEdit) {
        await updateTodo(todoToEdit.id, data as UpdateTodoRequest);
      } else {
        await createTodo(data as CreateTodoRequest);
      }
    },
    [todoToEdit, updateTodo, createTodo]
  );

  const handleFrameworkFilterChange = useCallback((framework: string | undefined) => {
    setComplianceFrameworkFilter(framework);
  }, []);

  return {
    // Data
    data: {
      todos,
      pagination,
      stats,
      analytics,
      client,
    },
    // UI State
    uiState: {
      selectedTab,
      isFormOpen,
      todoToEdit,
      loading,
      error,
      statsLoading,
      statsError,
      analyticsLoading,
      analyticsError,
      createLoading,
      updateLoading,
      searchText,
      selectedStatuses,
      selectedTags,
      selectedPriorities,
      selectedSeverities,
      showOverdueOnly,
      dateFilters,
      sortField,
      sortDirection,
    },
    // Actions
    actions: {
      setSelectedTab,
      handleFiltersChange,
      handleTableChange,
      handleCreateClick,
      handleEditClick,
      handleFormClose,
      handleFormSubmit,
      updateTodo,
      deleteTodo,
      refreshAnalytics,
      handleFrameworkFilterChange,
    },
  };
};
