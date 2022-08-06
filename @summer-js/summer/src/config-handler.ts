import merge from 'deepmerge'

let _envConfig = null
export const getConfig = (key?: string): Record<string, any> => {
  if (_envConfig) {
    return key ? _envConfig[key] : _envConfig
  }

  const defaultConfig = global['$$_DEFAULT_CONFIG'] || {}
  const envConfig = global['$$_ENV_CONFIG'] || {}
  const finalConfig = merge(defaultConfig, envConfig)

  _envConfig = finalConfig
  return key ? finalConfig[key] : finalConfig
}
