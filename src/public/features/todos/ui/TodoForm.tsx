import React from 'react';
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
  EuiFlexGroup,
  EuiFlexItem,
  EuiButton,
  EuiButtonEmpty,
} from '@elastic/eui';
import { FormattedMessage } from '@osd/i18n/react';
import { i18n } from '@osd/i18n';
import {
  Todo,
  TodoStatus,
  MAX_COMPLIANCE_FRAMEWORKS,
} from '../../../../common/todo/todo.types';
import { CreateTodoRequest, UpdateTodoRequest } from '../../../../common/todo/todo.dtos';
import { TodosClient } from '../api/todos.client';
import { useTodoForm } from '../hooks/use_todo_form';

interface TodoFormProps {
  todo?: Todo | null;
  loading?: boolean;
  onSubmit: (data: CreateTodoRequest | UpdateTodoRequest) => Promise<void>;
  onClose: () => void;
  client: TodosClient;
}

export const TodoForm: React.FC<TodoFormProps> = ({ todo, loading = false, onSubmit, onClose, client }) => {
  const { data: hookData, formState, actions } = useTodoForm({ todo, onSubmit, client });

  const { isEditMode, suggestedTags, suggestedFrameworks, statusOptions, priorityOptions, severityOptions } = hookData;

  const {
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
  } = formState;

  const {
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
  } = actions;

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
