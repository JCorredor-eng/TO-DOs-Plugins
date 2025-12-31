import React from 'react';
import {
  EuiFlexGroup,
  EuiFlexItem,
  EuiPanel,
  EuiTitle,
  EuiSpacer,
  EuiStat,
  EuiText,
  EuiBadge,
  EuiEmptyPrompt,
  EuiLoadingChart,
} from '@elastic/eui';
import { FormattedMessage } from '@osd/i18n/react';
import { i18n } from '@osd/i18n';
import { TodoStats, TODO_STATUS_LABELS, TODO_STATUS_COLORS } from '../../../../common/todo/todo.types';
interface TodosStatsDashboardProps {
  stats: TodoStats | null;
  loading: boolean;
  error: Error | null;
}
export const TodosStatsDashboard: React.FC<TodosStatsDashboardProps> = ({ stats, loading, error }) => {
  if (loading) {
    return (
      <EuiPanel>
        <EuiFlexGroup justifyContent="center" alignItems="center" style={{ minHeight: 400 }}>
          <EuiFlexItem grow={false}>
            <EuiLoadingChart size="xl" />
          </EuiFlexItem>
        </EuiFlexGroup>
      </EuiPanel>
    );
  }
  if (error) {
    return (
      <EuiPanel>
        <EuiEmptyPrompt
          iconType="alert"
          color="danger"
          title={
            <h2>
              <FormattedMessage
                id="customPlugin.error.loadingStatistics"
                defaultMessage="Failed to Load Statistics"
              />
            </h2>
          }
          body={<p>{error.message}</p>}
        />
      </EuiPanel>
    );
  }
  if (!stats || stats.total === 0) {
    return (
      <EuiPanel>
        <EuiEmptyPrompt
          iconType="visBarVerticalStacked"
          title={
            <h2>
              <FormattedMessage
                id="customPlugin.empty.noStatistics.title"
                defaultMessage="No Statistics Available"
              />
            </h2>
          }
          body={
            <p>
              <FormattedMessage
                id="customPlugin.empty.noStatistics.body"
                defaultMessage="Create some TODO items to see statistics."
              />
            </p>
          }
        />
      </EuiPanel>
    );
  }
  const { total, byStatus, topTags, topAssignees, unassignedCount } = stats;
  return (
    <>
      {}
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
              title={byStatus.planned.toString()}
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
              title={byStatus.done.toString()}
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
              title={byStatus.error.toString()}
              description={i18n.translate('customPlugin.chart.label.error', {
                defaultMessage: 'Error',
              })}
              titleColor={TODO_STATUS_COLORS.error}
              textAlign="center"
            />
          </EuiPanel>
        </EuiFlexItem>
      </EuiFlexGroup>
      <EuiSpacer size="l" />
      {}
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
          {Object.entries(byStatus).map(([status, count]) => {
            const percentage = total > 0 ? Math.round((count / total) * 100) : 0;
            return (
              <EuiFlexItem key={status}>
                <EuiFlexGroup direction="column" gutterSize="xs" alignItems="center">
                  <EuiFlexItem grow={false}>
                    <EuiBadge color={TODO_STATUS_COLORS[status as keyof typeof byStatus]}>
                      {TODO_STATUS_LABELS[status as keyof typeof byStatus]}
                    </EuiBadge>
                  </EuiFlexItem>
                  <EuiFlexItem grow={false}>
                    <EuiText size="s">
                      <strong>{count}</strong> ({percentage}%)
                    </EuiText>
                  </EuiFlexItem>
                  <EuiFlexItem grow={false}>
                    <div
                      style={{
                        width: 100,
                        height: 8,
                        backgroundColor: '#e0e0e0',
                        borderRadius: 4,
                        overflow: 'hidden',
                      }}
                    >
                      <div
                        style={{
                          width: `${percentage}%`,
                          height: '100%',
                          backgroundColor:
                            TODO_STATUS_COLORS[status as keyof typeof byStatus] === 'success'
                              ? '#00BFB3'
                              : TODO_STATUS_COLORS[status as keyof typeof byStatus] === 'danger'
                              ? '#BD271E'
                              : '#006BB4',
                        }}
                      />
                    </div>
                  </EuiFlexItem>
                </EuiFlexGroup>
              </EuiFlexItem>
            );
          })}
        </EuiFlexGroup>
      </EuiPanel>
      {}
      {topTags && topTags.length > 0 && (
        <>
          <EuiSpacer size="l" />
          <EuiPanel>
            <EuiTitle size="s">
              <h3>
                <FormattedMessage
                  id="customPlugin.chart.title.topTags"
                  defaultMessage="Top Tags"
                />
              </h3>
            </EuiTitle>
            <EuiSpacer size="m" />
            <EuiFlexGroup direction="column" gutterSize="s">
              {topTags.map((tagCount) => {
                const percentage = total > 0 ? Math.round((tagCount.count / total) * 100) : 0;
                return (
                  <EuiFlexItem key={tagCount.tag}>
                    <EuiFlexGroup alignItems="center" gutterSize="m">
                      <EuiFlexItem grow={false} style={{ minWidth: 120 }}>
                        <EuiBadge color="hollow">{tagCount.tag}</EuiBadge>
                      </EuiFlexItem>
                      <EuiFlexItem>
                        <div
                          style={{
                            width: '100%',
                            height: 24,
                            backgroundColor: '#e0e0e0',
                            borderRadius: 4,
                            overflow: 'hidden',
                            position: 'relative',
                          }}
                        >
                          <div
                            style={{
                              width: `${percentage}%`,
                              height: '100%',
                              backgroundColor: '#006BB4',
                            }}
                          />
                          <div
                            style={{
                              position: 'absolute',
                              top: 0,
                              left: 8,
                              lineHeight: '24px',
                              fontSize: '12px',
                              fontWeight: 600,
                              color: percentage > 50 ? '#fff' : '#000',
                            }}
                          >
                            {tagCount.count} ({percentage}%)
                          </div>
                        </div>
                      </EuiFlexItem>
                    </EuiFlexGroup>
                  </EuiFlexItem>
                );
              })}
            </EuiFlexGroup>
          </EuiPanel>
        </>
      )}

      {}
      {(topAssignees.length > 0 || unassignedCount > 0) && (
        <>
          <EuiSpacer size="l" />
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
              {}
              {topAssignees.map((assigneeCount) => {
                const percentage = total > 0 ? Math.round((assigneeCount.count / total) * 100) : 0;
                return (
                  <EuiFlexItem key={assigneeCount.assignee}>
                    <EuiFlexGroup alignItems="center" gutterSize="m">
                      <EuiFlexItem grow={false} style={{ minWidth: 150 }}>
                        <EuiBadge color="primary">{assigneeCount.assignee}</EuiBadge>
                      </EuiFlexItem>
                      <EuiFlexItem>
                        <div
                          style={{
                            width: '100%',
                            height: 24,
                            backgroundColor: '#e0e0e0',
                            borderRadius: 4,
                            overflow: 'hidden',
                            position: 'relative',
                          }}
                        >
                          <div
                            style={{
                              width: `${percentage}%`,
                              height: '100%',
                              backgroundColor: '#006BB4',
                            }}
                          />
                          <div
                            style={{
                              position: 'absolute',
                              top: 0,
                              left: 8,
                              lineHeight: '24px',
                              fontSize: '12px',
                              fontWeight: 600,
                              color: percentage > 50 ? '#fff' : '#000',
                            }}
                          >
                            {assigneeCount.count} ({percentage}%)
                          </div>
                        </div>
                      </EuiFlexItem>
                    </EuiFlexGroup>
                  </EuiFlexItem>
                );
              })}

              {}
              {unassignedCount > 0 && (
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
                      <div
                        style={{
                          width: '100%',
                          height: 24,
                          backgroundColor: '#e0e0e0',
                          borderRadius: 4,
                          overflow: 'hidden',
                          position: 'relative',
                        }}
                      >
                        <div
                          style={{
                            width: `${total > 0 ? Math.round((unassignedCount / total) * 100) : 0}%`,
                            height: '100%',
                            backgroundColor: '#98A2B3',
                          }}
                        />
                        <div
                          style={{
                            position: 'absolute',
                            top: 0,
                            left: 8,
                            lineHeight: '24px',
                            fontSize: '12px',
                            fontWeight: 600,
                            color: total > 0 && Math.round((unassignedCount / total) * 100) > 50 ? '#fff' : '#000',
                          }}
                        >
                          {unassignedCount} ({total > 0 ? Math.round((unassignedCount / total) * 100) : 0}%)
                        </div>
                      </div>
                    </EuiFlexItem>
                  </EuiFlexGroup>
                </EuiFlexItem>
              )}
            </EuiFlexGroup>
          </EuiPanel>
        </>
      )}
    </>
  );
};
