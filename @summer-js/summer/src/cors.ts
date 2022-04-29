import { requestMapping } from './request-mapping'
import { getConfig } from './config-handler'
import { Context } from '.'

const corsHeader = (origin: string) => ({
  'Access-Control-Allow-Origin': origin || '*',
  'Access-Control-Allow-Methods': '*',
  'Access-Control-Allow-Headers': '*',
  'Access-Control-Allow-Credentials': 'true'
})

const hasPath = (path) => {
  if (requestMapping[path]) {
    return true
  } else {
    const paths = Object.keys(requestMapping)
    for (let i = 0; i < paths.length; i++) {
      const routeData = requestMapping[paths[i]]
      if (routeData.pathRegExp.test(path)) {
        return true
      }
    }
  }
  return false
}

export const handleCors = (ctx: Context) => {
  if (getConfig().SERVER_CONFIG.cors && ctx.request.method === 'OPTIONS') {
    if (hasPath(ctx.request.path)) {
      ctx.response = {
        statusCode: 200,
        body: '',
        headers: corsHeader(ctx.request.headers['HTTP_ORIGIN'])
      }
      return true
    }
  }
  return false
}
