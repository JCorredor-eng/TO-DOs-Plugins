import React from 'react';
import {
  EuiPanel,
  EuiTitle,
  EuiSpacer,
  EuiText,
  EuiToolTip,
  EuiFlexGroup,
  EuiFlexItem,
} from '@elastic/eui';
import { FormattedMessage } from '@osd/i18n/react';
import { i18n } from '@osd/i18n';
import {
  PrioritySeverityMatrixCell,
  TODO_PRIORITY_VALUES,
  TODO_PRIORITY_LABELS,
  TODO_SEVERITY_VALUES,
  TODO_SEVERITY_LABELS,
  TodoPriority,
  TodoSeverity,
} from '../../../../common/todo/todo.types';

interface PrioritySeverityHeatmapProps {
  readonly matrixData: readonly PrioritySeverityMatrixCell[];
}

const getHeatmapColor = (percentage: number): string => {
  if (percentage === 0) return '#F5F7FA'; // Empty
  if (percentage < 10) return '#D3DAE6'; // Very light
  if (percentage < 20) return '#98A2B3'; // Light
  if (percentage < 30) return '#69707D'; // Medium
  if (percentage < 50) return '#343741'; // Dark
  return '#1A1C21'; // Very dark
};

const getTextColor = (percentage: number): string => {
  return percentage >= 30 ? '#FFFFFF' : '#343741';
};

export const PrioritySeverityHeatmap: React.FC<PrioritySeverityHeatmapProps> = ({
  matrixData,
}) => {
  const matrixMap = new Map<string, PrioritySeverityMatrixCell>();
  for (const cell of matrixData) {
    const key = `${cell.priority}-${cell.severity}`;
    matrixMap.set(key, cell);
  }

  const getCellData = (priority: TodoPriority, severity: TodoSeverity) => {
    const key = `${priority}-${severity}`;
    const cellData = matrixMap.get(key);

    if (!cellData) {
      return { count: 0, percentage: 0 };
    }

    return {
      count: cellData.count,
      percentage: cellData.percentage,
    };
  };

  return (
    <EuiPanel>
      <EuiTitle size="s">
        <h3>
          <FormattedMessage
            id="customPlugin.compliance.title.priorityHeatmap"
            defaultMessage="Priority vs Severity Distribution"
          />
        </h3>
      </EuiTitle>
      <EuiSpacer size="m" />

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '500px' }}>
          <thead>
            <tr>
              <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #D3DAE6' }}>
                <EuiText size="s">
                  <strong>
                    <FormattedMessage
                      id="customPlugin.compliance.label.prioritySeverity"
                      defaultMessage="Priority / Severity"
                    />
                  </strong>
                </EuiText>
              </th>
              {TODO_SEVERITY_VALUES.map((severity) => (
                <th
                  key={severity}
                  style={{
                    padding: '12px',
                    textAlign: 'center',
                    borderBottom: '2px solid #D3DAE6',
                    minWidth: '80px',
                  }}
                >
                  <EuiText size="s">
                    <strong>{TODO_SEVERITY_LABELS[severity]}</strong>
                  </EuiText>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {TODO_PRIORITY_VALUES.map((priority) => (
              <tr key={priority}>
                <td
                  style={{
                    padding: '12px',
                    fontWeight: 'bold',
                    borderRight: '2px solid #D3DAE6',
                  }}
                >
                  <EuiText size="s">{TODO_PRIORITY_LABELS[priority]}</EuiText>
                </td>
                {TODO_SEVERITY_VALUES.map((severity) => {
                  const cellData = getCellData(priority, severity);
                  const bgColor = getHeatmapColor(cellData.percentage);
                  const textColor = getTextColor(cellData.percentage);

                  return (
                    <td
                      key={`${priority}-${severity}`}
                      style={{
                        padding: '16px',
                        textAlign: 'center',
                        backgroundColor: bgColor,
                        border: '1px solid #D3DAE6',
                        transition: 'all 0.2s ease',
                        cursor: 'default',
                      }}
                    >
                      <EuiToolTip
                        content={
                          <div>
                            <div>
                              {i18n.translate('customPlugin.compliance.tooltip.prioritySeverity', {
                                defaultMessage: '{priority} Priority - {severity} Severity',
                                values: {
                                  priority: TODO_PRIORITY_LABELS[priority],
                                  severity: TODO_SEVERITY_LABELS[severity],
                                },
                              })}
                            </div>
                            <div style={{ marginTop: '4px' }}>
                              {i18n.translate('customPlugin.compliance.tooltip.count', {
                                defaultMessage: 'Count: {count}',
                                values: { count: cellData.count },
                              })}
                            </div>
                            <div>
                              {i18n.translate('customPlugin.compliance.tooltip.percentage', {
                                defaultMessage: 'Percentage: {percentage}%',
                                values: { percentage: cellData.percentage.toFixed(1) },
                              })}
                            </div>
                          </div>
                        }
                      >
                        <EuiText size="s" style={{ color: textColor }}>
                          <strong>{cellData.count}</strong>
                        </EuiText>
                      </EuiToolTip>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <EuiSpacer size="m" />
      {/* Legend */}
      <EuiFlexGroup gutterSize="s" alignItems="center" responsive={false}>
        <EuiFlexItem grow={false}>
          <EuiText size="xs" color="subdued">
            <FormattedMessage
              id="customPlugin.compliance.label.colorIntensity"
              defaultMessage="Color intensity indicates task concentration"
            />
          </EuiText>
        </EuiFlexItem>
      </EuiFlexGroup>
    </EuiPanel>
  );
};
