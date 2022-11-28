import { asyncLocalStorage, checkValidationError, Context } from '../request-handler'
import { requestMappingAssembler } from '../request-mapping'
import { OmitFirstAndSecondArg } from './utility'

export interface ControllerMethodDecoratorType {
  (path?: string): MethodDecorator
  (target: Object, propertyKey: string, descriptor: PropertyDescriptor): void
}

export const restfulMethodDecorator =
  (httpMethod: string): ControllerMethodDecoratorType =>
  (...dArgs): MethodDecorator => {
    if (dArgs.length <= 1) {
      return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
        requestMappingAssembler.addMethodRoute(dArgs[0] || '', httpMethod, propertyKey, target.constructor)
        requestMappingAssembler.addMethodDescriptor(descriptor)
      }
    } else {
      requestMappingAssembler.addMethodRoute('', httpMethod, dArgs[1], dArgs[0].constructor)
      requestMappingAssembler.addMethodDescriptor(dArgs[2])
      return null
    }
  }

const generateMethodDecorator =
  (paramMethod: any, ...args: any[]) =>
  (target: Object, propertyKey: string, descriptor: PropertyDescriptor) => {
    const originalFunc = descriptor.value
    descriptor.value = async function (...arg) {
      const context = asyncLocalStorage.getStore() || ({} as Context)
      context.invocation = {
        className: target.constructor.name,
        methodName: propertyKey,
        params: arg
      }

      const ret = await paramMethod(
        context,
        async (mArgs) => {
          checkValidationError(originalFunc, context)
          return await originalFunc.apply(this, mArgs)
        },
        ...args
      )
      context.invocation = undefined
      return ret
    }
  }

type DecoratorMethodType<T = any> = (ctx: Context, invokeMethod: (args: any[]) => Promise<T>, ...args: any[]) => void

interface MethodDecoratorType<T extends DecoratorMethodType> {
  (...name: Parameters<OmitFirstAndSecondArg<T>>): MethodDecorator
  (target: Object, propertyKey: string, descriptor: PropertyDescriptor): void
}

export const createMethodDecorator =
  <T extends DecoratorMethodType>(paramMethod: T): MethodDecoratorType<T> =>
  (...dArgs) => {
    if (dArgs.length === 3 && dArgs[0].constructor?.toString().startsWith('class ')) {
      generateMethodDecorator(paramMethod)(dArgs[0], dArgs[1], dArgs[2])
      return null
    }
    return generateMethodDecorator(paramMethod, ...dArgs)
  }
