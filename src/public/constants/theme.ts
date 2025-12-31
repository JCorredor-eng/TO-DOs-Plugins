
/**
 * Color palette for charts and visualizations.
 * These colors align with OpenSearch Dashboards design system.
 */
export const CHART_COLORS = {
  /** Background color for neutral elements */
  background: '#e0e0e0',
  /** Success/completion color (teal) */
  success: '#00BFB3',
  /** Danger/error color (red) */
  danger: '#BD271E',
  /** Primary/info color (blue) */
  primary: '#006BB4',
  /** Warning color (yellow) */
  warning: '#FEC514',
  /** Border and divider color (light gray) */
  border: '#D3DAE6',
  /** Subdued text color */
  subdued: '#69707D',
  /** Empty state color */
  empty: '#98A2B3',
} as const;

/**
 * Sizing constants for charts and UI elements.
 */
export const CHART_SIZES = {
  /** Standard progress bar height */
  progressBarHeight: 8,
  /** Standard progress bar width */
  progressBarWidth: 100,
  /** Standard border radius for rounded corners */
  borderRadius: 4,
  /** Small border radius */
  borderRadiusSmall: 2,
  /** Large border radius */
  borderRadiusLarge: 8,
} as const;

/**
 * Spacing constants for consistent layout.
 */
export const SPACING = {
  /** Extra small spacing (4px) */
  xs: 4,
  /** Small spacing (8px) */
  s: 8,
  /** Medium spacing (16px) */
  m: 16,
  /** Large spacing (24px) */
  l: 24,
  /** Extra large spacing (32px) */
  xl: 32,
} as const;

/**
 * Maps status color names to hex values for programmatic use.
 *
 * @param color - Color name from EUI color system ('success', 'danger', 'default', etc.)
 * @returns Hex color code
 */
export const mapStatusColorToHex = (color: string): string => {
  const colorMap: Record<string, string> = {
    success: CHART_COLORS.success,
    danger: CHART_COLORS.danger,
    primary: CHART_COLORS.primary,
    warning: CHART_COLORS.warning,
    default: CHART_COLORS.primary,
  };
  return colorMap[color] || CHART_COLORS.primary;
};
