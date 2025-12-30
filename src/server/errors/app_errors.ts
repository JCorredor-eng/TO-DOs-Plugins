export abstract class AppError extends Error {
  abstract readonly statusCode: number;
  abstract readonly code: string;
  readonly details?: Record<string, unknown>;
  constructor(message: string, details?: Record<string, unknown>) {
    super(message);
    this.name = this.constructor.name;
    this.details = details;
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }
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
export class NotFoundError extends AppError {
  readonly statusCode = 404;
  readonly code = 'NOT_FOUND';
  constructor(resource: string, identifier: string) {
    super(`${resource} with id '${identifier}' not found`);
  }
}
export class ValidationError extends AppError {
  readonly statusCode = 400;
  readonly code = 'VALIDATION_ERROR';
  constructor(message: string, details?: Record<string, unknown>) {
    super(message, details);
  }
}
export class ConflictError extends AppError {
  readonly statusCode = 409;
  readonly code = 'CONFLICT';
  constructor(message: string, details?: Record<string, unknown>) {
    super(message, details);
  }
}
export class IndexError extends AppError {
  readonly statusCode = 500;
  readonly code = 'INDEX_ERROR';
  constructor(message: string, details?: Record<string, unknown>) {
    super(`OpenSearch index error: ${message}`, details);
  }
}
export class BusinessRuleError extends AppError {
  readonly statusCode = 422;
  readonly code = 'BUSINESS_RULE_VIOLATION';
  constructor(message: string, details?: Record<string, unknown>) {
    super(message, details);
  }
}
export class InternalError extends AppError {
  readonly statusCode = 500;
  readonly code = 'INTERNAL_ERROR';
  constructor(message: string = 'An unexpected error occurred', details?: Record<string, unknown>) {
    super(message, details);
  }
}
