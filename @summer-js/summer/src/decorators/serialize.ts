export const Serialize = (serializeFunction: (value: any, obj?: any) => any): PropertyDecorator => {
  return (target: any, key: string) => {
    Reflect.defineMetadata('Serialize', serializeFunction, target, key)
  }
}

export const Ignore = Serialize(() => undefined)
