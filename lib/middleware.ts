import { MiddlewareOptions } from './decorators/middleware';

export const middlewares = [];
export const middlewareAssembler = {
  add(middleware, options: MiddlewareOptions) {
    middleware.options = options;
    middlewares.push(middleware);
    middlewares.sort((a, b) => a.options.order - b.options.order);
  }
};
