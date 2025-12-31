import { useState, useCallback, useMemo } from 'react';
import { i18n } from '@osd/i18n';
import { AnalyticsStats } from '../../../../common/todo/todo.types';

interface UseComplianceDashboardParams {
  data: AnalyticsStats | null;
  onFrameworkChange?: (framework: string | undefined) => void;
}

export const useComplianceDashboard = ({ data, onFrameworkChange }: UseComplianceDashboardParams) => {
  const [selectedFramework, setSelectedFramework] = useState<string>('');

  const availableFrameworks = useMemo(() => {
    if (!data) return [];
    return data.complianceCoverage.map((f) => f.framework).filter(Boolean);
  }, [data]);

  const frameworkOptions = useMemo(() => {
    return [
      {
        value: '',
        text: i18n.translate('customPlugin.compliance.label.allFrameworks', {
          defaultMessage: 'All Frameworks',
        }),
      },
      ...availableFrameworks.map((framework) => ({
        value: framework,
        text: framework,
      })),
    ];
  }, [availableFrameworks]);

  const handleFrameworkChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      const value = e.target.value;
      setSelectedFramework(value);
      if (onFrameworkChange) {
        onFrameworkChange(value || undefined);
      }
    },
    [onFrameworkChange]
  );

  return {
    data: {
      selectedFramework,
      frameworkOptions,
    },
    actions: {
      handleFrameworkChange,
    },
  };
};
