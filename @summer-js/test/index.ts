import { Context, requestHandler, waitForStart, summerDestroy } from '@summer-js/summer'
import { unzipSync } from 'node:zlib'
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
  queries?: Record<string, any>
  headers?: Record<string, any>
}

type TestResponse = {
  statusCode: number
  headers: Record<string, string | string[]>
  body: any
  rawBody: string
  print: (options?: { full: boolean }) => void
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
      pathParams: {},
      body: requestParams.body ?? '',
      headers: lowerCaseHeader,
      queries: requestParams.queries || {}
    },
    ...getInitContextData()
  }
  await requestHandler(context)
  if (context.response.headers['Content-Encoding'] === 'gzip') {
    context.response.body = unzipSync(context.response.body).toString('utf-8')
  }
  const rawBody = context.response.body
  try {
    if (context.response.body.trim().startsWith('{') || context.response.body.trim().startsWith('[')) {
      context.response.body = JSON.parse(context.response.body)
    }
  } catch (e) {
    context.response.body = rawBody
  }
  return {
    ...context.response,
    rawBody,
    print(options?: { full: boolean }) {
      const reqParams = { ...requestParams }
      if (reqParams.body) {
        try {
          reqParams.body = JSON.parse(reqParams.body)
        } catch (e) {}
      }
      if (reqParams.queries && Object.keys(reqParams.queries).length === 0) {
        delete reqParams.queries
      }
      if (reqParams.headers && Object.keys(reqParams.headers).length === 0) {
        delete reqParams.headers
      }
      const isJSON =
        ((context.response.headers['Content-Type'] || '') as string).toLowerCase().indexOf('application/json') >= 0
      console.log(
        '\x1b[36m' +
          method +
          ' ' +
          path +
          '\x1b[0m' +
          '\n\n' +
          (Object.keys(reqParams).length > 0 ? JSON.stringify(reqParams, null, 2) + '\n\n' : '') +
          '\x1b[36m' +
          'RESPONSE ' +
          context.response.statusCode +
          ' ' +
          (options?.full ? rawBody.length + ' bytes' : ''),
        '\x1b[0m\n\n' +
          (options?.full
            ? JSON.stringify(context.response.headers, null, 1).replace(/^\{\n/, '').replace(/\n\}$/, '') + '\n\n'
            : '') +
          (isJSON ? JSON.stringify(context.response.body, null, 2) : context.response.body)
      )
    }
  } as TestResponse
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

export class Request {
  #headers = {}

  constructor(options: { headers: Record<string, any> } = { headers: {} }) {
    this.#headers = options.headers
  }

  setHeaders(headers: Record<string, any> = {}) {
    this.#headers = headers
  }

  async get(requestPath: string, requestParams: RequestParams = {}) {
    let { path, queries } = parseUrl(requestPath)
    requestParams.queries = merge(queries, requestParams.queries || {})
    requestParams.headers = merge(this.#headers, requestParams.headers || {})
    return await sendRequest('GET', path, requestParams)
  }

  async post(requestPath: string, requestParams: RequestParams = {}) {
    let { path, queries } = parseUrl(requestPath)
    requestParams.queries = merge(queries, requestParams.queries || {})
    requestParams.headers = merge(this.#headers, requestParams.headers || {})
    return await sendRequest('POST', path, requestParams)
  }

  async put(requestPath: string, requestParams: RequestParams = {}) {
    let { path, queries } = parseUrl(requestPath)
    requestParams.queries = merge(queries, requestParams.queries || {})
    requestParams.headers = merge(this.#headers, requestParams.headers || {})
    return await sendRequest('PUT', path, requestParams)
  }

  async delete(requestPath: string, requestParams: RequestParams = {}) {
    let { path, queries } = parseUrl(requestPath)
    requestParams.queries = merge(queries, requestParams.queries || {})
    requestParams.headers = merge(this.#headers, requestParams.headers || {})
    return await sendRequest('DELETE', path, requestParams)
  }

  async patch(requestPath: string, requestParams: RequestParams = {}) {
    let { path, queries } = parseUrl(requestPath)
    requestParams.queries = merge(queries, requestParams.queries || {})
    requestParams.headers = merge(this.#headers, requestParams.headers || {})
    return await sendRequest('PATCH', path, requestParams)
  }

  async options(requestPath: string, requestParams: RequestParams = {}) {
    let { path, queries } = parseUrl(requestPath)
    requestParams.queries = merge(queries, requestParams.queries || {})
    requestParams.headers = merge(this.#headers, requestParams.headers || {})
    return await sendRequest('OPTIONS', path, requestParams)
  }
}

export const request = new Request()
