import { Context, requestHandler } from './request-handler'
import { handleStaticRequest } from './static-server'
import fs from 'fs'

import { getConfig } from './config-handler'
import { ServerConfig } from './http-server'

const serverConfig: ServerConfig = getConfig()['SERVER_CONFIG']

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

    if (serverConfig.basePath) {
      if (event.path.indexOf(serverConfig.basePath) === 0) {
        event.path = event.path.replace(serverConfig.basePath, '')
      }
    }

    const staticHandleResult = handleStaticRequest(event.path)
    if (staticHandleResult) {
      const contents = fs.readFileSync(staticHandleResult.filePath, { encoding: 'base64' })
      return {
        isBase64Encoded: true,
        statusCode: staticHandleResult.code,
        body: contents,
        headers: staticHandleResult.headers
      }
    }

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

    if (serverConfig.basePath) {
      if (req.path.indexOf(serverConfig.basePath) === 0) {
        req.path = req.path.replace(serverConfig.basePath, '')
      }
    }

    getRawBody(req, async (err, body) => {
      const staticHandleResult = handleStaticRequest(req.path)
      if (staticHandleResult) {
        resp.setStatusCode(staticHandleResult.code)
        for (var key in staticHandleResult.headers) {
          resp.setHeader(key, staticHandleResult.headers[key])
        }
        resp.send(fs.readFileSync(req.path))
        return
      }

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
