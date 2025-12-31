import React, { useState, useCallback, useRef } from 'react';
import { EuiHeaderLink, EuiPopover, EuiSelectable, EuiSelectableOption } from '@elastic/eui';
import { FormattedMessage } from 'react-intl';
import { useI18n } from '../../contexts';

interface LanguageOption extends EuiSelectableOption {
  label: string;
  value: string;
}

export const LanguageSelector: React.FC = () => {
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const { locale, setLocale } = useI18n();
  const buttonRef = useRef<HTMLButtonElement>(null);

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

  const handleLanguageChange = useCallback(
    (options: LanguageOption[]) => {
      const selectedOption = options.find((option) => option.checked === 'on');
      if (selectedOption) {
        const newLocale = selectedOption.value;
        setLocale(newLocale);
        setIsPopoverOpen(false);

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
