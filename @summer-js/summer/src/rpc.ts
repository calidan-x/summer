import https from 'https'
import http from 'http'
import { URL } from 'url'

import { validateAndConvertType } from './validate-types'
import { iocContainer } from './ioc'
import { Logger } from './logger'

interface RpcServerConfig {
  url: string
  accessKey: string
}

const httpPost = (url: string, body, headers) => {
  const urlObject = new URL(url)
  return new Promise<{ statusCode: number; body: string }>((resolve, reject) => {
    const client = urlObject.protocol === 'https' ? https : http
    const req = client.request(
      {
        method: 'POST',
        hostname: urlObject.hostname,
        path: urlObject.pathname,
        port: urlObject.port,
        headers
      },

      (res) => {
        let chunks = ''
        res.on('data', (data) => (chunks += data))
        res.on('end', () => {
          const resBody = JSON.parse(chunks)
          resolve({ statusCode: res.statusCode!, body: resBody })
        })
      }
    )
    req.on('error', reject)
    req.write(JSON.stringify(body))
    req.end()
  })
}

export const rpc = {
  rpcClass: [],
  rpcInstance: {},
  addRpcClass(clazz: any) {
    this.rpcClass.push(clazz)
    iocContainer.pendingIocClass(clazz)
  },
  resolveRpc() {
    this.rpcClass.forEach((rc) => {
      this.addRpcInstance(new rc())
    })
  },
  addRpcInstance(instance: object) {
    const className = instance.constructor.name
    if (this.rpcInstance[className]) {
      Logger.error('Duplicate ClassName: ' + className)
      process.exit()
    }
    this.rpcInstance[className] = instance
  },
  async call(className: string, method: string, args: any[]) {
    if (this.rpcInstance[className]) {
      if (this.rpcInstance[className][method]) {
        return await this.rpcInstance[className][method](...args)
      } else {
        throw new Error(className + '.' + method + ' not exist')
      }
    } else {
      throw new Error('No PRCProvider named: ' + className)
    }
  },
  async rpcRequest(rpcConfig: RpcServerConfig, postData: any, _type, declareType, instance) {
    let responseBody = ''
    try {
      const res = await httpPost(rpcConfig.url, postData, { 'summer-rpc-access-key': rpcConfig.accessKey })
      if (res.statusCode === 404) {
        throw new Error('RPC Fail: Remote url not found ' + rpcConfig.url)
      }
      responseBody = res.body
    } catch (e) {
      Logger.error('RPC Fail:')
      throw e
    }
    const allErrors = []
    responseBody = validateAndConvertType(declareType, '', responseBody, allErrors, '', -1, instance)
    if (allErrors.length) {
      throw new Error(JSON.stringify(allErrors))
    }
    return responseBody
  }
}

export type RpcConfig = {
  provider?: { accessKey: string }
  client?: Record<string, RpcServerConfig>
}
