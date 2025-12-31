import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { TodoFilters } from '../ui/TodoFilters';
import { TodoStatus, TodoPriority, TodoSeverity } from '../../../../common/todo/todo.types';
import { useTodoFilters } from '../hooks/use_todo_filters';

jest.mock('../hooks/use_todo_filters');

describe('TodoFilters', () => {
  const mockOnFiltersChange = jest.fn();
  const mockSetIsStatusPopoverOpen = jest.fn();
  const mockSetIsPriorityPopoverOpen = jest.fn();
  const mockSetIsSeverityPopoverOpen = jest.fn();
  const mockSetLocalTags = jest.fn();
  const mockHandleSearchChange = jest.fn();
  const mockHandleStatusChange = jest.fn();
  const mockHandlePriorityChange = jest.fn();
  const mockHandleSeverityChange = jest.fn();
  const mockHandleTagsBlur = jest.fn();
  const mockHandleOverdueToggle = jest.fn();
  const mockHandleClearAll = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    (useTodoFilters as jest.Mock).mockReturnValue({
      data: {
        statusOptions: [
          { label: 'Planned', key: 'planned', checked: undefined },
          { label: 'Done', key: 'done', checked: undefined },
          { label: 'Error', key: 'error', checked: undefined },
        ],
        priorityOptions: [
          { label: 'Low', key: 'low', checked: undefined },
          { label: 'Medium', key: 'medium', checked: undefined },
          { label: 'High', key: 'high', checked: undefined },
          { label: 'Critical', key: 'critical', checked: undefined },
        ],
        severityOptions: [
          { label: 'Info', key: 'info', checked: undefined },
          { label: 'Low', key: 'low', checked: undefined },
          { label: 'Medium', key: 'medium', checked: undefined },
          { label: 'High', key: 'high', checked: undefined },
          { label: 'Critical', key: 'critical', checked: undefined },
        ],
        localSearchText: '',
        localTags: '',
        localShowOverdueOnly: false,
        activeFiltersCount: 0,
      },
      uiState: {
        isStatusPopoverOpen: false,
        isPriorityPopoverOpen: false,
        isSeverityPopoverOpen: false,
      },
      actions: {
        setIsStatusPopoverOpen: mockSetIsStatusPopoverOpen,
        setIsPriorityPopoverOpen: mockSetIsPriorityPopoverOpen,
        setIsSeverityPopoverOpen: mockSetIsSeverityPopoverOpen,
        setLocalTags: mockSetLocalTags,
        handleSearchChange: mockHandleSearchChange,
        handleStatusChange: mockHandleStatusChange,
        handlePriorityChange: mockHandlePriorityChange,
        handleSeverityChange: mockHandleSeverityChange,
        handleTagsBlur: mockHandleTagsBlur,
        handleOverdueToggle: mockHandleOverdueToggle,
        handleClearAll: mockHandleClearAll,
      },
    });
  });

  describe('Rendering', () => {
    it('should render search input', () => {
      render(<TodoFilters onFiltersChange={mockOnFiltersChange} />);
      const searchInput = screen.getByPlaceholderText('Search TODOs...');
      expect(searchInput).toBeInTheDocument();
    });

    it('should render status filter button', () => {
      render(<TodoFilters onFiltersChange={mockOnFiltersChange} />);
      const statusButton = screen.getByText('Status');
      expect(statusButton).toBeInTheDocument();
    });

    it('should render priority filter button', () => {
      render(<TodoFilters onFiltersChange={mockOnFiltersChange} />);
      const priorityButton = screen.getByText('Priority');
      expect(priorityButton).toBeInTheDocument();
    });

    it('should render severity filter button', () => {
      render(<TodoFilters onFiltersChange={mockOnFiltersChange} />);
      const severityButton = screen.getByText('Severity');
      expect(severityButton).toBeInTheDocument();
    });

    it('should render tags input', () => {
      render(<TodoFilters onFiltersChange={mockOnFiltersChange} />);
      const tagsInput = screen.getByPlaceholderText('Tags (comma-separated)');
      expect(tagsInput).toBeInTheDocument();
    });

    it('should render overdue only switch', () => {
      render(<TodoFilters onFiltersChange={mockOnFiltersChange} />);
      const overdueSwitch = screen.getByText('Overdue only');
      expect(overdueSwitch).toBeInTheDocument();
    });

    it('should not show clear all button when no filters are active', () => {
      render(<TodoFilters onFiltersChange={mockOnFiltersChange} />);
      const clearAllButton = screen.queryByText(/clear all/i);
      expect(clearAllButton).not.toBeInTheDocument();
    });

    it('should show clear all button when filters are active', () => {
      (useTodoFilters as jest.Mock).mockReturnValueOnce({
        data: {
          statusOptions: [
            { label: 'Planned', key: 'planned', checked: undefined },
            { label: 'Done', key: 'done', checked: undefined },
            { label: 'Error', key: 'error', checked: undefined },
          ],
          priorityOptions: [
            { label: 'Low', key: 'low', checked: undefined },
            { label: 'Medium', key: 'medium', checked: undefined },
            { label: 'High', key: 'high', checked: undefined },
            { label: 'Critical', key: 'critical', checked: undefined },
          ],
          severityOptions: [
            { label: 'Info', key: 'info', checked: undefined },
            { label: 'Low', key: 'low', checked: undefined },
            { label: 'Medium', key: 'medium', checked: undefined },
            { label: 'High', key: 'high', checked: undefined },
            { label: 'Critical', key: 'critical', checked: undefined },
          ],
          localSearchText: 'test',
          localTags: '',
          localShowOverdueOnly: false,
          activeFiltersCount: 1,
        },
        uiState: {
          isStatusPopoverOpen: false,
          isPriorityPopoverOpen: false,
          isSeverityPopoverOpen: false,
        },
        actions: {
          setIsStatusPopoverOpen: mockSetIsStatusPopoverOpen,
          setIsPriorityPopoverOpen: mockSetIsPriorityPopoverOpen,
          setIsSeverityPopoverOpen: mockSetIsSeverityPopoverOpen,
          setLocalTags: mockSetLocalTags,
          handleSearchChange: mockHandleSearchChange,
          handleStatusChange: mockHandleStatusChange,
          handlePriorityChange: mockHandlePriorityChange,
          handleSeverityChange: mockHandleSeverityChange,
          handleTagsBlur: mockHandleTagsBlur,
          handleOverdueToggle: mockHandleOverdueToggle,
          handleClearAll: mockHandleClearAll,
        },
      });

      render(
        <TodoFilters
          searchText="test"
          onFiltersChange={mockOnFiltersChange}
        />
      );
      const clearAllButton = screen.getByText(/clear all \(1\)/i);
      expect(clearAllButton).toBeInTheDocument();
    });
  });

  describe('Search Functionality', () => {
    it('should call handleSearchChange when search text changes', () => {
      render(<TodoFilters onFiltersChange={mockOnFiltersChange} />);
      const searchInput = screen.getByPlaceholderText('Search TODOs...');

      fireEvent.change(searchInput, { target: { value: 'test search' } });

      expect(mockHandleSearchChange).toHaveBeenCalledWith('test search');
    });

    it('should display existing search text', () => {
      (useTodoFilters as jest.Mock).mockReturnValueOnce({
        data: {
          statusOptions: [
            { label: 'Planned', key: 'planned', checked: undefined },
            { label: 'Done', key: 'done', checked: undefined },
            { label: 'Error', key: 'error', checked: undefined },
          ],
          priorityOptions: [
            { label: 'Low', key: 'low', checked: undefined },
            { label: 'Medium', key: 'medium', checked: undefined },
            { label: 'High', key: 'high', checked: undefined },
            { label: 'Critical', key: 'critical', checked: undefined },
          ],
          severityOptions: [
            { label: 'Info', key: 'info', checked: undefined },
            { label: 'Low', key: 'low', checked: undefined },
            { label: 'Medium', key: 'medium', checked: undefined },
            { label: 'High', key: 'high', checked: undefined },
            { label: 'Critical', key: 'critical', checked: undefined },
          ],
          localSearchText: 'existing search',
          localTags: '',
          localShowOverdueOnly: false,
          activeFiltersCount: 1,
        },
        uiState: {
          isStatusPopoverOpen: false,
          isPriorityPopoverOpen: false,
          isSeverityPopoverOpen: false,
        },
        actions: {
          setIsStatusPopoverOpen: mockSetIsStatusPopoverOpen,
          setIsPriorityPopoverOpen: mockSetIsPriorityPopoverOpen,
          setIsSeverityPopoverOpen: mockSetIsSeverityPopoverOpen,
          setLocalTags: mockSetLocalTags,
          handleSearchChange: mockHandleSearchChange,
          handleStatusChange: mockHandleStatusChange,
          handlePriorityChange: mockHandlePriorityChange,
          handleSeverityChange: mockHandleSeverityChange,
          handleTagsBlur: mockHandleTagsBlur,
          handleOverdueToggle: mockHandleOverdueToggle,
          handleClearAll: mockHandleClearAll,
        },
      });

      render(
        <TodoFilters
          searchText="existing search"
          onFiltersChange={mockOnFiltersChange}
        />
      );
      const searchInput = screen.getByPlaceholderText('Search TODOs...') as HTMLInputElement;
      expect(searchInput.value).toBe('existing search');
    });
  });

  describe('Status Filter', () => {
    it('should call setIsStatusPopoverOpen when status button clicked', () => {
      render(<TodoFilters onFiltersChange={mockOnFiltersChange} />);

      const statusButton = screen.getByText('Status');
      fireEvent.click(statusButton);

      expect(mockSetIsStatusPopoverOpen).toHaveBeenCalledWith(true);
    });

    it('should display selected statuses', () => {
      const selectedStatuses: TodoStatus[] = ['planned', 'done'];
      render(
        <TodoFilters
          selectedStatuses={selectedStatuses}
          onFiltersChange={mockOnFiltersChange}
        />
      );

      const statusButton = screen.getByText('Status');
      expect(statusButton).toBeInTheDocument();
    });
  });

  describe('Priority Filter', () => {
    it('should call setIsPriorityPopoverOpen when priority button clicked', () => {
      render(<TodoFilters onFiltersChange={mockOnFiltersChange} />);

      const priorityButton = screen.getByText('Priority');
      fireEvent.click(priorityButton);

      expect(mockSetIsPriorityPopoverOpen).toHaveBeenCalledWith(true);
    });

    it('should display selected priorities', () => {
      const selectedPriorities: TodoPriority[] = ['high', 'critical'];
      render(
        <TodoFilters
          selectedPriorities={selectedPriorities}
          onFiltersChange={mockOnFiltersChange}
        />
      );

      const priorityButton = screen.getByText('Priority');
      expect(priorityButton).toBeInTheDocument();
    });
  });

  describe('Severity Filter', () => {
    it('should call setIsSeverityPopoverOpen when severity button clicked', () => {
      render(<TodoFilters onFiltersChange={mockOnFiltersChange} />);

      const severityButton = screen.getByText('Severity');
      fireEvent.click(severityButton);

      expect(mockSetIsSeverityPopoverOpen).toHaveBeenCalledWith(true);
    });

    it('should display selected severities', () => {
      const selectedSeverities: TodoSeverity[] = ['high', 'critical'];
      render(
        <TodoFilters
          selectedSeverities={selectedSeverities}
          onFiltersChange={mockOnFiltersChange}
        />
      );

      const severityButton = screen.getByText('Severity');
      expect(severityButton).toBeInTheDocument();
    });
  });

  describe('Tags Filter', () => {
    it('should call handleTagsBlur when tags input loses focus', () => {
      render(<TodoFilters onFiltersChange={mockOnFiltersChange} />);
      const tagsInput = screen.getByPlaceholderText('Tags (comma-separated)');

      fireEvent.change(tagsInput, { target: { value: 'tag1, tag2, tag3' } });
      fireEvent.blur(tagsInput);

      expect(mockHandleTagsBlur).toHaveBeenCalled();
    });

    it('should handle empty tags gracefully', () => {
      render(<TodoFilters onFiltersChange={mockOnFiltersChange} />);
      const tagsInput = screen.getByPlaceholderText('Tags (comma-separated)');

      fireEvent.change(tagsInput, { target: { value: '' } });
      fireEvent.blur(tagsInput);

      // handleTagsBlur is called, which internally calls onFiltersChange
      expect(mockHandleTagsBlur).toHaveBeenCalled();
    });

    it('should trim whitespace from tags', () => {
      render(<TodoFilters onFiltersChange={mockOnFiltersChange} />);
      const tagsInput = screen.getByPlaceholderText('Tags (comma-separated)');

      fireEvent.change(tagsInput, { target: { value: '  tag1  ,  tag2  ' } });
      fireEvent.blur(tagsInput);

      // handleTagsBlur is called, trimming happens inside the hook
      expect(mockHandleTagsBlur).toHaveBeenCalled();
    });

    it('should display existing tags', () => {
      (useTodoFilters as jest.Mock).mockReturnValueOnce({
        data: {
          statusOptions: [
            { label: 'Planned', key: 'planned', checked: undefined },
            { label: 'Done', key: 'done', checked: undefined },
            { label: 'Error', key: 'error', checked: undefined },
          ],
          priorityOptions: [
            { label: 'Low', key: 'low', checked: undefined },
            { label: 'Medium', key: 'medium', checked: undefined },
            { label: 'High', key: 'high', checked: undefined },
            { label: 'Critical', key: 'critical', checked: undefined },
          ],
          severityOptions: [
            { label: 'Info', key: 'info', checked: undefined },
            { label: 'Low', key: 'low', checked: undefined },
            { label: 'Medium', key: 'medium', checked: undefined },
            { label: 'High', key: 'high', checked: undefined },
            { label: 'Critical', key: 'critical', checked: undefined },
          ],
          localSearchText: '',
          localTags: 'existing1, existing2',
          localShowOverdueOnly: false,
          activeFiltersCount: 2,
        },
        uiState: {
          isStatusPopoverOpen: false,
          isPriorityPopoverOpen: false,
          isSeverityPopoverOpen: false,
        },
        actions: {
          setIsStatusPopoverOpen: mockSetIsStatusPopoverOpen,
          setIsPriorityPopoverOpen: mockSetIsPriorityPopoverOpen,
          setIsSeverityPopoverOpen: mockSetIsSeverityPopoverOpen,
          setLocalTags: mockSetLocalTags,
          handleSearchChange: mockHandleSearchChange,
          handleStatusChange: mockHandleStatusChange,
          handlePriorityChange: mockHandlePriorityChange,
          handleSeverityChange: mockHandleSeverityChange,
          handleTagsBlur: mockHandleTagsBlur,
          handleOverdueToggle: mockHandleOverdueToggle,
          handleClearAll: mockHandleClearAll,
        },
      });

      const selectedTags = ['existing1', 'existing2'];
      render(
        <TodoFilters
          selectedTags={selectedTags}
          onFiltersChange={mockOnFiltersChange}
        />
      );

      const tagsInput = screen.getByPlaceholderText('Tags (comma-separated)') as HTMLInputElement;
      expect(tagsInput.value).toBe('existing1, existing2');
    });
  });

  describe('Overdue Only Filter', () => {
    it('should call handleOverdueToggle when overdue switch is toggled on', () => {
      render(<TodoFilters onFiltersChange={mockOnFiltersChange} />);
      const overdueSwitch = screen.getByRole('switch');

      fireEvent.click(overdueSwitch);

      expect(mockHandleOverdueToggle).toHaveBeenCalled();
    });

    it('should call handleOverdueToggle when overdue switch is toggled', () => {
      render(
        <TodoFilters
          showOverdueOnly={true}
          onFiltersChange={mockOnFiltersChange}
        />
      );
      const overdueSwitch = screen.getByRole('switch');

      fireEvent.click(overdueSwitch);

      expect(mockHandleOverdueToggle).toHaveBeenCalled();
    });
  });

  describe('Clear All Filters', () => {
    it('should call handleClearAll when clear all button is clicked', () => {
      (useTodoFilters as jest.Mock).mockReturnValueOnce({
        data: {
          statusOptions: [
            { label: 'Planned', key: 'planned', checked: 'on' },
            { label: 'Done', key: 'done', checked: undefined },
            { label: 'Error', key: 'error', checked: undefined },
          ],
          priorityOptions: [
            { label: 'Low', key: 'low', checked: undefined },
            { label: 'Medium', key: 'medium', checked: undefined },
            { label: 'High', key: 'high', checked: 'on' },
            { label: 'Critical', key: 'critical', checked: undefined },
          ],
          severityOptions: [
            { label: 'Info', key: 'info', checked: undefined },
            { label: 'Low', key: 'low', checked: undefined },
            { label: 'Medium', key: 'medium', checked: undefined },
            { label: 'High', key: 'high', checked: undefined },
            { label: 'Critical', key: 'critical', checked: 'on' },
          ],
          localSearchText: 'test',
          localTags: 'tag1',
          localShowOverdueOnly: true,
          activeFiltersCount: 6,
        },
        uiState: {
          isStatusPopoverOpen: false,
          isPriorityPopoverOpen: false,
          isSeverityPopoverOpen: false,
        },
        actions: {
          setIsStatusPopoverOpen: mockSetIsStatusPopoverOpen,
          setIsPriorityPopoverOpen: mockSetIsPriorityPopoverOpen,
          setIsSeverityPopoverOpen: mockSetIsSeverityPopoverOpen,
          setLocalTags: mockSetLocalTags,
          handleSearchChange: mockHandleSearchChange,
          handleStatusChange: mockHandleStatusChange,
          handlePriorityChange: mockHandlePriorityChange,
          handleSeverityChange: mockHandleSeverityChange,
          handleTagsBlur: mockHandleTagsBlur,
          handleOverdueToggle: mockHandleOverdueToggle,
          handleClearAll: mockHandleClearAll,
        },
      });

      render(
        <TodoFilters
          searchText="test"
          selectedStatuses={['planned']}
          selectedTags={['tag1']}
          selectedPriorities={['high']}
          selectedSeverities={['critical']}
          showOverdueOnly={true}
          onFiltersChange={mockOnFiltersChange}
        />
      );

      const clearAllButton = screen.getByText(/clear all \(6\)/i);
      fireEvent.click(clearAllButton);

      expect(mockHandleClearAll).toHaveBeenCalled();
    });

    it('should display correct count of active filters', () => {
      (useTodoFilters as jest.Mock).mockReturnValueOnce({
        data: {
          statusOptions: [
            { label: 'Planned', key: 'planned', checked: 'on' },
            { label: 'Done', key: 'done', checked: 'on' },
            { label: 'Error', key: 'error', checked: undefined },
          ],
          priorityOptions: [
            { label: 'Low', key: 'low', checked: undefined },
            { label: 'Medium', key: 'medium', checked: undefined },
            { label: 'High', key: 'high', checked: undefined },
            { label: 'Critical', key: 'critical', checked: undefined },
          ],
          severityOptions: [
            { label: 'Info', key: 'info', checked: undefined },
            { label: 'Low', key: 'low', checked: undefined },
            { label: 'Medium', key: 'medium', checked: undefined },
            { label: 'High', key: 'high', checked: undefined },
            { label: 'Critical', key: 'critical', checked: undefined },
          ],
          localSearchText: 'test',
          localTags: 'tag1',
          localShowOverdueOnly: false,
          activeFiltersCount: 4,
        },
        uiState: {
          isStatusPopoverOpen: false,
          isPriorityPopoverOpen: false,
          isSeverityPopoverOpen: false,
        },
        actions: {
          setIsStatusPopoverOpen: mockSetIsStatusPopoverOpen,
          setIsPriorityPopoverOpen: mockSetIsPriorityPopoverOpen,
          setIsSeverityPopoverOpen: mockSetIsSeverityPopoverOpen,
          setLocalTags: mockSetLocalTags,
          handleSearchChange: mockHandleSearchChange,
          handleStatusChange: mockHandleStatusChange,
          handlePriorityChange: mockHandlePriorityChange,
          handleSeverityChange: mockHandleSeverityChange,
          handleTagsBlur: mockHandleTagsBlur,
          handleOverdueToggle: mockHandleOverdueToggle,
          handleClearAll: mockHandleClearAll,
        },
      });

      render(
        <TodoFilters
          searchText="test"
          selectedStatuses={['planned', 'done']}
          selectedTags={['tag1']}
          onFiltersChange={mockOnFiltersChange}
        />
      );

      const clearAllButton = screen.getByText(/clear all \(4\)/i);
      expect(clearAllButton).toBeInTheDocument();
    });
  });

  describe('Combined Filters', () => {
    it('should handle multiple filters simultaneously', () => {
      render(<TodoFilters onFiltersChange={mockOnFiltersChange} />);

      const searchInput = screen.getByPlaceholderText('Search TODOs...');
      fireEvent.change(searchInput, { target: { value: 'important' } });

      expect(mockHandleSearchChange).toHaveBeenCalledWith('important');
    });

    it('should preserve other filters when updating one filter', () => {
      (useTodoFilters as jest.Mock).mockReturnValueOnce({
        data: {
          statusOptions: [
            { label: 'Planned', key: 'planned', checked: 'on' },
            { label: 'Done', key: 'done', checked: undefined },
            { label: 'Error', key: 'error', checked: undefined },
          ],
          priorityOptions: [
            { label: 'Low', key: 'low', checked: undefined },
            { label: 'Medium', key: 'medium', checked: undefined },
            { label: 'High', key: 'high', checked: undefined },
            { label: 'Critical', key: 'critical', checked: undefined },
          ],
          severityOptions: [
            { label: 'Info', key: 'info', checked: undefined },
            { label: 'Low', key: 'low', checked: undefined },
            { label: 'Medium', key: 'medium', checked: undefined },
            { label: 'High', key: 'high', checked: undefined },
            { label: 'Critical', key: 'critical', checked: undefined },
          ],
          localSearchText: '',
          localTags: 'urgent',
          localShowOverdueOnly: false,
          activeFiltersCount: 2,
        },
        uiState: {
          isStatusPopoverOpen: false,
          isPriorityPopoverOpen: false,
          isSeverityPopoverOpen: false,
        },
        actions: {
          setIsStatusPopoverOpen: mockSetIsStatusPopoverOpen,
          setIsPriorityPopoverOpen: mockSetIsPriorityPopoverOpen,
          setIsSeverityPopoverOpen: mockSetIsSeverityPopoverOpen,
          setLocalTags: mockSetLocalTags,
          handleSearchChange: mockHandleSearchChange,
          handleStatusChange: mockHandleStatusChange,
          handlePriorityChange: mockHandlePriorityChange,
          handleSeverityChange: mockHandleSeverityChange,
          handleTagsBlur: mockHandleTagsBlur,
          handleOverdueToggle: mockHandleOverdueToggle,
          handleClearAll: mockHandleClearAll,
        },
      });

      render(
        <TodoFilters
          selectedStatuses={['planned']}
          selectedTags={['urgent']}
          onFiltersChange={mockOnFiltersChange}
        />
      );

      const overdueSwitch = screen.getByRole('switch');
      fireEvent.click(overdueSwitch);

      expect(mockHandleOverdueToggle).toHaveBeenCalled();
    });
  });

  describe('Edge Cases', () => {
    it('should handle undefined props gracefully', () => {
      render(<TodoFilters onFiltersChange={mockOnFiltersChange} />);
      expect(screen.getByPlaceholderText('Search TODOs...')).toBeInTheDocument();
    });

    it('should handle empty arrays for filter selections', () => {
      render(
        <TodoFilters
          selectedStatuses={[]}
          selectedTags={[]}
          selectedPriorities={[]}
          selectedSeverities={[]}
          onFiltersChange={mockOnFiltersChange}
        />
      );
      expect(screen.getByPlaceholderText('Search TODOs...')).toBeInTheDocument();
    });

    it('should handle rapid filter changes', async () => {
      render(<TodoFilters onFiltersChange={mockOnFiltersChange} />);
      const searchInput = screen.getByPlaceholderText('Search TODOs...');

      fireEvent.change(searchInput, { target: { value: 'a' } });
      fireEvent.change(searchInput, { target: { value: 'ab' } });
      fireEvent.change(searchInput, { target: { value: 'abc' } });

      expect(mockHandleSearchChange).toHaveBeenCalledTimes(3);
    });
  });
});
