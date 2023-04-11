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
export const Ctx = createParamDecorator((ctx) => ctx)

export const _bodyConvertFunc = (ctx) => ctx.request.body
export const Body = createParamDecorator(_bodyConvertFunc)

export const _queriesConvertFunc = (ctx) => ctx.request.queries
export const Queries = createParamDecorator(_queriesConvertFunc)

export const _queryConvertFunc = (ctx, paramName: string, name: string) => ctx.request.queries[name || paramName]
export const Query = createParamDecorator(_queryConvertFunc)

export const _pathParamConvertFunc = (ctx, paramName: string, name: string) => ctx.request.pathParams[name || paramName]
export const PathParam = createParamDecorator(_pathParamConvertFunc)

// export const Session = createParamDecorator((ctx) => ctx.session)

export const _headerConvertFunc = (ctx, paramName: string, name: string) =>
  ctx.request.headers[(name || paramName).toLowerCase()]
export const Header = createParamDecorator(_headerConvertFunc)

// export const _headersConvertFunc = (ctx) => ctx.request.headers
// export const Headers = createParamDecorator(_headerConvertFunc)

// export const Cookie = createParamDecorator((ctx, paramName: string, name: string) =>
//   ctx.cookies ? ctx.cookies[name || paramName] : undefined
// )
export const RequestPath = createParamDecorator((ctx) => ctx.request.path)

// property
;(global as any)._EnvConfig = createPropertyDecorator(async (config, _propertyName, configKey?: string) => {
  return configKey ? config[configKey] : config
})

/**
 * @deprecated Please use EnvConfig<'Name',Type = any>
 */
export const Config = (global as any)._EnvConfig
