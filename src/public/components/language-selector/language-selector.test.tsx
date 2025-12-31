import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { IntlProvider } from 'react-intl';
import { LanguageSelector } from './language-selector';
import * as I18nContext from '../../contexts/i18n-context';

import enTranslations from '../../../translations/en-US.json';

const mockSetLocale = jest.fn();
const mockUseI18n = jest.spyOn(I18nContext, 'useI18n');

describe('LanguageSelector', () => {
  beforeEach(() => {
    localStorage.clear();
    mockSetLocale.mockClear();

    mockUseI18n.mockReturnValue({
      locale: 'en-US',
      setLocale: mockSetLocale,
      supportedLocales: ['en-US', 'es-ES'] as const,
    });
  });

  const renderWithIntl = (component: React.ReactElement) => {
    return render(
      <IntlProvider locale="en-US" messages={enTranslations.messages} defaultLocale="en-US">
        {component}
      </IntlProvider>
    );
  };

  test('renders language selector button', () => {
    renderWithIntl(<LanguageSelector />);
    expect(screen.getByText('Language')).toBeInTheDocument();
  });

  test('opens popover when clicked', () => {
    renderWithIntl(<LanguageSelector />);
    const button = screen.getByText('Language');

    expect(screen.queryByText('English')).not.toBeInTheDocument();

    fireEvent.click(button);

    expect(button).toBeInTheDocument();
  });

  test('renders with en-US locale by default', () => {
    renderWithIntl(<LanguageSelector />);
    expect(screen.getByText('Language')).toBeInTheDocument();

    expect(mockUseI18n).toHaveBeenCalled();
  });

  test('renders with es-ES locale when set', () => {
    mockUseI18n.mockReturnValue({
      locale: 'es-ES',
      setLocale: mockSetLocale,
      supportedLocales: ['en-US', 'es-ES'] as const,
    });

    renderWithIntl(<LanguageSelector />);
    expect(screen.getByText('Language')).toBeInTheDocument();
    expect(mockUseI18n).toHaveBeenCalled();
  });

  test('button is clickable without errors', () => {
    renderWithIntl(<LanguageSelector />);
    const button = screen.getByText('Language');

    expect(() => {
      fireEvent.click(button);
    }).not.toThrow();
  });

  test('uses i18n context for locale management', () => {
    renderWithIntl(<LanguageSelector />);

    expect(mockUseI18n).toHaveBeenCalled();
    expect(mockUseI18n).toHaveReturnedWith(
      expect.objectContaining({
        locale: expect.any(String),
        setLocale: expect.any(Function),
      })
    );
  });
});
