import { Middleware, Context } from '@summer-js/summer';

// @Middleware({
//   order: 0,
//   filter: (controllerName, invokeMethod) => {
//     return controllerName === 'UserController';
//   }
// })
// export class PathMiddleware {
//   async process(ctx: Context, next: any) {
//     console.log(ctx.request.path);
//     await next();
//   }
// }
