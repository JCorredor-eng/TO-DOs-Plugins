import React from 'react';
import {
  EuiPanel,
  EuiTitle,
  EuiSpacer,
  EuiFlexGroup,
  EuiFlexItem,
  EuiProgress,
  EuiText,
  EuiBadge,
  EuiEmptyPrompt,
} from '@elastic/eui';
import { FormattedMessage } from '@osd/i18n/react';
import { i18n } from '@osd/i18n';
import { ComplianceCoverageStats } from '../../../../common/todo/todo.types';
import { TODO_STATUS_COLORS, TODO_STATUS_LABELS } from '../../../../common/todo/todo.types';

interface ComplianceFrameworkChartProps {
  readonly data: readonly ComplianceCoverageStats[];
}

const FrameworkRow: React.FC<{ framework: ComplianceCoverageStats }> = ({ framework }) => {
  const { framework: name, total, byStatus, completionRate } = framework;

  const plannedPercent = total > 0 ? (byStatus.planned / total) * 100 : 0;
  const donePercent = total > 0 ? (byStatus.done / total) * 100 : 0;
  const errorPercent = total > 0 ? (byStatus.error / total) * 100 : 0;

  return (
    <EuiPanel paddingSize="m" hasShadow={false} hasBorder>
      <EuiFlexGroup direction="column" gutterSize="s">
        {/* Framework name and completion rate */}
        <EuiFlexItem>
          <EuiFlexGroup justifyContent="spaceBetween" alignItems="center">
            <EuiFlexItem grow={false}>
              <EuiTitle size="xs">
                <h4>
                  {name || (
                    <FormattedMessage
                      id="customPlugin.compliance.label.noFramework"
                      defaultMessage="No Framework"
                    />
                  )}
                </h4>
              </EuiTitle>
            </EuiFlexItem>
            <EuiFlexItem grow={false}>
              <EuiBadge color={completionRate >= 80 ? 'success' : completionRate >= 50 ? 'warning' : 'danger'}>
                <FormattedMessage
                  id="customPlugin.compliance.label.complete"
                  defaultMessage="{rate}% Complete"
                  values={{ rate: completionRate.toFixed(0) }}
                />
              </EuiBadge>
            </EuiFlexItem>
          </EuiFlexGroup>
        </EuiFlexItem>

        {/* Progress bar */}
        <EuiFlexItem>
          <EuiProgress
            valueText={i18n.translate('customPlugin.compliance.label.totalTasksCount', {
              defaultMessage: '{count} total tasks',
              values: { count: total },
            })}
            max={100}
            color="success"
            size="l"
            label=""
            value={completionRate}
          />
        </EuiFlexItem>

        {/* Status breakdown */}
        <EuiFlexItem>
          <EuiFlexGroup gutterSize="m" alignItems="center" responsive={false}>
            <EuiFlexItem grow={false}>
              <EuiFlexGroup gutterSize="xs" alignItems="center" responsive={false}>
                <EuiFlexItem grow={false}>
                  <EuiBadge color={TODO_STATUS_COLORS.done}>
                    {TODO_STATUS_LABELS.done}: {byStatus.done}
                  </EuiBadge>
                </EuiFlexItem>
                <EuiFlexItem grow={false}>
                  <EuiText size="xs" color="subdued">
                    ({donePercent.toFixed(0)}%)
                  </EuiText>
                </EuiFlexItem>
              </EuiFlexGroup>
            </EuiFlexItem>

            <EuiFlexItem grow={false}>
              <EuiFlexGroup gutterSize="xs" alignItems="center" responsive={false}>
                <EuiFlexItem grow={false}>
                  <EuiBadge color={TODO_STATUS_COLORS.planned}>
                    {TODO_STATUS_LABELS.planned}: {byStatus.planned}
                  </EuiBadge>
                </EuiFlexItem>
                <EuiFlexItem grow={false}>
                  <EuiText size="xs" color="subdued">
                    ({plannedPercent.toFixed(0)}%)
                  </EuiText>
                </EuiFlexItem>
              </EuiFlexGroup>
            </EuiFlexItem>

            <EuiFlexItem grow={false}>
              <EuiFlexGroup gutterSize="xs" alignItems="center" responsive={false}>
                <EuiFlexItem grow={false}>
                  <EuiBadge color={TODO_STATUS_COLORS.error}>
                    {TODO_STATUS_LABELS.error}: {byStatus.error}
                  </EuiBadge>
                </EuiFlexItem>
                <EuiFlexItem grow={false}>
                  <EuiText size="xs" color="subdued">
                    ({errorPercent.toFixed(0)}%)
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

export const ComplianceFrameworkChart: React.FC<ComplianceFrameworkChartProps> = ({ data }) => {
  if (data.length === 0) {
    return (
      <EuiPanel>
        <EuiEmptyPrompt
          iconType="visBarVerticalStacked"
          title={
            <h3>
              <FormattedMessage
                id="customPlugin.empty.noFrameworkData.title"
                defaultMessage="No Framework Data"
              />
            </h3>
          }
          body={
            <p>
              <FormattedMessage
                id="customPlugin.empty.noFrameworkData.body"
                defaultMessage="No compliance frameworks have been assigned to tasks yet."
              />
            </p>
          }
        />
      </EuiPanel>
    );
  }

  return (
    <EuiPanel>
      <EuiTitle size="s">
        <h3>
          <FormattedMessage
            id="customPlugin.compliance.title.frameworkChart"
            defaultMessage="Task Status by Compliance Framework"
          />
        </h3>
      </EuiTitle>
      <EuiSpacer size="m" />
      <EuiFlexGroup direction="column" gutterSize="m">
        {data.map((framework) => (
          <EuiFlexItem key={framework.framework}>
            <FrameworkRow framework={framework} />
          </EuiFlexItem>
        ))}
      </EuiFlexGroup>
    </EuiPanel>
  );
};
