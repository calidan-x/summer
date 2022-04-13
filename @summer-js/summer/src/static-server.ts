import fs from 'fs'
import mine = require('mime-types')
import path = require('path')

import { getConfig } from './config-handler'
import { ServerConfig } from './http-server'

const serverConfig: ServerConfig = getConfig()['SERVER_CONFIG']

interface StaticResult {
  code: number
  headers: any
  filePath?: string
}

export const handleStaticRequest = (requestPath: string): StaticResult | null => {
  if (serverConfig.static) {
    for (const staticConfig of serverConfig.static) {
      let { requestPathRoot, destPathRoot, indexFiles } = staticConfig
      requestPathRoot = requestPathRoot.replace(/\/$/, '')
      let requestFile = '.' + requestPath
      const targetPath = destPathRoot
      if (!path.resolve(requestFile).startsWith(path.resolve(requestPathRoot.replace(/^\//, '')))) {
        continue
      }

      if (requestPath.startsWith(requestPathRoot + '/') || requestPath === requestPathRoot) {
        requestFile = requestFile.replace(requestPathRoot.replace(/^\//, ''), targetPath)
        if (targetPath.startsWith('/')) {
          requestFile = requestFile.replace('./', '')
        }

        if (fs.existsSync(requestFile) && !fs.lstatSync(requestFile).isDirectory()) {
        } else if (fs.existsSync(requestFile) && fs.lstatSync(requestFile).isDirectory()) {
          if (!requestFile.endsWith('/')) {
            return { code: 301, headers: { Location: requestPath + '/', 'Cache-Control': 'no-store' } }
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
          const mineType = mine.lookup(requestFile)
          const headers = { 'Cache-Control': 'max-age=2592000' }
          if (mineType) {
            headers['Content-Type'] = mineType
          }
          return { code: 200, headers, filePath: requestFile }
        } else {
          return { code: 404, headers: {} }
        }
      }
    }
  }
  return null
}
