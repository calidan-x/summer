import { getConfig } from './config-handler'
import { Logger } from './logger'
import { middlewareAssembler } from './middleware'

export interface Class<T> extends Function {
  new (...args: any[]): T
}

export const locContainer = {
  locClass: [],
  locInstanceMap: new WeakMap(),
  generateFunction: new WeakMap(),
  locGenericInstanceMap: [],
  locInstance: [],
  async resolveLoc() {
    this.instanceLocClasses()
    this.resolveInject()
    await this.resolveAssign()
  },
  findGenericInstance(clazz: Class<any>, params: any[]) {
    const typeKey = [clazz, ...params.map((p) => (typeof p[0] === 'function' ? p[0]() : p[0]))]
    const genericInstance = this.locGenericInstanceMap.find(({ key }) => {
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
      if (this.locInstanceMap.has(clazz)) {
        Logger.error('Duplicate Class: ' + className)
        process.exit()
      }
      this.locInstanceMap.set(clazz, instance)
      this.locInstance.push(instance)
    } else {
      const typeKey = [clazz, ...params.map((p) => (typeof p[0] === 'function' ? p[0]() : p[0]))]
      const genericInstance = this.findGenericInstance(clazz, params)
      if (!genericInstance) {
        this.locGenericInstanceMap.push({ key: typeKey, instance })
        this.locInstance.push(instance)
      }
    }
  },
  getInstance<T>(clazz: Class<T>, params: any[] = []): T {
    if (params.length === 0) {
      return this.locInstanceMap.get(clazz)
    } else {
      const genericInstance = this.findGenericInstance(clazz, params)
      return genericInstance ? genericInstance.instance : undefined
    }
  },
  paddingLocClass(clazz: any) {
    if (!this.locClass.includes(clazz)) {
      this.locClass.push(clazz)
      // auto injection
      Reflect.getOwnMetadataKeys(clazz.prototype).forEach((key) => {
        locContainer.paddingInject(clazz.prototype, key, true)
      })
    }
  },

  instanceLocClasses() {
    this.locClass.forEach((clazz: any) => {
      const instance = new clazz()
      this.addInstance(clazz, [], instance)
    })
    this.locClass.forEach((clazz: any) => {
      Reflect.getOwnMetadataKeys(clazz.prototype).forEach((key) => {
        let [injectClass, , genericParams] = Reflect.getMetadata('DeclareType', clazz.prototype, key)
        if (typeof injectClass === 'function' && injectClass.name === '') {
          injectClass = injectClass()
        }
        if (genericParams.length > 0) {
          const gParams = genericParams.map((gp) => (typeof gp[0] === 'function' ? gp[0]() : gp[0]))
          if (this.locClass.find((lc) => lc === injectClass)) {
            if (typeof injectClass === 'function' && /^\s*class\s+/.test(injectClass.toString())) {
              const generateFunction = this.generateFunction.get(injectClass)
              this.addInstance(
                injectClass,
                gParams,
                generateFunction ? generateFunction(...gParams) : new injectClass(...gParams)
              )
            }
          }
        }
      })
    })
    middlewareAssembler.init()
  },
  paddingInject(target: any, propertyKey: string, auto = false) {
    const t = Reflect.getMetadata('DeclareType', target, propertyKey)

    if (!target.$_paddingInject) {
      target.$_paddingInject = {}
      target.$_autoInjectKeys = []
    }
    if (!target.$_paddingInject[propertyKey]) {
      target.$_paddingInject[propertyKey] = t
      if (auto) {
        target.$_autoInjectKeys.push(propertyKey)
      }
    }
  },
  resolveInject() {
    for (const obj of this.locInstance) {
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
              obj[injectKey] = this.getInstance(injectClass)
            } else {
              const gParams = genericParams.map((gp) => (typeof gp[0] === 'function' ? gp[0]() : gp[0]))
              obj[injectKey] = this.findGenericInstance(injectClass, gParams)?.instance
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
    for (const obj of this.locInstance) {
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
    this.locClass = []
    this.locInstance = []
  }
}

export const getInjectable = <T>(clazz: Class<T>, params: any[] = []): T => {
  return locContainer.getInstance(clazz, params)
}

export const addInjectable = <T>(clazz: Class<T>, generateFunction?: (...params: any[]) => any) => {
  locContainer.paddingLocClass(clazz)
  if (generateFunction) {
    locContainer.generateFunction.set(clazz, generateFunction)
  }
}
