import 'reflect-metadata'
import cluster from 'node:cluster'
import { getServerType } from './serverless'
import { SummerPlugin } from './index'
import { httpServer } from './http-server'
import { locContainer } from './loc'
import { rpc } from './rpc'
import { session } from './session'
import { getConfig } from './config-handler'
import { Logger } from './logger'

const printSummerInfo = () => {
  const isSummerTesting = process.env.SUMMER_TESTING !== undefined
  if (!isSummerTesting) {
    console.log(`
🔆SUMMER Ver ${process.env.SUMMER_VERSION}    \n
===========================\n`)
    process.env.SUMMER_ENV && console.log(`ENV: ${process.env.SUMMER_ENV}\n`)
  }
}

interface SummerStartOptions {
  before?: (config: any) => void
  after?: (config: any) => void
}

export let startOptions: SummerStartOptions
const pluginIncs: SummerPlugin[] = []
const plugins: any[] = []
export const addPlugin = (plugin: any) => {
  plugins.push(plugin)
}

export const pluginCollection = {}
;(global as any).ClassCollect = (collectionName: string) => {
  return (target: any) => {
    if (!pluginCollection[collectionName]) {
      pluginCollection[collectionName] = []
    }
    pluginCollection[collectionName].push(target)
  }
}

const startLocks = {}
export const waitForStart = async (key: string) => {
  if (startLocks['done']) {
    return
  }
  return new Promise((resolve) => {
    if (!startLocks[key]) {
      startLocks[key] = resolve
    } else {
      resolve('')
    }
  })
}
export const summerStart = async (options?: SummerStartOptions) => {
  options = options || {}
  const config = getConfig()

  const isNormalServer = getServerType() === 'Normal'
  const isSummerTesting = process.env.SUMMER_TESTING !== undefined

  if (cluster.isPrimary && !isSummerTesting) {
    printSummerInfo()
  }

  for (const Plugin of plugins) {
    const plugin: SummerPlugin = new Plugin()
    pluginIncs.push(plugin)
    if (plugin.init) {
      await plugin.init(config[plugin.configKey])
    }
  }

  options.before && (await options.before(config))
  if (config['SERVER_CONFIG'] && isNormalServer && !isSummerTesting) {
    if (config['SESSION_CONFIG']) {
      session.init(config['SESSION_CONFIG'])
    }
    await httpServer.createServer(config['SERVER_CONFIG'], async () => {
      await locContainer.resolveLoc()
      rpc.resolveRpc()
      options.after && options.after(config)
    })
  } else {
    await locContainer.resolveLoc()
    rpc.resolveRpc()
    options.after && options.after(config)
    for (const k in startLocks) {
      startLocks[k]('')
    }
    startLocks['done'] = true
  }
}

export const summerDestroy = async () => {
  for (const plugin of pluginIncs) {
    plugin.destroy && (await plugin.destroy())
  }
}

process.on('unhandledRejection', function onError(err) {
  Logger.error('Unhandled Rejection', err)
})
