
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
import { TagChartItem } from '../../hooks/use_todos_stats_dashboard';
import { HorizontalProgressBar } from './HorizontalProgressBar';

/**
 * Props for TopTagsChart component
 */
export interface TopTagsChartProps {
  /** Array of tag items with pre-computed percentages */
  readonly items: readonly TagChartItem[];
}

/**
 * TopTagsChart Component
 *
 * Displays top tags as horizontal bar charts with percentages.
 * Pure presentational component that receives pre-computed data via props.
 *
 * Following PROJECT RULE #11:
 * - Purely presentational (props in, JSX out)
 * - No business logic or percentage calculations
 * - All computations done in hook
 * - Uses theme constants for styling
 * - Uses EUI components for consistency
 *
 * @param props - Component props containing tag chart items
 * @returns React component rendering top tags bar chart
 */
export const TopTagsChart: React.FC<TopTagsChartProps> = ({ items }) => {
  if (items.length === 0) {
    return null;
  }

  return (
    <EuiPanel>
      <EuiTitle size="s">
        <h3>
          <FormattedMessage id="customPlugin.chart.title.topTags" defaultMessage="Top Tags" />
        </h3>
      </EuiTitle>
      <EuiSpacer size="m" />

      <EuiFlexGroup direction="column" gutterSize="s">
        {items.map((item) => (
          <EuiFlexItem key={item.tag}>
            <EuiFlexGroup alignItems="center" gutterSize="m">
              <EuiFlexItem grow={false} style={{ minWidth: 120 }}>
                <EuiBadge color="hollow">{item.tag}</EuiBadge>
              </EuiFlexItem>

              <EuiFlexItem>
                <HorizontalProgressBar percentage={item.percentage} count={item.count} />
              </EuiFlexItem>
            </EuiFlexGroup>
          </EuiFlexItem>
        ))}
      </EuiFlexGroup>
    </EuiPanel>
  );
};
