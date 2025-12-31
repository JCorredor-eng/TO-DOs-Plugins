import React from 'react';
import {
  EuiPage,
  EuiPageBody,
  EuiPageContent,
  EuiPageContentBody,
  EuiPageHeader,
  EuiButton,
  EuiTabbedContent,
  EuiTabbedContentTab,
} from '@elastic/eui';
import { FormattedMessage } from '@osd/i18n/react';
import { HttpSetup, NotificationsStart } from '../../../../../src/core/public';
import { TodoForm } from './TodoForm';
import { TableTab } from './tabs/TableTab';
import { KanbanTab } from './tabs/KanbanTab';
import { AnalyticsTab } from './tabs/AnalyticsTab';
import { LanguageSelector } from '../../../components/language-selector';
import { useTodosPage } from '../hooks/use_todos_page';

interface TodosPageProps {
  http: HttpSetup;
  notifications: NotificationsStart;
  dateRange?: {
    from: string;
    to: string;
  };
}

export const TodosPage: React.FC<TodosPageProps> = ({ http, notifications, dateRange }) => {
  const { data, uiState, actions } = useTodosPage({ http, notifications, dateRange });

  const { todos, pagination, stats, analytics, client } = data;

  const {
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
  } = uiState;

  const {
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
  } = actions;
  const tabs: EuiTabbedContentTab[] = [
    {
      id: 'table',
      name: <FormattedMessage id="customPlugin.tabs.table" defaultMessage="Table View" />,
      content: (
        <TableTab
          todos={todos}
          pagination={pagination}
          loading={loading}
          error={error}
          sortField={sortField}
          sortDirection={sortDirection}
          filters={{
            searchText,
            selectedStatuses,
            selectedTags,
            selectedPriorities,
            selectedSeverities,
            showOverdueOnly,
            dateFilters,
          }}
          onCreateClick={handleCreateClick}
          onEdit={handleEditClick}
          onDelete={deleteTodo}
          onTableChange={handleTableChange}
          onFiltersChange={handleFiltersChange}
        />
      ),
    },
    {
      id: 'kanban',
      name: <FormattedMessage id="customPlugin.tabs.kanban" defaultMessage="Kanban Board" />,
      content: (
        <KanbanTab
          todos={todos}
          loading={loading}
          error={error}
          filters={{
            searchText,
            selectedStatuses,
            selectedTags,
            selectedPriorities,
            selectedSeverities,
            showOverdueOnly,
            dateFilters,
          }}
          onCreateClick={handleCreateClick}
          onStatusChange={async (todoId, status) => {
            await updateTodo(todoId, { status });
          }}
          onEdit={handleEditClick}
          onDelete={deleteTodo}
          onFiltersChange={handleFiltersChange}
        />
      ),
    },
    {
      id: 'analytics',
      name: <FormattedMessage id="customPlugin.tabs.analytics" defaultMessage="Analytics" />,
      content: (
        <AnalyticsTab
          stats={stats}
          statsLoading={statsLoading}
          statsError={statsError}
          analytics={analytics}
          analyticsLoading={analyticsLoading}
          analyticsError={analyticsError}
          onRefresh={refreshAnalytics}
          onFrameworkFilterChange={handleFrameworkFilterChange}
        />
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
              onTabClick={(tab) => setSelectedTab(tab.id as 'table' | 'analytics' | 'kanban')}
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
