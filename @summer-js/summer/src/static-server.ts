import http from 'http'
import fs from 'fs'
import mine = require('mime-types')
import path = require('path')

import { ServerConfig } from './http-server'

export const handleStaticRequest = (
  requestPath: string,
  req: http.IncomingMessage,
  res: http.ServerResponse,
  serverConfig: ServerConfig
) => {
  let requestHandled = false
  if (serverConfig.static) {
    for (const staticConfig of serverConfig.static) {
      let { requestPathRoot, destPathRoot, indexFiles } = staticConfig
      requestPathRoot = requestPathRoot.replace(/\/$/, '')
      let requestFile = '.' + requestPath
      const targetPath = destPathRoot
      if (!path.resolve(requestFile).startsWith(path.resolve(requestPathRoot.replace(/^\//, '')))) {
        continue
      }

      if (req.url.startsWith(requestPathRoot + '/') || req.url === requestPathRoot) {
        requestFile = requestFile.replace(requestPathRoot.replace(/^\//, ''), targetPath)
        if (targetPath.startsWith('/')) {
          requestFile = requestFile.replace('./', '')
        }

        if (fs.existsSync(requestFile) && !fs.lstatSync(requestFile).isDirectory()) {
        } else if (fs.existsSync(requestFile) && fs.lstatSync(requestFile).isDirectory()) {
          if (!requestFile.endsWith('/')) {
            res.writeHead(301, { Location: requestPath + '/', 'Cache-Control': 'no-store' })
            res.end()
            requestHandled = true
            break
          } else if (indexFiles) {
            let foundFile = false
            for (const file of indexFiles) {
              if (fs.existsSync(requestFile + file)) {
                requestFile = requestFile + file
                foundFile = true
                break
              }
            }
            if (!foundFile) {
              requestFile = ''
            }
          }
        } else {
          requestFile = ''
        }

        if (requestFile) {
          if (mine.lookup(requestFile)) {
            res.writeHead(200, { 'Content-Type': mine.lookup(requestFile), 'Cache-Control': 'max-age=2592000' })
          }
          fs.createReadStream(requestFile)
            .pipe(res)
            .on('finish', () => {
              res.end()
            })
        } else {
          res.writeHead(404)
          res.write('')
          res.end()
        }
        requestHandled = true
        break
      }
    }
  }
  return requestHandled
}
