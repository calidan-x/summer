import { Context, requestHandler } from './request-handler'
import { handleStaticRequest } from './static-server'
import fs from 'fs'
import path from 'path'
import zlib from 'zlib'

import { getConfig } from './config-handler'
import { ServerConfig } from './http-server'

export const getServerType = () => {
  let serverType: 'Normal' | 'AWSLambda' | 'AliFC' = 'Normal'
  if (process.env.AWS_LAMBDA_FUNCTION_VERSION !== undefined) {
    serverType = 'AWSLambda'
  } else if (process.env.FC_FUNC_CODE_PATH !== undefined) {
    serverType = 'AliFC'
  }
  return serverType
}

const getGZipData = async (data: string): Promise<string> => {
  return new Promise((resolve, rejected) => {
    zlib.gzip(data, function (error, gzippedResponse) {
      if (error) {
        rejected(error)
      } else {
        resolve(gzippedResponse.toString('base64'))
      }
    })
  })
}

// Serverless
export const handler = async (...args) => {
  const serverConfig: ServerConfig = getConfig()['SERVER_CONFIG']

  const serverType = getServerType()
  if (serverType === 'AWSLambda') {
    const event = args[0]

    if (serverConfig.basePath) {
      if (event.path.indexOf(serverConfig.basePath) === 0) {
        event.path = event.path.replace(serverConfig.basePath, '')
      } else {
        return {
          statusCode: 404,
          body: ''
        }
      }
    }

    const staticHandleResult = handleStaticRequest(event.path)
    if (staticHandleResult) {
      const resData = {
        isBase64Encoded: true,
        statusCode: staticHandleResult.code,
        body: '',
        headers: staticHandleResult.headers
      }

      if (staticHandleResult.filePath) {
        if (['.css', '.js', '.txt'].includes(path.extname(staticHandleResult.filePath))) {
          resData.body = await getGZipData(fs.readFileSync(staticHandleResult.filePath, { encoding: 'utf-8' }))
          resData.headers['Content-Encoding'] = 'gzip'
        } else {
          resData.body = fs.readFileSync(staticHandleResult.filePath, { encoding: 'base64' })
        }
      }

      return resData
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
      } else {
        resp.setStatusCode(404)
        resp.send('')
        return
      }
    }

    getRawBody(req, async (err, body) => {
      const staticHandleResult = handleStaticRequest(req.path)
      if (staticHandleResult) {
        resp.setStatusCode(staticHandleResult.code)
        for (var key in staticHandleResult.headers) {
          resp.setHeader(key, staticHandleResult.headers[key])
        }
        resp.send(staticHandleResult.filePath ? fs.readFileSync(staticHandleResult.filePath) : '')
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