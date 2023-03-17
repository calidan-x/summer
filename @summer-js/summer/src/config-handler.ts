import merge from 'deepmerge'

let _envConfig: any = null
export const getConfig = (key?: string): Record<string, any> => {
  if (_envConfig) {
    return key ? _envConfig[key] : _envConfig
  }

  const defaultConfig = global['$$_DEFAULT_CONFIG'] || {}
  const envConfig = global['$$_ENV_CONFIG'] || {}
  const finalConfig: any = merge(defaultConfig, envConfig)

  _envConfig = finalConfig
  return key ? finalConfig[key] : finalConfig
}

// @ts-ignore
export type EnvConfig<name extends string, T = any> = T
