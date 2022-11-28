interface MethodDecoratorType {
  (): MethodDecorator
  (target: Object, propertyKey: string, descriptor: PropertyDescriptor): void
}

export const PostConstruct: MethodDecoratorType = (...args) => {
  if (args.length == 0) {
    return (target: any, propertyKey: string, _descriptor: PropertyDescriptor) => {
      target.$_postConstruct = propertyKey
    }
  } else {
    args[0].$_postConstruct = args[1]
    return null
  }
}
