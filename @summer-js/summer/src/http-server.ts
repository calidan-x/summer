import http, { Server } from 'http'
import cluster from 'node:cluster'
import os from 'node:os'
import fs from 'fs'

import { Logger } from './logger'
import { parseBody } from './body-parser'
import { StreamingData, requestHandler } from './request-handler'
import { Context } from './'
import { handleStaticRequest } from './static-server'

interface StaticConfig {
  requestPath: string
  destPath: string
  indexFiles?: string[]
  spa?: boolean
}

export interface ServerConfig {
  port?: number
  static?: StaticConfig[]
  basePath?: string
  cors?: boolean
  clusterMode?: boolean
  workersNumber?: number
  compression?: {
    enable: boolean
    threshold?: number
  }
}

export const getInitContextData = () => ({
  response: {
    statusCode: 0,
    headers: new Proxy(
      {},
      {
        set(obj, key: string, value: string) {
          const foundKey = Object.keys(obj).find((k) => k.toLowerCase() === key.toLowerCase())
          obj[foundKey || key] = value
          return true
        },
        get(obj, key: string) {
          const foundKey = Object.keys(obj).find((k) => k.toLowerCase() === key.toLowerCase())
          return obj[foundKey || Symbol()]
        }
      }
    ),
    body: undefined
  },
  cookies: {},
  session: {},
  data: {}
})

export const httpServer = {
  server: undefined as unknown as Server,
  paramsToObject(entries) {
    const result = {}
    for (const [key, value] of entries) {
      result[key] = value
    }
    return result
  },
  async handlerRequest(req: http.IncomingMessage, res: http.ServerResponse, bodyData, serverConfig: ServerConfig) {
    if (serverConfig.basePath) {
      if (req.url!.startsWith(serverConfig.basePath)) {
        req.url = req.url!.replace(serverConfig.basePath, '')
      } else {
        res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' })
        res.write('')
        res.end()
        return
      }
    }
    const urlParts = req.url!.split('?')
    const requestPath = urlParts[0].split('#')[0]

    const staticHandleResult = handleStaticRequest(requestPath)
    if (staticHandleResult) {
      res.writeHead(staticHandleResult.code, staticHandleResult.headers)
      if (staticHandleResult.filePath) {
        fs.createReadStream(staticHandleResult.filePath)
          .pipe(res)
          .on('end', () => {
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
        pathParams: {},
        queries: this.paramsToObject(new URLSearchParams(urlParts[1]).entries()),
        headers: req.rawHeaders as any,
        body: bodyData
      },
      ...getInitContextData()
    }

    ;(req as any).$SummerContext = context
    ;(res as any).$SummerContext = context

    await requestHandler(context, req.headers as any)

    res.writeHead(context.response.statusCode, context.response.headers)
    if (!(context.response.body instanceof StreamingData)) {
      res.write(context.response.body)
      res.end()
    } else {
      context.response.body.readable.pipe(res).on('end', () => {
        res.end()
      })
    }
  },

  createServer(serverConfig: ServerConfig) {
    if (!serverConfig.port) {
      Logger.error('Server port not set in ServerConfig')
      return
    }

    if (cluster.isPrimary && serverConfig.clusterMode) {
      const workersNumber = serverConfig.workersNumber || os.cpus().length
      for (let i = 0; i < workersNumber; i++) {
        cluster.fork()
      }

      cluster.on('exit', (_worker, _code, _signal) => {
        cluster.fork()
      })

      Logger.info(
        `Cluster Server (${workersNumber} workers) running at: http://127.0.0.1:` +
          serverConfig.port +
          (serverConfig.basePath ? serverConfig.basePath + '/' : '')
      )
    } else {
      this.server = http
        .createServer(async (req, res) => {
          const bodyData = await parseBody(req, req.method!, req.headers)
          this.handlerRequest(req, res, bodyData, serverConfig)
        })
        .on('error', (msg) => {
          Logger.error(msg)
        })
    }
  },

  startServer(serverConfig: ServerConfig, serverStated?: () => void) {
    this.server.listen(serverConfig.port, '', () => {
      if (cluster.isPrimary) {
        Logger.info(
          'Server running at: http://127.0.0.1:' +
            serverConfig.port +
            (serverConfig.basePath ? serverConfig.basePath + '/' : '')
        )
      }
      serverStated && serverStated()
    })
  }
}
