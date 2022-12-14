import { iocContainer } from '../ioc'

/*
@Deprecated

interface InjectDecoratorType {
  (): PropertyDecorator
  (target: any, propertyKey: string): void
}

interface AutoInjectDecoratorType {
  (): ClassDecorator
  (target: any): void
}

export const Inject: InjectDecoratorType = (...arg) => {
  if (arg.length === 0) {
    return (target: any, propertyKey: string) => {
      locContainer.paddingInject(target, propertyKey)
    }
  } else {
    locContainer.paddingInject(arg[0], arg[1])
  }
}

export const AutoInject: AutoInjectDecoratorType = (...arg) => {
  if (arg.length === 0) {
    return (target: any) => {
      Reflect.getOwnMetadataKeys(target.prototype).forEach((key) => {
        locContainer.paddingInject(target.prototype, key, true)
      })
    }
  } else {
    Reflect.getOwnMetadataKeys(arg[0].prototype).forEach((key) => {
      locContainer.paddingInject(arg[0].prototype, key, true)
    })
  }
}
*/

interface InjectableDecoratorType {
  (): ClassDecorator
  (target: any): void
}

// @ts-ignore
export const Injectable: InjectableDecoratorType = (...args) => {
  if (args.length === 0) {
    return (clazz: any) => {
      iocContainer.paddingIocClass(clazz)
    }
  } else {
    iocContainer.paddingIocClass(args[0])
  }
}

export const Service = Injectable
