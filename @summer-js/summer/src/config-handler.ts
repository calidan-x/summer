import merge from 'deepmerge'

let _envConfig: any = null

export const getEnvConfig = <T = any>(key?: string): T => {
  if (_envConfig) {
    return key ? _envConfig[key] : _envConfig
  }

  const defaultConfig = global['$$_DEFAULT_CONFIG'] || {}
  const envConfig = global['$$_ENV_CONFIG'] || {}
  const finalConfig: any = merge(defaultConfig, envConfig)

  _envConfig = finalConfig
  return key ? finalConfig[key] : finalConfig
}

const loopKeyValue = (config: any, updateFunc: (value: any) => any) => {
  if (Array.isArray(config)) {
    config.forEach((cfg) => {
      loopKeyValue(cfg, updateFunc)
    })
  } else if (typeof config === 'object') {
    Object.entries(config).forEach(([key, value]) => {
      if (typeof value === 'function') {
      } else if (typeof value !== 'object') {
        config[key] = updateFunc(value)
      } else {
        loopKeyValue(value, updateFunc)
      }
    })
  }
}

export const replaceEnvConfigValue = (updateFunc: (value: any) => any) => {
  loopKeyValue(_envConfig, updateFunc)
}

/**
 * @deprecated Please use getEnvConfig() instead
 */
export const getConfig = getEnvConfig

// @ts-ignore
export type EnvConfig<name extends string, T = any> = T
