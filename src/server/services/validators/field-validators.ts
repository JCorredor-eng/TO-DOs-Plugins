
import { ValidationError } from '../../errors/app_errors';
import {
  TODO_PRIORITY_VALUES,
  TODO_SEVERITY_VALUES,
  TODO_STATUS_VALUES,
  MAX_COMPLIANCE_FRAMEWORKS,
  MAX_COMPLIANCE_FRAMEWORK_LENGTH,
} from '../../../common/todo/todo.types';

/**
 * Centralized field validation logic for TODO entities.
 * Provides reusable validation methods to ensure consistency
 * across create and update operations.
 */
export class FieldValidators {
  /**
   * Validates the title field.
   *
   * @param title - Title value to validate
   * @param isRequired - Whether the field is required
   * @throws {ValidationError} If validation fails
   */
  static validateTitle(title: string | undefined, isRequired: boolean): void {
    if (isRequired && (!title || title.trim().length === 0)) {
      throw new ValidationError('Title is required', { field: 'title' });
    }

    if (title !== undefined && title.trim().length === 0 && !isRequired) {
      throw new ValidationError('Title cannot be empty', { field: 'title' });
    }

    if (title && title.length > 256) {
      throw new ValidationError('Title must not exceed 256 characters', {
        field: 'title',
        maxLength: 256,
        actualLength: title.length,
      });
    }
  }

  /**
   * Validates the description field.
   *
   * @param description - Description value to validate
   * @throws {ValidationError} If validation fails
   */
  static validateDescription(description: string | undefined): void {
    if (description && description.length > 4000) {
      throw new ValidationError('Description must not exceed 4000 characters', {
        field: 'description',
        maxLength: 4000,
        actualLength: description.length,
      });
    }
  }

  /**
   * Validates the status field.
   *
   * @param status - Status value to validate
   * @throws {ValidationError} If validation fails
   */
  static validateStatus(status: string | undefined): void {
    if (status && !TODO_STATUS_VALUES.includes(status as any)) {
      throw new ValidationError(`Invalid status: ${status}`, {
        field: 'status',
        validValues: [...TODO_STATUS_VALUES],
      });
    }
  }

  /**
   * Validates the tags array.
   *
   * @param tags - Tags array to validate
   * @throws {ValidationError} If validation fails
   */
  static validateTags(tags: readonly string[] | undefined): void {
    if (!tags) {
      return;
    }

    if (tags.length > 20) {
      throw new ValidationError('Maximum 20 tags allowed', {
        field: 'tags',
        maxTags: 20,
        actualTags: tags.length,
      });
    }

    for (const tag of tags) {
      if (tag.length > 50) {
        throw new ValidationError('Each tag must not exceed 50 characters', {
          field: 'tags',
          maxLength: 50,
          tag,
        });
      }
    }
  }

  /**
   * Validates the assignee field.
   *
   * @param assignee - Assignee value to validate
   * @throws {ValidationError} If validation fails
   */
  static validateAssignee(assignee: string | undefined): void {
    if (assignee && assignee.length > 100) {
      throw new ValidationError('Assignee must not exceed 100 characters', {
        field: 'assignee',
        maxLength: 100,
        actualLength: assignee.length,
      });
    }
  }

  /**
   * Validates the priority field.
   *
   * @param priority - Priority value to validate
   * @throws {ValidationError} If validation fails
   */
  static validatePriority(priority: string | undefined): void {
    if (priority && !TODO_PRIORITY_VALUES.includes(priority as 'low' | 'medium' | 'high' | 'critical')) {
      throw new ValidationError(`Invalid priority: ${priority}`, {
        field: 'priority',
        validValues: [...TODO_PRIORITY_VALUES],
      });
    }
  }

  /**
   * Validates the severity field.
   *
   * @param severity - Severity value to validate
   * @throws {ValidationError} If validation fails
   */
  static validateSeverity(severity: string | undefined): void {
    if (severity && !TODO_SEVERITY_VALUES.includes(severity as 'info' | 'low' | 'medium' | 'high' | 'critical')) {
      throw new ValidationError(`Invalid severity: ${severity}`, {
        field: 'severity',
        validValues: [...TODO_SEVERITY_VALUES],
      });
    }
  }

  /**
   * Validates the dueDate field.
   *
   * @param dueDate - DueDate value to validate
   * @param allowNull - Whether null is allowed (for updates)
   * @throws {ValidationError} If validation fails
   */
  static validateDueDate(dueDate: string | undefined | null, allowNull: boolean = false): void {
    if (dueDate === null && allowNull) {
      return;
    }

    if (dueDate && !FieldValidators.isValidISODate(dueDate)) {
      throw new ValidationError('Invalid dueDate format. Use ISO 8601 format (e.g., 2025-12-31T23:59:59Z)', {
        field: 'dueDate',
        format: 'ISO 8601',
      });
    }
  }

  /**
   * Validates the complianceFrameworks array.
   *
   * @param frameworks - Compliance frameworks array to validate
   * @throws {ValidationError} If validation fails
   */
  static validateComplianceFrameworks(frameworks: readonly string[] | undefined): void {
    if (!frameworks) {
      return;
    }

    if (frameworks.length > MAX_COMPLIANCE_FRAMEWORKS) {
      throw new ValidationError(`Maximum ${MAX_COMPLIANCE_FRAMEWORKS} compliance frameworks allowed`, {
        field: 'complianceFrameworks',
        maxFrameworks: MAX_COMPLIANCE_FRAMEWORKS,
        actualFrameworks: frameworks.length,
      });
    }

    for (const framework of frameworks) {
      if (framework.length > MAX_COMPLIANCE_FRAMEWORK_LENGTH) {
        throw new ValidationError(`Each compliance framework must not exceed ${MAX_COMPLIANCE_FRAMEWORK_LENGTH} characters`, {
          field: 'complianceFrameworks',
          maxLength: MAX_COMPLIANCE_FRAMEWORK_LENGTH,
          framework,
        });
      }
    }
  }

  /**
   * Checks if a string is a valid ISO 8601 date.
   *
   * @param dateString - Date string to validate
   * @returns True if valid ISO date, false otherwise
   */
  private static isValidISODate(dateString: string): boolean {
    try {
      const date = new Date(dateString);
      return !isNaN(date.getTime()) && date.toISOString() === dateString;
    } catch {
      return false;
    }
  }
}
