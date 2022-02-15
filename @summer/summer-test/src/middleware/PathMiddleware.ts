import { Middleware } from '@summer/summer';

@Middleware({
  order: 0,
  filter: (controllerName, controllerMethod) => {
    return controllerName.startsWith('User');
  }
})
export class PathMiddleware {
  async process(ctx: any, next: any) {
    await next();
  }
}