import http = require('http')
import cookie from 'cookie'
import fs from 'fs'

import { Logger } from './logger'
import { requestHandler } from './request-handler'
import { session, SessionConfig } from './session'
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
}

export const httpServer = {
  paramsToObject(entries) {
    const result = {}
    for (const [key, value] of entries) {
      result[key] = value
    }
    return result
  },
  createServer(serverConfig: ServerConfig, sessionConfig: SessionConfig, serverStated?: () => void) {
    if (!serverConfig.port) {
      return
    }
    http
      .createServer((req, res) => {
        let bodyData = ''
        req.on('data', (chunk) => {
          bodyData += chunk
        })

        req.on('end', async () => {
          if (serverConfig.basePath) {
            if (req.url.indexOf(serverConfig.basePath) === 0) {
              req.url = req.url.replace(serverConfig.basePath, '')
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
            }
            return
          }

          const cookies = cookie?.parse(req.headers.cookie || '') || {}

          const requestCtx = {
            method: req.method as any,
            path: requestPath,
            queries: this.paramsToObject(new URLSearchParams(urlParts[1]).entries()),
            headers: req.headers as any,
            body: bodyData
          }

          const context: Context = {
            request: requestCtx,
            response: { statusCode: 200, body: '' },
            cookies: cookies
          }

          let sessionCookie = ''
          if (sessionConfig) {
            const { setCookie, sessionValues } = session.getSession(cookies[session.sessionName])
            context.sessions = sessionValues
            sessionCookie = setCookie
          }

          await requestHandler(context)

          if (sessionCookie) {
            context.response.headers['set-cookie'] = sessionCookie
          }
          res.writeHead(context.response.statusCode, context.response.headers)
          res.write(context.response.body)
          res.end()
        })
      })
      .listen(serverConfig.port, '', () => {
        Logger.log('Server running at: http://127.0.0.1:' + serverConfig.port)
        serverStated && serverStated()
      })
  }
}
