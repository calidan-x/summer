export const Serialize = (serializeFunction: (value: any) => any): PropertyDecorator => {
  return (target: any, key: string) => {
    Reflect.defineMetadata('Serialize', serializeFunction, target, key)
  }
}
