import React, { useState } from 'react';
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

export const CustomPluginApp = ({
  basename,
  notifications,
  http,
  navigation,
}: CustomPluginAppDeps) => {
  const [dateRange, setDateRange] = useState({
    from: 'now-7d',
    to: 'now',
  });

  const handleQuerySubmit = ({ dateRange: newDateRange }: any) => {
    if (newDateRange) {
      setDateRange({
        from: newDateRange.from,
        to: newDateRange.to,
      });
    }
  };

  return (
    <Router basename={basename}>
      <CustomI18nProvider>
        <>
          <navigation.ui.TopNavMenu
            appName={PLUGIN_ID}
            showSearchBar={false}
            showDatePicker={true}
            dateRangeFrom={dateRange.from}
            dateRangeTo={dateRange.to}
            onQuerySubmit={handleQuerySubmit}
            useDefaultBehaviors={true}
          />
          <Switch>
            <Route path="/todos">
              <TodosPage
                http={http}
                notifications={notifications}
                dateRange={dateRange}
              />
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
