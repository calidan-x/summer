import { AsyncLocalStorage } from 'node:async_hooks'
import { getConfig } from './config-handler'
import { locContainer } from './loc'
import { Logger } from './logger'
import { middlewares } from './middleware'
import { requestMapping } from './request-mapping'
import { validateAndConvertType } from './validate-types'
import { session } from './session'
import { parseCookie, assembleCookie } from './cookie'
import { handleCors } from './cors'
import { rpc } from './rpc'

interface RequestContext {
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'OPTIONS'
  path: string
  pathParams?: Record<string, string>
  queries?: Record<string, string>
  headers?: Record<string, string>
  body?: string
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
  invocation?: {
    class: string
    method: string
    params: any[]
  }
}

export const asyncLocalStorage = new AsyncLocalStorage<Context>()

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

const addZero = (num: number) => (num < 10 ? '0' + num : num + '')

const toDate = (d: Date) => {
  if (!d) {
    return null
  }
  return d.getFullYear() + '-' + addZero(d.getMonth() + 1) + '-' + addZero(d.getDate())
}

const toDateTime = (d: Date) => {
  if (!d) {
    return null
  }
  return toDate(d) + ' ' + addZero(d.getHours()) + ':' + addZero(d.getMinutes()) + ':' + addZero(d.getSeconds())
}

const serialization = (obj, declareType: any[]) => {
  let [d0, d1, d2] = declareType || []
  const isArray = d1 === Array

  if (isArray) {
    for (const key in obj) {
      obj[key] = serialization(obj[key], [d0, undefined, d2])
    }
  } else if (typeof obj === 'object' && ![Date, _DateTime, _TimeStamp].includes(d0)) {
    for (const key in obj) {
      let declareType = Reflect.getMetadata('DeclareType', obj, key) || []
      if (typeof declareType[0] === 'number') {
        if (d2) {
          declareType = d2[declareType[0]] || []
        } else {
          declareType = []
        }
      }
      obj[key] = serialization(obj[key], declareType)
    }
  } else {
    if (typeof d0 === 'object') {
      if (d0[obj]) {
        obj = d0[obj]
      } else {
        for (const enumKey in d0) {
          if (d0[enumKey] === obj) {
            obj = enumKey
          }
        }
      }
    } else if (d0 === Date) {
      obj = toDate(obj)
    } else if (d0 === _DateTime) {
      obj = toDateTime(obj)
    } else if (d0 === _TimeStamp) {
      obj = obj.getTime()
    }
  }

  return obj
}

export const applyResponse = (ctx: Context, responseData: any, returnDeclareType: any[]) => {
  if (!responseData) {
    responseData = ''
  }
  const isJSON = typeof responseData === 'object'
  if (isJSON) {
    responseData = serialization(responseData, returnDeclareType)
  }

  if (ctx.response.body === undefined) {
    ctx.response.body = isJSON ? JSON.stringify(responseData) : responseData + ''
  }
  ctx.response.statusCode = ctx.response.statusCode || 200
  ctx.response.headers['Content-Type'] =
    ctx.response.headers['Content-Type'] || (isJSON ? 'application/json' : 'text/html')
}

const callControllerMethod = async (ctx: Context) => {
  const { method, path } = ctx.request
  const match = matchPathMethod(path, method)

  if (match !== null) {
    const { controller, callMethod, params, pathParams } = match
    ctx.request.pathParams = pathParams
    ctx.invocation = {
      class: controller.constructor.name,
      method: callMethod,
      params: undefined
    }
    const applyParam = []
    let allErrors = []
    for (let i = 0; i < params.length; i++) {
      const param = params[i]
      if (param) {
        let convertedValue
        let paramValue = param.paramMethod(ctx, ...param.paramValues)
        convertedValue = await validateAndConvertType(
          param.declareType,
          param.paramValues[0],
          paramValue,
          allErrors,
          callMethod,
          param.index,
          controller
        )
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
      await asyncLocalStorage.run(ctx, async () => {
        let responseData = await controller[callMethod].apply(controller, applyParam)
        const returnDeclareType = Reflect.getMetadata('ReturnDeclareType', controller, callMethod)
        applyResponse(ctx, responseData, returnDeclareType)
      })
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

const handleRpc = async (ctx: Context) => {
  if (ctx.request.headers['summer-rpc-access-key']) {
    if (
      getConfig()['RPC_CONFIG'].provider &&
      ctx.request.headers['summer-rpc-access-key'] === getConfig()['RPC_CONFIG'].provider.accessKey
    ) {
      let rpcData
      try {
        rpcData = JSON.parse(ctx.request.body)
        if (!rpcData.class || !rpcData.method) {
          throw new Error()
        }
      } catch (e) {
        Logger.error('Error parsing rpc data')
      }

      if (rpcData) {
        try {
          const result = await rpc.call(rpcData.class, rpcData.method, rpcData.data || [])
          ctx.response.statusCode = 200
          ctx.response.body = JSON.stringify(result)
        } catch (e) {
          Logger.error(e)
          ctx.response.statusCode = 400
          ctx.response.body = JSON.stringify({ error: e.message })
        }
      }
    } else {
      const msg = 'Rpc accessKey mismatch'
      Logger.error(msg)
      ctx.response.statusCode = 400
      ctx.response.body = JSON.stringify({ error: msg })
    }
    return true
  }
  return false
}

export const requestHandler = async (ctx: Context) => {
  try {
    if (await handleRpc(ctx)) {
      return
    }

    if (handleCors(ctx)) {
      return
    }

    parseCookie(ctx)

    session.handleSession(ctx)

    await callMiddleware(ctx)

    assembleCookie(ctx)
  } catch (e) {
    Logger.error(e)
    if (e.stack) {
      console.log(e.stack)
    }

    ctx.response.statusCode = ctx.response.statusCode || 500
    ctx.response.headers['Content-Type'] = ctx.response.headers['Content-Type'] || 'text/html'
    if (ctx.response.body === undefined) {
      ctx.response.body = 'Server Error'
    }
  }
}
