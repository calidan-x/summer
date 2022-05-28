import fs from 'fs'
import path from 'path'
import zlib from 'zlib'
import { Readable } from 'stream'

import { Context, requestHandler } from './request-handler'
import { handleStaticRequest } from './static-server'
import { getConfig } from './config-handler'
import { ServerConfig } from './http-server'
import { parseBody } from './body-parser'
import { waitForStart } from './summer'

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
  await waitForStart('ServerLess')
  const serverConfig: ServerConfig = getConfig()['SERVER_CONFIG']

  const serverType = getServerType()
  if (serverType === 'AWSLambda') {
    const event = args[0]

    if (serverConfig) {
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

    let bodyData = event.body
    let files = {}
    if (event.isBase64Encoded) {
      const parseResult = await parseBody(
        Readable.from(Buffer.from(event.body as string, 'base64')),
        event.httpMethod,
        event.headers
      )
      bodyData = parseResult.bodyData
      files = parseResult.files
    }

    const context: Context = {
      request: {
        method: event.httpMethod,
        path: event.path,
        queries: event.queryStringParameters,
        headers: event.headers,
        body: bodyData,
        files
      },
      response: { statusCode: 200, headers: {}, body: '' }
    }
    await requestHandler(context)
    const setCookies = context.response.headers['set-cookie']
    if (setCookies) {
      delete context.response.headers['set-cookie']
    }
    return {
      statusCode: context.response.statusCode,
      body: context.response.body,
      headers: context.response.headers,
      multiValueHeaders: {
        'set-cookie': setCookies
      }
    }
  } else if (serverType === 'AliFC') {
    const req = args[0]
    const resp = args[1]

    if (serverConfig) {
      if (serverConfig.basePath) {
        if (req.path.indexOf(serverConfig.basePath) === 0) {
          req.path = req.path.replace(serverConfig.basePath, '')
        } else {
          resp.setStatusCode(404)
          resp.send('')
          return
        }
      }
    }

    const staticHandleResult = handleStaticRequest(req.path)
    if (staticHandleResult) {
      resp.setStatusCode(staticHandleResult.code)
      for (var key in staticHandleResult.headers) {
        resp.setHeader(key, staticHandleResult.headers[key])
      }
      resp.send(staticHandleResult.filePath ? fs.readFileSync(staticHandleResult.filePath) : '')
      return
    }

    const { bodyData, files } = await parseBody(req, req.method, req.headers)

    const context: Context = {
      request: {
        method: req.method,
        path: req.path,
        queries: req.queries,
        headers: req.headers,
        body: bodyData,
        files
      },
      response: { statusCode: 200, headers: {}, body: '' }
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
  }
}
