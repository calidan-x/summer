import { Context } from '../request-handler';
import { requestMappingAssembler } from '../request-mapping';
import { OmitFirstAndSecondArg } from './utility';

const getArgName = (func, argIndex: number) => {
  var args = func.toString().match(/.*?\(([^)]*)\)/)[1];
  return args
    .split(',')
    .map(function (arg) {
      return arg.replace(/\/\*.*\*\//, '').trim();
    })
    .filter(function (arg) {
      return arg;
    })[argIndex];
};

const getArgType = (target: Object, propertyKey: string, parameterIndex: number) => {
  const types = Reflect.getMetadata('design:paramtypes', target, propertyKey);
  return types[parameterIndex];
};

const getArgDeclareType = (target: Object, propertyKey: string, parameterIndex: number) => {
  const types = Reflect.getOwnMetadata('DeclareTypes', target, propertyKey);
  return types[parameterIndex];
};

const generateParamDecorator =
  (paramMethod: any, ...args: any[]) =>
  (target: Object, propertyKey: string, parameterIndex: number) => {
    const type = getArgType(target, propertyKey, parameterIndex);
    const declareType = getArgDeclareType(target, propertyKey, parameterIndex);
    if (!args) {
      args = [];
    }
    args.splice(0, 0, getArgName(target[propertyKey], parameterIndex));
    requestMappingAssembler.addParam(paramMethod, args, type, declareType, parameterIndex);
  };

type DecoratorMethodType = (ctx: Context, ...args: any[]) => any;

export const createParamDecorator =
  <T extends DecoratorMethodType>(paramMethod: T): ParamDecoratorType<T> =>
  (...dArgs) => {
    if (dArgs.length === 3 && dArgs[0].constructor?.toString().startsWith('class ')) {
      generateParamDecorator(paramMethod)(dArgs[0], dArgs[1], dArgs[2]);
      return;
    }
    return generateParamDecorator(paramMethod, ...dArgs);
  };

interface ParamDecoratorType<T extends DecoratorMethodType> {
  (...name: Parameters<OmitFirstAndSecondArg<T>>): ParameterDecorator;
  (target: Object, propertyKey: string, parameterIndex: number): void;
}

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
