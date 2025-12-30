import './index.scss';
import { CustomPluginPlugin } from './plugin';
export function plugin() {
  return new CustomPluginPlugin();
}
export { CustomPluginPluginSetup, CustomPluginPluginStart } from './types';
