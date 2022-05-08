import busboy from 'busboy'
import { Readable } from 'stream'
import { randomFillSync } from 'crypto'
import fs from 'fs'
import os from 'os'
import path from 'path'
import { UploadedFile } from './request-handler'

const random = (() => {
  const buf = Buffer.alloc(16)
  return () => randomFillSync(buf).toString('hex')
})()

export const parseBody = (
  req: Readable,
  method: string,
  headers
): Promise<{ bodyData: any; files: Record<string, UploadedFile> }> => {
  return new Promise((resolve, reject) => {
    if (
      method === 'POST' &&
      (headers['content-type'] === 'application/x-www-form-urlencoded' ||
        (headers['content-type'] || '').startsWith('multipart/form-data'))
    ) {
      let parseEnd = false
      const bodyData = {}
      const files = {}
      const bb = busboy({ headers })
      bb.on('file', (name, file, info) => {
        const saveTo = path.join(os.tmpdir(), `upload-${random()}`)
        const steam = file.pipe(fs.createWriteStream(saveTo))
        files[name] = { ...info, tmpPath: saveTo }
        steam.on('finish', () => {
          if (parseEnd) {
            resolve({ bodyData, files })
          }
        })
      })
      bb.on('field', (name, value) => {
        bodyData[name] = value
      })
      bb.on('close', () => {
        parseEnd = true
        if (Object.keys(files).length === 0) {
          resolve({ bodyData, files })
        }
      })
      req.pipe(bb)
    } else {
      let bodyData = ''
      req.on('data', (chunk) => {
        bodyData += chunk
      })
      req.on('end', async () => {
        resolve({ bodyData, files: {} })
      })
    }
  })
}
