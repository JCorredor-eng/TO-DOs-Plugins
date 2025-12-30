import React from 'react';
import {
  EuiPanel,
  EuiTitle,
  EuiSpacer,
  EuiFlexGroup,
  EuiFlexItem,
  EuiText,
  EuiBadge,
  EuiProgress,
  EuiEmptyPrompt,
} from '@elastic/eui';
import { FormattedMessage } from '@osd/i18n/react';
import { DistributionStats } from '../../../../common/todo/todo.types';
import { TODO_PRIORITY_COLORS, TODO_PRIORITY_LABELS } from '../../../../common/todo/todo.types';
interface HighCriticalTasksChartProps {
  readonly data: readonly DistributionStats[];
}
export const HighCriticalTasksChart: React.FC<HighCriticalTasksChartProps> = ({ data }) => {
  const highPriorityData = data.find(d => d.label === 'high');
  const criticalPriorityData = data.find(d => d.label === 'critical');
  const highCount = highPriorityData?.count || 0;
  const criticalCount = criticalPriorityData?.count || 0;
  const totalHighCritical = highCount + criticalCount;
  const highPercentage = highPriorityData?.percentage || 0;
  const criticalPercentage = criticalPriorityData?.percentage || 0;
  const highOfTotal = totalHighCritical > 0 ? (highCount / totalHighCritical) * 100 : 0;
  const criticalOfTotal = totalHighCritical > 0 ? (criticalCount / totalHighCritical) * 100 : 0;
  if (totalHighCritical === 0) {
    return (
      <EuiPanel>
        <EuiEmptyPrompt
          iconType="check"
          title={
            <h3>
              <FormattedMessage
                id="customPlugin.empty.noHighCriticalTasks.title"
                defaultMessage="No High or Critical Tasks"
              />
            </h3>
          }
          body={
            <p>
              <FormattedMessage
                id="customPlugin.empty.noHighCriticalTasks.body"
                defaultMessage="There are currently no high or critical priority tasks."
              />
            </p>
          }
          titleSize="s"
        />
      </EuiPanel>
    );
  }
  return (
    <EuiPanel>
      <EuiTitle size="s">
        <h3>
          <FormattedMessage
            id="customPlugin.compliance.title.highCriticalChart"
            defaultMessage="High & Critical Priority Tasks"
          />
        </h3>
      </EuiTitle>
      <EuiSpacer size="m" />
      {}
      <EuiFlexGroup gutterSize="s" alignItems="center">
        <EuiFlexItem grow={false}>
          <EuiText size="s" color="subdued">
            <FormattedMessage
              id="customPlugin.compliance.label.totalHighCritical"
              defaultMessage="Total High & Critical:"
            />
          </EuiText>
        </EuiFlexItem>
        <EuiFlexItem grow={false}>
          <EuiBadge color="danger">
            <strong>{totalHighCritical}</strong>
          </EuiBadge>
        </EuiFlexItem>
      </EuiFlexGroup>
      <EuiSpacer size="m" />
      {}
      <div style={{ position: 'relative' }}>
        <div
          style={{
            display: 'flex',
            height: '40px',
            borderRadius: '6px',
            overflow: 'hidden',
            border: '1px solid #D3DAE6',
          }}
        >
          {}
          {highCount > 0 && (
            <div
              style={{
                width: `${highOfTotal}%`,
                backgroundColor: '#FEC514', 
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.3s ease',
              }}
              title={`High: ${highCount} tasks (${highOfTotal.toFixed(1)}%)`}
            >
              {highOfTotal > 15 && (
                <EuiText size="s" style={{ color: '#343741', fontWeight: 'bold' }}>
                  {highCount}
                </EuiText>
              )}
            </div>
          )}
          {}
          {criticalCount > 0 && (
            <div
              style={{
                width: `${criticalOfTotal}%`,
                backgroundColor: '#BD271E', 
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.3s ease',
              }}
              title={`Critical: ${criticalCount} tasks (${criticalOfTotal.toFixed(1)}%)`}
            >
              {criticalOfTotal > 15 && (
                <EuiText size="s" style={{ color: '#FFFFFF', fontWeight: 'bold' }}>
                  {criticalCount}
                </EuiText>
              )}
            </div>
          )}
        </div>
      </div>
      <EuiSpacer size="m" />
      {}
      <EuiFlexGroup gutterSize="m" direction="column">
        {}
        <EuiFlexItem>
          <EuiFlexGroup justifyContent="spaceBetween" alignItems="center" gutterSize="s">
            <EuiFlexItem grow={false}>
              <EuiFlexGroup gutterSize="s" alignItems="center" responsive={false}>
                <EuiFlexItem grow={false}>
                  <div
                    style={{
                      width: '16px',
                      height: '16px',
                      backgroundColor: '#FEC514',
                      borderRadius: '3px',
                      border: '1px solid #D3DAE6',
                    }}
                  />
                </EuiFlexItem>
                <EuiFlexItem grow={false}>
                  <EuiText size="s">
                    <strong>{TODO_PRIORITY_LABELS.high}</strong>
                  </EuiText>
                </EuiFlexItem>
              </EuiFlexGroup>
            </EuiFlexItem>
            <EuiFlexItem grow={false}>
              <EuiFlexGroup gutterSize="s" alignItems="center" responsive={false}>
                <EuiFlexItem grow={false}>
                  <EuiBadge color={TODO_PRIORITY_COLORS.high}>
                    <FormattedMessage
                      id="customPlugin.compliance.label.tasksCount"
                      defaultMessage="{count} tasks"
                      values={{ count: highCount }}
                    />
                  </EuiBadge>
                </EuiFlexItem>
                <EuiFlexItem grow={false}>
                  <EuiText size="xs" color="subdued">
                    <FormattedMessage
                      id="customPlugin.compliance.label.ofAllTasks"
                      defaultMessage="({percentage}% of all tasks)"
                      values={{ percentage: highPercentage.toFixed(1) }}
                    />
                  </EuiText>
                </EuiFlexItem>
              </EuiFlexGroup>
            </EuiFlexItem>
          </EuiFlexGroup>
        </EuiFlexItem>
        {}
        <EuiFlexItem>
          <EuiFlexGroup justifyContent="spaceBetween" alignItems="center" gutterSize="s">
            <EuiFlexItem grow={false}>
              <EuiFlexGroup gutterSize="s" alignItems="center" responsive={false}>
                <EuiFlexItem grow={false}>
                  <div
                    style={{
                      width: '16px',
                      height: '16px',
                      backgroundColor: '#BD271E',
                      borderRadius: '3px',
                      border: '1px solid #D3DAE6',
                    }}
                  />
                </EuiFlexItem>
                <EuiFlexItem grow={false}>
                  <EuiText size="s">
                    <strong>{TODO_PRIORITY_LABELS.critical}</strong>
                  </EuiText>
                </EuiFlexItem>
              </EuiFlexGroup>
            </EuiFlexItem>
            <EuiFlexItem grow={false}>
              <EuiFlexGroup gutterSize="s" alignItems="center" responsive={false}>
                <EuiFlexItem grow={false}>
                  <EuiBadge color={TODO_PRIORITY_COLORS.critical}>
                    <FormattedMessage
                      id="customPlugin.compliance.label.tasksCount"
                      defaultMessage="{count} tasks"
                      values={{ count: criticalCount }}
                    />
                  </EuiBadge>
                </EuiFlexItem>
                <EuiFlexItem grow={false}>
                  <EuiText size="xs" color="subdued">
                    <FormattedMessage
                      id="customPlugin.compliance.label.ofAllTasks"
                      defaultMessage="({percentage}% of all tasks)"
                      values={{ percentage: criticalPercentage.toFixed(1) }}
                    />
                  </EuiText>
                </EuiFlexItem>
              </EuiFlexGroup>
            </EuiFlexItem>
          </EuiFlexGroup>
        </EuiFlexItem>
      </EuiFlexGroup>
    </EuiPanel>
  );
};
