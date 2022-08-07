import { Context, requestHandler, waitForStart, summerDestroy } from '@summer-js/summer'
import { getInitContextData } from '@summer-js/summer/lib/http-server'
import queryString from 'query-string'
import merge from 'deepmerge'
import path from 'path'

export const initTest = async () => {
  process.env.SUMMER_TESTING = 'true'
  await import(path.resolve('./compile/index'))
  await waitForStart()
}

export const endTest = async () => {
  summerDestroy()
}

interface RequestParams {
  body?: any
  queries?: any
  headers?: any
}

type TestResponse = {
  statusCode: number
  headers: Record<string, string | string[]>
  body: any
  rawBody: string
}

const sendRequest = async (method: any, path: string, requestParams: RequestParams) => {
  if (typeof requestParams.body === 'object') {
    requestParams.body = JSON.stringify(requestParams.body)
  }
  const lowerCaseHeader = requestParams.headers || {}
  Object.keys(lowerCaseHeader).forEach((key) => {
    if (key.toLocaleLowerCase() !== key) {
      lowerCaseHeader[key.toLocaleLowerCase()] = lowerCaseHeader[key]
      delete lowerCaseHeader[key]
    }
  })
  const context: Context = {
    request: {
      method,
      path,
      body: requestParams.body ?? '',
      headers: lowerCaseHeader,
      queries: requestParams.queries || {}
    },
    ...getInitContextData()
  }
  await requestHandler(context)
  const rawBody = context.response.body
  try {
    if (context.response.body.trim().startsWith('{') || context.response.body.trim().startsWith('[')) {
      context.response.body = JSON.parse(context.response.body)
    }
  } catch (e) {
    context.response.body = rawBody
  }
  return { ...context.response, rawBody } as TestResponse
}

const parseUrl = (requestPath: string) => {
  const qInx = requestPath.indexOf('?')
  if (qInx < 0 || requestPath.endsWith('?')) {
    return { path: requestPath, queries: {} }
  }
  const queries = queryString.parse(requestPath.substring(qInx + 1, requestPath.length))
  const path = requestPath.substring(0, qInx)
  return { path, queries }
}

export const request = {
  async get(requestPath: string, requestParams: RequestParams = {}) {
    let { path, queries } = parseUrl(requestPath)
    requestParams.queries = merge(queries, requestParams.queries || {})
    return await sendRequest('GET', path, requestParams)
  },
  async post(requestPath: string, requestParams: RequestParams = {}) {
    let { path, queries } = parseUrl(requestPath)
    requestParams.queries = merge(queries, requestParams.queries || {})
    return await sendRequest('POST', path, requestParams)
  },
  async put(requestPath: string, requestParams: RequestParams = {}) {
    let { path, queries } = parseUrl(requestPath)
    requestParams.queries = merge(queries, requestParams.queries || {})
    return await sendRequest('PUT', path, requestParams)
  },
  async delete(requestPath: string, requestParams: RequestParams = {}) {
    let { path, queries } = parseUrl(requestPath)
    requestParams.queries = merge(queries, requestParams.queries || {})
    return await sendRequest('DELETE', path, requestParams)
  },
  async patch(requestPath: string, requestParams: RequestParams = {}) {
    let { path, queries } = parseUrl(requestPath)
    requestParams.queries = merge(queries, requestParams.queries || {})
    return await sendRequest('PATCH', path, requestParams)
  },
  async options(requestPath: string, requestParams: RequestParams = {}) {
    let { path, queries } = parseUrl(requestPath)
    requestParams.queries = merge(queries, requestParams.queries || {})
    return await sendRequest('OPTIONS', path, requestParams)
  }
}
