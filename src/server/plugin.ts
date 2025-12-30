import {
  PluginInitializerContext,
  CoreSetup,
  CoreStart,
  Plugin,
  Logger,
} from '../../../src/core/server';
import { CustomPluginPluginSetup, CustomPluginPluginStart } from './types';
import { defineRoutes } from './routes';
export class CustomPluginPlugin
  implements Plugin<CustomPluginPluginSetup, CustomPluginPluginStart>
{
  private readonly logger: Logger;
  constructor(initializerContext: PluginInitializerContext) {
    this.logger = initializerContext.logger.get();
  }
  public setup(core: CoreSetup): CustomPluginPluginSetup {
    this.logger.debug('customPlugin: Setup');
    const router = core.http.createRouter();
    defineRoutes(router, this.logger);
    this.logger.info('customPlugin: Routes registered');
    return {};
  }
  public start(core: CoreStart): CustomPluginPluginStart {
    this.logger.debug('customPlugin: Started');
    return {};
  }
  public stop(): void {
    this.logger.debug('customPlugin: Stopped');
  }
}
