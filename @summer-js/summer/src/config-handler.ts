import { ServerConfig } from './http-server'
import merge from 'deepmerge'

interface SummerConfig {
  SERVER_CONFIG: ServerConfig
}

let _envConfig = null
export const getConfig = (): SummerConfig => {
  if (_envConfig) {
    return _envConfig
  }
  const defaultConfig = global['$$_DEFAULT_CONFIG'] || {}
  const envConfig = global['$$_ENV_CONFIG'] || {}
  const finalConfig = merge(defaultConfig, envConfig)

  _envConfig = finalConfig
  return finalConfig as any
}
