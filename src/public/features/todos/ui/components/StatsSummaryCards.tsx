
import React from 'react';
import { EuiFlexGroup, EuiFlexItem, EuiPanel, EuiStat } from '@elastic/eui';
import { i18n } from '@osd/i18n';
import { TODO_STATUS_COLORS } from '../../../../../common/todo/todo.types';

/**
 * Props for StatsSummaryCards component
 */
export interface StatsSummaryCardsProps {
  /** Total number of TODOs */
  readonly total: number;
  /** Number of planned TODOs */
  readonly planned: number;
  /** Number of in-progress TODOs */
  readonly in_progress: number;
  /** Number of done TODOs */
  readonly done: number;
  /** Number of error TODOs */
  readonly error: number;
}

/**
 * StatsSummaryCards Component
 *
 * Displays five summary stat cards showing total, planned, in-progress, done, and error counts.
 * Pure presentational component that receives pre-computed data via props.
 *
 * Following PROJECT RULE #11:
 * - Purely presentational (props in, JSX out)
 * - No business logic or data transformations
 * - No useEffect or non-trivial useState
 * - Uses EUI components for consistency
 *
 * @param props - Component props containing stat counts
 * @returns React component rendering five stat cards
 */
export const StatsSummaryCards: React.FC<StatsSummaryCardsProps> = ({
  total,
  planned,
  in_progress,
  done,
  error,
}) => {
  return (
    <EuiFlexGroup>
      <EuiFlexItem>
        <EuiPanel>
          <EuiStat
            title={total.toString()}
            description={i18n.translate('customPlugin.chart.title.totalTodos', {
              defaultMessage: 'Total TODOs',
            })}
            titleColor="primary"
            textAlign="center"
          />
        </EuiPanel>
      </EuiFlexItem>

      <EuiFlexItem>
        <EuiPanel>
          <EuiStat
            title={planned.toString()}
            description={i18n.translate('customPlugin.chart.label.planned', {
              defaultMessage: 'Planned',
            })}
            titleColor={TODO_STATUS_COLORS.planned}
            textAlign="center"
          />
        </EuiPanel>
      </EuiFlexItem>

      <EuiFlexItem>
        <EuiPanel>
          <EuiStat
            title={in_progress.toString()}
            description={i18n.translate('customPlugin.chart.label.inProgress', {
              defaultMessage: 'In Progress',
            })}
            titleColor={TODO_STATUS_COLORS.in_progress}
            textAlign="center"
          />
        </EuiPanel>
      </EuiFlexItem>

      <EuiFlexItem>
        <EuiPanel>
          <EuiStat
            title={done.toString()}
            description={i18n.translate('customPlugin.chart.label.done', {
              defaultMessage: 'Done',
            })}
            titleColor={TODO_STATUS_COLORS.done}
            textAlign="center"
          />
        </EuiPanel>
      </EuiFlexItem>

      <EuiFlexItem>
        <EuiPanel>
          <EuiStat
            title={error.toString()}
            description={i18n.translate('customPlugin.chart.label.error', {
              defaultMessage: 'Error',
            })}
            titleColor={TODO_STATUS_COLORS.error}
            textAlign="center"
          />
        </EuiPanel>
      </EuiFlexItem>
    </EuiFlexGroup>
  );
};
