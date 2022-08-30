import { getConfig } from './config-handler'
import { Logger } from './logger'
import { middlewareAssembler } from './middleware'

export interface Class<T> extends Function {
  new (...args: any[]): T
}

export const locContainer = {
  locClass: [],
  locInstanceMap: new WeakMap(),
  locInstance: [],
  async resolveLoc() {
    this.instanceLocClasses()
    this.resolveInject()
    await this.resolveAssign()
  },
  addInstance(clazz: Class<any>, instance: object) {
    const className = clazz.name
    if (this.locInstanceMap.has(clazz)) {
      Logger.error('Duplicate Class: ' + className)
      process.exit()
    }
    this.locInstanceMap.set(clazz, instance)
    this.locInstance.push(instance)
  },
  getInstance<T>(clazz: Class<T>): T {
    return this.locInstanceMap.get(clazz)
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
      this.addInstance(clazz, instance)
    })
    middlewareAssembler.init()
  },
  paddingInject(target: any, propertyKey: string, auto = false) {
    let t = Reflect.getMetadata('DeclareType', target, propertyKey)[0]

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
          let injectClass = obj.$_paddingInject[injectKey]
          if (typeof injectClass === 'function' && injectClass.name === '') {
            injectClass = injectClass()
          }
          if (typeof injectClass === 'function' && /^\s*class\s+/.test(injectClass.toString())) {
            obj[injectKey] = this.getInstance(injectClass)
            if (!obj[injectKey]) {
              if (!obj.$_autoInjectKeys.includes(injectKey)) {
                Logger.error(injectKey + ':' + injectClass + ' is not injectable in ' + obj.constructor.name)
              }
            }
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

export const getInjectable = <T>(clazz: Class<T>): T => {
  return locContainer.getInstance(clazz)
}

export const addInjectable = <T>(clazz: Class<T>): T => {
  const inc = new clazz() as any
  locContainer.addInstance(clazz, inc)
  return inc
}
