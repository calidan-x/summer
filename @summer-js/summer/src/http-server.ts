import http from 'http'
import cluster from 'node:cluster'
import os from 'node:os'
import fs from 'fs'

import { Logger } from './logger'
import { parseBody } from './body-parser'
import { requestHandler } from './request-handler'
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

const headerKeyMappingCache = {}
export const getInitContextData = () => ({
  response: {
    statusCode: 0,
    headers: new Proxy(
      {},
      {
        set(obj, prop: string, value) {
          if (!headerKeyMappingCache[prop]) {
            headerKeyMappingCache[prop] = prop.toLowerCase().replace(/^.|(-[a-zA-Z])/g, (str) => {
              return str.toUpperCase()
            })
          }
          prop = headerKeyMappingCache[prop]
          obj[prop] = value
          return true
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
        pathParams: {},
        queries: this.paramsToObject(new URLSearchParams(urlParts[1]).entries()),
        headers: req.headers as any,
        body: bodyData
      },
      ...getInitContextData()
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
      http
        .createServer(async (req, res) => {
          const bodyData = await parseBody(req, req.method!, req.headers)
          this.handlerRequest(req, res, bodyData, serverConfig)
        })
        .listen(serverConfig.port, '', () => {
          if (cluster.isPrimary) {
            Logger.info(
              'Server running at: http://127.0.0.1:' +
                serverConfig.port +
                (serverConfig.basePath ? serverConfig.basePath + '/' : '')
            )
          }
          serverStated && serverStated()
        })
        .on('error', (msg) => {
          Logger.error(msg)
        })
    }
  }
}
