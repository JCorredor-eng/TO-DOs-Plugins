
import { useMemo } from 'react';
import { TodoStats, TodoStatus, TODO_STATUS_COLORS } from '../../../../common/todo/todo.types';
import { mapStatusColorToHex } from '../../../constants/theme';

/**
 * Represents a status item with calculated percentage and color
 */
export interface StatusDistributionItem {
  readonly status: TodoStatus;
  readonly count: number;
  readonly percentage: number;
  readonly color: string;
}

/**
 * Represents a tag with calculated percentage
 */
export interface TagChartItem {
  readonly tag: string;
  readonly count: number;
  readonly percentage: number;
}

/**
 * Represents an assignee with calculated percentage
 */
export interface AssigneeChartItem {
  readonly assignee: string;
  readonly count: number;
  readonly percentage: number;
}

/**
 * UI state for the stats dashboard
 */
export interface StatsUIState {
  readonly hasData: boolean;
  readonly hasTags: boolean;
  readonly hasAssignees: boolean;
}

/**
 * Chart data ready for rendering
 */
export interface StatsChartData {
  readonly statusDistribution: readonly StatusDistributionItem[];
  readonly topTags: readonly TagChartItem[];
  readonly assignees: readonly AssigneeChartItem[];
  readonly unassignedItem: AssigneeChartItem | null;
}

/**
 * Props for useTodosStatsDashboard hook
 */
export interface UseTodosStatsDashboardOptions {
  stats: TodoStats | null;
  loading: boolean;
  error: Error | null;
}

/**
 * Return type for useTodosStatsDashboard hook
 */
export interface UseTodosStatsDashboardReturn {
  /** Raw stats data */
  data: {
    total: number;
    planned: number;
    in_progress: number;
    done: number;
    error: number;
  } | null;
  /** UI state flags */
  uiState: StatsUIState;
  /** Pre-computed chart data with percentages and colors */
  charts: StatsChartData;
}

/**
 * Custom hook for TodosStatsDashboard component.
 * Encapsulates all business logic, data transformation, and percentage calculations.
 *
 * Following PROJECT RULE #11:
 * - All business logic (percentage calculations, color mapping) is in the hook
 * - All computed values are memoized to avoid re-computation on every render
 * - Returns UI-friendly contract: { data, uiState, charts }
 *
 * @param options - Hook options containing stats, loading, and error state
 * @returns UI-friendly data contract with pre-computed values
 */
export const useTodosStatsDashboard = ({
  stats,
  loading,
  error,
}: UseTodosStatsDashboardOptions): UseTodosStatsDashboardReturn => {
  /**
   * Extract summary statistics
   */
  const data = useMemo(() => {
    if (!stats || stats.total === 0) {
      return null;
    }

    return {
      total: stats.total,
      planned: stats.byStatus.planned,
      in_progress: stats.byStatus.in_progress,
      done: stats.byStatus.done,
      error: stats.byStatus.error,
    };
  }, [stats]);

  /**
   * Calculate UI state flags
   */
  const uiState = useMemo<StatsUIState>(() => {
    const hasData = !loading && !error && stats !== null && stats.total > 0;
    const hasTags = hasData && stats!.topTags.length > 0;
    const hasAssignees = hasData && (stats!.topAssignees.length > 0 || stats!.unassignedCount > 0);

    return {
      hasData,
      hasTags,
      hasAssignees,
    };
  }, [loading, error, stats]);

  /**
   * Calculate status distribution with percentages and colors
   */
  const statusDistribution = useMemo<readonly StatusDistributionItem[]>(() => {
    if (!stats || stats.total === 0) {
      return [];
    }

    const total = stats.total;

    return (Object.keys(stats.byStatus) as TodoStatus[]).map((status) => {
      const count = stats.byStatus[status];
      const percentage = total > 0 ? Math.round((count / total) * 100) : 0;
      const colorName = TODO_STATUS_COLORS[status];
      const color = mapStatusColorToHex(colorName);

      return {
        status,
        count,
        percentage,
        color,
      };
    });
  }, [stats]);

  /**
   * Calculate top tags with percentages
   */
  const topTags = useMemo<readonly TagChartItem[]>(() => {
    if (!stats || !stats.topTags || stats.total === 0) {
      return [];
    }

    const total = stats.total;

    return stats.topTags.map((tagCount) => ({
      tag: tagCount.tag,
      count: tagCount.count,
      percentage: total > 0 ? Math.round((tagCount.count / total) * 100) : 0,
    }));
  }, [stats]);

  /**
   * Calculate assignee distribution with percentages
   */
  const assignees = useMemo<readonly AssigneeChartItem[]>(() => {
    if (!stats || !stats.topAssignees || stats.total === 0) {
      return [];
    }

    const total = stats.total;

    return stats.topAssignees.map((assigneeCount) => ({
      assignee: assigneeCount.assignee,
      count: assigneeCount.count,
      percentage: total > 0 ? Math.round((assigneeCount.count / total) * 100) : 0,
    }));
  }, [stats]);

  /**
   * Calculate unassigned item with percentage
   */
  const unassignedItem = useMemo<AssigneeChartItem | null>(() => {
    if (!stats || stats.unassignedCount === 0 || stats.total === 0) {
      return null;
    }

    const total = stats.total;

    return {
      assignee: 'Unassigned',
      count: stats.unassignedCount,
      percentage: total > 0 ? Math.round((stats.unassignedCount / total) * 100) : 0,
    };
  }, [stats]);

  /**
   * Combine all chart data
   */
  const charts = useMemo<StatsChartData>(
    () => ({
      statusDistribution,
      topTags,
      assignees,
      unassignedItem,
    }),
    [statusDistribution, topTags, assignees, unassignedItem]
  );

  return {
    data,
    uiState,
    charts,
  };
};
