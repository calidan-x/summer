import merge from 'deepmerge'

let _envConfig = null
export const getConfig = () => {
  if (_envConfig) {
    return _envConfig
  }
  const defaultConfig = global['$$_DEFAULT_CONFIG'] || {}
  const envConfig = global['$$_ENV_CONFIG'] || {}
  const finalConfig = merge(defaultConfig, envConfig)

  _envConfig = finalConfig
  return finalConfig
}
