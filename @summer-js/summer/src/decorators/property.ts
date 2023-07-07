import { IocContainer } from '../ioc'
import { OmitFirstAndSecondArg } from './utility'

const generatePropertyDecorator =
  (decoratorMethod: any, ...args: any[]) =>
  (target: Object, propertyKey: string) => {
    IocContainer.pendingAssign(target, propertyKey, decoratorMethod, args)
  }

type DecoratorMethodType = (config: any, propertyName: string, ...args: any[]) => any

export interface PropertyDecoratorType<T extends DecoratorMethodType> {
  (...name: Parameters<OmitFirstAndSecondArg<T>>): PropertyDecorator
  (target: Object, propertyKey: string): void
}

export const createPropertyDecorator =
  <T extends DecoratorMethodType>(paramMethod: T): PropertyDecoratorType<T> =>
  //@ts-ignore
  (...dArgs: any[]) => {
    if (dArgs.length === 3 && dArgs[0].constructor?.toString().startsWith('class ') && dArgs[2] === undefined) {
      generatePropertyDecorator(paramMethod)(dArgs[0], dArgs[1])
      return undefined
    }
    return generatePropertyDecorator(paramMethod, ...dArgs)
  }
