import fs from 'fs'
import path from 'path'
import { Readable } from 'stream'

import { Context, StreamingData, requestHandler } from './request-handler'
import { handleStaticRequest } from './static-server'
import { getEnvConfig } from './config-handler'
import { getInitContextData, ServerConfig } from './http-server'
import { parseBody } from './body-parser'
import { startOptions, summerInit } from './summer'
import { getGZipData } from './utils'

export const getServerType = () => {
  let serverType: 'Normal' | 'AWSLambda' | 'AliFC' = 'Normal'
  if (process.env.AWS_LAMBDA_FUNCTION_VERSION) {
    serverType = 'AWSLambda'
  }
  return serverType
}

// Serverless

export const handler = async (...args) => {
  await summerInit(startOptions)

  const serverConfig: ServerConfig = getEnvConfig('SERVER_CONFIG')

  const serverType = getServerType()
  switch (serverType) {
    case 'AWSLambda': {
      const event = args[0]

      // support function url
      event.path = event.path || event.rawPath
      event.queryStringParameters = event.queryStringParameters || {}
      event.httpMethod = event.httpMethod || event.requestContext?.http?.method

      if (serverConfig) {
        if (serverConfig.basePath) {
          if (event.path.startsWith(serverConfig.basePath)) {
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
          if (['.css', '.js', '.txt', '.html'].includes(path.extname(staticHandleResult.filePath))) {
            resData.body = (
              await getGZipData(fs.readFileSync(staticHandleResult.filePath, { encoding: 'utf-8' }))
            ).toString('base64')
            resData.headers['Content-Encoding'] = 'gzip'
          } else {
            resData.body = fs.readFileSync(staticHandleResult.filePath, { encoding: 'base64' })
          }
        }

        return resData
      }

      let bodyData = event.body
      if (event.isBase64Encoded) {
        const parseResult = await parseBody(
          Readable.from(Buffer.from(event.body as string, 'base64')),
          event.httpMethod,
          event.headers
        )
        bodyData = parseResult.bodyData
      }

      const context: Context = {
        request: {
          method: event.httpMethod,
          path: event.path,
          pathParams: {},
          queries: event.queryStringParameters,
          headers: event.headers,
          body: bodyData
        },
        ...getInitContextData()
      }
      await requestHandler(context)
      const setCookies = context.response.headers['Set-Cookie']
      if (setCookies) {
        delete context.response.headers['Set-Cookie']
      }

      if (!(context.response.body instanceof StreamingData)) {
        return {
          statusCode: context.response.statusCode,
          body: context.response.body,
          headers: context.response.headers,
          multiValueHeaders: {
            'Set-Cookie': setCookies
          }
        }
      } else {
        const base64Body = await new Promise((resolve, rejected) => {
          let resData = ''
          context.response.body.readable.setEncoding('base64')
          context.response.body.readable.on('end', () => {
            resolve(resData)
          })
          context.response.body.readable.on('error', () => {
            rejected('')
          })
          context.response.body.readable.on('data', (d) => {
            resData += d
          })
        })

        return {
          isBase64Encoded: true,
          statusCode: context.response.statusCode,
          body: base64Body,
          headers: context.response.headers
        }
      }
    }

    // case 'AliFC': {
    //   const req = args[0]
    //   const resp = args[1]

    //   if (serverConfig) {
    //     if (serverConfig.basePath) {
    //       if (req.path.indexOf(serverConfig.basePath) === 0) {
    //         req.path = req.path.replace(serverConfig.basePath, '')
    //       } else {
    //         resp.setStatusCode(404)
    //         resp.send('')
    //         return
    //       }
    //     }
    //   }

    //   const staticHandleResult = handleStaticRequest(req.path)
    //   if (staticHandleResult) {
    //     resp.setStatusCode(staticHandleResult.code)
    //     for (var key in staticHandleResult.headers) {
    //       resp.setHeader(key, staticHandleResult.headers[key])
    //     }
    //     resp.send(staticHandleResult.filePath ? fs.readFileSync(staticHandleResult.filePath) : '')
    //     return
    //   }

    //   const bodyData = await parseBody(req.body, req.method, req.headers)

    //   const context: Context = {
    //     request: {
    //       method: req.method,
    //       path: req.path,
    //       queries: req.queries,
    //       headers: req.headers,
    //       body: bodyData
    //     },
    //     ...getInitContextData()
    //   }

    //   await requestHandler(context)

    //   for (var key in req.queries) {
    //     var value = req.queries[key]
    //     resp.setHeader(key, value)
    //   }
    //   resp.setStatusCode(context.response.statusCode)
    //   for (var key in context.response.headers) {
    //     resp.setHeader(key, context.response.headers[key])
    //   }
    //   resp.send(context.response.body)
    // }
  }

  return null
}
