import React from 'react';
import { render, screen } from '@testing-library/react';
import { HorizontalProgressBar } from '../ui/components/HorizontalProgressBar';
import { CHART_COLORS } from '../../../constants/theme';

describe('HorizontalProgressBar', () => {
  it('renders percentage and count', () => {
    render(<HorizontalProgressBar percentage={75} count={15} />);
    expect(screen.getByText('15 (75%)')).toBeInTheDocument();
  });

  it('uses default bar color when not specified', () => {
    const { container } = render(<HorizontalProgressBar percentage={50} count={10} />);
    const bar = container.firstChild?.childNodes[0] as HTMLElement;
    // Browsers convert #006BB4 to rgb(0, 107, 180)
    expect(bar.style.backgroundColor).toBe('rgb(0, 107, 180)');
  });

  it('uses custom bar color when specified', () => {
    const { container } = render(
      <HorizontalProgressBar percentage={50} count={10} barColor="rgb(255, 0, 0)" />
    );
    const bar = container.firstChild?.childNodes[0] as HTMLElement;
    expect(bar.style.backgroundColor).toBe('rgb(255, 0, 0)');
  });

  it('applies white text color when percentage > 50', () => {
    const { container } = render(<HorizontalProgressBar percentage={75} count={15} />);
    const label = container.firstChild?.childNodes[1] as HTMLElement;
    // Browsers convert #fff to rgb(255, 255, 255)
    expect(label.style.color).toBe('rgb(255, 255, 255)');
  });

  it('applies black text color when percentage <= 50', () => {
    const { container } = render(<HorizontalProgressBar percentage={25} count={5} />);
    const label = container.firstChild?.childNodes[1] as HTMLElement;
    // Browsers convert #000 to rgb(0, 0, 0)
    expect(label.style.color).toBe('rgb(0, 0, 0)');
  });

  it('renders bar with correct width based on percentage', () => {
    const { container } = render(<HorizontalProgressBar percentage={60} count={12} />);
    const bar = container.firstChild?.childNodes[0] as HTMLElement;
    expect(bar.style.width).toBe('60%');
  });

  it('uses custom background color when specified', () => {
    const { container } = render(
      <HorizontalProgressBar
        percentage={50}
        count={10}
        backgroundColor="rgb(238, 238, 238)"
      />
    );
    const outerDiv = container.firstChild as HTMLElement;
    expect(outerDiv.style.backgroundColor).toBe('rgb(238, 238, 238)');
  });

  it('uses default background color when not specified', () => {
    const { container } = render(<HorizontalProgressBar percentage={50} count={10} />);
    const outerDiv = container.firstChild as HTMLElement;
    // Browsers convert #e0e0e0 to rgb(224, 224, 224)
    expect(outerDiv.style.backgroundColor).toBe('rgb(224, 224, 224)');
  });
});
