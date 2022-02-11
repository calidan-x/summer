import { applyResponse, Context, context } from '../request-handler';
import { requestMappingAssembler } from '../request-mapping';
import { OmitFirstAndSecondArg } from './utility';

interface ControllerMethodDecoratorType {
  (path?: string): MethodDecorator;
  (target: Object, propertyKey: string, descriptor: PropertyDescriptor): void;
}

const restfulMethodDecorator =
  (httpMethod: string): ControllerMethodDecoratorType =>
  (...dArgs): MethodDecorator => {
    if (dArgs.length <= 1) {
      return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
        requestMappingAssembler.addMethodRoute(dArgs[0] || '', httpMethod, propertyKey, target.constructor.name);
        requestMappingAssembler.addMethodDescriptor(descriptor);
      };
    } else {
      requestMappingAssembler.addMethodRoute('', httpMethod, dArgs[1], dArgs[0].constructor.name);
      requestMappingAssembler.addMethodDescriptor(dArgs[2]);
    }
  };

export const Get = restfulMethodDecorator('GET');
export const Post = restfulMethodDecorator('POST');
export const Put = restfulMethodDecorator('PUT');
export const Patch = restfulMethodDecorator('PATCH');
export const Delete = restfulMethodDecorator('DELETE');
export const Request = restfulMethodDecorator('REQUEST');

const generateMethodDecorator =
  (paramMethod: any, ...args: any[]) =>
  (target: Object, propertyKey: string, descriptor: PropertyDescriptor) => {
    const originalFunc = descriptor.value;
    descriptor.value = async function (...arg) {
      await paramMethod(
        context,
        async () => {
          const response = await originalFunc.apply(this, arg);
          if (response !== undefined) {
            applyResponse(context, response);
          }
        },
        ...args
      );
    };
  };

type DecoratorMethodType<T = any> = (ctx: Context, callMethod: () => T, ...args: any[]) => void;

interface MethodDecoratorType<T extends DecoratorMethodType> {
  (...name: Parameters<OmitFirstAndSecondArg<T>>): MethodDecorator;
  (target: Object, propertyKey: string, descriptor: PropertyDescriptor): void;
}

export const createMethodDecorator =
  <T extends DecoratorMethodType>(paramMethod: T): MethodDecoratorType<T> =>
  (...dArgs) => {
    if (dArgs.length === 3 && dArgs[0].constructor?.toString().startsWith('class ')) {
      generateMethodDecorator(paramMethod)(dArgs[0], dArgs[1], dArgs[2]);
      return;
    }
    return generateMethodDecorator(paramMethod, ...dArgs);
  };

////
const CACHE = {};
export const Cache = createMethodDecorator(async (ctx, callMethod, key: string) => {
  if (CACHE[key] === undefined) {
    CACHE[key] = await callMethod();
  }
  return CACHE[key];
});

export const Response = createMethodDecorator(async (ctx, callMethod, code: number, message: string) => {
  await callMethod();
  ctx.response.code = code;
  ctx.response.body = message;
});

export const Hihi = createMethodDecorator(async (ctx, callMethod, message: string) => {
  await callMethod();
  console.log(message);
});
