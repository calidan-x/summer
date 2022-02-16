export { ServerConfig } from './http-server';
export { SessionConfig } from './session';

export const configHandler = {
  async loadConfig() {
    const defaultConfig = global['$$_DEFAULT_CONFIG'] || {};
    const envConfig = global['$$_ENV_CONFIG'] || {};

    const finalConfig = defaultConfig;
    Object.keys(envConfig).forEach((key) => {
      if (finalConfig[key]) {
        finalConfig[key] = { ...finalConfig[key], ...envConfig[key] };
      } else {
        finalConfig[key] = envConfig[key];
      }
    });

    return finalConfig;
  }
};
