import { ClassDeclaration } from 'ts-morph'
export { summerStart, summerDestroy, waitForStart, addPlugin, pluginCollection } from './summer'
export * from './decorators'
export * from './utils'
export { requestHandler, Context, getContext } from './request-handler'
export * from './error'
export { getInjectable, addInjectable } from './loc'
export { Logger } from './logger'
export { SessionConfig } from './session'
export { RpcConfig } from './rpc'
export { ServerConfig } from './http-server'
export { getConfig } from './config-handler'
export { handler } from './serverless'
export { setCookie, clearCookie } from './cookie'
export { File } from './validate-types'
export { SummerPlugin } from './plugin'

declare global {
  type int = number
  const _Int: any
  const _PropDeclareType: any
  const _ParamDeclareType: any
  const _ReturnDeclareType: any
  const _Optional: any
  const ClassCollect: any
}

;(global as any)._Int = class _Int {}
;(global as any)._PropDeclareType = (declareType: any) => (target: Object, propertyKey: string | symbol) => {
  Reflect.defineMetadata(propertyKey, propertyKey, target)
  declareType = declareType || []
  declareType[2] = declareType[2] || []
  Reflect.defineMetadata('DeclareType', declareType, target, propertyKey)
}
;(global as any)._ParamDeclareType =
  (declareType: any) => (target: Object, propertyKey: string | symbol, index: number) => {
    let existingParameterTypes: any[] = Reflect.getOwnMetadata('DeclareTypes', target, propertyKey) || []
    declareType = declareType || []
    declareType[2] = declareType[2] || []
    existingParameterTypes[index] = declareType
    Reflect.defineMetadata('DeclareTypes', existingParameterTypes, target, propertyKey)
  }
;(global as any)._ReturnDeclareType = (declareType: any) => (target: Object, propertyKey: string | symbol) => {
  declareType = declareType || []
  declareType[2] = declareType[2] || []
  Reflect.defineMetadata('ReturnDeclareType', declareType, target, propertyKey)
}
