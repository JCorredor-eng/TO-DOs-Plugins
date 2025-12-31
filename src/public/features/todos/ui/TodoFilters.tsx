import React from 'react';
import {
  EuiFieldSearch,
  EuiFlexGroup,
  EuiFlexItem,
  EuiFilterGroup,
  EuiFilterButton,
  EuiPopover,
  EuiSelectable,
  EuiFieldText,
  EuiSwitch,
} from '@elastic/eui';
import { FormattedMessage } from '@osd/i18n/react';
import { i18n } from '@osd/i18n';
import {
  TodoStatus,
  TodoPriority,
  TodoSeverity,
} from '../../../../common/todo/todo.types';
import { useTodoFilters } from '../hooks/use_todo_filters';

export interface DateRangeFilters {
  createdAfter?: string;
  createdBefore?: string;
  updatedAfter?: string;
  updatedBefore?: string;
  completedAfter?: string;
  completedBefore?: string;
  dueDateAfter?: string;
  dueDateBefore?: string;
}

interface TodoFiltersProps {
  searchText?: string;
  selectedStatuses?: TodoStatus[];
  selectedTags?: string[];
  selectedPriorities?: TodoPriority[];
  selectedSeverities?: TodoSeverity[];
  showOverdueOnly?: boolean;
  dateFilters?: DateRangeFilters;
  onFiltersChange: (filters: {
    searchText?: string;
    status?: TodoStatus[];
    tags?: string[];
    priority?: TodoPriority[];
    severity?: TodoSeverity[];
    isOverdue?: boolean;
    dateFilters?: DateRangeFilters;
  }) => void;
}

export const TodoFilters: React.FC<TodoFiltersProps> = ({
  searchText = '',
  selectedStatuses = [],
  selectedTags = [],
  selectedPriorities = [],
  selectedSeverities = [],
  showOverdueOnly = false,
  dateFilters = {},
  onFiltersChange,
}) => {
  const { data: hookData, uiState, actions } = useTodoFilters({
    searchText,
    selectedStatuses,
    selectedTags,
    selectedPriorities,
    selectedSeverities,
    showOverdueOnly,
    dateFilters,
    onFiltersChange,
  });

  const {
    statusOptions,
    priorityOptions,
    severityOptions,
    localSearchText,
    localTags,
    localShowOverdueOnly,
    activeFiltersCount,
  } = hookData;

  const { isStatusPopoverOpen, isPriorityPopoverOpen, isSeverityPopoverOpen } = uiState;

  const {
    setIsStatusPopoverOpen,
    setIsPriorityPopoverOpen,
    setIsSeverityPopoverOpen,
    setLocalTags,
    handleSearchChange,
    handleStatusChange,
    handlePriorityChange,
    handleSeverityChange,
    handleTagsBlur,
    handleOverdueToggle,
    handleClearAll,
  } = actions;

  const statusButton = (
    <EuiFilterButton
      iconType="arrowDown"
      onClick={() => setIsStatusPopoverOpen(!isStatusPopoverOpen)}
      isSelected={isStatusPopoverOpen}
      numFilters={selectedStatuses.length}
      hasActiveFilters={selectedStatuses.length > 0}
      numActiveFilters={selectedStatuses.length}
    >
      <FormattedMessage id="customPlugin.filters.button.status" defaultMessage="Status" />
    </EuiFilterButton>
  );

  const priorityButton = (
    <EuiFilterButton
      iconType="arrowDown"
      onClick={() => setIsPriorityPopoverOpen(!isPriorityPopoverOpen)}
      isSelected={isPriorityPopoverOpen}
      numFilters={selectedPriorities.length}
      hasActiveFilters={selectedPriorities.length > 0}
      numActiveFilters={selectedPriorities.length}
    >
      <FormattedMessage id="customPlugin.filters.button.priority" defaultMessage="Priority" />
    </EuiFilterButton>
  );

  const severityButton = (
    <EuiFilterButton
      iconType="arrowDown"
      onClick={() => setIsSeverityPopoverOpen(!isSeverityPopoverOpen)}
      isSelected={isSeverityPopoverOpen}
      numFilters={selectedSeverities.length}
      hasActiveFilters={selectedSeverities.length > 0}
      numActiveFilters={selectedSeverities.length}
    >
      <FormattedMessage id="customPlugin.filters.button.severity" defaultMessage="Severity" />
    </EuiFilterButton>
  );

  return (
    <>
      <EuiFlexGroup gutterSize="s" alignItems="center" wrap>
        <EuiFlexItem grow={true} style={{ minWidth: 300 }}>
          <EuiFieldSearch
            placeholder={i18n.translate('customPlugin.filters.placeholder.search', {
              defaultMessage: 'Search TODOs...',
            })}
            value={localSearchText}
            onChange={(e) => handleSearchChange(e.target.value)}
            isClearable
            fullWidth
          />
        </EuiFlexItem>

        <EuiFlexItem grow={false}>
          <EuiFilterGroup>
            <EuiPopover
              button={statusButton}
              isOpen={isStatusPopoverOpen}
              closePopover={() => setIsStatusPopoverOpen(false)}
              panelPaddingSize="none"
            >
              <EuiSelectable
                options={statusOptions}
                onChange={handleStatusChange}
                listProps={{ bordered: true }}
              >
                {(list) => <div style={{ width: 200 }}>{list}</div>}
              </EuiSelectable>
            </EuiPopover>

            <EuiPopover
              button={priorityButton}
              isOpen={isPriorityPopoverOpen}
              closePopover={() => setIsPriorityPopoverOpen(false)}
              panelPaddingSize="none"
            >
              <EuiSelectable
                options={priorityOptions}
                onChange={handlePriorityChange}
                listProps={{ bordered: true }}
              >
                {(list) => <div style={{ width: 200 }}>{list}</div>}
              </EuiSelectable>
            </EuiPopover>

            <EuiPopover
              button={severityButton}
              isOpen={isSeverityPopoverOpen}
              closePopover={() => setIsSeverityPopoverOpen(false)}
              panelPaddingSize="none"
            >
              <EuiSelectable
                options={severityOptions}
                onChange={handleSeverityChange}
                listProps={{ bordered: true }}
              >
                {(list) => <div style={{ width: 200 }}>{list}</div>}
              </EuiSelectable>
            </EuiPopover>
          </EuiFilterGroup>
        </EuiFlexItem>

        <EuiFlexItem grow={false} style={{ minWidth: 180 }}>
          <EuiFieldText
            placeholder={i18n.translate('customPlugin.filters.placeholder.tags', {
              defaultMessage: 'Tags (comma-separated)',
            })}
            value={localTags}
            onChange={(e) => setLocalTags(e.target.value)}
            onBlur={handleTagsBlur}
          />
        </EuiFlexItem>

        <EuiFlexItem grow={false}>
          <EuiSwitch
            label={i18n.translate('customPlugin.filters.switch.overdueOnly', {
              defaultMessage: 'Overdue only',
            })}
            checked={localShowOverdueOnly}
            onChange={handleOverdueToggle}
          />
        </EuiFlexItem>

        {activeFiltersCount > 0 && (
          <EuiFlexItem grow={false}>
            <EuiFilterButton onClick={handleClearAll} iconType="cross">
              <FormattedMessage
                id="customPlugin.filters.button.clearAll"
                defaultMessage="Clear all ({count})"
                values={{ count: activeFiltersCount }}
              />
            </EuiFilterButton>
          </EuiFlexItem>
        )}
      </EuiFlexGroup>

    </>
  );
};
