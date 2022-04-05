import { createParamDecorator } from './param';
import { createMethodDecorator, restfulMethodDecorator } from './method';
import { createClassDecorator } from './class';
import { createClassAndMethodDecorator } from './class-method';
import { createPropertyDecorator } from './property';

export {
  createMethodDecorator,
  createClassDecorator,
  createClassAndMethodDecorator,
  createPropertyDecorator,
  createParamDecorator
};

// method
export const Get = restfulMethodDecorator('GET');
export const Post = restfulMethodDecorator('POST');
export const Put = restfulMethodDecorator('PUT');
export const Patch = restfulMethodDecorator('PATCH');
export const Delete = restfulMethodDecorator('DELETE');
export const Options = restfulMethodDecorator('OPTIONS');
export const Request = restfulMethodDecorator('REQUEST');

// params
export const Ctx = createParamDecorator((ctx) => ctx);
export const Body = createParamDecorator((ctx) => ctx.request.body);
export const Queries = createParamDecorator((ctx) => ctx.request.queries);
export const Query = createParamDecorator(
  (ctx, paramName: string, name: string) => ctx.request.queries[name || paramName]
);
export const PathParam = createParamDecorator(
  (ctx, paramName: string, name: string) => ctx.request.pathParams[name || paramName]
);
export const Session = createParamDecorator((ctx, paramName: string, name: string) => ctx.sessions[name || paramName]);
export const Header = createParamDecorator(
  (ctx, paramName: string, name: string) => ctx.request.headers[name || paramName]
);
export const Cookie = createParamDecorator((ctx, paramName: string, name: string) => ctx.cookies[name || paramName]);
export const RequestPath = createParamDecorator((ctx) => ctx.request.path);

// property
export const Config = createPropertyDecorator(async (config, propertyName, configKey: string) => {
  return config[configKey || propertyName];
});
