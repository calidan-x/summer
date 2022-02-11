import { applyResponse, Context, context } from '../request-handler';
import { OmitFirstAndSecondArg } from './utility';

const generateClassDecorator =
  (decoratorCall: any, ...args: any[]) =>
  (constructor: Function) => {
    Object.getOwnPropertyNames(constructor.prototype).forEach((name) => {
      if (typeof constructor.prototype[name] === 'function' && name !== 'constructor') {
        const descriptor = Object.getOwnPropertyDescriptor(constructor.prototype, name);
        const originalFunc = descriptor.value;
        descriptor.value = async function (...arg) {
          await decoratorCall(
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
        Object.defineProperty(constructor.prototype, name, descriptor);
      }
    });
  };

type DecoratorMethodType<T = any> = (ctx: Context, callMethod: () => T, ...args: any[]) => void;

interface MethodDecoratorType<T extends DecoratorMethodType> {
  (...name: Parameters<OmitFirstAndSecondArg<T>>): ClassDecorator;
  (constructor: Function): void;
}

export const createControllerDecorator =
  <T extends DecoratorMethodType>(paramMethod: T): MethodDecoratorType<T> =>
  (...dArgs) => {
    console.log(dArgs.length);
    if (dArgs.length === 1 && dArgs[0].toString().startsWith('class ')) {
      generateClassDecorator(paramMethod)(dArgs[0]);
      return;
    }
    return generateClassDecorator(paramMethod, ...dArgs);
  };

export const Hi = createControllerDecorator(async (ctx, callMethod, aa) => {
  await callMethod();
});
