import { getConfig } from './config-handler'
import { Logger } from './logger'

export interface Class<T> extends Function {
  new (...args: any[]): T
}

export const locContainer = {
  locClass: [],
  locInstance: {},
  resolveLoc() {
    this.instanceLocClasses()
    this.resolveInject()
    this.resolveAssign()
  },
  addInstance(instance: object) {
    const className = instance.constructor.name
    if (this.locInstance[className]) {
      Logger.error('Duplicate ClassName: ' + className)
      process.exit()
    }
    this.locInstance[className] = instance
  },
  getInstance<T>(clazz: string | Class<T>): T {
    const className: string = typeof clazz === 'string' ? clazz : clazz.constructor.name
    if (!this.locInstance[className]) {
      return undefined
    }
    return this.locInstance[className]
  },
  paddingLocClass(clazz: Function) {
    this.locClass.push(clazz)
  },
  instanceLocClasses() {
    this.locClass.forEach((clazz: any) => {
      const instance = new clazz()
      this.addInstance(instance)
    })
  },
  paddingInject(target: any, propertyKey: string, auto = false) {
    const t = Reflect.getMetadata('design:type', target, propertyKey)
    if (!target.$_paddingInject) {
      target.$_paddingInject = {}
      target.$_autoInjectKeys = []
    }
    if (!target.$_paddingInject[propertyKey]) {
      if (typeof t === 'function' && /^\s*class\s+/.test(t.toString())) {
        target.$_paddingInject[propertyKey] = t.name
        if (auto) {
          target.$_autoInjectKeys.push(propertyKey)
        }
      }
    }
  },
  resolveInject() {
    for (const locKey in this.locInstance) {
      const obj = this.locInstance[locKey]
      if (obj.$_paddingInject) {
        for (const injectKey in obj.$_paddingInject) {
          obj[injectKey] = this.getInstance(obj.$_paddingInject[injectKey])
          if (!obj[injectKey]) {
            if (!obj.$_autoInjectKeys.includes(injectKey)) {
              Logger.error(
                injectKey + ':' + obj.$_paddingInject[injectKey] + ' is not injectable in ' + obj.constructor.name
              )
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
    for (const locKey in this.locInstance) {
      const obj = this.locInstance[locKey]
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
    }
  },
  clear() {
    this.locClass = []
    this.locInstance = {}
  }
}

export const getLocInstance = locContainer.getInstance
