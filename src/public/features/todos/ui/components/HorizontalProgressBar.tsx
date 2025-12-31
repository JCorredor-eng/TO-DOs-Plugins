import React from 'react';
import { CHART_COLORS, CHART_SIZES } from '../../../../constants/theme';

/**
 * Props for HorizontalProgressBar component
 */
export interface HorizontalProgressBarProps {
  /** Percentage value (0-100) for bar width */
  readonly percentage: number;
  /** Count to display in label */
  readonly count: number;
  /** Background color for the filled portion of the bar */
  readonly barColor?: string;
  /** Background color for the empty portion of the bar */
  readonly backgroundColor?: string;
}

/**
 * HorizontalProgressBar Component
 *
 * Reusable horizontal progress bar with percentage display.
 * Used by chart components to eliminate duplicate bar rendering code.
 *
 * Following PROJECT RULE #11:
 * - Purely presentational (props in, JSX out)
 * - No business logic or calculations
 * - Uses theme constants for default styling
 *
 * @param props - Component props
 * @returns React component rendering a horizontal progress bar
 */
export const HorizontalProgressBar: React.FC<HorizontalProgressBarProps> = ({
  percentage,
  count,
  barColor = CHART_COLORS.primary,
  backgroundColor = CHART_COLORS.background,
}) => {
  return (
    <div
      style={{
        width: '100%',
        height: 24,
        backgroundColor,
        borderRadius: CHART_SIZES.borderRadius,
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      {/* Filled portion */}
      <div
        style={{
          width: `${percentage}%`,
          height: '100%',
          backgroundColor: barColor,
        }}
      />

      {/* Text label overlay */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 8,
          lineHeight: '24px',
          fontSize: '12px',
          fontWeight: 600,
          color: percentage > 50 ? '#fff' : '#000',
        }}
      >
        {count} ({percentage}%)
      </div>
    </div>
  );
};
