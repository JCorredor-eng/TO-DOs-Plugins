import { useState, useCallback, useEffect, useMemo } from 'react';
import { EuiComboBoxOptionOption } from '@elastic/eui';
import { i18n } from '@osd/i18n';
import {
  Todo,
  TodoStatus,
  TodoPriority,
  TodoSeverity,
  TODO_STATUS_VALUES,
  TODO_STATUS_LABELS,
  TODO_PRIORITY_VALUES,
  TODO_PRIORITY_LABELS,
  TODO_SEVERITY_VALUES,
  TODO_SEVERITY_LABELS,
  MAX_COMPLIANCE_FRAMEWORKS,
  MAX_COMPLIANCE_FRAMEWORK_LENGTH,
} from '../../../../common/todo/todo.types';
import { CreateTodoRequest, UpdateTodoRequest } from '../../../../common/todo/todo.dtos';
import { TodosClient } from '../api/todos.client';
import { useTodoSuggestions } from './use_todo_suggestions';

interface FormErrors {
  title?: string;
  description?: string;
  tags?: string;
  dueDate?: string;
  complianceFrameworks?: string;
}

interface UseTodoFormParams {
  todo?: Todo | null;
  onSubmit: (data: CreateTodoRequest | UpdateTodoRequest) => Promise<void>;
  client: TodosClient;
}

export const useTodoForm = ({ todo, onSubmit, client }: UseTodoFormParams) => {
  const isEditMode = !!todo;
  const { tags: suggestedTags, complianceFrameworks: suggestedFrameworks } = useTodoSuggestions({ client });

  // Form state
  const [title, setTitle] = useState(todo?.title || '');
  const [description, setDescription] = useState(todo?.description || '');
  const [status, setStatus] = useState<TodoStatus>(todo?.status || 'planned');
  const [assignee, setAssignee] = useState(todo?.assignee || '');
  const [selectedTags, setSelectedTags] = useState<EuiComboBoxOptionOption[]>(
    (todo?.tags || []).map((tag) => ({ label: tag }))
  );
  const [priority, setPriority] = useState<TodoPriority>(todo?.priority || 'medium');
  const [severity, setSeverity] = useState<TodoSeverity>(todo?.severity || 'low');
  const [dueDate, setDueDate] = useState(
    todo?.dueDate ? todo.dueDate.substring(0, 10) : ''
  );
  const [selectedComplianceFrameworks, setSelectedComplianceFrameworks] = useState<
    EuiComboBoxOptionOption[]
  >((todo?.complianceFrameworks || []).map((framework) => ({ label: framework })));
  const [errors, setErrors] = useState<FormErrors>({});

  // Sync form state when todo prop changes
  useEffect(() => {
    if (todo) {
      setTitle(todo.title);
      setDescription(todo.description || '');
      setStatus(todo.status);
      setAssignee(todo.assignee || '');
      setSelectedTags((todo.tags || []).map((tag) => ({ label: tag })));
      setPriority(todo.priority || 'medium');
      setSeverity(todo.severity || 'low');
      setDueDate(todo.dueDate ? todo.dueDate.substring(0, 10) : '');
      setSelectedComplianceFrameworks(
        (todo.complianceFrameworks || []).map((framework) => ({ label: framework }))
      );
    }
  }, [todo]);

  // Select options
  const statusOptions = useMemo(
    () =>
      TODO_STATUS_VALUES.map((status) => ({
        value: status,
        text: TODO_STATUS_LABELS[status],
      })),
    []
  );

  const priorityOptions = useMemo(
    () =>
      TODO_PRIORITY_VALUES.map((priority) => ({
        value: priority,
        text: TODO_PRIORITY_LABELS[priority],
      })),
    []
  );

  const severityOptions = useMemo(
    () =>
      TODO_SEVERITY_VALUES.map((severity) => ({
        value: severity,
        text: TODO_SEVERITY_LABELS[severity],
      })),
    []
  );

  // Validation
  const validate = useCallback((): boolean => {
    const newErrors: FormErrors = {};

    if (!title.trim()) {
      newErrors.title = i18n.translate('customPlugin.form.error.titleRequired', {
        defaultMessage: 'Title is required',
      });
    } else if (title.length > 256) {
      newErrors.title = i18n.translate('customPlugin.form.error.titleTooLong', {
        defaultMessage: 'Title must be 256 characters or less',
      });
    }

    if (description.length > 4000) {
      newErrors.description = i18n.translate('customPlugin.form.error.descriptionTooLong', {
        defaultMessage: 'Description must be 4000 characters or less',
      });
    }

    if (selectedTags.length > 20) {
      newErrors.tags = i18n.translate('customPlugin.form.error.tooManyTags', {
        defaultMessage: 'Maximum 20 tags allowed',
      });
    }

    if (dueDate) {
      const dueDateObj = new Date(dueDate);
      if (isNaN(dueDateObj.getTime())) {
        newErrors.dueDate = i18n.translate('customPlugin.form.error.invalidDate', {
          defaultMessage: 'Invalid date format',
        });
      }
    }

    if (selectedComplianceFrameworks.length > MAX_COMPLIANCE_FRAMEWORKS) {
      newErrors.complianceFrameworks = i18n.translate('customPlugin.form.error.tooManyFrameworks', {
        defaultMessage: 'Maximum {max} compliance frameworks allowed',
        values: { max: MAX_COMPLIANCE_FRAMEWORKS },
      });
    }

    const hasLongFramework = selectedComplianceFrameworks.some(
      (framework) => framework.label.length > MAX_COMPLIANCE_FRAMEWORK_LENGTH
    );
    if (hasLongFramework) {
      newErrors.complianceFrameworks = i18n.translate('customPlugin.form.error.frameworkTooLong', {
        defaultMessage: 'Each compliance framework must be {max} characters or less',
        values: { max: MAX_COMPLIANCE_FRAMEWORK_LENGTH },
      });
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [title, description, selectedTags, dueDate, selectedComplianceFrameworks]);

  // Form submission
  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      if (!validate()) {
        return;
      }

      const tags = selectedTags.map((tag) => tag.label);
      const complianceFrameworks = selectedComplianceFrameworks.map((framework) => framework.label);
      const dueDateISO = dueDate ? new Date(dueDate).toISOString() : undefined;

      if (isEditMode) {
        const updateData: UpdateTodoRequest = {};
        if (title !== todo.title) updateData.title = title;
        if (description !== (todo.description || '')) updateData.description = description;
        if (status !== todo.status) updateData.status = status;
        if (assignee !== (todo.assignee || '')) updateData.assignee = assignee;
        if (JSON.stringify(tags) !== JSON.stringify(todo.tags)) updateData.tags = tags;
        if (priority !== todo.priority) updateData.priority = priority;
        if (severity !== todo.severity) updateData.severity = severity;

        const existingDueDate = todo.dueDate ? todo.dueDate.substring(0, 10) : '';
        if (dueDate !== existingDueDate) {
          updateData.dueDate = dueDateISO || null;
        }

        if (
          JSON.stringify(complianceFrameworks) !== JSON.stringify(todo.complianceFrameworks || [])
        ) {
          updateData.complianceFrameworks = complianceFrameworks;
        }

        await onSubmit(updateData);
      } else {
        const createData: CreateTodoRequest = {
          title,
          status,
        };

        if (description) createData.description = description;
        if (tags.length > 0) createData.tags = tags;
        if (assignee) createData.assignee = assignee;
        if (priority !== 'medium') createData.priority = priority;
        if (severity !== 'low') createData.severity = severity;
        if (dueDateISO) createData.dueDate = dueDateISO;
        if (complianceFrameworks.length > 0) {
          createData.complianceFrameworks = complianceFrameworks;
        }

        await onSubmit(createData);
      }
    },
    [
      validate,
      isEditMode,
      title,
      description,
      status,
      assignee,
      selectedTags,
      priority,
      severity,
      dueDate,
      selectedComplianceFrameworks,
      todo,
      onSubmit,
    ]
  );

  const onCreateTag = useCallback((searchValue: string) => {
    const newOption = { label: searchValue };
    setSelectedTags((prev) => [...prev, newOption]);
  }, []);

  const onCreateComplianceFramework = useCallback((searchValue: string) => {
    const newOption = { label: searchValue };
    setSelectedComplianceFrameworks((prev) => [...prev, newOption]);
  }, []);

  return {
    data: {
      isEditMode,
      suggestedTags,
      suggestedFrameworks,
      statusOptions,
      priorityOptions,
      severityOptions,
    },
    formState: {
      title,
      description,
      status,
      assignee,
      selectedTags,
      priority,
      severity,
      dueDate,
      selectedComplianceFrameworks,
      errors,
    },
    actions: {
      setTitle,
      setDescription,
      setStatus,
      setAssignee,
      setSelectedTags,
      setPriority,
      setSeverity,
      setDueDate,
      setSelectedComplianceFrameworks,
      onCreateTag,
      onCreateComplianceFramework,
      handleSubmit,
    },
  };
};
