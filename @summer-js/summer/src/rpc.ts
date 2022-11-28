import { validateAndConvertType } from './validate-types'
import { locContainer } from './loc'
import axios from 'axios'
import { Logger } from './logger'

interface RpcServerConfig {
  url: string
  accessKey: string
}

export const rpc = {
  rpcClass: [],
  rpcInstance: {},
  addRpcClass(clazz: any) {
    this.rpcClass.push(clazz)
    locContainer.paddingLocClass(clazz)
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
    let result
    try {
      result = (
        await axios.post(rpcConfig.url, postData, { headers: { 'summer-rpc-access-key': rpcConfig.accessKey } })
      ).data
    } catch (e) {
      if (e.response.status === 404) {
        Logger.error('RPC Fail: Remote url not found ' + rpcConfig.url)
      } else {
        Logger.error('RPC Fail', e.response.data)
      }
    }
    const allErrors = []
    result = validateAndConvertType(declareType, '', result, allErrors, '', -1, instance)
    if (allErrors.length) {
      throw new Error(JSON.stringify(allErrors))
    }
    return result
  }
}

export type RpcConfig = {
  provider?: { accessKey: string }
  client?: Record<string, RpcServerConfig>
}
