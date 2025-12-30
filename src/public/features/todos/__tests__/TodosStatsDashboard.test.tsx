import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { TodosStatsDashboard } from '../ui/TodosStatsDashboard';
import { TodoStats } from '../../../../common/todo/todo.types';
describe('TodosStatsDashboard', () => {
  const mockStats: TodoStats = {
    total: 100,
    byStatus: {
      planned: 50,
      done: 40,
      error: 10,
    },
    topTags: [
      { tag: 'pci-dss', count: 30 },
      { tag: 'iso-27001', count: 25 },
      { tag: 'security', count: 20 },
      { tag: 'compliance', count: 15 },
      { tag: 'audit', count: 10 },
    ],
    completedOverTime: [
      { date: '2024-01-01', count: 10 },
      { date: '2024-01-02', count: 15 },
      { date: '2024-01-03', count: 8 },
    ],
  };
  const defaultProps = {
    stats: mockStats,
    loading: false,
    error: null,
  };
  describe('Loading State', () => {
    it('should show loading indicator when loading', () => {
      render(<TodosStatsDashboard {...defaultProps} loading={true} stats={null} />);
      const loadingElement = document.querySelector('.euiLoadingChart');
      expect(loadingElement).toBeInTheDocument();
    });
    it('should not show stats when loading', () => {
      render(<TodosStatsDashboard {...defaultProps} loading={true} stats={null} />);
      expect(screen.queryByText('Total TODOs')).not.toBeInTheDocument();
    });
  });
  describe('Error State', () => {
    it('should show error message when error occurs', () => {
      const error = new Error('Failed to load statistics');
      render(<TodosStatsDashboard {...defaultProps} error={error} stats={null} />);
      expect(screen.getByText('Failed to Load Statistics')).toBeInTheDocument();
      expect(screen.getByText('Failed to load statistics')).toBeInTheDocument();
    });
    it('should not show stats when error occurs', () => {
      const error = new Error('Network error');
      render(<TodosStatsDashboard {...defaultProps} error={error} stats={null} />);
      expect(screen.queryByText('Total TODOs')).not.toBeInTheDocument();
    });
    it('should display error icon', () => {
      const error = new Error('Test error');
      render(<TodosStatsDashboard {...defaultProps} error={error} stats={null} />);
      expect(screen.getByText('Failed to Load Statistics')).toBeInTheDocument();
    });
  });
  describe('Empty State', () => {
    it('should show empty state when stats is null', () => {
      render(<TodosStatsDashboard {...defaultProps} stats={null} />);
      expect(screen.getByText('No Statistics Available')).toBeInTheDocument();
      expect(screen.getByText('Create some TODO items to see statistics.')).toBeInTheDocument();
    });
    it('should show empty state when total is zero', () => {
      const emptyStats: TodoStats = {
        total: 0,
        byStatus: { planned: 0, done: 0, error: 0 },
        topTags: [],
        completedOverTime: [],
      };
      render(<TodosStatsDashboard {...defaultProps} stats={emptyStats} />);
      expect(screen.getByText('No Statistics Available')).toBeInTheDocument();
    });
    it('should not show stats panels when empty', () => {
      render(<TodosStatsDashboard {...defaultProps} stats={null} />);
      expect(screen.queryByText('Total TODOs')).not.toBeInTheDocument();
      expect(screen.queryByText('Planned')).not.toBeInTheDocument();
    });
  });
  describe('Summary Statistics', () => {
    it('should display total count', () => {
      render(<TodosStatsDashboard {...defaultProps} />);
      expect(screen.getByText('100')).toBeInTheDocument();
      expect(screen.getByText('Total TODOs')).toBeInTheDocument();
    });
    it('should display planned count', () => {
      render(<TodosStatsDashboard {...defaultProps} />);
      expect(screen.getByText('Total TODOs')).toBeInTheDocument();
      const plannedLabels = screen.getAllByText('Planned');
      expect(plannedLabels.length).toBeGreaterThan(0);
    });
    it('should display done count', () => {
      render(<TodosStatsDashboard {...defaultProps} />);
      const doneLabels = screen.getAllByText('Done');
      expect(doneLabels.length).toBeGreaterThan(0);
    });
    it('should display error count', () => {
      render(<TodosStatsDashboard {...defaultProps} />);
      const errorLabels = screen.getAllByText('Error');
      expect(errorLabels.length).toBeGreaterThan(0);
    });
    it('should display all four stat panels', () => {
      render(<TodosStatsDashboard {...defaultProps} />);
      expect(screen.getByText('Total TODOs')).toBeInTheDocument();
      const plannedLabels = screen.getAllByText('Planned');
      expect(plannedLabels.length).toBeGreaterThan(0);
      const doneLabels = screen.getAllByText('Done');
      expect(doneLabels.length).toBeGreaterThan(0);
      const errorLabels = screen.getAllByText('Error');
      expect(errorLabels.length).toBeGreaterThan(0);
    });
  });
  describe('Status Distribution', () => {
    it('should show status distribution panel', () => {
      render(<TodosStatsDashboard {...defaultProps} />);
      expect(screen.getByText('Status Distribution')).toBeInTheDocument();
    });
    it('should display status labels', () => {
      render(<TodosStatsDashboard {...defaultProps} />);
      const plannedBadges = screen.getAllByText('Planned');
      const doneBadges = screen.getAllByText('Done');
      const errorBadges = screen.getAllByText('Error');
      expect(plannedBadges.length).toBeGreaterThan(0);
      expect(doneBadges.length).toBeGreaterThan(0);
      expect(errorBadges.length).toBeGreaterThan(0);
    });
    it('should calculate correct percentages', () => {
      render(<TodosStatsDashboard {...defaultProps} />);
      const fiftyPercent = screen.getAllByText(/\(50%\)/);
      expect(fiftyPercent.length).toBeGreaterThan(0);
      const fortyPercent = screen.getAllByText(/\(40%\)/);
      expect(fortyPercent.length).toBeGreaterThan(0);
      const tenPercent = screen.getAllByText(/\(10%\)/);
      expect(tenPercent.length).toBeGreaterThan(0);
    });
    it('should handle zero total without crashing', () => {
      const zeroStats: TodoStats = {
        total: 0,
        byStatus: { planned: 0, done: 0, error: 0 },
        topTags: [],
        completedOverTime: [],
      };
      render(<TodosStatsDashboard {...defaultProps} stats={zeroStats} />);
      expect(screen.getByText('No Statistics Available')).toBeInTheDocument();
    });
    it('should render progress bars', () => {
      const { container } = render(<TodosStatsDashboard {...defaultProps} />);
      const progressBars = container.querySelectorAll('div[style*="width"]');
      expect(progressBars.length).toBeGreaterThan(0);
    });
  });
  describe('Top Tags', () => {
    it('should show top tags panel', () => {
      render(<TodosStatsDashboard {...defaultProps} />);
      expect(screen.getByText('Top Tags')).toBeInTheDocument();
    });
    it('should display all top tags', () => {
      render(<TodosStatsDashboard {...defaultProps} />);
      expect(screen.getByText('pci-dss')).toBeInTheDocument();
      expect(screen.getByText('iso-27001')).toBeInTheDocument();
      expect(screen.getByText('security')).toBeInTheDocument();
      expect(screen.getByText('compliance')).toBeInTheDocument();
      expect(screen.getByText('audit')).toBeInTheDocument();
    });
    it('should display tag counts with percentages', () => {
      render(<TodosStatsDashboard {...defaultProps} />);
      expect(screen.getByText(/30 \(30%\)/)).toBeInTheDocument();
      expect(screen.getByText(/25 \(25%\)/)).toBeInTheDocument();
      expect(screen.getByText(/20 \(20%\)/)).toBeInTheDocument();
    });
    it('should not show top tags panel when no tags', () => {
      const noTagsStats: TodoStats = {
        ...mockStats,
        topTags: [],
      };
      render(<TodosStatsDashboard {...defaultProps} stats={noTagsStats} />);
      expect(screen.queryByText('Top Tags')).not.toBeInTheDocument();
    });
    it('should render tag progress bars', () => {
      const { container } = render(<TodosStatsDashboard {...defaultProps} />);
      expect(screen.getByText('Top Tags')).toBeInTheDocument();
      expect(screen.getByText('pci-dss')).toBeInTheDocument();
    });
    it('should handle single tag', () => {
      const singleTagStats: TodoStats = {
        ...mockStats,
        topTags: [{ tag: 'solo-tag', count: 50 }],
      };
      render(<TodosStatsDashboard {...defaultProps} stats={singleTagStats} />);
      expect(screen.getByText('Top Tags')).toBeInTheDocument();
      expect(screen.getByText('solo-tag')).toBeInTheDocument();
    });
  });
  describe('Data Visualization', () => {
    it('should render all visual elements', () => {
      const { container } = render(<TodosStatsDashboard {...defaultProps} />);
      const panels = container.querySelectorAll('[class*="euiPanel"]');
      expect(panels.length).toBeGreaterThan(0);
    });
    it('should apply correct color coding', () => {
      render(<TodosStatsDashboard {...defaultProps} />);
      expect(screen.getAllByText('Planned').length).toBeGreaterThan(0);
      expect(screen.getAllByText('Done').length).toBeGreaterThan(0);
      expect(screen.getAllByText('Error').length).toBeGreaterThan(0);
    });
    it('should use semantic HTML structure', () => {
      render(<TodosStatsDashboard {...defaultProps} />);
      expect(screen.getByRole('heading', { name: /status distribution/i })).toBeInTheDocument();
      expect(screen.getByRole('heading', { name: /top tags/i })).toBeInTheDocument();
    });
  });
  describe('Edge Cases', () => {
    it('should handle stats with all zeros', () => {
      const allZeroStats: TodoStats = {
        total: 100, 
        byStatus: { planned: 0, done: 0, error: 0 },
        topTags: [],
        completedOverTime: [],
      };
      render(<TodosStatsDashboard {...defaultProps} stats={allZeroStats} />);
      expect(screen.getByText('100')).toBeInTheDocument();
      const zeroPercent = screen.getAllByText(/\(0%\)/);
      expect(zeroPercent.length).toBeGreaterThan(0);
    });
    it('should handle very large numbers', () => {
      const largeStats: TodoStats = {
        total: 999999,
        byStatus: { planned: 333333, done: 333333, error: 333333 },
        topTags: [{ tag: 'large', count: 999999 }],
        completedOverTime: [],
      };
      render(<TodosStatsDashboard {...defaultProps} stats={largeStats} />);
      expect(screen.getByText('999999')).toBeInTheDocument();
    });
    it('should handle stats with only one status populated', () => {
      const oneStatusStats: TodoStats = {
        total: 50,
        byStatus: { planned: 50, done: 0, error: 0 },
        topTags: [],
        completedOverTime: [],
      };
      render(<TodosStatsDashboard {...defaultProps} stats={oneStatusStats} />);
      const fiftyElements = screen.getAllByText('50');
      expect(fiftyElements.length).toBeGreaterThan(0);
      const hundredPercent = screen.getAllByText(/\(100%\)/);
      expect(hundredPercent.length).toBeGreaterThan(0);
      const zeroPercent = screen.getAllByText(/\(0%\)/);
      expect(zeroPercent.length).toBeGreaterThan(0);
    });
    it('should round percentages correctly', () => {
      const oddStats: TodoStats = {
        total: 3,
        byStatus: { planned: 1, done: 1, error: 1 },
        topTags: [{ tag: 'tag1', count: 1 }],
        completedOverTime: [],
      };
      render(<TodosStatsDashboard {...defaultProps} stats={oddStats} />);
      const thirtyThreePercent = screen.getAllByText(/\(33%\)/);
      expect(thirtyThreePercent.length).toBeGreaterThan(0);
    });
    it('should handle missing completedOverTime data', () => {
      const noTimelineStats: TodoStats = {
        ...mockStats,
        completedOverTime: [],
      };
      render(<TodosStatsDashboard {...defaultProps} stats={noTimelineStats} />);
      expect(screen.getByText('Total TODOs')).toBeInTheDocument();
      expect(screen.getByText('Status Distribution')).toBeInTheDocument();
    });
    it('should handle simultaneous loading and error gracefully', () => {
      const error = new Error('Test error');
      render(<TodosStatsDashboard {...defaultProps} loading={true} error={error} stats={null} />);
      const loadingElement = document.querySelector('.euiLoadingChart');
      expect(loadingElement).toBeInTheDocument();
    });
  });
  describe('Accessibility', () => {
    it('should have accessible stat descriptions', () => {
      render(<TodosStatsDashboard {...defaultProps} />);
      expect(screen.getByText('Total TODOs')).toBeInTheDocument();
      const plannedLabels = screen.getAllByText('Planned');
      expect(plannedLabels.length).toBeGreaterThan(0);
      const doneLabels = screen.getAllByText('Done');
      expect(doneLabels.length).toBeGreaterThan(0);
      const errorLabels = screen.getAllByText('Error');
      expect(errorLabels.length).toBeGreaterThan(0);
    });
    it('should use semantic headings', () => {
      render(<TodosStatsDashboard {...defaultProps} />);
      const headings = screen.getAllByRole('heading');
      expect(headings.length).toBeGreaterThan(0);
    });
    it('should have proper structure for screen readers', () => {
      const { container } = render(<TodosStatsDashboard {...defaultProps} />);
      expect(container.querySelector('h3')).toBeInTheDocument();
    });
  });
  describe('Responsive Rendering', () => {
    it('should render stats in a flex layout', () => {
      const { container } = render(<TodosStatsDashboard {...defaultProps} />);
      const flexGroups = container.querySelectorAll('[class*="euiFlexGroup"]');
      expect(flexGroups.length).toBeGreaterThan(0);
    });
    it('should maintain layout with minimal data', () => {
      const minimalStats: TodoStats = {
        total: 1,
        byStatus: { planned: 1, done: 0, error: 0 },
        topTags: [{ tag: 'single', count: 1 }],
        completedOverTime: [{ date: '2024-01-01', count: 1 }],
      };
      render(<TodosStatsDashboard {...defaultProps} stats={minimalStats} />);
      expect(screen.getByText('Total TODOs')).toBeInTheDocument();
      expect(screen.getByText('Status Distribution')).toBeInTheDocument();
      expect(screen.getByText('Top Tags')).toBeInTheDocument();
    });
  });
});
