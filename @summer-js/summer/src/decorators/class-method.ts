import { applyResponse, Context, context } from '../request-handler';
import { OmitFirstAndSecondArg } from './utility';

type DecoratorMethodType<T = any> = (ctx: Context, callMethod: () => T, ...args: any[]) => void;

interface MethodDecoratorType<T extends DecoratorMethodType> {
  (...name: Parameters<OmitFirstAndSecondArg<T>>): ClassDecorator;
  (target: Object, propertyKey: string, descriptor: PropertyDescriptor): void;
  (constructor: Function): void;
}

const generateClassMethodDecorator =
  (decoratorCall: any, ...args: any[]) =>
  (target: Object | Function, propertyKey: string = null, descriptor: PropertyDescriptor = null) => {
    if (propertyKey) {
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
    } else {
      const constructor = target as Function;
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
    }
  };

export const createClassAndMethodDecorator =
  <T extends DecoratorMethodType>(paramMethod: T): MethodDecoratorType<T> =>
  (...dArgs) => {
    if (dArgs.length === 1 && dArgs[0].toString().startsWith('class ')) {
      generateClassMethodDecorator(paramMethod)(dArgs[0]);
      return;
    } else if (dArgs.length === 3 && dArgs[0].constructor?.toString().startsWith('class ')) {
      generateClassMethodDecorator(paramMethod)(dArgs[0], dArgs[1], dArgs[2]);
      return;
    }
    return generateClassMethodDecorator(paramMethod, ...dArgs);
  };
