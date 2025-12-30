import React, { useState, useMemo } from 'react';
import {
  EuiPanel,
  EuiTitle,
  EuiSpacer,
  EuiBasicTable,
  EuiBasicTableColumn,
  EuiBadge,
  EuiEmptyPrompt,
  EuiText,
  Criteria,
  Direction,
} from '@elastic/eui';
import { FormattedMessage } from '@osd/i18n/react';
import { i18n } from '@osd/i18n';
import { OverdueTaskStats } from '../../../../common/todo/todo.types';
import {
  TODO_PRIORITY_COLORS,
  TODO_PRIORITY_LABELS,
  TODO_SEVERITY_COLORS,
  TODO_SEVERITY_LABELS,
  TODO_STATUS_COLORS,
  TODO_STATUS_LABELS,
  TodoPriority,
  TodoSeverity,
} from '../../../../common/todo/todo.types';

interface OverdueTasksTableProps {
  readonly data: OverdueTaskStats;
}

interface OverdueTableRow {
  readonly category: string;
  readonly priority: {
    readonly low: number;
    readonly medium: number;
    readonly high: number;
    readonly critical: number;
  };
  readonly severity: {
    readonly info: number;
    readonly low: number;
    readonly medium: number;
    readonly high: number;
    readonly critical: number;
  };
}

export const OverdueTasksTable: React.FC<OverdueTasksTableProps> = ({ data }) => {
  const [sortField, setSortField] = useState<string>('category');
  const [sortDirection, setSortDirection] = useState<Direction>('asc');

  const tableData: OverdueTableRow[] = useMemo(() => {
    return [
      {
        category: i18n.translate('customPlugin.compliance.label.overdueCategory', {
          defaultMessage: 'Overdue Tasks',
        }),
        priority: data.byPriority,
        severity: data.bySeverity,
      },
    ];
  }, [data]);

  const onTableChange = ({ sort }: Criteria<OverdueTableRow>) => {
    if (sort) {
      setSortField(sort.field);
      setSortDirection(sort.direction);
    }
  };

  const columns: Array<EuiBasicTableColumn<OverdueTableRow>> = [
    {
      field: 'category',
      name: i18n.translate('customPlugin.table.column.category', { defaultMessage: 'Category' }),
      width: '150px',
      render: (category: string) => (
        <EuiText size="s">
          <strong>{category}</strong>
        </EuiText>
      ),
    },
    {
      name: i18n.translate('customPlugin.table.column.byPriority', { defaultMessage: 'By Priority' }),
      render: (row: OverdueTableRow) => (
        <EuiPanel paddingSize="s" hasShadow={false} hasBorder={false} color="transparent">
          <EuiText size="xs">
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {Object.entries(row.priority).map(([priority, count]) => (
                <EuiBadge key={priority} color={TODO_PRIORITY_COLORS[priority as TodoPriority]}>
                  {TODO_PRIORITY_LABELS[priority as TodoPriority]}: {count}
                </EuiBadge>
              ))}
            </div>
          </EuiText>
        </EuiPanel>
      ),
    },
    {
      name: i18n.translate('customPlugin.table.column.bySeverity', { defaultMessage: 'By Severity' }),
      render: (row: OverdueTableRow) => (
        <EuiPanel paddingSize="s" hasShadow={false} hasBorder={false} color="transparent">
          <EuiText size="xs">
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {Object.entries(row.severity).map(([severity, count]) => (
                <EuiBadge key={severity} color={TODO_SEVERITY_COLORS[severity as TodoSeverity]}>
                  {TODO_SEVERITY_LABELS[severity as TodoSeverity]}: {count}
                </EuiBadge>
              ))}
            </div>
          </EuiText>
        </EuiPanel>
      ),
    },
  ];

  if (data.total === 0) {
    return (
      <EuiPanel>
        <EuiEmptyPrompt
          iconType="check"
          title={
            <h3>
              <FormattedMessage
                id="customPlugin.empty.noOverdueTasks.title"
                defaultMessage="No Overdue Tasks"
              />
            </h3>
          }
          body={
            <p>
              <FormattedMessage
                id="customPlugin.empty.noOverdueTasks.body"
                defaultMessage="Great job! All tasks with due dates are on track."
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
            id="customPlugin.compliance.title.overdueTable"
            defaultMessage="Overdue Tasks Summary"
          />
        </h3>
      </EuiTitle>
      <EuiSpacer size="s" />
      <EuiText size="s" color="subdued">
        <p>
          <EuiBadge color="danger">{data.total}</EuiBadge>{' '}
          <FormattedMessage
            id="customPlugin.compliance.label.overdueTasks"
            defaultMessage="{count} tasks are overdue (past due date and not completed)"
            values={{ count: '' }}
          />
        </p>
      </EuiText>
      <EuiSpacer size="m" />
      <EuiBasicTable
        items={tableData}
        columns={columns}
        sorting={{
          sort: {
            field: sortField,
            direction: sortDirection,
          },
        }}
        onChange={onTableChange}
        compressed
      />
    </EuiPanel>
  );
};
