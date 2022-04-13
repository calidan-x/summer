import { Context, requestHandler } from './request-handler'

export const getServerType = () => {
  let serverType: 'Normal' | 'AWSLambda' | 'AliFC' = 'Normal'
  if (process.env.AWS_LAMBDA_FUNCTION_VERSION !== undefined) {
    serverType = 'AWSLambda'
  } else if (process.env.FC_FUNC_CODE_PATH !== undefined) {
    serverType = 'AliFC'
  }
  return serverType
}

// Serverless
export const handler = async (...args) => {
  const serverType = getServerType()
  if (serverType === 'AWSLambda') {
    const event = args[0]
    const context: Context = {
      request: {
        method: event.httpMethod,
        path: event.path,
        queries: event.queryStringParameters,
        headers: event.headers,
        body: event.body
      },
      response: { statusCode: 200, body: '' }
    }
    await requestHandler(context)
    return {
      statusCode: context.response.statusCode,
      body: context.response.body,
      headers: context.response.headers
    }
  } else if (serverType === 'AliFC') {
    const getRawBody = require('raw-body')
    const req = args[0]
    const resp = args[1]

    getRawBody(req, async (err, body) => {
      const context: Context = {
        request: {
          method: req.method,
          path: req.path,
          queries: req.queries,
          headers: req.headers,
          body
        },
        response: { statusCode: 200, body: '' }
      }

      await requestHandler(context)

      for (var key in req.queries) {
        var value = req.queries[key]
        resp.setHeader(key, value)
      }
      resp.setStatusCode(context.response.statusCode)
      for (var key in context.response.headers) {
        resp.setHeader(key, context.response.headers[key])
      }
      resp.send(context.response.body)
    })
  }
}
