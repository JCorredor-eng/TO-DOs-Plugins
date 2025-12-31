/**
 * Base class for all application-specific errors.
 * Extends the native Error class with HTTP status codes and error codes.
 *
 * @abstract
 * @remarks
 * All application errors should extend this class to ensure consistent
 * error handling and HTTP response mapping.
 */
export abstract class AppError extends Error {
  /** HTTP status code for this error type */
  abstract readonly statusCode: number;

  /** Machine-readable error code (e.g., 'NOT_FOUND', 'VALIDATION_ERROR') */
  abstract readonly code: string;

  /** Optional additional details about the error */
  readonly details?: Record<string, unknown>;

  /**
   * Creates a new application error.
   *
   * @param message - Human-readable error message
   * @param details - Optional additional error details
   */
  constructor(message: string, details?: Record<string, unknown>) {
    super(message);
    this.name = this.constructor.name;
    this.details = details;
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }

  /**
   * Converts the error to a JSON-serializable object.
   * Used for API error responses.
   *
   * @returns Error object compatible with {@link ApiErrorResponse}
   */
  toJSON(): {
    statusCode: number;
    error: string;
    message: string;
    details?: Record<string, unknown>;
  } {
    return {
      statusCode: this.statusCode,
      error: this.code,
      message: this.message,
      ...(this.details && { details: this.details }),
    };
  }
}
/**
 * Error thrown when a requested resource is not found.
 * Maps to HTTP 404 status code.
 *
 * @example
 * ```typescript
 * throw new NotFoundError('TODO', 'abc123');
 * // Results in: "TODO with id 'abc123' not found"
 * ```
 */
export class NotFoundError extends AppError {
  readonly statusCode = 404;
  readonly code = 'NOT_FOUND';

  /**
   * Creates a new not found error.
   *
   * @param resource - The type of resource that was not found (e.g., 'TODO', 'User')
   * @param identifier - The identifier that was used to look up the resource
   */
  constructor(resource: string, identifier: string) {
    super(`${resource} with id '${identifier}' not found`);
  }
}
/**
 * Error thrown when request validation fails.
 * Maps to HTTP 400 status code.
 *
 * @example
 * ```typescript
 * throw new ValidationError('Title is required', { field: 'title' });
 * ```
 */
export class ValidationError extends AppError {
  readonly statusCode = 400;
  readonly code = 'VALIDATION_ERROR';

  /**
   * Creates a new validation error.
   *
   * @param message - Description of the validation failure
   * @param details - Optional details about which fields failed validation
   */
  constructor(message: string, details?: Record<string, unknown>) {
    super(message, details);
  }
}
/**
 * Error thrown when a resource conflict occurs.
 * Maps to HTTP 409 status code.
 *
 * @example
 * ```typescript
 * throw new ConflictError('A TODO with this title already exists');
 * ```
 */
export class ConflictError extends AppError {
  readonly statusCode = 409;
  readonly code = 'CONFLICT';

  /**
   * Creates a new conflict error.
   *
   * @param message - Description of the conflict
   * @param details - Optional details about the conflict
   */
  constructor(message: string, details?: Record<string, unknown>) {
    super(message, details);
  }
}
/**
 * Error thrown when an OpenSearch index operation fails.
 * Maps to HTTP 500 status code.
 *
 * @example
 * ```typescript
 * throw new IndexError('Failed to create index', { indexName: 'todos' });
 * ```
 */
export class IndexError extends AppError {
  readonly statusCode = 500;
  readonly code = 'INDEX_ERROR';

  /**
   * Creates a new index error.
   *
   * @param message - Description of the index operation failure
   * @param details - Optional details about the failure
   */
  constructor(message: string, details?: Record<string, unknown>) {
    super(`OpenSearch index error: ${message}`, details);
  }
}
/**
 * Error thrown when a business rule is violated.
 * Maps to HTTP 422 status code (Unprocessable Entity).
 *
 * @example
 * ```typescript
 * throw new BusinessRuleError('Cannot complete a TODO that has no assignee');
 * ```
 */
export class BusinessRuleError extends AppError {
  readonly statusCode = 422;
  readonly code = 'BUSINESS_RULE_VIOLATION';

  /**
   * Creates a new business rule error.
   *
   * @param message - Description of the business rule violation
   * @param details - Optional details about the violation
   */
  constructor(message: string, details?: Record<string, unknown>) {
    super(message, details);
  }
}
/**
 * Error thrown for unexpected internal server errors.
 * Maps to HTTP 500 status code.
 *
 * @example
 * ```typescript
 * throw new InternalError('Database connection failed');
 * ```
 */
export class InternalError extends AppError {
  readonly statusCode = 500;
  readonly code = 'INTERNAL_ERROR';

  /**
   * Creates a new internal error.
   *
   * @param message - Description of the error (defaults to generic message)
   * @param details - Optional details about the error
   */
  constructor(message: string = 'An unexpected error occurred', details?: Record<string, unknown>) {
    super(message, details);
  }
}
