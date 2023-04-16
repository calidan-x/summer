import { addSerializeKeys } from '../request-handler'

export const Serialize = (serializeFunction: (value: any) => any): PropertyDecorator => {
  return (target: any, key: string) => {
    addSerializeKeys(target, key)
    Reflect.defineMetadata('Serialize', serializeFunction, target, key)
  }
}
