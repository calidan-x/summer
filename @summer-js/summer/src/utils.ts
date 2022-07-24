export const fillData = <T>(instance: T, fillData: Partial<T> & Omit<Record<string, any>, keyof T>) => {
  for (const k in fillData) {
    let propType = Reflect.getMetadata('DeclareType', instance, k)
    if (propType) {
      instance[k] = fillData[k]
    }
  }
}

interface Type<T> extends Function {
  new (...args: any[]): T
}

export const convertData = <T>(data: Partial<T> & Omit<Record<string, any>, keyof T>, clazz: Type<T>): T => {
  const instance = new clazz()
  for (const k in data) {
    let propType = Reflect.getMetadata('DeclareType', instance, k)
    if (propType) {
      instance[k] = data[k]
    }
  }
  return instance
}
