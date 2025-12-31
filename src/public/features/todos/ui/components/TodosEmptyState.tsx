import React from 'react';
import { EuiEmptyPrompt, EuiButton } from '@elastic/eui';
import { FormattedMessage } from '@osd/i18n/react';

/**
 * Props for TodosEmptyState component
 */
export interface TodosEmptyStateProps {
  /** Icon type to display in the empty state */
  readonly iconType?: string;
  /** Callback invoked when the create button is clicked */
  readonly onCreateClick: () => void;
}

/**
 * TodosEmptyState Component
 *
 * Displays an empty state prompt when no TODOs are found.
 * Used across different tabs (Table, Kanban) to provide consistent empty state UX.
 *
 * Following PROJECT RULE #11:
 * - Purely presentational (props in, JSX out)
 * - No business logic
 * - Uses EUI components for consistency
 *
 * @param props - Component props
 * @returns React component rendering empty state prompt
 */
export const TodosEmptyState: React.FC<TodosEmptyStateProps> = ({
  iconType = 'document',
  onCreateClick,
}) => {
  return (
    <EuiEmptyPrompt
      iconType={iconType}
      title={
        <h2>
          <FormattedMessage
            id="customPlugin.empty.noTodos.title"
            defaultMessage="No TODOs Found"
          />
        </h2>
      }
      body={
        <p>
          <FormattedMessage
            id="customPlugin.empty.noTodos.body"
            defaultMessage="Create your first TODO item to get started."
          />
        </p>
      }
      actions={
        <EuiButton onClick={onCreateClick} fill iconType="plusInCircle">
          <FormattedMessage
            id="customPlugin.actions.button.createTodo"
            defaultMessage="Create TODO"
          />
        </EuiButton>
      }
    />
  );
};
