import React, { useState, useCallback, useEffect } from 'react';
import {
  EuiFlyout,
  EuiFlyoutHeader,
  EuiFlyoutBody,
  EuiFlyoutFooter,
  EuiTitle,
  EuiForm,
  EuiFormRow,
  EuiFieldText,
  EuiTextArea,
  EuiSelect,
  EuiComboBox,
  EuiComboBoxOptionOption,
  EuiFlexGroup,
  EuiFlexItem,
  EuiButton,
  EuiButtonEmpty,
  EuiSpacer,
} from '@elastic/eui';
import { FormattedMessage } from '@osd/i18n/react';
import { i18n } from '@osd/i18n';
import {
  Todo,
  TodoStatus,
  TodoPriority,
  TodoSeverity,
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
import { useTodoSuggestions } from '../hooks/use_todo_suggestions';

interface TodoFormProps {
  todo?: Todo | null;
  loading?: boolean;
  onSubmit: (data: CreateTodoRequest | UpdateTodoRequest) => Promise<void>;
  onClose: () => void;
  client: TodosClient;
}

interface FormErrors {
  title?: string;
  description?: string;
  tags?: string;
  dueDate?: string;
  complianceFrameworks?: string;
}

export const TodoForm: React.FC<TodoFormProps> = ({ todo, loading = false, onSubmit, onClose, client }) => {
  const isEditMode = !!todo;

  const { tags: suggestedTags, complianceFrameworks: suggestedFrameworks } = useTodoSuggestions({ client });

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

  const statusOptions = [
    { value: 'planned', text: TODO_STATUS_LABELS.planned },
    { value: 'done', text: TODO_STATUS_LABELS.done },
    { value: 'error', text: TODO_STATUS_LABELS.error },
  ];

  const priorityOptions = TODO_PRIORITY_VALUES.map((priority) => ({
    value: priority,
    text: TODO_PRIORITY_LABELS[priority],
  }));

  const severityOptions = TODO_SEVERITY_VALUES.map((severity) => ({
    value: severity,
    text: TODO_SEVERITY_LABELS[severity],
  }));

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

  return (
    <EuiFlyout onClose={onClose} size="m" ownFocus>
      <EuiFlyoutHeader hasBorder>
        <EuiTitle size="m">
          <h2>
            {isEditMode ? (
              <FormattedMessage id="customPlugin.form.title.edit" defaultMessage="Edit TODO" />
            ) : (
              <FormattedMessage id="customPlugin.form.title.create" defaultMessage="Create TODO" />
            )}
          </h2>
        </EuiTitle>
      </EuiFlyoutHeader>

      <EuiFlyoutBody>
        <EuiForm component="form" onSubmit={handleSubmit}>
          <EuiFormRow
            label={
              <FormattedMessage id="customPlugin.form.field.title" defaultMessage="Title" />
            }
            isInvalid={!!errors.title}
            error={errors.title}
            fullWidth
            helpText={
              <FormattedMessage
                id="customPlugin.form.help.titleRequired"
                defaultMessage="Required. Maximum 256 characters."
              />
            }
          >
            <EuiFieldText
              name="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              isInvalid={!!errors.title}
              fullWidth
              required
            />
          </EuiFormRow>

          <EuiFormRow
            label={
              <FormattedMessage
                id="customPlugin.form.field.description"
                defaultMessage="Description"
              />
            }
            isInvalid={!!errors.description}
            error={errors.description}
            fullWidth
            helpText={
              <FormattedMessage
                id="customPlugin.form.help.descriptionOptional"
                defaultMessage="Optional. Maximum 4000 characters."
              />
            }
          >
            <EuiTextArea
              name="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              isInvalid={!!errors.description}
              fullWidth
              rows={6}
            />
          </EuiFormRow>

          <EuiFormRow
            label={
              <FormattedMessage id="customPlugin.form.field.status" defaultMessage="Status" />
            }
            fullWidth
          >
            <EuiSelect
              name="status"
              value={status}
              onChange={(e) => setStatus(e.target.value as TodoStatus)}
              options={statusOptions}
              fullWidth
            />
          </EuiFormRow>

          <EuiFormRow
            label={<FormattedMessage id="customPlugin.form.field.tags" defaultMessage="Tags" />}
            isInvalid={!!errors.tags}
            error={errors.tags}
            fullWidth
            helpText={
              <FormattedMessage
                id="customPlugin.form.help.tagsOptional"
                defaultMessage="Optional. Press Enter to create a new tag. Maximum 20 tags."
              />
            }
          >
            <EuiComboBox
              placeholder={i18n.translate('customPlugin.form.placeholder.tags', {
                defaultMessage: 'Add tags',
              })}
              options={suggestedTags.map((tag) => ({ label: tag }))}
              selectedOptions={selectedTags}
              onChange={setSelectedTags}
              onCreateOption={onCreateTag}
              isInvalid={!!errors.tags}
              fullWidth
            />
          </EuiFormRow>

          <EuiFormRow
            label={
              <FormattedMessage id="customPlugin.form.field.assignee" defaultMessage="Assignee" />
            }
            fullWidth
            helpText={
              <FormattedMessage
                id="customPlugin.form.help.assigneeOptional"
                defaultMessage="Optional. Maximum 100 characters."
              />
            }
          >
            <EuiFieldText
              name="assignee"
              value={assignee}
              onChange={(e) => setAssignee(e.target.value)}
              fullWidth
              placeholder={i18n.translate('customPlugin.form.placeholder.assignee', {
                defaultMessage: 'e.g., john.doe',
              })}
            />
          </EuiFormRow>

          <EuiFormRow
            label={
              <FormattedMessage id="customPlugin.form.field.priority" defaultMessage="Priority" />
            }
            fullWidth
            helpText={
              <FormattedMessage
                id="customPlugin.form.help.priorityLevel"
                defaultMessage="Priority level for task execution."
              />
            }
          >
            <EuiSelect
              name="priority"
              value={priority}
              onChange={(e) => setPriority(e.target.value as TodoPriority)}
              options={priorityOptions}
              fullWidth
            />
          </EuiFormRow>

          <EuiFormRow
            label={
              <FormattedMessage id="customPlugin.form.field.severity" defaultMessage="Severity" />
            }
            fullWidth
            helpText={
              <FormattedMessage
                id="customPlugin.form.help.severityLevel"
                defaultMessage="Impact level of the task."
              />
            }
          >
            <EuiSelect
              name="severity"
              value={severity}
              onChange={(e) => setSeverity(e.target.value as TodoSeverity)}
              options={severityOptions}
              fullWidth
            />
          </EuiFormRow>

          <EuiFormRow
            label={
              <FormattedMessage id="customPlugin.form.field.dueDate" defaultMessage="Due Date" />
            }
            isInvalid={!!errors.dueDate}
            error={errors.dueDate}
            fullWidth
            helpText={
              <FormattedMessage
                id="customPlugin.form.help.dueDateOptional"
                defaultMessage="Optional. Target completion date."
              />
            }
          >
            <EuiFieldText
              name="dueDate"
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              isInvalid={!!errors.dueDate}
              fullWidth
            />
          </EuiFormRow>

          <EuiFormRow
            label={
              <FormattedMessage
                id="customPlugin.form.field.complianceFrameworks"
                defaultMessage="Compliance Frameworks"
              />
            }
            isInvalid={!!errors.complianceFrameworks}
            error={errors.complianceFrameworks}
            fullWidth
            helpText={
              <FormattedMessage
                id="customPlugin.form.help.complianceOptional"
                defaultMessage="Optional. Press Enter to add. Maximum {max} frameworks."
                values={{ max: MAX_COMPLIANCE_FRAMEWORKS }}
              />
            }
          >
            <EuiComboBox
              placeholder={i18n.translate('customPlugin.form.placeholder.complianceFrameworks', {
                defaultMessage: 'Add compliance frameworks (e.g., PCI-DSS, ISO-27001)',
              })}
              options={suggestedFrameworks.map((framework) => ({ label: framework }))}
              selectedOptions={selectedComplianceFrameworks}
              onChange={setSelectedComplianceFrameworks}
              onCreateOption={onCreateComplianceFramework}
              isInvalid={!!errors.complianceFrameworks}
              fullWidth
            />
          </EuiFormRow>
        </EuiForm>
      </EuiFlyoutBody>

      <EuiFlyoutFooter>
        <EuiFlexGroup justifyContent="spaceBetween">
          <EuiFlexItem grow={false}>
            <EuiButtonEmpty onClick={onClose} disabled={loading}>
              <FormattedMessage
                id="customPlugin.actions.button.cancel"
                defaultMessage="Cancel"
              />
            </EuiButtonEmpty>
          </EuiFlexItem>
          <EuiFlexItem grow={false}>
            <EuiButton
              onClick={handleSubmit}
              fill
              isLoading={loading}
              disabled={loading}
              iconType={isEditMode ? 'save' : 'plusInCircle'}
            >
              {isEditMode ? (
                <FormattedMessage
                  id="customPlugin.actions.button.save"
                  defaultMessage="Save Changes"
                />
              ) : (
                <FormattedMessage
                  id="customPlugin.actions.button.createTodo"
                  defaultMessage="Create TODO"
                />
              )}
            </EuiButton>
          </EuiFlexItem>
        </EuiFlexGroup>
      </EuiFlyoutFooter>
    </EuiFlyout>
  );
};
