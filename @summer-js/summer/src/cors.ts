import { getEnvConfig } from './config-handler'
import { Context } from '.'

const corsHeader = (context: Context) => ({
  'Access-Control-Allow-Origin': context.request.headers['origin'] || '*',
  'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,PATCH,OPTIONS',
  'Access-Control-Allow-Headers': context.request.headers['access-control-request-headers'] || '*',
  'Access-Control-Allow-Credentials': 'true'
})

export const handleCors = (ctx: Context) => {
  if (getEnvConfig('SERVER_CONFIG').cors) {
    if (ctx.request.method === 'OPTIONS') {
      ctx.response = {
        statusCode: 200,
        body: '',
        headers: corsHeader(ctx)
      }
      return true
    } else {
      Object.assign(ctx.response.headers, corsHeader(ctx))
    }
  }
  return false
}
