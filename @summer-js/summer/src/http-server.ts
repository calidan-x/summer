import http = require('http')
import fs from 'fs'

import { Logger } from './logger'
import { parseBody } from './body-parser'
import { requestHandler } from './request-handler'
import { Context } from './'
import { handleStaticRequest } from './static-server'

interface StaticConfig {
  requestPathRoot: string
  destPathRoot: string
  indexFiles?: string[]
}

export interface ServerConfig {
  port?: number
  static?: StaticConfig[]
  basePath?: string
  cors?: boolean
}

export const httpServer = {
  paramsToObject(entries) {
    const result = {}
    for (const [key, value] of entries) {
      result[key] = value
    }
    return result
  },
  async handlerRequest(req: http.IncomingMessage, res: http.ServerResponse, bodyData, serverConfig: ServerConfig) {
    if (serverConfig.basePath) {
      if (req.url.indexOf(serverConfig.basePath) === 0) {
        req.url = req.url.replace(serverConfig.basePath, '')
      } else {
        res.writeHead(404)
        res.write('404 Not Found')
        res.end()
        return
      }
    }
    const urlParts = req.url.split('?')
    const requestPath = urlParts[0].split('#')[0]

    const staticHandleResult = handleStaticRequest(requestPath)
    if (staticHandleResult) {
      res.writeHead(staticHandleResult.code, staticHandleResult.headers)
      if (staticHandleResult.filePath) {
        fs.createReadStream(staticHandleResult.filePath)
          .pipe(res)
          .on('finish', () => {
            res.end()
          })
      } else {
        res.end()
      }
      return
    }

    const context: Context = {
      request: {
        method: req.method as any,
        path: requestPath,
        queries: this.paramsToObject(new URLSearchParams(urlParts[1]).entries()),
        headers: req.headers as any,
        body: bodyData
      },
      response: { statusCode: 0, headers: {}, body: undefined },
      cookies: {},
      session: {},
      data: {}
    }

    await requestHandler(context)

    res.writeHead(context.response.statusCode, context.response.headers)
    res.write(context.response.body)
    res.end()
  },
  createServer(serverConfig: ServerConfig, serverStated?: () => void) {
    if (!serverConfig.port) {
      Logger.error('Server port not set in ServerConfig')
      return
    }
    http
      .createServer(async (req, res) => {
        const bodyData = await parseBody(req, req.method, req.headers)
        this.handlerRequest(req, res, bodyData, serverConfig)
      })
      .listen(serverConfig.port, '', () => {
        Logger.log(
          'Server running at: http://127.0.0.1:' +
            serverConfig.port +
            (serverConfig.basePath ? serverConfig.basePath + '/' : '')
        )
        serverStated && serverStated()
      })
  }
}
