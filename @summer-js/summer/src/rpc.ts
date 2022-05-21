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
        throw new Error('Cannot find a method named: ' + className + ' in ' + className)
      }
    } else {
      throw new Error('No prc provider named: ' + className)
    }
  },
  async rpcRequest(rpcConfig: RpcServerConfig, postData: any) {
    const result = (
      await axios.post(rpcConfig.url, postData, { headers: { 'summer-rpc-access-key': rpcConfig.accessKey } })
    ).data
    return result
  }
}

export type RpcConfig = {
  server?: { accessKey: string }
  client?: Record<string, RpcServerConfig>
}
