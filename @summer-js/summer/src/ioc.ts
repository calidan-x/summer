import { getConfig } from './config-handler'
import { Logger } from './logger'
import { middlewareAssembler } from './middleware'

export interface Class<T> extends Function {
  new (...args: any[]): T
}

export const iocContainer = {
  iocClass: [],
  iocInstanceMap: new WeakMap(),
  generateFunction: new WeakMap(),
  iocGenericInstanceMap: [],
  iocInstance: [],
  async resolveLoc() {
    this.instanceiocClasses()
    this.resolveInject()
    await this.resolveAssign()
  },
  findGenericInstance(clazz: Class<any>, params: any[]) {
    const typeKey = [clazz, ...params]
    const genericInstance = this.iocGenericInstanceMap.find(({ key }) => {
      let equal = true
      key.forEach((item, inx) => {
        if (item !== typeKey[inx]) {
          equal = false
        }
      })
      return equal
    })
    return genericInstance
  },
  addInstance(clazz: Class<any>, params: any[], instance: object) {
    if (!instance) {
      return
    }
    const className = clazz.name
    if (params.length === 0) {
      if (this.iocInstanceMap.has(clazz)) {
        Logger.error('Duplicate Class: ' + className)
        process.exit()
      }
      this.iocInstanceMap.set(clazz, instance)
      this.iocInstance.push(instance)
    } else {
      const genericInstance = this.findGenericInstance(clazz, params)
      if (!genericInstance) {
        const typeKey = [clazz, ...params]
        this.iocGenericInstanceMap.push({ key: typeKey, instance })
        this.iocInstance.push(instance)
      }
    }
  },
  getInstance<T>(clazz: Class<T>, params: any[] = []): T {
    if (params.length === 0) {
      return this.iocInstanceMap.get(clazz)
    } else {
      const genericInstance = this.findGenericInstance(clazz, params)
      return genericInstance ? genericInstance.instance : undefined
    }
  },
  paddingIocClass(clazz: any) {
    if (!this.iocClass.includes(clazz)) {
      this.iocClass.push(clazz)
      // auto injection
      Reflect.getOwnMetadataKeys(clazz.prototype).forEach((key) => {
        iocContainer.paddingInject(clazz.prototype, key, true)
      })
    }
  },

  paddingInject(target: any, propertyKey: string, auto = false) {
    let [injectClass, array, genericParams] = Reflect.getMetadata('DeclareType', target, propertyKey)
    genericParams = genericParams.map((p) => {
      return typeof p[0] === 'function' && !p[0].name ? p[0]() : p[0]
    })
    if (!target.$_paddingInject) {
      target.$_paddingInject = {}
      target.$_autoInjectKeys = []
    }
    if (!target.$_paddingInject[propertyKey]) {
      target.$_paddingInject[propertyKey] = [injectClass, array, genericParams]
      if (auto) {
        target.$_autoInjectKeys.push(propertyKey)
      }
    }
  },
  instanceiocClasses() {
    this.iocClass.forEach((clazz: any) => {
      const classParams = Reflect.getMetadata('design:paramtypes', clazz)
      if (!classParams || (classParams && classParams.length === 0)) {
        const generateFunction = this.generateFunction.get(clazz)
        let instance: any
        if (!generateFunction) {
          instance = new clazz()
        } else {
          instance = generateFunction()
        }
        this.addInstance(clazz, [], instance)
      }
    })
    this.iocClass.forEach((clazz: any) => {
      Reflect.getOwnMetadataKeys(clazz.prototype).forEach((key) => {
        let [injectClass, , genericParams] = Reflect.getMetadata('DeclareType', clazz.prototype, key)
        if (typeof injectClass === 'function' && injectClass.name === '') {
          injectClass = injectClass()
        }
        genericParams = genericParams.map((p) => {
          return typeof p[0] === 'function' && !p[0].name ? p[0]() : p[0]
        })
        if (genericParams.length > 0) {
          if (this.iocClass.find((lc) => lc === injectClass)) {
            if (typeof injectClass === 'function' && /^\s*class\s+/.test(injectClass.toString())) {
              const generateFunction = this.generateFunction.get(injectClass)
              this.addInstance(
                injectClass,
                genericParams,
                generateFunction ? generateFunction(...genericParams) : new injectClass(...genericParams)
              )
            }
          }
        }
      })
    })
    middlewareAssembler.init()
  },
  resolveInject() {
    for (const obj of this.iocInstance) {
      if (obj.$_paddingInject) {
        for (const injectKey in obj.$_paddingInject) {
          let [injectClass, array, genericParams] = obj.$_paddingInject[injectKey]

          if (typeof injectClass === 'function' && injectClass.name === '') {
            injectClass = injectClass()
          }

          if (array === Array) {
            Logger.error(
              'Injection cannot be an Array',
              obj.constructor.name + '.' + injectKey + '[' + injectClass.name + ']'
            )
            process.exit()
          }

          if (typeof injectClass === 'function' && /^\s*class\s+/.test(injectClass.toString())) {
            if (genericParams.length === 0) {
              obj[injectKey] = obj[injectKey] ?? this.getInstance(injectClass)
            } else {
              obj[injectKey] = obj[injectKey] ?? this.findGenericInstance(injectClass, genericParams)?.instance
            }

            // if (!obj[injectKey]) {
            //   if (!obj.$_autoInjectKeys.includes(injectKey)) {
            //     Logger.error(injectKey + ':' + injectClass + ' is not injectable in ' + obj.constructor.name)
            //   }
            // }
          }
        }
        delete obj.$_paddingInject
        delete obj.$_autoInjectKeys
      }
      if (obj.constructor.prototype.$_paddingInject) {
        delete obj.constructor.prototype.$_paddingInject
      }
      if (obj.constructor.prototype.$_autoInjectKeys) {
        delete obj.constructor.prototype.$_autoInjectKeys
      }
    }
  },
  paddingAssign(target: any, propertyKey: string, decoratorFunc: any, args: any) {
    if (!target._paddingAssign) {
      target._paddingAssign = {}
    }
    target._paddingAssign[propertyKey] = { decoratorFunc, args }
  },
  async resolveAssign() {
    const config = getConfig()
    for (const obj of this.iocInstance) {
      if (obj._paddingAssign) {
        for (const assignKey in obj._paddingAssign) {
          obj[assignKey] = await obj._paddingAssign[assignKey].decoratorFunc(
            config,
            assignKey,
            ...obj._paddingAssign[assignKey].args
          )
        }
        delete obj._paddingAssign
      }

      if (obj.constructor.prototype._paddingAssign) {
        delete obj.constructor.prototype._paddingAssign
      }

      if (obj['$_postConstruct']) {
        obj[obj['$_postConstruct']]()
        delete obj['$_postConstruct']
      }
    }
  },
  clear() {
    this.iocClass = []
    this.iocInstance = []
  }
}

export const getInjectable = <T>(clazz: Class<T>, params: any[] = []): T => {
  return iocContainer.getInstance(clazz, params)
}

export const addInjectable = <T>(clazz: Class<T>, generateFunction?: (...params: any[]) => any) => {
  iocContainer.paddingIocClass(clazz)
  if (generateFunction) {
    iocContainer.generateFunction.set(clazz, generateFunction)
  }
}
