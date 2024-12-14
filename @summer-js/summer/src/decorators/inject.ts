import { IocContainer } from '../ioc'

interface InjectableDecoratorType {
  (options?: { tags: string[] }): ClassDecorator
  (target: any): void
}

// @ts-ignore
export const Injectable: InjectableDecoratorType = (...args) => {
  if (args.length === 0) {
    return (clazz: any) => {
      IocContainer.pendingIocClass(clazz)
    }
  } else {
    if (args[0].tags) {
      return (clazz: any) => {
        clazz.prototype.__$tags__ = args[0].tags
        IocContainer.pendingIocClass(clazz)
      }
    } else {
      IocContainer.pendingIocClass(args[0])
    }
  }
}

export const Service = Injectable
