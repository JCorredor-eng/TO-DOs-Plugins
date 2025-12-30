/**
 * Pre-load translations before React mounts
 * This ensures translations are available immediately when components render
 */
import './i18n-loader';

import React from 'react';
import ReactDOM from 'react-dom';
import { AppMountParameters, CoreStart } from '../../../src/core/public';
import { AppPluginStartDependencies } from './types';
import { CustomPluginApp } from './components/app';
export const renderApp = (
  { notifications, http }: CoreStart,
  { navigation }: AppPluginStartDependencies,
  { appBasePath, element }: AppMountParameters
) => {
  ReactDOM.render(
    <CustomPluginApp
      basename={appBasePath}
      notifications={notifications}
      http={http}
      navigation={navigation}
    />,
    element
  );
  return () => ReactDOM.unmountComponentAtNode(element);
};
