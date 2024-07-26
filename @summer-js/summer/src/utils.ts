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

export const serialize = <T>(obj: T, declareType: any[] = []): T => {
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
    obj = (obj || []).map((item) => serialize(item, [d0, undefined, d2])) as any
  } else {
    const t = { ...obj }
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
      obj[key] = serializeFunc ? serializeFunc(obj[key], t) : serialize(obj[key], declareType)
    }
  }

  return obj
}
