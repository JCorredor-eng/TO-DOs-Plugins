
import React from 'react';
import {
  EuiPanel,
  EuiTitle,
  EuiSpacer,
  EuiEmptyPrompt,
  EuiDraggable,
  EuiDroppable,
} from '@elastic/eui';
import { FormattedMessage } from '@osd/i18n/react';
import { Todo, TodoStatus } from '../../../../../common/todo/todo.types';
import { KanbanCard } from './KanbanCard';

/**
 * Props for KanbanColumn component
 */
export interface KanbanColumnProps {
  /** Status value for this column */
  readonly status: TodoStatus;
  /** Display title for column header */
  readonly title: string;
  /** EUI color for visual accent */
  readonly color: string;
  /** Todos to display in this column */
  readonly todos: readonly Todo[];
  /** Unique ID for drag-drop library */
  readonly droppableId: string;
  /** Callback when edit is clicked on a card */
  readonly onEdit: (todo: Todo) => void;
  /** Callback when delete is clicked on a card */
  readonly onDelete: (todoId: string) => void;
}

/**
 * KanbanColumn Component
 *
 * Displays a single column in the kanban board with a droppable area for cards.
 * Pure presentational component following PROJECT RULE #11.
 *
 * Features:
 * - Column header with title and count
 * - Droppable area for todo cards
 * - Empty state when no todos
 * - Color accent for visual distinction
 *
 * @param props - Component props
 * @returns React component rendering a kanban column
 */
export const KanbanColumn: React.FC<KanbanColumnProps> = ({
  status,
  title,
  color,
  todos,
  droppableId,
  onEdit,
  onDelete,
}) => {
  return (
    <EuiPanel
      paddingSize="m"
      hasShadow={false}
      hasBorder
      style={{
        minHeight: '500px',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Column Header */}
      <EuiTitle size="xs">
        <h3>
          {title} ({todos.length})
        </h3>
      </EuiTitle>

      <EuiSpacer size="m" />

      {/* Droppable Area */}
      {todos.length === 0 ? (
        // Empty State
        <EuiEmptyPrompt
          iconType="visTable"
          title={
            <h4>
              <FormattedMessage
                id="customPlugin.kanban.column.empty.title"
                defaultMessage="No {status} tasks"
                values={{ status: title.toLowerCase() }}
              />
            </h4>
          }
          body={
            <p>
              <FormattedMessage
                id="customPlugin.kanban.column.empty.body"
                defaultMessage="Drag tasks here or create new ones"
              />
            </p>
          }
          titleSize="xs"
        />
      ) : (
        <EuiDroppable
          droppableId={droppableId}
          spacing="m"
          style={{
            flexGrow: 1,
            minHeight: '400px',
          }}
        >
          {todos.map((todo, index) => (
            <EuiDraggable
              key={todo.id}
              draggableId={todo.id}
              index={index}
              customDragHandle={true}
              hasInteractiveChildren={true}
            >
              {(provided) => (
                <KanbanCard
                  todo={todo}
                  index={index}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  dragHandleProps={provided.dragHandleProps}
                />
              )}
            </EuiDraggable>
          ))}
        </EuiDroppable>
      )}
    </EuiPanel>
  );
};
