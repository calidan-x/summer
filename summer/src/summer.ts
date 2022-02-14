import 'reflect-metadata';
import path from 'path';
import { httpServer } from './http-server';
import { mysqlDB } from './database/mysql';
import { locContainer } from './loc';
import { session } from './session';
import { Logger } from './logger';
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

// const { version } = require(fs.existsSync('../package.json') ? '../package.json' : '../../package.json');
const version = '0.1.0';

export const Summer = {
  dbConnections: [],
  isTestEnv: false,
  envConfig: {},

  // 通过用户设置的配置加载服务
  async resolveConfig() {
    const config = this.envConfig;
    if (config['MYSQL_CONFIG']) {
      const mysqlConnection = await mysqlDB.connect(config['MYSQL_CONFIG']);
      if (mysqlConnection.isConnected) {
        !this.isTestEnv && Logger.log('MySQL DB connected');
        this.dbConnections.push(mysqlConnection);
      }
    }

    if (config['SERVER_CONFIG']) {
      if (config['SESSION_CONFIG']) {
        session.init(config['SESSION_CONFIG']);
      }
      await httpServer.createServer(config['SERVER_CONFIG'], config['SESSION_CONFIG']);
    }
  },

  async start() {
    !this.isTestEnv && console.log(`\n🔆SUMMER Ver ${version}\n`);
    !this.isTestEnv && global['$$_SUMMER_ENV'] && console.log(`ENV: ${global['$$_SUMMER_ENV']}\n`);

    this.envConfig = await configHandler.loadConfig();

    await this.resolveConfig();

    locContainer.resolveLoc();
  },

  async initTest() {
    process.env.SUMMER_ENV = 'test';
    this.isTestEnv = true;
    await import(path.resolve('./.summer-compile/src/auto-imports'));
    await this.start();
  },

  async endTest() {
    while (this.dbConnections.length) {
      const connection = this.dbConnections.pop();
      await connection.close();
    }
  }
};
