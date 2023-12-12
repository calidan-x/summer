import merge from 'deepmerge'

let _envConfig: any = null

export const getEnvConfig = (key?: string): any => {
  if (_envConfig) {
    return key ? _envConfig[key] : _envConfig
  }

  const defaultConfig = global['$$_DEFAULT_CONFIG'] || {}
  const envConfig = global['$$_ENV_CONFIG'] || {}
  const finalConfig: any = merge(defaultConfig, envConfig)

  _envConfig = finalConfig
  return key ? finalConfig[key] : finalConfig
}

/**
 * @deprecated Please use getEnvConfig() instead
 */
export const getConfig = getEnvConfig

// @ts-ignore
export type EnvConfig<name extends string, T = any> = T
