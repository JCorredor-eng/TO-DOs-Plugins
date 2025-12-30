import React, { useState, useCallback, useRef } from 'react';
import { EuiHeaderLink, EuiPopover, EuiSelectable, EuiSelectableOption } from '@elastic/eui';
import { FormattedMessage } from 'react-intl';
import { useI18n } from '../../contexts';

interface LanguageOption extends EuiSelectableOption {
  label: string;
  value: string;
}

/**
 * Language selector component that allows users to switch between supported languages.
 *
 * Features:
 * - Dropdown menu with language options
 * - Dynamic language switching without page reload
 * - Persists language preference to localStorage
 * - Visual indication of currently selected language
 * - Removes focus from button after selection for better UX
 *
 * Supported Languages:
 * - English (en-US)
 * - Spanish (es-ES)
 */
export const LanguageSelector: React.FC = () => {
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const { locale, setLocale } = useI18n();
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Language options with static labels (these don't need to change with locale)
  const languageOptions: LanguageOption[] = [
    {
      label: 'English',
      value: 'en-US',
      checked: locale === 'en-US' ? 'on' : undefined,
    },
    {
      label: 'Spanish (Español)',
      value: 'es-ES',
      checked: locale === 'es-ES' ? 'on' : undefined,
    },
  ];

  /**
   * Handles language selection change.
   * Updates the locale via the i18n context, which triggers a re-render
   * of all FormattedMessage components with the new language.
   * Also closes the popover and removes focus from the button.
   *
   * @param options - Updated language options from EuiSelectable
   */
  const handleLanguageChange = useCallback(
    (options: LanguageOption[]) => {
      const selectedOption = options.find((option) => option.checked === 'on');
      if (selectedOption) {
        const newLocale = selectedOption.value;
        setLocale(newLocale);
        setIsPopoverOpen(false);

        // Remove focus from button to avoid visual "stuck" appearance
        // Use setTimeout to ensure popover closes before removing focus
        setTimeout(() => {
          if (buttonRef.current) {
            buttonRef.current.blur();
          }
        }, 100);
      }
    },
    [setLocale]
  );

  const button = (
    <EuiHeaderLink
      iconType="globe"
      onClick={() => setIsPopoverOpen(!isPopoverOpen)}
      buttonRef={buttonRef}
    >
      <FormattedMessage id="customPlugin.languageSelector.label" defaultMessage="Language" />
    </EuiHeaderLink>
  );

  return (
    <EuiPopover
      button={button}
      isOpen={isPopoverOpen}
      closePopover={() => setIsPopoverOpen(false)}
      panelPaddingSize="none"
      anchorPosition="downRight"
    >
      <EuiSelectable
        options={languageOptions}
        onChange={handleLanguageChange}
        singleSelection={true}
        listProps={{ bordered: true }}
      >
        {(list) => <div style={{ width: 200 }}>{list}</div>}
      </EuiSelectable>
    </EuiPopover>
  );
};
