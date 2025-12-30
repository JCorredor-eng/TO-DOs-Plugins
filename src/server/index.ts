import { PluginInitializerContext } from '../../../src/core/server';
import { CustomPluginPlugin } from './plugin';
export function plugin(initializerContext: PluginInitializerContext) {
  return new CustomPluginPlugin(initializerContext);
}
export { CustomPluginPluginSetup, CustomPluginPluginStart } from './types';
