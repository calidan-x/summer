// import { ClassDeclaration } from 'ts-morph'
export { summerStart, summerDestroy, waitForStart, addPlugin, pluginCollection } from './summer'
export * from './decorators'
export * from './utils'
export { requestHandler, Context, getContext, StreamingData } from './request-handler'
export * from './error'
export { getInjectable, addInjectable } from './ioc'
export { Logger } from './logger'
export { SessionConfig, Session } from './session'
export { RpcConfig } from './rpc'
export { ServerConfig } from './http-server'
import { addSerializeKeys } from './request-handler'
export { getConfig, getEnvConfig, EnvConfig } from './config-handler'
export { handler } from './serverless'
export { Cookie } from './cookie'
export { File } from './validate-types'
export { SummerPlugin } from './plugin'

declare global {
  type int = number
  const _Int: any
  const _EnvConfig: any
  const _PropDeclareType: any
  const _ParamDeclareType: any
  const _ReturnDeclareType: any
  const _Optional: any
  const _NotBlank: any
  const ClassCollect: any
  namespace NodeJS {
    interface ProcessEnv {
      SUMMER_ENV: string
      SUMMER_BUILD_TIME: string
    }
  }
}

;(global as any)._Int = class _Int {}
;(global as any)._PropDeclareType = (declareType: any) => (target: Object, propertyKey: string | symbol) => {
  Reflect.defineMetadata(propertyKey, propertyKey, target)
  declareType = declareType || []
  declareType[2] = declareType[2] || []
  let d0 = declareType[0]
  Reflect.defineMetadata('DeclareType', declareType, target, propertyKey)
  if (d0) {
    if (typeof d0 === 'function' && d0.name === '') {
      d0 = d0()
    }
    // enum or object
    if (
      (typeof d0 === 'object' && !Array.isArray(d0)) ||
      declareType[1] === Array ||
      ![Number, String, Boolean, _Int, Date].includes(d0)
    ) {
      addSerializeKeys(target, propertyKey as string)
    }
  }
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
