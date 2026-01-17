export const fillData = <T>(instance: T, fillData: Partial<T> & Omit<Record<string, any>, keyof T>) => {
  for (const k in fillData) {
    let propType = Reflect.getMetadata('DeclareType', instance as any, k)
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
    let propType = Reflect.getMetadata('DeclareType', instance as any, k)
    if (propType) {
      instance[k] = data[k]
    }
  }
  return instance
}

const deepCloneInstance = (instance) => {
  if (Array.isArray(instance)) {
    return instance.map((item) => (item && typeof item === 'object' ? deepCloneInstance(item) : item))
  }

  if (instance instanceof Date) {
    return new Date(instance)
  }

  const clone = Object.create(Object.getPrototypeOf(instance))
  const keys = Object.keys(instance)
  for (const key of keys) {
    if (instance.hasOwnProperty(key)) {
      const value = instance[key]
      if (value && typeof value === 'object') {
        clone[key] = deepCloneInstance(value)
      } else {
        clone[key] = value
      }
    }
  }
  return clone
}

type Equal<X, Y> = (<T>() => T extends X ? 1 : 2) extends <T>() => T extends Y ? 1 : 2 ? true : false

type ForEach<K, T extends any[], Result = never> = T extends [infer First, infer Second, ...infer Rest]
  ? ForEach<K, Rest, Result | (Equal<K, First> extends true ? keyof Second : never)>
  : Result

type EnumToString<T, Enums extends any[]> = {
  [K in keyof T]: T[K] extends Date
    ? number
    : T[K] extends object
    ? EnumToString<Required<T[K]>, Enums>
    : ForEach<T[K], Enums> extends never
    ? T[K]
    : ForEach<T[K], Enums>
}

export const SERIALIZE_ENUMS = Symbol('__enums__')
type EnumsOf<T> = T extends { [SERIALIZE_ENUMS]: infer E extends any[] } ? E : []
interface SerializeFunction {
  <T>(obj: T[], declareType?: any[]): EnumToString<Required<T>, EnumsOf<T>>[]
  <T>(obj: T, declareType?: any[]): EnumToString<Required<T>, EnumsOf<T>>
}
export const serialize: SerializeFunction = <T>(obj: T | T[], declareType: any[] = []): any => {
  const newObj = deepCloneInstance(obj)
  return _serialize(newObj, declareType)
}

const _serialize = <T>(obj: T, declareType: any[] = []): T => {
  let [d0, , d2] = declareType || []
  if (typeof d0 === 'function' && d0.name === '') {
    d0 = d0()
  }

  if (typeof obj !== 'object') {
    if (typeof d0 === 'object' && !Array.isArray(d0)) {
      if (d0[obj] && typeof obj === 'number') {
        obj = d0[obj]
      } else if (typeof d0[obj] !== 'number') {
        for (const enumKey in d0) {
          if (d0[enumKey] === obj) {
            obj = enumKey as any
          }
        }
      }
    }
  } else if (Array.isArray(obj)) {
    obj = (obj || []).map((item) => _serialize(item, [d0, undefined, d2])) as any
  } else {
    const keep = { ...obj }
    for (const key in obj) {
      let declareType =
        Reflect.getMetadata('DeclareType', obj, key) ||
        (d0 ? Reflect.getMetadata('DeclareType', d0.prototype, key) : []) ||
        []
      if (typeof declareType[0] === 'number') {
        if (d2) {
          const d1Type = declareType[1]
          declareType = d2[declareType[0]] || []
          if (d1Type) {
            declareType[1] = d1Type
          }
        } else {
          declareType = []
        }
      }
      if (declareType[2]) {
        declareType[2].forEach((d, inx) => {
          if (typeof d[0] === 'number') {
            declareType[2][inx] = d2[d[0]]
          }
        })
      }
      const serializeFunc = Reflect.getMetadata('Serialize', obj, key)
      obj[key] = serializeFunc
        ? _serialize(serializeFunc(obj[key], keep), declareType)
        : _serialize(obj[key], declareType)
    }
  }

  return obj
}
