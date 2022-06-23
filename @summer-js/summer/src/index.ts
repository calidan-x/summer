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
export { File } from './validate-types'

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
  const _Optional: any
  const _NotEmpty: any
}

;(global as any)._Int = class _Int {}
;(global as any)._TimeStamp = class _TimeStamp {}
;(global as any)._DateTime = class _DateTime {}
;(global as any)._PropDeclareType =
  (declareType: any, typeParams: any[]) => (target: Object, propertyKey: string | symbol) => {
    Reflect.defineMetadata(propertyKey, propertyKey, target)
    declareType = declareType || []
    declareType[2] = typeParams || []
    Reflect.defineMetadata('DeclareType', declareType, target, propertyKey)
  }
;(global as any)._ParamDeclareType =
  (declareType: any, typeParams: any[]) => (target: Object, propertyKey: string | symbol, index: number) => {
    let existingParameterTypes: any[] = Reflect.getOwnMetadata('DeclareTypes', target, propertyKey) || []
    declareType = declareType || []
    declareType[2] = typeParams || []
    existingParameterTypes[index] = declareType
    Reflect.defineMetadata('DeclareTypes', existingParameterTypes, target, propertyKey)
  }
;(global as any)._ReturnDeclareType =
  (declareType: any, typeParams: any[]) => (target: Object, propertyKey: string | symbol) => {
    declareType = declareType || []
    declareType[2] = typeParams || []
    Reflect.defineMetadata('ReturnDeclareType', declareType, target, propertyKey)
  }
