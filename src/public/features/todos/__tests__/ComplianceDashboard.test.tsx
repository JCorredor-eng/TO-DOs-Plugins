import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ComplianceDashboard } from '../ui/ComplianceDashboard';
import { AnalyticsStats } from '../../../../common/todo/todo.types';
jest.mock('../ui/ComplianceFrameworkChart', () => ({
  ComplianceFrameworkChart: ({ data }: any) => (
    <div data-testid="compliance-framework-chart">
      ComplianceFrameworkChart with {data?.length || 0} frameworks
    </div>
  ),
}));
jest.mock('../ui/OverdueTasksTable', () => ({
  OverdueTasksTable: ({ data }: any) => (
    <div data-testid="overdue-tasks-table">
      OverdueTasksTable with {data?.total || 0} overdue tasks
    </div>
  ),
}));
jest.mock('../ui/PrioritySeverityHeatmap', () => ({
  PrioritySeverityHeatmap: ({ priorityData, severityData }: any) => (
    <div data-testid="priority-severity-heatmap">
      PrioritySeverityHeatmap with {priorityData?.length || 0} priority items and {severityData?.length || 0} severity items
    </div>
  ),
}));
jest.mock('../ui/HighCriticalTasksChart', () => ({
  HighCriticalTasksChart: ({ data }: any) => (
    <div data-testid="high-critical-tasks-chart">
      HighCriticalTasksChart with {data?.length || 0} priority items
    </div>
  ),
}));
describe('ComplianceDashboard', () => {
  const mockOnRefresh = jest.fn();
  const mockOnFrameworkChange = jest.fn();
  const sampleAnalyticsData: AnalyticsStats = {
    computedAt: '2024-01-15T12:00:00.000Z',
    totalTasks: 100,
    complianceCoverage: [
      {
        framework: 'PCI-DSS',
        total: 30,
        byStatus: {
          planned: 10,
          done: 15,
          error: 5,
        },
        completionRate: 50,
      },
      {
        framework: 'ISO-27001',
        total: 25,
        byStatus: {
          planned: 15,
          done: 8,
          error: 2,
        },
        completionRate: 32,
      },
      {
        framework: 'HIPAA',
        total: 20,
        byStatus: {
          planned: 5,
          done: 12,
          error: 3,
        },
        completionRate: 60,
      },
    ],
    overdueTasks: {
      total: 20,
      byPriority: {
        low: 2,
        medium: 5,
        high: 8,
        critical: 5,
      },
      bySeverity: {
        info: 1,
        low: 2,
        medium: 7,
        high: 6,
        critical: 4,
      },
    },
    priorityDistribution: [
      { label: 'low', count: 20, percentage: 20 },
      { label: 'medium', count: 40, percentage: 40 },
      { label: 'high', count: 30, percentage: 30 },
      { label: 'critical', count: 10, percentage: 10 },
    ],
    severityDistribution: [
      { label: 'info', count: 5, percentage: 5 },
      { label: 'low', count: 25, percentage: 25 },
      { label: 'medium', count: 35, percentage: 35 },
      { label: 'high', count: 25, percentage: 25 },
      { label: 'critical', count: 10, percentage: 10 },
    ],
  };
  beforeEach(() => {
    jest.clearAllMocks();
  });
  const defaultProps = {
    data: sampleAnalyticsData,
    loading: false,
    error: null,
    onRefresh: mockOnRefresh,
    onFrameworkChange: mockOnFrameworkChange,
  };
  describe('Loading State', () => {
    it('should render loading spinner when loading is true', () => {
      const { container } = render(
        <ComplianceDashboard
          {...defaultProps}
          loading={true}
          data={null}
        />
      );
      const loadingElement = container.querySelector('.euiLoadingChart');
      expect(loadingElement).toBeInTheDocument();
    });
    it('should not render data when loading', () => {
      render(
        <ComplianceDashboard
          {...defaultProps}
          loading={true}
          data={null}
        />
      );
      expect(screen.queryByTestId('compliance-framework-chart')).not.toBeInTheDocument();
      expect(screen.queryByTestId('overdue-tasks-table')).not.toBeInTheDocument();
    });
    it('should center loading spinner', () => {
      const { container } = render(
        <ComplianceDashboard
          {...defaultProps}
          loading={true}
          data={null}
        />
      );
      const flexGroup = container.querySelector('[style*="min-height"]');
      expect(flexGroup).toBeInTheDocument();
    });
  });
  describe('Error State', () => {
    it('should render error message when error exists', () => {
      const testError = new Error('Failed to fetch analytics data');
      render(
        <ComplianceDashboard
          {...defaultProps}
          error={testError}
          data={null}
        />
      );
      expect(screen.getByText('Error Loading Analytics')).toBeInTheDocument();
      expect(screen.getByText('Failed to fetch analytics data')).toBeInTheDocument();
    });
    it('should render retry button in error state', () => {
      const testError = new Error('Network error');
      render(
        <ComplianceDashboard
          {...defaultProps}
          error={testError}
          data={null}
        />
      );
      const retryButton = screen.getByRole('button', { name: /retry/i });
      expect(retryButton).toBeInTheDocument();
    });
    it('should call onRefresh when retry button is clicked', () => {
      const testError = new Error('Test error');
      render(
        <ComplianceDashboard
          {...defaultProps}
          error={testError}
          data={null}
        />
      );
      const retryButton = screen.getByRole('button', { name: /retry/i });
      fireEvent.click(retryButton);
      expect(mockOnRefresh).toHaveBeenCalledTimes(1);
    });
    it('should not render data visualizations in error state', () => {
      const testError = new Error('Test error');
      render(
        <ComplianceDashboard
          {...defaultProps}
          error={testError}
          data={null}
        />
      );
      expect(screen.queryByTestId('compliance-framework-chart')).not.toBeInTheDocument();
      expect(screen.queryByTestId('overdue-tasks-table')).not.toBeInTheDocument();
    });
    it('should render error callout with danger color', () => {
      const testError = new Error('Test error');
      const { container } = render(
        <ComplianceDashboard
          {...defaultProps}
          error={testError}
          data={null}
        />
      );
      expect(container.querySelector('.euiCallOut--danger')).toBeInTheDocument();
    });
  });
  describe('Empty State - No Data', () => {
    it('should render empty prompt when data is null', () => {
      render(
        <ComplianceDashboard
          {...defaultProps}
          data={null}
        />
      );
      expect(screen.getByRole('heading', { name: 'No Analytics Data' })).toBeInTheDocument();
      expect(screen.getByText('Analytics data is not available. Please try refreshing.')).toBeInTheDocument();
    });
    it('should render refresh button in empty state', () => {
      render(
        <ComplianceDashboard
          {...defaultProps}
          data={null}
        />
      );
      const refreshButton = screen.getByRole('button', { name: /refresh/i });
      expect(refreshButton).toBeInTheDocument();
    });
    it('should call onRefresh when refresh button is clicked in empty state', () => {
      render(
        <ComplianceDashboard
          {...defaultProps}
          data={null}
        />
      );
      const refreshButton = screen.getByRole('button', { name: /refresh/i });
      fireEvent.click(refreshButton);
      expect(mockOnRefresh).toHaveBeenCalledTimes(1);
    });
  });
  describe('Empty State - No Tasks', () => {
    it('should render no tasks prompt when totalTasks is 0', () => {
      const emptyData: AnalyticsStats = {
        ...sampleAnalyticsData,
        totalTasks: 0,
        complianceCoverage: [],
        overdueTasks: {
          total: 0,
          byPriority: { low: 0, medium: 0, high: 0, critical: 0 },
          bySeverity: { info: 0, low: 0, medium: 0, high: 0, critical: 0 },
        },
        priorityDistribution: [],
        severityDistribution: [],
      };
      render(
        <ComplianceDashboard
          {...defaultProps}
          data={emptyData}
        />
      );
      expect(screen.getByRole('heading', { name: 'No Tasks Available' })).toBeInTheDocument();
      expect(screen.getByText('Create some TODO items to see compliance analytics.')).toBeInTheDocument();
    });
    it('should not render visualizations when no tasks', () => {
      const emptyData: AnalyticsStats = {
        ...sampleAnalyticsData,
        totalTasks: 0,
      };
      render(
        <ComplianceDashboard
          {...defaultProps}
          data={emptyData}
        />
      );
      expect(screen.queryByTestId('compliance-framework-chart')).not.toBeInTheDocument();
      expect(screen.queryByTestId('overdue-tasks-table')).not.toBeInTheDocument();
    });
  });
  describe('Successful Render with Data', () => {
    it('should render all 4 visualizations', () => {
      render(<ComplianceDashboard {...defaultProps} />);
      expect(screen.getByTestId('compliance-framework-chart')).toBeInTheDocument();
      expect(screen.getByTestId('overdue-tasks-table')).toBeInTheDocument();
      expect(screen.getByTestId('priority-severity-heatmap')).toBeInTheDocument();
      expect(screen.getByTestId('high-critical-tasks-chart')).toBeInTheDocument();
    });
    it('should pass correct data to ComplianceFrameworkChart', () => {
      render(<ComplianceDashboard {...defaultProps} />);
      const chart = screen.getByTestId('compliance-framework-chart');
      expect(chart).toHaveTextContent('3 frameworks');
    });
    it('should pass correct data to OverdueTasksTable', () => {
      render(<ComplianceDashboard {...defaultProps} />);
      const table = screen.getByTestId('overdue-tasks-table');
      expect(table).toHaveTextContent('20 overdue tasks');
    });
    it('should pass correct data to PrioritySeverityHeatmap', () => {
      render(<ComplianceDashboard {...defaultProps} />);
      const heatmap = screen.getByTestId('priority-severity-heatmap');
      expect(heatmap).toHaveTextContent('4 priority items');
      expect(heatmap).toHaveTextContent('5 severity items');
    });
    it('should pass correct data to HighCriticalTasksChart', () => {
      render(<ComplianceDashboard {...defaultProps} />);
      const chart = screen.getByTestId('high-critical-tasks-chart');
      expect(chart).toHaveTextContent('4 priority items');
    });
    it('should display total tasks count', () => {
      render(<ComplianceDashboard {...defaultProps} />);
      expect(screen.getByText(/Total Tasks:/)).toBeInTheDocument();
      expect(screen.getByText(/100/)).toBeInTheDocument();
    });
    it('should display last updated timestamp', () => {
      render(<ComplianceDashboard {...defaultProps} />);
      expect(screen.getByText(/Last Updated:/)).toBeInTheDocument();
      expect(screen.getByText(/2024/)).toBeInTheDocument();
    });
    it('should render refresh button in header', () => {
      render(<ComplianceDashboard {...defaultProps} />);
      const refreshButton = screen.getByRole('button', { name: /refresh/i });
      expect(refreshButton).toBeInTheDocument();
    });
    it('should call onRefresh when header refresh button is clicked', () => {
      render(<ComplianceDashboard {...defaultProps} />);
      const refreshButton = screen.getByRole('button', { name: /refresh/i });
      fireEvent.click(refreshButton);
      expect(mockOnRefresh).toHaveBeenCalledTimes(1);
    });
  });
  describe('Framework Filter', () => {
    it('should render framework filter dropdown', () => {
      render(<ComplianceDashboard {...defaultProps} />);
      expect(screen.getByLabelText(/Filter by Compliance Framework/i)).toBeInTheDocument();
    });
    it('should include "All Frameworks" option', () => {
      render(<ComplianceDashboard {...defaultProps} />);
      const select = screen.getByLabelText(/Filter by Compliance Framework/i) as HTMLSelectElement;
      const options = Array.from(select.options).map(opt => opt.text);
      expect(options).toContain('All Frameworks');
    });
    it('should populate filter with available frameworks from data', () => {
      render(<ComplianceDashboard {...defaultProps} />);
      const select = screen.getByLabelText(/Filter by Compliance Framework/i) as HTMLSelectElement;
      const options = Array.from(select.options).map(opt => opt.text);
      expect(options).toContain('PCI-DSS');
      expect(options).toContain('ISO-27001');
      expect(options).toContain('HIPAA');
    });
    it('should have 4 options total (All + 3 frameworks)', () => {
      render(<ComplianceDashboard {...defaultProps} />);
      const select = screen.getByLabelText(/Filter by Compliance Framework/i) as HTMLSelectElement;
      expect(select.options.length).toBe(4);
    });
    it('should default to "All Frameworks"', () => {
      render(<ComplianceDashboard {...defaultProps} />);
      const select = screen.getByLabelText(/Filter by Compliance Framework/i) as HTMLSelectElement;
      expect(select.value).toBe('');
    });
    it('should call onFrameworkChange with framework when selected', () => {
      render(<ComplianceDashboard {...defaultProps} />);
      const select = screen.getByLabelText(/Filter by Compliance Framework/i);
      fireEvent.change(select, { target: { value: 'PCI-DSS' } });
      expect(mockOnFrameworkChange).toHaveBeenCalledWith('PCI-DSS');
    });
    it('should call onFrameworkChange with undefined when "All Frameworks" selected', () => {
      render(<ComplianceDashboard {...defaultProps} />);
      const select = screen.getByLabelText(/Filter by Compliance Framework/i);
      fireEvent.change(select, { target: { value: 'PCI-DSS' } });
      fireEvent.change(select, { target: { value: '' } });
      expect(mockOnFrameworkChange).toHaveBeenLastCalledWith(undefined);
    });
    it('should update select value when framework is changed', () => {
      render(<ComplianceDashboard {...defaultProps} />);
      const select = screen.getByLabelText(/Filter by Compliance Framework/i) as HTMLSelectElement;
      fireEvent.change(select, { target: { value: 'ISO-27001' } });
      expect(select.value).toBe('ISO-27001');
    });
    it('should not call onFrameworkChange if callback is not provided', () => {
      render(
        <ComplianceDashboard
          {...defaultProps}
          onFrameworkChange={undefined}
        />
      );
      const select = screen.getByLabelText(/Filter by Compliance Framework/i);
      fireEvent.change(select, { target: { value: 'PCI-DSS' } });
      expect(select).toBeInTheDocument();
    });
    it('should handle data with no frameworks', () => {
      const noFrameworksData: AnalyticsStats = {
        ...sampleAnalyticsData,
        complianceCoverage: [],
      };
      render(
        <ComplianceDashboard
          {...defaultProps}
          data={noFrameworksData}
        />
      );
      const select = screen.getByLabelText(/Filter by Compliance Framework/i) as HTMLSelectElement;
      expect(select.options.length).toBe(1); 
    });
  });
  describe('Layout and Responsiveness', () => {
    it('should render visualizations in 2x2 grid layout', () => {
      const { container } = render(<ComplianceDashboard {...defaultProps} />);
      const flexGroups = container.querySelectorAll('.euiFlexGroup');
      expect(flexGroups.length).toBeGreaterThanOrEqual(2);
    });
    it('should render top row visualizations', () => {
      render(<ComplianceDashboard {...defaultProps} />);
      expect(screen.getByTestId('compliance-framework-chart')).toBeInTheDocument();
      expect(screen.getByTestId('overdue-tasks-table')).toBeInTheDocument();
    });
    it('should render bottom row visualizations', () => {
      render(<ComplianceDashboard {...defaultProps} />);
      expect(screen.getByTestId('priority-severity-heatmap')).toBeInTheDocument();
      expect(screen.getByTestId('high-critical-tasks-chart')).toBeInTheDocument();
    });
  });
  describe('Edge Cases', () => {
    it('should handle data with single framework', () => {
      const singleFrameworkData: AnalyticsStats = {
        ...sampleAnalyticsData,
        complianceCoverage: [
          {
            framework: 'SOC2',
            total: 100,
            byStatus: { planned: 50, done: 40, error: 10 },
            completionRate: 40,
          },
        ],
      };
      render(
        <ComplianceDashboard
          {...defaultProps}
          data={singleFrameworkData}
        />
      );
      const select = screen.getByLabelText(/Filter by Compliance Framework/i) as HTMLSelectElement;
      expect(select.options.length).toBe(2); 
    });
    it('should handle data with no overdue tasks', () => {
      const noOverdueData: AnalyticsStats = {
        ...sampleAnalyticsData,
        overdueTasks: {
          total: 0,
          byPriority: { low: 0, medium: 0, high: 0, critical: 0 },
          bySeverity: { info: 0, low: 0, medium: 0, high: 0, critical: 0 },
        },
      };
      render(
        <ComplianceDashboard
          {...defaultProps}
          data={noOverdueData}
        />
      );
      const table = screen.getByTestId('overdue-tasks-table');
      expect(table).toHaveTextContent('0 overdue tasks');
    });
    it('should handle very large total tasks count', () => {
      const largeData: AnalyticsStats = {
        ...sampleAnalyticsData,
        totalTasks: 999999,
      };
      render(
        <ComplianceDashboard
          {...defaultProps}
          data={largeData}
        />
      );
      expect(screen.getByText(/999999/)).toBeInTheDocument();
    });
    it('should handle framework names with special characters', () => {
      const specialCharsData: AnalyticsStats = {
        ...sampleAnalyticsData,
        complianceCoverage: [
          {
            framework: 'ISO/IEC 27001:2013',
            total: 50,
            byStatus: { planned: 20, done: 25, error: 5 },
            completionRate: 50,
          },
        ],
      };
      render(
        <ComplianceDashboard
          {...defaultProps}
          data={specialCharsData}
        />
      );
      const select = screen.getByLabelText(/Filter by Compliance Framework/i) as HTMLSelectElement;
      const options = Array.from(select.options).map(opt => opt.text);
      expect(options).toContain('ISO/IEC 27001:2013');
    });
    it('should handle timestamp formatting edge cases', () => {
      const edgeCaseData: AnalyticsStats = {
        ...sampleAnalyticsData,
        computedAt: '2025-12-31T23:59:59.999Z',
      };
      render(
        <ComplianceDashboard
          {...defaultProps}
          data={edgeCaseData}
        />
      );
      expect(screen.getByText(/Last Updated:/)).toBeInTheDocument();
    });
  });
  describe('Accessibility', () => {
    it('should have accessible form labels', () => {
      render(<ComplianceDashboard {...defaultProps} />);
      const label = screen.getByText(/Filter by Compliance Framework/i);
      expect(label).toBeInTheDocument();
    });
    it('should have accessible buttons', () => {
      render(<ComplianceDashboard {...defaultProps} />);
      const refreshButton = screen.getByRole('button', { name: /refresh/i });
      expect(refreshButton).toBeInTheDocument();
    });
    it('should have proper loading announcement', () => {
      const { container } = render(
        <ComplianceDashboard
          {...defaultProps}
          loading={true}
          data={null}
        />
      );
      const loadingElement = container.querySelector('.euiLoadingChart');
      expect(loadingElement).toBeInTheDocument();
    });
    it('should have accessible error message', () => {
      const testError = new Error('Test error message');
      render(
        <ComplianceDashboard
          {...defaultProps}
          error={testError}
          data={null}
        />
      );
      expect(screen.getByText('Test error message')).toBeInTheDocument();
    });
  });
  describe('Re-rendering Behavior', () => {
    it('should update when data prop changes', () => {
      const { rerender } = render(<ComplianceDashboard {...defaultProps} />);
      expect(screen.getByText(/100/)).toBeInTheDocument();
      const updatedData: AnalyticsStats = {
        ...sampleAnalyticsData,
        totalTasks: 200,
      };
      rerender(
        <ComplianceDashboard
          {...defaultProps}
          data={updatedData}
        />
      );
      expect(screen.getByText(/200/)).toBeInTheDocument();
    });
    it('should update framework options when data changes', () => {
      const { rerender } = render(<ComplianceDashboard {...defaultProps} />);
      let select = screen.getByLabelText(/Filter by Compliance Framework/i) as HTMLSelectElement;
      expect(select.options.length).toBe(4); 
      const newData: AnalyticsStats = {
        ...sampleAnalyticsData,
        complianceCoverage: [
          {
            framework: 'GDPR',
            total: 50,
            byStatus: { planned: 20, done: 25, error: 5 },
            completionRate: 50,
          },
        ],
      };
      rerender(
        <ComplianceDashboard
          {...defaultProps}
          data={newData}
        />
      );
      select = screen.getByLabelText(/Filter by Compliance Framework/i) as HTMLSelectElement;
      expect(select.options.length).toBe(2); 
    });
    it('should transition from loading to data correctly', () => {
      const { rerender, container } = render(
        <ComplianceDashboard
          {...defaultProps}
          loading={true}
          data={null}
        />
      );
      expect(container.querySelector('.euiLoadingChart')).toBeInTheDocument();
      rerender(<ComplianceDashboard {...defaultProps} />);
      expect(container.querySelector('.euiLoadingChart')).not.toBeInTheDocument();
      expect(screen.getByTestId('compliance-framework-chart')).toBeInTheDocument();
    });
    it('should transition from error to data correctly', () => {
      const { rerender } = render(
        <ComplianceDashboard
          {...defaultProps}
          error={new Error('Test error')}
          data={null}
        />
      );
      expect(screen.getByText('Error Loading Analytics')).toBeInTheDocument();
      rerender(
        <ComplianceDashboard
          {...defaultProps}
          error={null}
        />
      );
      expect(screen.queryByText('Error Loading Analytics')).not.toBeInTheDocument();
      expect(screen.getByTestId('compliance-framework-chart')).toBeInTheDocument();
    });
  });
});
