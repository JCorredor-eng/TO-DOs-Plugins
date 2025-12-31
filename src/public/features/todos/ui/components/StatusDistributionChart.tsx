
import React from 'react';
import {
  EuiPanel,
  EuiTitle,
  EuiSpacer,
  EuiFlexGroup,
  EuiFlexItem,
  EuiBadge,
  EuiText,
} from '@elastic/eui';
import { FormattedMessage } from '@osd/i18n/react';
import { TODO_STATUS_LABELS } from '../../../../../common/todo/todo.types';
import { StatusDistributionItem } from '../../hooks/use_todos_stats_dashboard';
import { CHART_COLORS, CHART_SIZES } from '../../../../constants/theme';

/**
 * Props for StatusDistributionChart component
 */
export interface StatusDistributionChartProps {
  /** Array of status items with pre-computed percentages and colors */
  readonly items: readonly StatusDistributionItem[];
}

/**
 * StatusDistributionChart Component
 *
 * Displays status distribution with progress bars showing percentage completion.
 * Pure presentational component that receives pre-computed data via props.
 *
 * Following PROJECT RULE #11:
 * - Purely presentational (props in, JSX out)
 * - No business logic, percentage calculations, or color mapping
 * - All computations done in hook
 * - Uses theme constants for styling
 * - Uses EUI components for consistency
 *
 * @param props - Component props containing status distribution items
 * @returns React component rendering status distribution with progress bars
 */
export const StatusDistributionChart: React.FC<StatusDistributionChartProps> = ({ items }) => {
  return (
    <EuiPanel>
      <EuiTitle size="s">
        <h3>
          <FormattedMessage
            id="customPlugin.chart.title.statusDistribution"
            defaultMessage="Status Distribution"
          />
        </h3>
      </EuiTitle>
      <EuiSpacer size="m" />

      <EuiFlexGroup gutterSize="l" alignItems="center">
        {items.map((item) => (
          <EuiFlexItem key={item.status}>
            <EuiFlexGroup direction="column" gutterSize="xs" alignItems="center">
              <EuiFlexItem grow={false}>
                <EuiBadge color={TODO_STATUS_LABELS[item.status] === 'Done' ? 'success' : TODO_STATUS_LABELS[item.status] === 'Error' ? 'danger' : 'primary'}>
                  {TODO_STATUS_LABELS[item.status]}
                </EuiBadge>
              </EuiFlexItem>

              <EuiFlexItem grow={false}>
                <EuiText size="s">
                  <strong>{item.count}</strong> ({item.percentage}%)
                </EuiText>
              </EuiFlexItem>

              <EuiFlexItem grow={false}>
                <div
                  style={{
                    width: CHART_SIZES.progressBarWidth,
                    height: CHART_SIZES.progressBarHeight,
                    backgroundColor: CHART_COLORS.background,
                    borderRadius: CHART_SIZES.borderRadius,
                    overflow: 'hidden',
                  }}
                >
                  <div
                    style={{
                      width: `${item.percentage}%`,
                      height: '100%',
                      backgroundColor: item.color,
                    }}
                  />
                </div>
              </EuiFlexItem>
            </EuiFlexGroup>
          </EuiFlexItem>
        ))}
      </EuiFlexGroup>
    </EuiPanel>
  );
};
