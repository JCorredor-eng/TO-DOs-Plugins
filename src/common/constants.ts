/**
 * Unique identifier for the custom plugin.
 */
export const PLUGIN_ID = 'customPlugin';

/**
 * Display name for the plugin shown in the UI.
 */
export const PLUGIN_NAME = 'TO-DO Plugin';

/**
 * Default OpenSearch index name for storing TODO items.
 */
export const DEFAULT_INDEX_NAME = 'customplugin-todos';

/**
 * Base path for all plugin API endpoints.
 */
export const API_BASE_PATH = `/api/${PLUGIN_ID}`;

/**
 * API path for TODO-related endpoints.
 */
export const TODOS_API_PATH = `${API_BASE_PATH}/todos`;

/**
 * Default number of items per page for pagination.
 */
export const DEFAULT_PAGE_SIZE = 20;

/**
 * Maximum allowed number of items per page.
 */
export const MAX_PAGE_SIZE = 100;

/**
 * OpenSearch date format string for date fields.
 * Uses ISO 8601 format with optional time component.
 */
export const DATE_FORMAT = 'strict_date_optional_time';
