import { pathToRegexp } from 'path-to-regexp'
import { Class } from './loc'
import { Logger } from './logger'

export const requestMapping = {}
export const requestMappingAssembler = {
  params: [],
  controllerMethodDescriptors: [],
  controllerRequestMapping: {},
  nextController() {
    this.controllerMethodDescriptors = []
  },
  addParam(paramMethod: (ctx: any) => any, paramValues: any[], declareType: any, index: number) {
    this.params[index] = {
      paramValues,
      paramMethod,
      declareType,
      index
    }
  },
  addMethodRoute(path: string, httpMethod: string, callMethod: string, controllerClass: Class<any>) {
    if (this.controllerRequestMapping[path] && this.controllerRequestMapping[path][httpMethod]) {
      Logger.error(
        `Duplicate request routes: ${httpMethod} ${path || '/'} in ${controllerClass.name}.${callMethod}() and ${
          this.controllerRequestMapping[path][httpMethod]['controllerName']
        }.${this.controllerRequestMapping[path][httpMethod]['callMethod']}()`
      )
      process.exit()
    }
    this.controllerRequestMapping[path] = {
      ...this.controllerRequestMapping[path],
      [httpMethod]: {
        callMethod,
        params: this.params,
        controllerClass,
        controllerName: controllerClass.name
      }
    }
    this.params = []
  },
  addMethodDescriptor(descriptor: PropertyDescriptor) {
    this.controllerMethodDescriptors.push(descriptor)
  },
  addControllerRoute(controllerName: string, controllerPath: string) {
    Object.keys(this.controllerRequestMapping).forEach((path) => {
      const keys = []
      const fullPath = controllerPath + path
      const regexp = pathToRegexp(fullPath, keys)

      let pathMappingData = requestMapping[fullPath] || {}
      ;['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'REQUEST'].forEach((reqMethod) => {
        if (pathMappingData[reqMethod] && this.controllerRequestMapping[path][reqMethod]) {
          Logger.error(
            `Duplicate request routes: ${reqMethod} ${fullPath || '/'} in ${JSON.stringify([
              pathMappingData[reqMethod].controllerName,
              controllerName
            ])}`
          )
          process.exit()
        }
      })

      requestMapping[fullPath] = {
        ...pathMappingData,
        ...this.controllerRequestMapping[path],
        pathRegExp: regexp,
        pathKeys: keys.map((key) => key.name)
      }
    })
    this.controllerRequestMapping = {}
  }
}
