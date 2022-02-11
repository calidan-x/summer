import { middlewareAssembler } from '../middleware';

export interface MiddlewareOptions {
  order: number;
  filter?: (controllerName: string, controllerMethod?: string) => boolean;
}
export const Middleware = (middlewareOptions: MiddlewareOptions) => (target: any) => {
  middlewareAssembler.add(new target(), middlewareOptions);
};
