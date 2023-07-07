import { IocContainer } from '../ioc'

interface InjectableDecoratorType {
  (): ClassDecorator
  (target: any): void
}

// @ts-ignore
export const Injectable: InjectableDecoratorType = (...args) => {
  if (args.length === 0) {
    return (clazz: any) => {
      IocContainer.pendingIocClass(clazz)
    }
  } else {
    IocContainer.pendingIocClass(args[0])
  }
}

export const Service = Injectable
