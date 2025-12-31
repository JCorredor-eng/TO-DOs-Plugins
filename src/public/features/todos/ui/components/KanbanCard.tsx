
import React, { useMemo } from 'react';
import {
  EuiPanel,
  EuiFlexGroup,
  EuiFlexItem,
  EuiTitle,
  EuiText,
  EuiBadge,
  EuiButtonIcon,
  EuiIcon,
  EuiSpacer,
  EuiToolTip,
} from '@elastic/eui';
import { FormattedMessage } from '@osd/i18n/react';
import { i18n } from '@osd/i18n';
import moment from 'moment';
import {
  Todo,
  TODO_PRIORITY_LABELS,
  TODO_PRIORITY_COLORS,
  TODO_SEVERITY_LABELS,
  TODO_SEVERITY_COLORS,
} from '../../../../../common/todo/todo.types';

/**
 * Props for KanbanCard component
 */
export interface KanbanCardProps {
  /** Todo item to display */
  readonly todo: Todo;
  /** Index for drag-drop ordering */
  readonly index: number;
  /** Callback when edit button is clicked */
  readonly onEdit: (todo: Todo) => void;
  /** Callback when delete button is clicked */
  readonly onDelete: (todoId: string) => void;
  /** Drag handle props from EuiDraggable */
  readonly dragHandleProps?: any;
}

/**
 * KanbanCard Component
 *
 * Displays a single TODO item as a draggable card in a kanban column.
 * Pure presentational component following PROJECT RULE #11.
 *
 * Features:
 * - Drag handle icon for reordering
 * - Title and description with truncation
 * - Priority and severity badges
 * - Tag display (first 3, with "+N" for extras)
 * - Assignee indicator
 * - Due date with overdue highlighting
 * - Edit/delete action buttons
 *
 * @param props - Component props
 * @returns React component rendering a kanban card
 */
export const KanbanCard: React.FC<KanbanCardProps> = ({
  todo,
  index,
  onEdit,
  onDelete,
  dragHandleProps,
}) => {
  /**
   * Calculate if todo is overdue (memoized)
   */
  const isOverdue = useMemo(() => {
    if (!todo.dueDate || todo.status === 'done') {
      return false;
    }
    return moment(todo.dueDate).isBefore(moment(), 'day');
  }, [todo.dueDate, todo.status]);

  /**
   * Format due date for display (memoized)
   */
  const formattedDueDate = useMemo(() => {
    if (!todo.dueDate) {
      return null;
    }
    return moment(todo.dueDate).format('MMM D, YYYY');
  }, [todo.dueDate]);

  /**
   * Tags to display (first 3)
   */
  const displayTags = useMemo(() => todo.tags.slice(0, 3), [todo.tags]);

  /**
   * Remaining tags count
   */
  const remainingTagsCount = useMemo(() => {
    return todo.tags.length > 3 ? todo.tags.length - 3 : 0;
  }, [todo.tags.length]);

  return (
    <EuiPanel paddingSize="s" hasShadow={false} hasBorder>
      <EuiFlexGroup alignItems="flexStart" gutterSize="s" responsive={false}>
        {/* Drag Handle */}
        <EuiFlexItem grow={false} {...dragHandleProps}>
          <EuiToolTip
            content={
              <FormattedMessage
                id="customPlugin.kanban.card.dragToMove"
                defaultMessage="Drag to move TODO"
              />
            }
          >
            <EuiIcon type="grab" color="subdued" style={{ cursor: 'grab' }} />
          </EuiToolTip>
        </EuiFlexItem>

        {/* Card Content */}
        <EuiFlexItem>
          {/* Title */}
          <EuiTitle size="xxs">
            <h4
              style={{
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                marginBottom: '4px',
              }}
            >
              {todo.title}
            </h4>
          </EuiTitle>

          {/* Description */}
          {todo.description && (
            <>
              <EuiText size="xs" color="subdued">
                <p
                  style={{
                    display: '-webkit-box',
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    marginBottom: '8px',
                  }}
                >
                  {todo.description}
                </p>
              </EuiText>
            </>
          )}

          <EuiSpacer size="xs" />

          {/* Badges Row */}
          <EuiFlexGroup gutterSize="xs" wrap responsive={false}>
            {/* Priority Badge */}
            <EuiFlexItem grow={false}>
              <EuiBadge color={TODO_PRIORITY_COLORS[todo.priority]}>
                {TODO_PRIORITY_LABELS[todo.priority]}
              </EuiBadge>
            </EuiFlexItem>

            {/* Severity Badge */}
            <EuiFlexItem grow={false}>
              <EuiBadge color={TODO_SEVERITY_COLORS[todo.severity]}>
                {TODO_SEVERITY_LABELS[todo.severity]}
              </EuiBadge>
            </EuiFlexItem>

            {/* Tags */}
            {displayTags.map((tag) => (
              <EuiFlexItem key={tag} grow={false}>
                <EuiBadge color="hollow">{tag}</EuiBadge>
              </EuiFlexItem>
            ))}

            {/* Remaining Tags Indicator */}
            {remainingTagsCount > 0 && (
              <EuiFlexItem grow={false}>
                <EuiToolTip
                  content={
                    <FormattedMessage
                      id="customPlugin.kanban.card.moreTags"
                      defaultMessage="{count} more tags"
                      values={{ count: remainingTagsCount }}
                    />
                  }
                >
                  <EuiBadge color="hollow">+{remainingTagsCount}</EuiBadge>
                </EuiToolTip>
              </EuiFlexItem>
            )}
          </EuiFlexGroup>

          <EuiSpacer size="xs" />

          {/* Meta Information Row */}
          <EuiFlexGroup gutterSize="s" alignItems="center" responsive={false}>
            {/* Assignee */}
            {todo.assignee && (
              <EuiFlexItem grow={false}>
                <EuiFlexGroup gutterSize="xs" alignItems="center" responsive={false}>
                  <EuiFlexItem grow={false}>
                    <EuiIcon type="user" size="s" color="subdued" />
                  </EuiFlexItem>
                  <EuiFlexItem grow={false}>
                    <EuiText size="xs" color="subdued">
                      {todo.assignee}
                    </EuiText>
                  </EuiFlexItem>
                </EuiFlexGroup>
              </EuiFlexItem>
            )}

            {/* Due Date */}
            {todo.dueDate && (
              <EuiFlexItem grow={false}>
                <EuiFlexGroup gutterSize="xs" alignItems="center" responsive={false}>
                  <EuiFlexItem grow={false}>
                    <EuiIcon
                      type="calendar"
                      size="s"
                      color={isOverdue ? 'danger' : 'subdued'}
                    />
                  </EuiFlexItem>
                  <EuiFlexItem grow={false}>
                    <EuiText size="xs" color={isOverdue ? 'danger' : 'subdued'}>
                      {formattedDueDate}
                      {isOverdue && (
                        <span>
                          {' '}
                          (
                          <FormattedMessage
                            id="customPlugin.kanban.card.overdue"
                            defaultMessage="Overdue"
                          />
                          )
                        </span>
                      )}
                    </EuiText>
                  </EuiFlexItem>
                </EuiFlexGroup>
              </EuiFlexItem>
            )}
          </EuiFlexGroup>
        </EuiFlexItem>

        {/* Action Buttons */}
        <EuiFlexItem grow={false}>
          <EuiFlexGroup direction="column" gutterSize="xs" responsive={false}>
            <EuiFlexItem grow={false}>
              <EuiButtonIcon
                iconType="pencil"
                aria-label={i18n.translate('customPlugin.kanban.card.edit', {
                  defaultMessage: 'Edit TODO',
                })}
                onClick={() => onEdit(todo)}
                color="primary"
                size="s"
              />
            </EuiFlexItem>
            <EuiFlexItem grow={false}>
              <EuiButtonIcon
                iconType="trash"
                aria-label={i18n.translate('customPlugin.kanban.card.delete', {
                  defaultMessage: 'Delete TODO',
                })}
                onClick={() => onDelete(todo.id)}
                color="danger"
                size="s"
              />
            </EuiFlexItem>
          </EuiFlexGroup>
        </EuiFlexItem>
      </EuiFlexGroup>
    </EuiPanel>
  );
};
