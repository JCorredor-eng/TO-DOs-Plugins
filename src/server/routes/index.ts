import { IRouter, Logger } from '../../../../src/core/server';
import { registerTodosRoutes } from './todos.routes';
export function defineRoutes(router: IRouter, logger: Logger): void {
  registerTodosRoutes(router, logger);
  logger.debug('All routes registered');
}
export { registerTodosRoutes };
