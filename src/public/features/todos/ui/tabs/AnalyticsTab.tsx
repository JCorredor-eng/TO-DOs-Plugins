import React from 'react';
import { EuiSpacer, EuiTitle, EuiText } from '@elastic/eui';
import { FormattedMessage } from '@osd/i18n/react';
import { TodoStats, AnalyticsStats } from '../../../../../common/todo/todo.types';
import { TodosStatsDashboard } from '../TodosStatsDashboard';
import { ComplianceDashboard } from '../ComplianceDashboard';

/**
 * Props for AnalyticsTab component
 */
export interface AnalyticsTabProps {
  /** TODO statistics data */
  readonly stats: TodoStats | null;
  /** Stats loading state */
  readonly statsLoading: boolean;
  /** Stats error state */
  readonly statsError: Error | null;
  /** Analytics data */
  readonly analytics: AnalyticsStats | null;
  /** Analytics loading state */
  readonly analyticsLoading: boolean;
  /** Analytics error state */
  readonly analyticsError: Error | null;
  /** Callback to refresh analytics */
  readonly onRefresh: () => Promise<void>;
  /** Callback when framework filter changes */
  readonly onFrameworkFilterChange: (frameworks: string[]) => void;
}

/**
 * AnalyticsTab Component
 *
 * Displays analytics dashboard with general statistics and compliance analytics.
 *
 * @param props - Component props
 * @returns React component rendering the analytics tab content
 */
export const AnalyticsTab: React.FC<AnalyticsTabProps> = ({
  stats,
  statsLoading,
  statsError,
  analytics,
  analyticsLoading,
  analyticsError,
  onRefresh,
  onFrameworkFilterChange,
}) => {
  return (
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
          onRefresh={onRefresh}
          onFrameworkChange={onFrameworkFilterChange}
        />
      </div>

      <EuiSpacer size="l" />
    </>
  );
};
