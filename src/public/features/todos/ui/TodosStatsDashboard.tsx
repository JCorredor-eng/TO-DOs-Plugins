
import React from 'react';
import {
  EuiFlexGroup,
  EuiFlexItem,
  EuiPanel,
  EuiSpacer,
  EuiEmptyPrompt,
  EuiLoadingChart,
} from '@elastic/eui';
import { FormattedMessage } from '@osd/i18n/react';
import { TodoStats } from '../../../../common/todo/todo.types';
import { useTodosStatsDashboard } from '../hooks/use_todos_stats_dashboard';
import { StatsSummaryCards } from './components/StatsSummaryCards';
import { StatusDistributionChart } from './components/StatusDistributionChart';
import { TopTagsChart } from './components/TopTagsChart';
import { AssigneeDistributionChart } from './components/AssigneeDistributionChart';

/**
 * Props for TodosStatsDashboard component
 */
interface TodosStatsDashboardProps {
  stats: TodoStats | null;
  loading: boolean;
  error: Error | null;
}

/**
 * TodosStatsDashboard Component
 *
 * Container component for displaying TODO statistics and visualizations.
 * Uses custom hook for business logic and presentational components for rendering.
 *
 * Following PROJECT RULE #11:
 * - Container component that delegates to hook and presentational components
 * - Hook handles all business logic, data shaping, and calculations
 * - Child components are purely presentational
 * - Minimal logic - only handles loading, error, and empty states
 *
 * Architecture:
 * - useTodosStatsDashboard hook: Business logic + data transformations
 * - StatsSummaryCards: Summary stat cards (total, planned, in-progress, done, error)
 * - StatusDistributionChart: Status distribution with progress bars
 * - TopTagsChart: Top tags bar chart
 * - AssigneeDistributionChart: Assignee distribution + unassigned count
 *
 * @param props - Component props containing stats, loading, and error state
 * @returns React component rendering stats dashboard or loading/error/empty state
 */
export const TodosStatsDashboard: React.FC<TodosStatsDashboardProps> = ({
  stats,
  loading,
  error,
}) => {
  // Hook encapsulates all business logic and data transformations
  const { data, uiState, charts } = useTodosStatsDashboard({ stats, loading, error });

  // Loading state
  if (loading) {
    return (
      <EuiPanel>
        <EuiFlexGroup justifyContent="center" alignItems="center" style={{ minHeight: 400 }}>
          <EuiFlexItem grow={false}>
            <EuiLoadingChart size="xl" />
          </EuiFlexItem>
        </EuiFlexGroup>
      </EuiPanel>
    );
  }

  // Error state
  if (error) {
    return (
      <EuiPanel>
        <EuiEmptyPrompt
          iconType="alert"
          color="danger"
          title={
            <h2>
              <FormattedMessage
                id="customPlugin.error.loadingStatistics"
                defaultMessage="Failed to Load Statistics"
              />
            </h2>
          }
          body={<p>{error.message}</p>}
        />
      </EuiPanel>
    );
  }

  // Empty state
  if (!uiState.hasData) {
    return (
      <EuiPanel>
        <EuiEmptyPrompt
          iconType="visBarVerticalStacked"
          title={
            <h2>
              <FormattedMessage
                id="customPlugin.empty.noStatistics.title"
                defaultMessage="No Statistics Available"
              />
            </h2>
          }
          body={
            <p>
              <FormattedMessage
                id="customPlugin.empty.noStatistics.body"
                defaultMessage="Create some TODO items to see statistics."
              />
            </p>
          }
        />
      </EuiPanel>
    );
  }

  // Main dashboard view - all data pre-computed by hook
  return (
    <>
      {/* Summary stat cards */}
      <StatsSummaryCards
        total={data!.total}
        planned={data!.planned}
        in_progress={data!.in_progress}
        done={data!.done}
        error={data!.error}
      />

      <EuiSpacer size="l" />

      {/* Status distribution chart */}
      <StatusDistributionChart items={charts.statusDistribution} />

      {/* Top tags chart - only render if has tags */}
      {uiState.hasTags && (
        <>
          <EuiSpacer size="l" />
          <TopTagsChart items={charts.topTags} />
        </>
      )}

      {/* Assignee distribution chart - only render if has assignees or unassigned */}
      {uiState.hasAssignees && (
        <>
          <EuiSpacer size="l" />
          <AssigneeDistributionChart
            assignees={charts.assignees}
            unassigned={charts.unassignedItem}
          />
        </>
      )}
    </>
  );
};
