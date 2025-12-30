import { OpenSearchDashboardsResponseFactory } from '../../../../src/core/server';
import { AppError, InternalError } from './app_errors';
import { ApiErrorResponse } from '../../common';
export function mapErrorToHttpResponse(
  error: unknown,
  response: OpenSearchDashboardsResponseFactory,
  logger?: { error: (message: string, meta?: Record<string, unknown>) => void }
): ReturnType<OpenSearchDashboardsResponseFactory['custom']> {
  if (error instanceof AppError) {
    const errorBody: ApiErrorResponse = error.toJSON();
    if (logger && error.statusCode >= 500) {
      logger.error(`${error.code}: ${error.message}`, {
        stack: error.stack,
        details: error.details,
      });
    }
    return response.custom({
      statusCode: error.statusCode,
      body: errorBody,
    });
  }
  if (isOpenSearchError(error)) {
    const statusCode = extractOpenSearchStatusCode(error);
    const message = extractOpenSearchMessage(error);
    if (logger) {
      logger.error(`OpenSearch error: ${message}`, {
        statusCode,
        originalError: error,
      });
    }
    if (statusCode === 404) {
      return response.notFound({
        body: {
          statusCode: 404,
          error: 'NOT_FOUND',
          message: 'Resource not found',
        } as ApiErrorResponse,
      });
    }
    return response.custom({
      statusCode: statusCode >= 400 && statusCode < 600 ? statusCode : 500,
      body: {
        statusCode: statusCode >= 400 && statusCode < 600 ? statusCode : 500,
        error: 'OPENSEARCH_ERROR',
        message,
      } as ApiErrorResponse,
    });
  }
  if (error instanceof Error) {
    if (logger) {
      logger.error(`Unhandled error: ${error.message}`, {
        stack: error.stack,
      });
    }
    const internalError = new InternalError(error.message);
    return response.custom({
      statusCode: 500,
      body: internalError.toJSON(),
    });
  }
  if (logger) {
    logger.error('Unknown error type', { error });
  }
  const unknownError = new InternalError('An unexpected error occurred');
  return response.custom({
    statusCode: 500,
    body: unknownError.toJSON(),
  });
}
function isOpenSearchError(error: unknown): error is OpenSearchClientError {
  return (
    error !== null &&
    typeof error === 'object' &&
    ('statusCode' in error || 'meta' in error || 'body' in error)
  );
}
function extractOpenSearchStatusCode(error: OpenSearchClientError): number {
  if (typeof error.statusCode === 'number') {
    return error.statusCode;
  }
  if (error.meta?.statusCode) {
    return error.meta.statusCode;
  }
  if (error.body?.status) {
    return error.body.status;
  }
  return 500;
}
function extractOpenSearchMessage(error: OpenSearchClientError): string {
  if (error.body?.error?.reason) {
    return error.body.error.reason;
  }
  if (error.body?.error?.type) {
    return `OpenSearch error: ${error.body.error.type}`;
  }
  if (error.message) {
    return error.message;
  }
  return 'An OpenSearch error occurred';
}
interface OpenSearchClientError {
  statusCode?: number;
  message?: string;
  meta?: {
    statusCode?: number;
  };
  body?: {
    status?: number;
    error?: {
      type?: string;
      reason?: string;
    };
  };
}
