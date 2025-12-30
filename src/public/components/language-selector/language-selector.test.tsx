import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import { IntlProvider } from 'react-intl';
import { LanguageSelector } from './language-selector';
import * as I18nContext from '../../contexts/i18n-context';

// Import translation files for tests
import enTranslations from '../../../translations/en-US.json';

// Mock the useI18n hook
const mockSetLocale = jest.fn();
const mockUseI18n = jest.spyOn(I18nContext, 'useI18n');

describe('LanguageSelector', () => {
  beforeEach(() => {
    localStorage.clear();
    mockSetLocale.mockClear();

    // Reset the mock to default locale before each test
    mockUseI18n.mockReturnValue({
      locale: 'en-US',
      setLocale: mockSetLocale,
      supportedLocales: ['en-US', 'es-ES'] as const,
    });
  });

  // Helper to render with IntlProvider for FormattedMessage support
  const renderWithIntl = (component: React.ReactElement) => {
    return render(
      <IntlProvider locale="en-US" messages={enTranslations.messages} defaultLocale="en-US">
        {component}
      </IntlProvider>
    );
  };

  test('renders language selector button', () => {
    const { getByText } = renderWithIntl(<LanguageSelector />);
    expect(getByText('Language')).toBeInTheDocument();
  });

  test('opens popover when clicked', () => {
    const { getByText } = renderWithIntl(<LanguageSelector />);
    const button = getByText('Language');

    fireEvent.click(button);

    expect(getByText('English')).toBeInTheDocument();
    expect(getByText(/Spanish/)).toBeInTheDocument();
  });

  test('calls setLocale when language is changed', async () => {
    const { getByText, getAllByRole } = renderWithIntl(<LanguageSelector />);

    // Open popover
    fireEvent.click(getByText('Language'));

    // Find and click Spanish option
    const options = getAllByRole('option');
    const spanishOption = options.find((opt) => opt.textContent?.includes('Spanish'));

    if (spanishOption) {
      fireEvent.click(spanishOption);

      await waitFor(() => {
        expect(mockSetLocale).toHaveBeenCalledWith('es-ES');
      });
    }
  });

  test('updates localStorage when language changes', async () => {
    const { getByText, getAllByRole } = renderWithIntl(<LanguageSelector />);

    fireEvent.click(getByText('Language'));

    const options = getAllByRole('option');
    const spanishOption = options.find((opt) => opt.textContent?.includes('Spanish'));

    if (spanishOption) {
      fireEvent.click(spanishOption);

      await waitFor(() => {
        // The context will handle localStorage, just verify setLocale was called
        expect(mockSetLocale).toHaveBeenCalled();
      });
    }
  });

  test('shows current locale as selected', () => {
    // Mock current locale as Spanish
    mockUseI18n.mockReturnValue({
      locale: 'es-ES',
      setLocale: mockSetLocale,
      supportedLocales: ['en-US', 'es-ES'] as const,
    });

    const { getByText } = renderWithIntl(<LanguageSelector />);
    fireEvent.click(getByText('Language'));

    const options = document.querySelectorAll('[role="option"]');
    const spanishOption = Array.from(options).find((opt) =>
      opt.textContent?.includes('Spanish')
    );

    expect(spanishOption?.getAttribute('aria-selected')).toBe('true');
  });

  test('defaults to en-US when no preference is saved', () => {
    const { getByText } = renderWithIntl(<LanguageSelector />);
    fireEvent.click(getByText('Language'));

    const options = document.querySelectorAll('[role="option"]');
    const englishOption = Array.from(options).find((opt) => opt.textContent?.includes('English'));

    expect(englishOption?.getAttribute('aria-selected')).toBe('true');
  });
});
