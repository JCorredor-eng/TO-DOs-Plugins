import React, { useState, useCallback } from 'react';
import {
  EuiFieldSearch,
  EuiFlexGroup,
  EuiFlexItem,
  EuiFilterGroup,
  EuiFilterButton,
  EuiPopover,
  EuiSelectable,
  EuiSelectableOption,
  EuiSpacer,
  EuiFieldText,
  EuiFormRow,
  EuiSwitch,
} from '@elastic/eui';
import { FormattedMessage } from '@osd/i18n/react';
import { i18n } from '@osd/i18n';
import {
  TodoStatus,
  TodoPriority,
  TodoSeverity,
  TODO_STATUS_LABELS,
  TODO_PRIORITY_VALUES,
  TODO_PRIORITY_LABELS,
  TODO_SEVERITY_VALUES,
  TODO_SEVERITY_LABELS,
} from '../../../../common/todo/todo.types';
interface TodoFiltersProps {
  searchText?: string;
  selectedStatuses?: TodoStatus[];
  selectedTags?: string[];
  selectedPriorities?: TodoPriority[];
  selectedSeverities?: TodoSeverity[];
  showOverdueOnly?: boolean;
  onFiltersChange: (filters: {
    searchText?: string;
    status?: TodoStatus[];
    tags?: string[];
    priority?: TodoPriority[];
    severity?: TodoSeverity[];
    isOverdue?: boolean;
  }) => void;
}
export const TodoFilters: React.FC<TodoFiltersProps> = ({
  searchText = '',
  selectedStatuses = [],
  selectedTags = [],
  selectedPriorities = [],
  selectedSeverities = [],
  showOverdueOnly = false,
  onFiltersChange,
}) => {
  const [isStatusPopoverOpen, setIsStatusPopoverOpen] = useState(false);
  const [isPriorityPopoverOpen, setIsPriorityPopoverOpen] = useState(false);
  const [isSeverityPopoverOpen, setIsSeverityPopoverOpen] = useState(false);
  const [localSearchText, setLocalSearchText] = useState(searchText);
  const [localTags, setLocalTags] = useState(selectedTags.join(', '));
  const [localShowOverdueOnly, setLocalShowOverdueOnly] = useState(showOverdueOnly);
  const statusOptions: EuiSelectableOption[] = [
    {
      label: TODO_STATUS_LABELS.planned,
      key: 'planned',
      checked: selectedStatuses.includes('planned') ? 'on' : undefined,
    },
    {
      label: TODO_STATUS_LABELS.done,
      key: 'done',
      checked: selectedStatuses.includes('done') ? 'on' : undefined,
    },
    {
      label: TODO_STATUS_LABELS.error,
      key: 'error',
      checked: selectedStatuses.includes('error') ? 'on' : undefined,
    },
  ];
  const priorityOptions: EuiSelectableOption[] = TODO_PRIORITY_VALUES.map((priority) => ({
    label: TODO_PRIORITY_LABELS[priority],
    key: priority,
    checked: selectedPriorities.includes(priority) ? 'on' : undefined,
  }));
  const severityOptions: EuiSelectableOption[] = TODO_SEVERITY_VALUES.map((severity) => ({
    label: TODO_SEVERITY_LABELS[severity],
    key: severity,
    checked: selectedSeverities.includes(severity) ? 'on' : undefined,
  }));
  const handleSearchChange = useCallback(
    (value: string) => {
      setLocalSearchText(value);
      onFiltersChange({
        searchText: value,
        status: selectedStatuses,
        tags: selectedTags,
        priority: selectedPriorities,
        severity: selectedSeverities,
        isOverdue: localShowOverdueOnly,
      });
    },
    [onFiltersChange, selectedStatuses, selectedTags, selectedPriorities, selectedSeverities, localShowOverdueOnly]
  );
  const handleStatusChange = useCallback(
    (options: EuiSelectableOption[]) => {
      const newStatuses = options
        .filter((option) => option.checked === 'on')
        .map((option) => option.key as TodoStatus);
      onFiltersChange({
        searchText: localSearchText,
        status: newStatuses,
        tags: selectedTags,
        priority: selectedPriorities,
        severity: selectedSeverities,
        isOverdue: localShowOverdueOnly,
      });
    },
    [onFiltersChange, localSearchText, selectedTags, selectedPriorities, selectedSeverities, localShowOverdueOnly]
  );
  const handlePriorityChange = useCallback(
    (options: EuiSelectableOption[]) => {
      const newPriorities = options
        .filter((option) => option.checked === 'on')
        .map((option) => option.key as TodoPriority);
      onFiltersChange({
        searchText: localSearchText,
        status: selectedStatuses,
        tags: selectedTags,
        priority: newPriorities,
        severity: selectedSeverities,
        isOverdue: localShowOverdueOnly,
      });
    },
    [onFiltersChange, localSearchText, selectedStatuses, selectedTags, selectedSeverities, localShowOverdueOnly]
  );
  const handleSeverityChange = useCallback(
    (options: EuiSelectableOption[]) => {
      const newSeverities = options
        .filter((option) => option.checked === 'on')
        .map((option) => option.key as TodoSeverity);
      onFiltersChange({
        searchText: localSearchText,
        status: selectedStatuses,
        tags: selectedTags,
        priority: selectedPriorities,
        severity: newSeverities,
        isOverdue: localShowOverdueOnly,
      });
    },
    [onFiltersChange, localSearchText, selectedStatuses, selectedTags, selectedPriorities, localShowOverdueOnly]
  );
  const handleTagsBlur = useCallback(() => {
    const tags = localTags
      .split(',')
      .map((tag) => tag.trim())
      .filter((tag) => tag.length > 0);
    onFiltersChange({
      searchText: localSearchText,
      status: selectedStatuses,
      tags,
      priority: selectedPriorities,
      severity: selectedSeverities,
      isOverdue: localShowOverdueOnly,
    });
  }, [localTags, onFiltersChange, localSearchText, selectedStatuses, selectedPriorities, selectedSeverities, localShowOverdueOnly]);
  const handleOverdueToggle = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const checked = e.target.checked;
      setLocalShowOverdueOnly(checked);
      onFiltersChange({
        searchText: localSearchText,
        status: selectedStatuses,
        tags: selectedTags,
        priority: selectedPriorities,
        severity: selectedSeverities,
        isOverdue: checked,
      });
    },
    [onFiltersChange, localSearchText, selectedStatuses, selectedTags, selectedPriorities, selectedSeverities]
  );
  const handleClearAll = useCallback(() => {
    setLocalSearchText('');
    setLocalTags('');
    setLocalShowOverdueOnly(false);
    onFiltersChange({
      searchText: '',
      status: [],
      tags: [],
      priority: [],
      severity: [],
      isOverdue: false,
    });
  }, [onFiltersChange]);
  const activeFiltersCount =
    (searchText ? 1 : 0) +
    selectedStatuses.length +
    selectedTags.length +
    selectedPriorities.length +
    selectedSeverities.length +
    (showOverdueOnly ? 1 : 0);
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
      <EuiSpacer size="m" />
    </>
  );
};
