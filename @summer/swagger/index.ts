import { SummerPlugin, loadConfig, Get } from '@summer/summer';
import { getAbsoluteFSPath } from 'swagger-ui-dist';
import fs from 'fs';

interface SwaggerDoc {
  swagger: string;
  info: {
    title: string;
    description?: string;
    version?: string;
    termsOfService?: string;
    contact?: { email: string };
    license?: { name: string; url: string };
  };
  host: string;
  basePath: string;
  tags: {
    name: string;
    description: string;
    externalDocs?: { description: string; url: string };
  }[];
  schemes: ('https' | 'http' | 'ws' | 'wss')[];
  paths: Record<
    string,
    Record<
      string,
      {
        tags: string[];
        summary: string;
        description: string;
        operationId: string;
        consumes: string[];
        produces: string[];
        parameters: {
          name: string;
          in: 'path';
          description: string;
          required: true;
          type: 'string' | 'int' | 'boolean' | 'object';
          schema?: {
            type: string;
            example?: any;
            required: string[];
            properties: Record<string, { type: string; description?: string }>;
          };
        }[];
        responses: Record<string, { description: string }>;
        security?: [Record<string, string[]>];
        deprecated?: boolean;
      }
    >
  >;
  securityDefinitions?: {};
  definitions?: {};
  externalDocs?: { description: string; url: string };
}

export interface SwaggerConfig {
  info: {
    title: string;
    description?: string;
    version?: string;
    termsOfService?: string;
    contact?: { email: string };
    license?: { name: string; url: string };
  };
  host?: string;
  basePath?: string;
  swaggerDocPath: string;
}

const swaggerJson: SwaggerDoc = {
  swagger: '2.0',
  info: { title: '' },
  host: '',
  basePath: '',
  tags: [],
  schemes: ['https'],
  paths: {}
};

export default class implements SummerPlugin {
  configKey = 'SWAGGER_CONFIG';
  async init(config: SwaggerConfig) {
    Object.assign(swaggerJson, config);
    const serverConfig = loadConfig()['SERVER_CONFIG'];
    if (serverConfig) {
      if (!serverConfig.serveStatic) {
        serverConfig.serveStatic = { paths: {}, indexFiles: [] };
      } else {
        if (!serverConfig.serveStatic.paths) {
          serverConfig.serveStatic.paths = {};
        }
        if (!serverConfig.serveStatic.indexFiles) {
          serverConfig.serveStatic.indexFiles = [];
        }
      }
      serverConfig.serveStatic.paths[config.swaggerDocPath] = 'resource/swagger-ui';
    }
  }

  postCompile() {
    let swaggerUIPath = getAbsoluteFSPath();
    if (!swaggerUIPath) {
      swaggerUIPath = '../../node_modules/swagger-ui-dist';
    }
    if (!fs.existsSync('./resource')) {
      fs.mkdirSync('./resource');
    }
    if (!fs.existsSync('./resource/swagger-ui')) {
      fs.mkdirSync('./resource/swagger-ui');
    }
    const files = ['swagger-ui.css', 'swagger-ui-bundle.js', 'swagger-ui-standalone-preset.js'];
    files.forEach((f) => {
      fs.copyFileSync(swaggerUIPath + '/' + f, './resource/swagger-ui/' + f);
    });
  }
}

const allTags = [];
export const ApiGroupDoc = (name: string, description: string = '', order = 999999999) => {
  return function (target: any) {
    allTags.push({ controllerName: target.name, name, description, order });
  };
};

const allApis = [];
export const ApiDoc = (api: {
  description: string;
  request: { header: any; param: any; query: any; path: any; body: any };
  response: {
    header: any;
    stateCode: string;
    body: any;
  }[];
  order?: number;
}) => {
  api.order = api.order || 9999999;
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    allApis.push({ api, controllerName: target.name, controllerMethod: propertyKey });
  };
};
