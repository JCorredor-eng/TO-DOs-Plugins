
import { i18n } from '@osd/i18n';

/**
 * Formats a date string as a human-readable relative time (e.g., "2 days ago", "3 hours ago").
 *
 * @param dateString - ISO date string to format
 * @returns Localized relative time string
 *
 * @example
 * formatRelativeTime('2024-01-15T10:00:00Z') // "2 days ago"
 * formatRelativeTime('2024-01-17T15:30:00Z') // "3 hours ago"
 */
export const formatRelativeTime = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffDays > 0) {
    return i18n.translate('customPlugin.time.daysAgo', {
      defaultMessage: '{count, plural, =1 {# day ago} other {# days ago}}',
      values: { count: diffDays },
    });
  }
  if (diffHours > 0) {
    return i18n.translate('customPlugin.time.hoursAgo', {
      defaultMessage: '{count, plural, =1 {# hour ago} other {# hours ago}}',
      values: { count: diffHours },
    });
  }
  if (diffMins > 0) {
    return i18n.translate('customPlugin.time.minutesAgo', {
      defaultMessage: '{count, plural, =1 {# minute ago} other {# minutes ago}}',
      values: { count: diffMins },
    });
  }
  return i18n.translate('customPlugin.time.justNow', {
    defaultMessage: 'just now',
  });
};

/**
 * Formats a date string as a localized date (e.g., "Jan 15, 2024").
 *
 * @param dateString - ISO date string to format
 * @param locale - Optional locale string (defaults to browser locale)
 * @returns Localized date string in short format
 *
 * @example
 * formatDate('2024-01-15T10:00:00Z') // "Jan 15, 2024"
 * formatDate('2024-01-15T10:00:00Z', 'es-ES') // "15 ene 2024"
 */
export const formatDate = (dateString: string, locale?: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString(locale, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

/**
 * Checks if a due date has passed relative to a reference date.
 *
 * @param dueDateString - ISO date string to check
 * @param referenceDate - Reference date for comparison (defaults to current time)
 * @returns True if the due date is in the past, false otherwise
 *
 * @example
 * isOverdue('2024-01-01T10:00:00Z') // true (if current date is after Jan 1, 2024)
 * isOverdue('2025-12-31T23:59:59Z') // false (if current date is before Dec 31, 2025)
 * isOverdue('2024-01-01T10:00:00Z', new Date('2024-01-02')) // true
 */
export const isOverdue = (dueDateString: string, referenceDate: Date = new Date()): boolean => {
  const dueDate = new Date(dueDateString);
  return dueDate < referenceDate;
};

/**
 * Formats a date range as a human-readable string.
 *
 * @param fromDateString - Start date (ISO string)
 * @param toDateString - End date (ISO string)
 * @param locale - Optional locale string (defaults to browser locale)
 * @returns Formatted date range string
 *
 * @example
 * formatDateRange('2024-01-01', '2024-01-31') // "Jan 1, 2024 - Jan 31, 2024"
 */
export const formatDateRange = (fromDateString: string, toDateString: string, locale?: string): string => {
  const fromDate = formatDate(fromDateString, locale);
  const toDate = formatDate(toDateString, locale);
  return `${fromDate} - ${toDate}`;
};
