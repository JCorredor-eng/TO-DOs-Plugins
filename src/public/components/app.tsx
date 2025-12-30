import React from 'react';
import { BrowserRouter as Router, Route, Switch, Redirect } from 'react-router-dom';
import { CoreStart } from '../../../../src/core/public';
import { NavigationPublicPluginStart } from '../../../../src/plugins/navigation/public';
import { PLUGIN_ID } from '../../common';
import { TodosPage } from '../features/todos';
import { CustomI18nProvider } from '../contexts';

interface CustomPluginAppDeps {
  basename: string;
  notifications: CoreStart['notifications'];
  http: CoreStart['http'];
  navigation: NavigationPublicPluginStart;
}

/**
 * Main application component for the Custom Plugin.
 *
 * Wraps the application with:
 * - React Router for navigation
 * - Custom i18n provider for dynamic language switching
 * - OpenSearch Dashboards navigation UI
 *
 * @param props - Component dependencies
 * @param props.basename - Base URL path for the application
 * @param props.notifications - OpenSearch Dashboards notifications service
 * @param props.http - OpenSearch Dashboards HTTP service
 * @param props.navigation - OpenSearch Dashboards navigation plugin
 */
export const CustomPluginApp = ({
  basename,
  notifications,
  http,
  navigation,
}: CustomPluginAppDeps) => {
  return (
    <Router basename={basename}>
      <CustomI18nProvider>
        <>
          <navigation.ui.TopNavMenu
            appName={PLUGIN_ID}
            showSearchBar={true}
            useDefaultBehaviors={true}
          />
          <Switch>
            <Route path="/todos">
              <TodosPage http={http} notifications={notifications} />
            </Route>
            <Route path="/">
              <Redirect to="/todos" />
            </Route>
          </Switch>
        </>
      </CustomI18nProvider>
    </Router>
  );
};
