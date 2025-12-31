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
  EuiSpacer,
  EuiEmptyPrompt,
  EuiCallOut,
  EuiText,
  EuiTitle,
} from '@elastic/eui';
import { FormattedMessage } from '@osd/i18n/react';
import { HttpSetup, NotificationsStart } from '../../../../../src/core/public';
import { TodosTable } from './TodosTable';
import { TodosStatsDashboard } from './TodosStatsDashboard';
import { TodoForm } from './TodoForm';
import { TodoFilters } from './TodoFilters';
import { ComplianceDashboard } from './ComplianceDashboard';
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
    deleteTodo,
    refreshAnalytics,
    handleFrameworkFilterChange,
  } = actions;
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
            dateFilters={dateFilters}
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
