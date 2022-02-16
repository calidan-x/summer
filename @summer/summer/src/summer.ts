import 'reflect-metadata';
import { httpServer } from './http-server';
import { locContainer } from './loc';
import { session } from './session';
import { configHandler } from './config-handler';

declare global {
  type int = bigint;
  type float = number;
}

(global as any)._PropDeclareType = (type: any) => (target: Object, propertyKey: string | symbol) => {
  // Reflect.metadata('DeclareType', type);
  Reflect.defineMetadata(propertyKey, propertyKey, target);
  Reflect.defineMetadata('DeclareType', type, target, propertyKey);
};

(global as any)._ParamDeclareType = (type: any) => (target: Object, propertyKey: string | symbol, index: number) => {
  let existingParameterTypes: number[] = Reflect.getOwnMetadata('DeclareTypes', target, propertyKey) || [];
  existingParameterTypes[index] = type;
  Reflect.defineMetadata('DeclareTypes', existingParameterTypes, target, propertyKey);
};

const version = '$$SUMMER_VERSION';

export const Summer = {
  dbConnections: [],
  isTestEnv: false,
  envConfig: {},

  // 通过用户设置的配置加载服务
  async resolveConfig() {
    const config = this.envConfig;

    for (const Plugin of global['$$_PLUGINS']) {
      const plugin = new Plugin();
      await plugin.init(config[plugin.configKey]);
    }

    if (config['SERVER_CONFIG']) {
      if (config['SESSION_CONFIG']) {
        session.init(config['SESSION_CONFIG']);
      }
      await httpServer.createServer(config['SERVER_CONFIG'], config['SESSION_CONFIG']);
    }
  },

  async start() {
    !this.isTestEnv &&
      console.log(`
===========================\n
🔆SUMMER Ver ${version}    \n
===========================\n`);
    !this.isTestEnv && global['$$_SUMMER_ENV'] && console.log(`ENV: ${global['$$_SUMMER_ENV']}\n`);

    this.envConfig = await configHandler.loadConfig();

    await this.resolveConfig();

    locContainer.resolveLoc();
  }
};
