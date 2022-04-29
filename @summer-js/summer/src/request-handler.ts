import { locContainer } from './loc'
import { Logger } from './logger'
import { middlewares } from './middleware'
import { requestMapping } from './request-mapping'
import { validateAndConvertType } from './validate-types'
import { session } from './session'
import { parseCookie, assembleCookie } from './cookie'
import { handleCors } from './cors'

export interface UploadedFile {
  filename: string
  encoding: string
  mimeType: string
  tmpPath: string
}

interface RequestContext {
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'OPTIONS'
  path: string
  pathParams?: Record<string, string>
  queries?: Record<string, string>
  headers?: Record<string, string>
  body?: string
  files?: Record<string, UploadedFile>
}

export interface ResponseContext {
  statusCode: number
  headers: Record<string, string | string[]>
  body: string
}

export interface Context {
  request: RequestContext
  response: ResponseContext
  cookies?: Record<string, string>
  session?: Record<string, string>
  data?: Record<string, string>
}

export let context: Context = {} as any

const matchPathMethod = (path: string, httpMethod: string) => {
  let routeData = requestMapping[path]

  // 直接匹配
  if (routeData) {
    const methodData = routeData[httpMethod] || routeData['REQUEST']
    if (methodData) {
      return {
        controller: locContainer.getInstance(methodData.controllerName),
        ...methodData
      }
    }
  }
  // 正则匹配
  else {
    const paths = Object.keys(requestMapping)
    for (let i = 0; i < paths.length; i++) {
      routeData = requestMapping[paths[i]]
      const methodData = routeData[httpMethod] || routeData['REQUEST']
      if (methodData) {
        const pathParamArray = routeData.pathRegExp.exec(path)
        if (pathParamArray) {
          const pathKeys = routeData.pathKeys
          const pathParams = {}
          pathKeys.forEach((pk, inx) => {
            pathParams[pk] = pathParamArray[inx + 1]
          })
          return {
            controller: locContainer.getInstance(methodData.controllerName),
            pathParams,
            ...methodData
          }
        }
      }
    }
  }
  return null
}

export const applyResponse = (ctx: Context, responseData: any) => {
  const isJSON = typeof responseData === 'object'
  ctx.response = {
    ...ctx.response,
    statusCode: 200,
    headers: {
      'Content-Type': isJSON ? 'application/json' : 'text/html'
    },
    body: isJSON ? JSON.stringify(responseData) : responseData + ''
  }
}

const callControllerMethod = async (ctx: Context) => {
  const { method, path } = ctx.request
  const match = matchPathMethod(path, method)

  if (match !== null) {
    const { controller, callMethod, params, pathParams } = match
    ctx.request.pathParams = pathParams
    const applyParam = []
    let allErrors = []
    for (let i = 0; i < params.length; i++) {
      const param = params[i]
      if (param) {
        let convertedValue
        let paramValue = param.paramMethod(ctx, ...param.paramValues)
        if (typeof paramValue === 'object') {
          convertedValue = paramValue
        } else {
          convertedValue = await validateAndConvertType(
            param.type,
            param.declareType,
            param.paramValues[0],
            paramValue,
            allErrors,
            callMethod,
            param.index,
            controller
          )
        }
        applyParam.push(convertedValue)
      } else {
        applyParam.push(undefined)
      }
    }

    if (allErrors.length > 0) {
      ctx.response = {
        statusCode: 400,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ errors: allErrors })
      }
    } else {
      try {
        let responseData = await controller[callMethod].apply(controller, applyParam)
        if (responseData !== undefined) {
          applyResponse(ctx, responseData)
        }
      } catch (e) {
        Logger.error(e.stack)
        ctx.response = { statusCode: 400, headers: { 'Content-Type': 'text/html' }, body: '400 Bad Request' }
      }
    }
  } else {
    ctx.response = { statusCode: 404, headers: { 'Content-Type': 'text/html' }, body: '404 Not Found' }
  }
}

const callMiddleware = async (ctx: Context, deep = 0) => {
  const mw = middlewares[deep]
  const next = async () => await callMiddleware(ctx, deep + 1)
  if (mw) {
    return await mw.process(ctx, next)
  } else {
    return await callControllerMethod(ctx)
  }
}

export const requestHandler = async (ctx: Context) => {
  context = ctx

  if (handleCors(ctx)) {
    return
  }

  parseCookie(ctx)

  session.handleSession(ctx)

  await callMiddleware(ctx)

  assembleCookie(ctx)
}
