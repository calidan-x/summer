import { Context, requestHandler, waitForStart, summerDestroy } from '@summer-js/summer'
import { unzipSync } from 'node:zlib'
import { getInitContextData } from '@summer-js/summer/lib/http-server'
import queryString from 'query-string'
import merge from 'deepmerge'
import path from 'path'

const initTest = async () => {
  process.env.SUMMER_TESTING = 'true'
  await import(path.resolve('./compile/index'))
  await waitForStart()
}

const endTest = async () => {
  summerDestroy()
}

if (process.env.NODE_ENV === 'test') {
  beforeAll(async () => {
    await initTest()
  })

  afterAll(async () => {
    await endTest()
  })
}

interface RequestParams {
  headers?: Record<string, any>
}

interface FullRequestParams {
  body?: any
  queries?: Record<string, any>
  headers?: Record<string, any>
}

type TestResponse<T> = {
  statusCode: number
  headers: Record<string, string | string[]>
  body: T
  rawBody: string
  print: (options?: { full: boolean }) => void
}

const sendRequest = async <T>(method: any, path: string, requestParams: FullRequestParams) => {
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
  } as TestResponse<T>
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

  async get<T = any>(requestPath: string, queries?: Record<string, any>, params: RequestParams = {}) {
    let { path, queries: urlQueries } = parseUrl(requestPath)
    const requestParams: FullRequestParams = {}
    requestParams.queries = merge(urlQueries || {}, queries || {})
    requestParams.headers = merge(this.#headers, params.headers || {})
    return await sendRequest<T>('GET', path, requestParams)
  }

  async post<T = any>(requestPath: string, body?: any, params: RequestParams = {}) {
    let { path, queries } = parseUrl(requestPath)
    const requestParams: FullRequestParams = {}
    requestParams.queries = queries || {}
    requestParams.body = body
    requestParams.headers = merge(this.#headers, params.headers || {})
    return await sendRequest<T>('POST', path, requestParams)
  }

  async put<T = any>(requestPath: string, body?: any, params: RequestParams = {}) {
    let { path, queries } = parseUrl(requestPath)
    const requestParams: FullRequestParams = {}
    requestParams.queries = queries || {}
    requestParams.body = body
    requestParams.headers = merge(this.#headers, params.headers || {})
    return await sendRequest<T>('PUT', path, requestParams)
  }

  async patch<T = any>(requestPath: string, body?: any, params: RequestParams = {}) {
    let { path, queries } = parseUrl(requestPath)
    const requestParams: FullRequestParams = {}
    requestParams.queries = queries || {}
    requestParams.body = body
    requestParams.headers = merge(this.#headers, params.headers || {})
    return await sendRequest<T>('PATCH', path, requestParams)
  }

  async delete<T = any>(requestPath: string, queries?: Record<string, any>, params: RequestParams = {}) {
    let { path, queries: urlQueries } = parseUrl(requestPath)
    const requestParams: FullRequestParams = {}
    requestParams.queries = merge(urlQueries || {}, queries || {})
    requestParams.headers = merge(this.#headers, params.headers || {})
    return await sendRequest<T>('DELETE', path, requestParams)
  }

  async options<T = any>(requestPath: string, requestParams: FullRequestParams = {}) {
    let { path, queries } = parseUrl(requestPath)
    requestParams.queries = merge(queries || {}, requestParams.queries || {})
    requestParams.headers = merge(this.#headers, requestParams.headers || {})
    return await sendRequest<T>('OPTIONS', path, requestParams)
  }
}

export const request = new Request()
