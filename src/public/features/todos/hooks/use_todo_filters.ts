import { useState, useCallback, useMemo } from 'react';
import { EuiSelectableOption } from '@elastic/eui';
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
import { DateRangeFilters } from '../ui/TodoFilters';

interface UseTodoFiltersParams {
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

export const useTodoFilters = ({
  searchText = '',
  selectedStatuses = [],
  selectedTags = [],
  selectedPriorities = [],
  selectedSeverities = [],
  showOverdueOnly = false,
  dateFilters = {},
  onFiltersChange,
}: UseTodoFiltersParams) => {
  // Popover states
  const [isStatusPopoverOpen, setIsStatusPopoverOpen] = useState(false);
  const [isPriorityPopoverOpen, setIsPriorityPopoverOpen] = useState(false);
  const [isSeverityPopoverOpen, setIsSeverityPopoverOpen] = useState(false);

  // Local states for controlled inputs
  const [localSearchText, setLocalSearchText] = useState(searchText);
  const [localTags, setLocalTags] = useState(selectedTags.join(', '));
  const [localShowOverdueOnly, setLocalShowOverdueOnly] = useState(showOverdueOnly);

  // Build selectable options
  const statusOptions: EuiSelectableOption[] = useMemo(
    () => [
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
    ],
    [selectedStatuses]
  );

  const priorityOptions: EuiSelectableOption[] = useMemo(
    () =>
      TODO_PRIORITY_VALUES.map((priority) => ({
        label: TODO_PRIORITY_LABELS[priority],
        key: priority,
        checked: selectedPriorities.includes(priority) ? 'on' : undefined,
      })),
    [selectedPriorities]
  );

  const severityOptions: EuiSelectableOption[] = useMemo(
    () =>
      TODO_SEVERITY_VALUES.map((severity) => ({
        label: TODO_SEVERITY_LABELS[severity],
        key: severity,
        checked: selectedSeverities.includes(severity) ? 'on' : undefined,
      })),
    [selectedSeverities]
  );

  // Handlers
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
        dateFilters: dateFilters,
      });
    },
    [
      onFiltersChange,
      selectedStatuses,
      selectedTags,
      selectedPriorities,
      selectedSeverities,
      localShowOverdueOnly,
      dateFilters,
    ]
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
        dateFilters: dateFilters,
      });
    },
    [
      onFiltersChange,
      localSearchText,
      selectedTags,
      selectedPriorities,
      selectedSeverities,
      localShowOverdueOnly,
      dateFilters,
    ]
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
        dateFilters: dateFilters,
      });
    },
    [
      onFiltersChange,
      localSearchText,
      selectedStatuses,
      selectedTags,
      selectedSeverities,
      localShowOverdueOnly,
      dateFilters,
    ]
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
        dateFilters: dateFilters,
      });
    },
    [
      onFiltersChange,
      localSearchText,
      selectedStatuses,
      selectedTags,
      selectedPriorities,
      localShowOverdueOnly,
      dateFilters,
    ]
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
      dateFilters: dateFilters,
    });
  }, [
    localTags,
    onFiltersChange,
    localSearchText,
    selectedStatuses,
    selectedPriorities,
    selectedSeverities,
    localShowOverdueOnly,
    dateFilters,
  ]);

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
        dateFilters: dateFilters,
      });
    },
    [
      onFiltersChange,
      localSearchText,
      selectedStatuses,
      selectedTags,
      selectedPriorities,
      selectedSeverities,
      dateFilters,
    ]
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
      dateFilters: {},
    });
  }, [onFiltersChange]);

  // Calculate active filters count
  const activeFiltersCount =
    (searchText ? 1 : 0) +
    selectedStatuses.length +
    selectedTags.length +
    selectedPriorities.length +
    selectedSeverities.length +
    (showOverdueOnly ? 1 : 0);

  return {
    data: {
      statusOptions,
      priorityOptions,
      severityOptions,
      localSearchText,
      localTags,
      localShowOverdueOnly,
      activeFiltersCount,
    },
    uiState: {
      isStatusPopoverOpen,
      isPriorityPopoverOpen,
      isSeverityPopoverOpen,
    },
    actions: {
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
    },
  };
};
