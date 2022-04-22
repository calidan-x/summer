import { ClassDeclaration, Decorator } from 'ts-morph'
export { summerStart, summerDestroy } from './summer'
export * from './decorators'
export * from './utils'
export { requestHandler, Context } from './request-handler'
export { getInjectable } from './loc'
export { Logger } from './logger'
export { SessionConfig } from './session'
export { ServerConfig } from './http-server'
export { getConfig } from './config-handler'
export { handler } from './serverless'
export { addPlugin } from './summer'
export { setCookie, clearCookie } from './cookie'

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
  const _PropDeclareType: any
  const _ParamDeclareType: any
  const _Required: any
  const Int: any
}

;(global as any)._PropDeclareType = (type: any) => (target: Object, propertyKey: string | symbol) => {
  Reflect.defineMetadata(propertyKey, propertyKey, target)
  Reflect.defineMetadata('DeclareType', type, target, propertyKey)
}
;(global as any)._ParamDeclareType = (type: any) => (target: Object, propertyKey: string | symbol, index: number) => {
  let existingParameterTypes: number[] = Reflect.getOwnMetadata('DeclareTypes', target, propertyKey) || []
  existingParameterTypes[index] = type
  Reflect.defineMetadata('DeclareTypes', existingParameterTypes, target, propertyKey)
}
