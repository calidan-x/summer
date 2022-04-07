export { ServerConfig } from './http-server'
export { SessionConfig } from './session'

let _envConfig = null
export const getConfig = () => {
  if (_envConfig) {
    return _envConfig
  }
  const defaultConfig = global['$$_DEFAULT_CONFIG'] || {}
  const envConfig = global['$$_ENV_CONFIG'] || {}

  const finalConfig = defaultConfig
  Object.keys(envConfig).forEach((key) => {
    if (finalConfig[key]) {
      finalConfig[key] = { ...finalConfig[key], ...envConfig[key] }
    } else {
      finalConfig[key] = envConfig[key]
    }
  })

  _envConfig = finalConfig
  return finalConfig
}
