import { NavigationPublicPluginStart } from '../../../src/plugins/navigation/public';
export interface CustomPluginPluginSetup {
  getGreeting: () => string;
}
export interface CustomPluginPluginStart {}
export interface AppPluginStartDependencies {
  navigation: NavigationPublicPluginStart;
}
