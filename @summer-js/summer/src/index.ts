import { ClassDeclaration } from 'ts-morph'
export { summerStart, summerDestroy, waitForStart } from './summer'
export * from './decorators'
export * from './utils'
export { requestHandler, Context } from './request-handler'
export { getInjectable } from './loc'
export { Logger } from './logger'
export { SessionConfig } from './session'
export { RpcConfig } from './rpc'
export { ServerConfig } from './http-server'
export { getConfig } from './config-handler'
export { handler } from './serverless'
export { addPlugin } from './summer'
export { setCookie, clearCookie } from './cookie'
export { UploadedFile } from './request-handler'

export interface SummerPlugin {
  configKey: string
  compile?: (clazz: ClassDeclaration) => void
  postCompile?: () => void
  autoImportDecorators?: () => string[]
  init: (config: any) => void
  destroy?: () => void
}

declare global {
  type int = number
  type DateTime = Date
  type TimeStamp = Date
  const _Int: any
  const _TimeStamp: any
  const _DateTime: any
  const _PropDeclareType: any
  const _ParamDeclareType: any
  const _ReturnDeclareType: any
  const _Required: any
}

;(global as any)._Int = function _Int() {}
;(global as any)._TimeStamp = function _TimeStamp() {}
;(global as any)._DateTime = function _DateTime() {}
;(global as any)._PropDeclareType = (type: any) => (target: Object, propertyKey: string | symbol) => {
  Reflect.defineMetadata(propertyKey, propertyKey, target)
  Reflect.defineMetadata('DeclareType', type, target, propertyKey)
}
;(global as any)._ParamDeclareType = (type: any) => (target: Object, propertyKey: string | symbol, index: number) => {
  let existingParameterTypes: number[] = Reflect.getOwnMetadata('DeclareTypes', target, propertyKey) || []
  existingParameterTypes[index] = type
  Reflect.defineMetadata('DeclareTypes', existingParameterTypes, target, propertyKey)
}
;(global as any)._ReturnDeclareType =
  (type: any, declareType: any) => (target: Object, propertyKey: string | symbol) => {
    Reflect.defineMetadata('ReturnDeclareType', [type, declareType], target, propertyKey)
  }
