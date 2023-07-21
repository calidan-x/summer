import { Context } from '../request-handler'
import { restfulMethodDecorator } from './method'
import { createParamDecorator } from './param'
import { createPropertyDecorator } from './property'

// method
export const Get = restfulMethodDecorator('GET')
export const Post = restfulMethodDecorator('POST')
export const Put = restfulMethodDecorator('PUT')
export const Patch = restfulMethodDecorator('PATCH')
export const Delete = restfulMethodDecorator('DELETE')
export const Request = restfulMethodDecorator('REQUEST')

// params
/**
 * @deprecated Please use '@Context'
 */
export const Ctx = createParamDecorator((ctx: Context) => ctx)

export const _bodyConvertFunc = (ctx: Context) => {
  if (ctx.request.headers['Content-Type'] === 'application/json') {
    return JSON.parse(ctx.request.body!)
  }
  return ctx.request.body
}
export const Body = createParamDecorator(_bodyConvertFunc)

export const _queriesConvertFunc = (ctx: Context) => ctx.request.queries
export const Queries = createParamDecorator(_queriesConvertFunc)

export const _queryConvertFunc = (ctx: Context, paramName: string, name: string) =>
  ctx.request.queries[name || paramName]
export const Query = createParamDecorator(_queryConvertFunc)

export const _pathParamConvertFunc = (ctx: Context, paramName: string, name: string) =>
  ctx.request.pathParams[name || paramName]
export const PathParam = createParamDecorator(_pathParamConvertFunc)

export const _headerConvertFunc = (ctx: Context, paramName: string, name: string) =>
  ctx.request.headers[name || paramName]
export const Header = createParamDecorator(_headerConvertFunc)

export const RequestPath = createParamDecorator((ctx: Context) => ctx.request.path)

// property
;(global as any)._EnvConfig = createPropertyDecorator(async (config, _propertyName, configKey?: string) => {
  return configKey ? config[configKey] : config
})

/**
 * @deprecated Please use EnvConfig<'Name',Type = any>
 */
export const Config = (global as any)._EnvConfig
