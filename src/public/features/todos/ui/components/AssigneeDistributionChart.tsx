
import React from 'react';
import {
  EuiPanel,
  EuiTitle,
  EuiSpacer,
  EuiFlexGroup,
  EuiFlexItem,
  EuiBadge,
} from '@elastic/eui';
import { FormattedMessage } from '@osd/i18n/react';
import { AssigneeChartItem } from '../../hooks/use_todos_stats_dashboard';
import { CHART_COLORS } from '../../../../constants/theme';
import { HorizontalProgressBar } from './HorizontalProgressBar';

/**
 * Props for AssigneeDistributionChart component
 */
export interface AssigneeDistributionChartProps {
  /** Array of assignee items with pre-computed percentages */
  readonly assignees: readonly AssigneeChartItem[];
  /** Unassigned item with pre-computed percentage (null if no unassigned tasks) */
  readonly unassigned: AssigneeChartItem | null;
}

/**
 * AssigneeDistributionChart Component
 *
 * Displays assignee distribution as horizontal bar charts with percentages.
 * Includes both assigned and unassigned tasks.
 * Pure presentational component that receives pre-computed data via props.
 *
 * Following PROJECT RULE #11:
 * - Purely presentational (props in, JSX out)
 * - No business logic or percentage calculations
 * - All computations done in hook
 * - Uses theme constants for styling
 * - Uses EUI components for consistency
 *
 * @param props - Component props containing assignee chart items
 * @returns React component rendering assignee distribution bar chart
 */
export const AssigneeDistributionChart: React.FC<AssigneeDistributionChartProps> = ({
  assignees,
  unassigned,
}) => {
  // Don't render if no assignees and no unassigned tasks
  if (assignees.length === 0 && !unassigned) {
    return null;
  }

  return (
    <EuiPanel>
      <EuiTitle size="s">
        <h3>
          <FormattedMessage
            id="customPlugin.chart.title.assigneeDistribution"
            defaultMessage="Assignee Distribution"
          />
        </h3>
      </EuiTitle>
      <EuiSpacer size="m" />

      <EuiFlexGroup direction="column" gutterSize="s">
        {/* Assigned tasks */}
        {assignees.map((item) => (
          <EuiFlexItem key={item.assignee}>
            <EuiFlexGroup alignItems="center" gutterSize="m">
              <EuiFlexItem grow={false} style={{ minWidth: 150 }}>
                <EuiBadge color="primary">{item.assignee}</EuiBadge>
              </EuiFlexItem>

              <EuiFlexItem>
                <HorizontalProgressBar
                  percentage={item.percentage}
                  count={item.count}
                  barColor={CHART_COLORS.primary}
                />
              </EuiFlexItem>
            </EuiFlexGroup>
          </EuiFlexItem>
        ))}

        {/* Unassigned tasks */}
        {unassigned && (
          <EuiFlexItem>
            <EuiFlexGroup alignItems="center" gutterSize="m">
              <EuiFlexItem grow={false} style={{ minWidth: 150 }}>
                <EuiBadge color="default">
                  <FormattedMessage
                    id="customPlugin.chart.label.unassigned"
                    defaultMessage="Unassigned"
                  />
                </EuiBadge>
              </EuiFlexItem>

              <EuiFlexItem>
                <HorizontalProgressBar
                  percentage={unassigned.percentage}
                  count={unassigned.count}
                  barColor={CHART_COLORS.empty}
                />
              </EuiFlexItem>
            </EuiFlexGroup>
          </EuiFlexItem>
        )}
      </EuiFlexGroup>
    </EuiPanel>
  );
};
