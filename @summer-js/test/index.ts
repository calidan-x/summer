import { Context, requestHandler, summerStart, summerDestroy } from '@summer-js/summer'
import path from 'path'

export const initTest = async () => {
  process.env.SUMMER_TESTING = 'true'
  await import(path.resolve('./node_modules/.summer-compile/auto-imports'))
  await summerStart()
}

export const endTest = async () => {
  summerDestroy()
}

interface RequestParams {
  body?: any
  queries?: any
  headers?: any
}

const sendRequest = async (method: any, path: string, requestParams: RequestParams) => {
  const context: Context = {
    request: {
      method,
      path,
      body: requestParams.body || '',
      headers: requestParams.headers || {},
      queries: requestParams.queries || {}
    },
    response: { statusCode: 200, body: '' }
  }
  await requestHandler(context)
  return context.response
}

export const request = {
  async get(path: string, requestParams: RequestParams = {}) {
    return await sendRequest('GET', path, requestParams)
  },
  async post(path: string, requestParams: RequestParams = {}) {
    return await sendRequest('POST', path, requestParams)
  },
  async put(path: string, requestParams: RequestParams = {}) {
    return await sendRequest('PUT', path, requestParams)
  },
  async delete(path: string, requestParams: RequestParams = {}) {
    return await sendRequest('DELETE', path, requestParams)
  },
  async patch(path: string, requestParams: RequestParams = {}) {
    return await sendRequest('PATCH', path, requestParams)
  }
}
