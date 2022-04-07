import 'reflect-metadata'
import { SummerPlugin } from './index'
import { httpServer } from './http-server'
import { locContainer } from './loc'
import { session } from './session'
import { getConfig } from './config-handler'

const version = '$$SUMMER_VERSION'

interface SummerStartOptions {
  before?: (config: any) => void
  after?: (config: any) => void
}

const pluginIncs: SummerPlugin[] = []

export const summerStart = async (options?: SummerStartOptions) => {
  options = options || {}
  const config = getConfig()

  const isAWSLambda = process.env.AWS_LAMBDA_FUNCTION_VERSION !== undefined
  const isSummerTesting = process.env.SUMMER_TESTING !== undefined

  if (config['SERVER_CONFIG'] && !isAWSLambda && !isSummerTesting) {
    console.log(`
🔆SUMMER Ver ${version}    \n
===========================\n`)
    global['$$_SUMMER_ENV'] && console.log(`ENV: ${global['$$_SUMMER_ENV']}\n`)
  }

  for (const Plugin of global['$$_PLUGINS']) {
    const plugin: SummerPlugin = new Plugin()
    pluginIncs.push(plugin)
    plugin.init && (await plugin.init(config[plugin.configKey]))
  }

  options.before && (await options.before(config))

  if (config['SERVER_CONFIG'] && !isAWSLambda && !isSummerTesting) {
    if (config['SESSION_CONFIG']) {
      session.init(config['SESSION_CONFIG'])
    }

    await httpServer.createServer(config['SERVER_CONFIG'], config['SESSION_CONFIG'], () => {
      options.after && options.after(config)
    })
  }

  locContainer.resolveLoc()
}

export const summerDestroy = async () => {
  for (const plugin of pluginIncs) {
    plugin.destroy && (await plugin.destroy())
  }
}
