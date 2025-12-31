import React from 'react';
import {
  EuiFlexGroup,
  EuiFlexItem,
  EuiSelect,
  EuiFormRow,
  EuiSpacer,
  EuiLoadingChart,
  EuiCallOut,
  EuiEmptyPrompt,
  EuiButton,
  EuiPanel,
  EuiText,
} from '@elastic/eui';
import { FormattedMessage } from '@osd/i18n/react';
import { AnalyticsStats } from '../../../../common/todo/todo.types';
import { ComplianceFrameworkChart } from './ComplianceFrameworkChart';
import { OverdueTasksTable } from './OverdueTasksTable';
import { PrioritySeverityHeatmap } from './PrioritySeverityHeatmap';
import { HighCriticalTasksChart } from './HighCriticalTasksChart';
import { useComplianceDashboard } from '../hooks/use_compliance_dashboard';

interface ComplianceDashboardProps {
  readonly data: AnalyticsStats | null;
  readonly loading: boolean;
  readonly error: Error | null;
  readonly onRefresh: () => void;
  readonly onFrameworkChange?: (framework: string | undefined) => void;
}

export const ComplianceDashboard: React.FC<ComplianceDashboardProps> = ({
  data,
  loading,
  error,
  onRefresh,
  onFrameworkChange,
}) => {
  const { data: hookData, actions } = useComplianceDashboard({ data, onFrameworkChange });
  const { selectedFramework, frameworkOptions } = hookData;
  const { handleFrameworkChange } = actions;
  if (loading) {
    return (
      <EuiFlexGroup justifyContent="center" alignItems="center" style={{ minHeight: '400px' }}>
        <EuiFlexItem grow={false}>
          <EuiLoadingChart size="xl" />
        </EuiFlexItem>
      </EuiFlexGroup>
    );
  }
  if (error) {
    return (
      <EuiCallOut
        title={
          <FormattedMessage
            id="customPlugin.error.loadingAnalytics"
            defaultMessage="Error Loading Analytics"
          />
        }
        color="danger"
        iconType="alert"
      >
        <p>{error.message}</p>
        <EuiSpacer size="s" />
        <EuiButton color="danger" size="s" onClick={onRefresh}>
          <FormattedMessage id="customPlugin.actions.button.retry" defaultMessage="Retry" />
        </EuiButton>
      </EuiCallOut>
    );
  }
  if (!data) {
    return (
      <EuiEmptyPrompt
        iconType="visBarVertical"
        title={
          <h2>
            <FormattedMessage
              id="customPlugin.empty.noAnalytics.title"
              defaultMessage="No Analytics Data"
            />
          </h2>
        }
        body={
          <p>
            <FormattedMessage
              id="customPlugin.empty.noAnalytics.body"
              defaultMessage="Analytics data is not available. Please try refreshing."
            />
          </p>
        }
        actions={
          <EuiButton onClick={onRefresh} fill>
            <FormattedMessage id="customPlugin.actions.button.refresh" defaultMessage="Refresh" />
          </EuiButton>
        }
      />
    );
  }
  if (data.totalTasks === 0) {
    return (
      <EuiEmptyPrompt
        iconType="documents"
        title={
          <h2>
            <FormattedMessage
              id="customPlugin.empty.noTasks.title"
              defaultMessage="No Tasks Available"
            />
          </h2>
        }
        body={
          <p>
            <FormattedMessage
              id="customPlugin.empty.noTasks.body"
              defaultMessage="Create some TODO items to see compliance analytics."
            />
          </p>
        }
      />
    );
  }
  return (
    <>
      {}
      <EuiFlexGroup alignItems="flexEnd" gutterSize="m">
        <EuiFlexItem grow={false} style={{ minWidth: '300px' }}>
          <EuiFormRow
            label={
              <FormattedMessage
                id="customPlugin.compliance.label.filterFramework"
                defaultMessage="Filter by Compliance Framework"
              />
            }
            display="rowCompressed"
          >
            <EuiSelect
              options={frameworkOptions}
              value={selectedFramework}
              onChange={handleFrameworkChange}
              compressed
            />
          </EuiFormRow>
        </EuiFlexItem>
        <EuiFlexItem grow={false}>
          <EuiButton onClick={onRefresh} iconType="refresh" size="s">
            <FormattedMessage id="customPlugin.actions.button.refresh" defaultMessage="Refresh" />
          </EuiButton>
        </EuiFlexItem>
        <EuiFlexItem>
          <EuiPanel paddingSize="s" color="subdued">
            <EuiText size="s">
              <strong>
                <FormattedMessage
                  id="customPlugin.compliance.label.totalTasks"
                  defaultMessage="Total Tasks:"
                />
              </strong>{' '}
              {data.totalTasks} |{' '}
              <strong>
                <FormattedMessage
                  id="customPlugin.compliance.label.lastUpdated"
                  defaultMessage="Last Updated:"
                />
              </strong>{' '}
              {new Date(data.computedAt).toLocaleString()}
            </EuiText>
          </EuiPanel>
        </EuiFlexItem>
      </EuiFlexGroup>
      <EuiSpacer size="l" />
      {}
      <EuiFlexGroup direction="row" gutterSize="l" responsive>
        {}
        <EuiFlexItem>
          <ComplianceFrameworkChart data={data.complianceCoverage} />
        </EuiFlexItem>
        {}
        <EuiFlexItem>
          <OverdueTasksTable data={data.overdueTasks} />
        </EuiFlexItem>
      </EuiFlexGroup>
      <EuiSpacer size="l" />
      <EuiFlexGroup direction="row" gutterSize="l" responsive>
        {}
        <EuiFlexItem>
          <PrioritySeverityHeatmap
            matrixData={data.prioritySeverityMatrix}
          />
        </EuiFlexItem>
        {}
        <EuiFlexItem>
          <HighCriticalTasksChart data={data.priorityDistribution} />
        </EuiFlexItem>
      </EuiFlexGroup>
    </>
  );
};
