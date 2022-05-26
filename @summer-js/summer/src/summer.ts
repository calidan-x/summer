import 'reflect-metadata'
import { getServerType } from './serverless'
import { SummerPlugin } from './index'
import { httpServer } from './http-server'
import { locContainer } from './loc'
import { rpc } from './rpc'
import { session } from './session'
import { getConfig } from './config-handler'

const version = '$$SUMMER_VERSION'

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

export const summerStart = async (options?: SummerStartOptions) => {
  startOptions = options || {}
  if (getServerType() === 'Normal') {
    await start()
  }
}

export const start = async () => {
  const options = startOptions
  const config = getConfig()

  const isNormalServer = getServerType() === 'Normal'
  const isSummerTesting = process.env.SUMMER_TESTING !== undefined

  if (config['SERVER_CONFIG'] && isNormalServer && !isSummerTesting) {
    console.log(`
🔆SUMMER Ver ${version}    \n
===========================\n`)
    process.env.SUMMER_ENV && console.log(`ENV: ${process.env.SUMMER_ENV}\n`)
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
    await httpServer.createServer(config['SERVER_CONFIG'], () => {
      locContainer.resolveLoc()
      rpc.resolveRpc()
      options.after && options.after(config)
    })
  } else {
    locContainer.resolveLoc()
    rpc.resolveRpc()
    options.after && options.after(config)
  }
}

export const summerDestroy = async () => {
  for (const plugin of pluginIncs) {
    plugin.destroy && (await plugin.destroy())
  }
}
