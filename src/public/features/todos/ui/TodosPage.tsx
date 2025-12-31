import React, { useState, useCallback, useMemo } from 'react';
import {
  EuiPage,
  EuiPageBody,
  EuiPageContent,
  EuiPageContentBody,
  EuiPageHeader,
  EuiTitle,
  EuiButton,
  EuiTabbedContent,
  EuiTabbedContentTab,
  EuiSpacer,
  EuiLoadingSpinner,
  EuiEmptyPrompt,
  EuiCallOut,
  EuiText,
} from '@elastic/eui';
import { FormattedMessage } from '@osd/i18n/react';
import { HttpSetup, NotificationsStart } from '../../../../../src/core/public';
import { TodosClient } from '../api/todos.client';
import { useTodos } from '../hooks/use_todos';
import { useCreateTodo } from '../hooks/use_create_todo';
import { useUpdateTodo } from '../hooks/use_update_todo';
import { useDeleteTodo } from '../hooks/use_delete_todo';
import { useTodoStats } from '../hooks/use_todo_stats';
import { useTodoAnalytics } from '../hooks/use_todo_analytics';
import { TodosTable } from './TodosTable';
import { TodosStatsDashboard } from './TodosStatsDashboard';
import { TodoForm } from './TodoForm';
import { TodoFilters } from './TodoFilters';
import { ComplianceDashboard } from './ComplianceDashboard';
import { LanguageSelector } from '../../../components/language-selector';
import { Todo, TodoStatus, TodoPriority, TodoSeverity, TodoSortField } from '../../../../common/todo/todo.types';
import { CreateTodoRequest, UpdateTodoRequest } from '../../../../common/todo/todo.dtos';
interface TodosPageProps {
  http: HttpSetup;
  notifications: NotificationsStart;
}
export const TodosPage: React.FC<TodosPageProps> = ({ http, notifications }) => {
  const client = useMemo(() => new TodosClient(http), [http]);
  const [selectedTab, setSelectedTab] = useState<'table' | 'analytics'>('table');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [todoToEdit, setTodoToEdit] = useState<Todo | null>(null);
  const [complianceFrameworkFilter, setComplianceFrameworkFilter] = useState<string | undefined>(undefined);
  const [searchText, setSearchText] = useState<string>();
  const [selectedStatuses, setSelectedStatuses] = useState<TodoStatus[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedPriorities, setSelectedPriorities] = useState<TodoPriority[]>([]);
  const [selectedSeverities, setSelectedSeverities] = useState<TodoSeverity[]>([]);
  const [showOverdueOnly, setShowOverdueOnly] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [sortField, setSortField] = useState<TodoSortField>('createdAt');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
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
      sortField,
      sortDirection,
    }),
    [currentPage, pageSize, searchText, selectedStatuses, selectedTags, selectedPriorities, selectedSeverities, showOverdueOnly, sortField, sortDirection]
  );
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
  const handleFiltersChange = useCallback(
    (filters: {
      searchText?: string;
      status?: TodoStatus[];
      tags?: string[];
      priority?: TodoPriority[];
      severity?: TodoSeverity[];
      isOverdue?: boolean;
    }) => {
      setSearchText(filters.searchText);
      setSelectedStatuses(filters.status || []);
      setSelectedTags(filters.tags || []);
      setSelectedPriorities(filters.priority || []);
      setSelectedSeverities(filters.severity || []);
      setShowOverdueOnly(filters.isOverdue || false);
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
  const tabs: EuiTabbedContentTab[] = [
    {
      id: 'table',
      name: <FormattedMessage id="customPlugin.tabs.table" defaultMessage="Table View" />,
      content: (
        <>
          <EuiSpacer size="m" />
          <TodoFilters
            searchText={searchText}
            selectedStatuses={selectedStatuses}
            selectedTags={selectedTags}
            selectedPriorities={selectedPriorities}
            selectedSeverities={selectedSeverities}
            showOverdueOnly={showOverdueOnly}
            onFiltersChange={handleFiltersChange}
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
            <EuiEmptyPrompt
              iconType="document"
              title={
                <h2>
                  <FormattedMessage
                    id="customPlugin.empty.noTodos.title"
                    defaultMessage="No TODOs Found"
                  />
                </h2>
              }
              body={
                <p>
                  <FormattedMessage
                    id="customPlugin.empty.noTodos.body"
                    defaultMessage="Create your first TODO item to get started."
                  />
                </p>
              }
              actions={
                <EuiButton onClick={handleCreateClick} fill iconType="plusInCircle">
                  <FormattedMessage
                    id="customPlugin.actions.button.createTodo"
                    defaultMessage="Create TODO"
                  />
                </EuiButton>
              }
            />
          ) : (
            <TodosTable
              todos={todos}
              pagination={pagination}
              loading={loading}
              sortField={sortField}
              sortDirection={sortDirection}
              onEdit={handleEditClick}
              onDelete={deleteTodo}
              onTableChange={handleTableChange}
            />
          )}
        </>
      ),
    },
    {
      id: 'analytics',
      name: <FormattedMessage id="customPlugin.tabs.analytics" defaultMessage="Analytics" />,
      content: (
        <>
          <EuiSpacer size="l" />
          <div>
            <EuiTitle size="m">
              <h2>
                <FormattedMessage
                  id="customPlugin.analytics.section.statistics"
                  defaultMessage="General Statistics"
                />
              </h2>
            </EuiTitle>
            <EuiSpacer size="s" />
            <EuiText size="s" color="subdued">
              <p>
                <FormattedMessage
                  id="customPlugin.analytics.section.statistics.description"
                  defaultMessage="Overview of all TODO items including status distribution and most used tags"
                />
              </p>
            </EuiText>
            <EuiSpacer size="m" />
            <TodosStatsDashboard stats={stats} loading={statsLoading} error={statsError} />
          </div>

          <EuiSpacer size="xl" />
          <EuiSpacer size="xl" />
          <div>
            <EuiTitle size="m">
              <h2>
                <FormattedMessage
                  id="customPlugin.analytics.section.compliance"
                  defaultMessage="Compliance & Security Analytics"
                />
              </h2>
            </EuiTitle>
            <EuiSpacer size="s" />
            <EuiText size="s" color="subdued">
              <p>
                <FormattedMessage
                  id="customPlugin.analytics.section.compliance.description"
                  defaultMessage="Compliance framework coverage, priority distribution, and security task analysis"
                />
              </p>
            </EuiText>
            <EuiSpacer size="m" />
            <ComplianceDashboard
              data={analytics}
              loading={analyticsLoading}
              error={analyticsError}
              onRefresh={refreshAnalytics}
              onFrameworkChange={handleFrameworkFilterChange}
            />
          </div>

          <EuiSpacer size="l" />
        </>
      ),
    },
  ];
  return (
    <EuiPage restrictWidth="95%">
      <EuiPageBody>
        <EuiPageHeader
          pageTitle={
            <FormattedMessage id="customPlugin.page.title" defaultMessage="TODO Management" />
          }
          description={
            <FormattedMessage
              id="customPlugin.page.description"
              defaultMessage="Manage your TODO items, track progress, and view statistics."
            />
          }
          rightSideItems={[
            <LanguageSelector key="language-selector" />,
            <EuiButton key="create-button" onClick={handleCreateClick} fill iconType="plusInCircle">
              <FormattedMessage
                id="customPlugin.actions.button.createTodo"
                defaultMessage="Create TODO"
              />
            </EuiButton>,
          ]}
        />
        <EuiPageContent>
          <EuiPageContentBody>
            <EuiTabbedContent
              tabs={tabs}
              selectedTab={tabs.find((tab) => tab.id === selectedTab)}
              onTabClick={(tab) => setSelectedTab(tab.id as 'table' | 'analytics')}
            />
          </EuiPageContentBody>
        </EuiPageContent>
      </EuiPageBody>
      {isFormOpen && (
        <TodoForm
          todo={todoToEdit}
          loading={createLoading || updateLoading}
          onSubmit={handleFormSubmit}
          onClose={handleFormClose}
          client={client}
        />
      )}
    </EuiPage>
  );
};
