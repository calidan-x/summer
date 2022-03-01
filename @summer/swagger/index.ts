import { SummerPlugin, loadConfig, Controller, Get, Query } from '@summer/summer';
import { requestMapping } from '@summer/summer/lib/request-mapping';
import { getAbsoluteFSPath } from 'swagger-ui-dist';
import fs from 'fs';

interface Schema {
  type: string;
  example?: any;
  required?: string[];
  properties: Record<string, { type: string; description?: string }>;
}

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
        description?: string;
        operationId?: string;
        consumes?: string[];
        produces?: string[];
        parameters?: {
          name: string;
          in: 'path';
          description: string;
          required: true;
          type: 'string' | 'integer' | 'boolean' | 'object';
          schema?: Schema;
        }[];
        responses?: Record<string, { description?: string; schema?: Schema }>;
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
  schemes: ['http'],
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

  getAutoImportContent() {
    return 'import { SummerSwaggerUIController } from "@summer/swagger";\nSummerSwaggerUIController;\n';
  }

  async postCompile() {
    let swaggerUIPath = getAbsoluteFSPath();
    if (!fs.existsSync(swaggerUIPath)) {
      swaggerUIPath = '../../node_modules/swagger-ui-dist';
    }

    let swaggerPluginPath = './node_modules/@summer/swagger';
    if (!fs.existsSync(swaggerPluginPath)) {
      swaggerPluginPath = '../../node_modules/@summer/swagger';
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
    fs.copyFileSync(swaggerPluginPath + '/index.html', './resource/swagger-ui/index.html');
  }
}

const allTags = [];
export const ApiGroupDoc = (name: string, description: string = '', order = 999999999) => {
  return function (target: any) {
    allTags.push({ controllerName: target.name, name, description, order });
  };
};

interface ControllerApiDoc {
  summery: string;
  description?: string;
  requestBody?: any;
  response?: any;
  errorResponses?: Record<string | number, any>;
  order?: number;
}

const allApis: (ControllerApiDoc & { controllerName: string; callMethod: string })[] = [];
export const ApiDoc = (api: ControllerApiDoc) => {
  api.order = api.order || 9999999;
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    allApis.push({ ...api, controllerName: target.constructor.name, callMethod: propertyKey });
  };
};

const findRoute = (controllerName: string, callMethod: string) => {
  for (const path in requestMapping) {
    for (const requestMethod in requestMapping[path]) {
      const route = requestMapping[path][requestMethod];
      if (route.controllerName === controllerName && route.callMethod === callMethod) {
        return { path, requestMethod, params: route.params };
      }
    }
  }
  return null;
};

const findTag = (controllerName: string) => {
  const tag = allTags.find((tag) => tag.controllerName === controllerName);
  if (tag) {
    return tag.name;
  }
  return '';
};

const parmMatchPattern = {
  '(ctx, paramName, name) => ctx.request.queries[name || paramName]': 'query',
  '(ctx, paramName, name) => ctx.request.pathParams[name || paramName]': 'path',
  '(ctx, paramName, name) => ctx.request.headers[name || paramName]': 'header',
  '(ctx) => ctx.request.body': 'body'
};

const getType = (type: any) => {
  if (!type) {
    return '';
  }
  const basicTypes = ['int', 'bigint', 'number', 'string', 'boolean'];
  if (basicTypes.includes(type.name.toLowerCase())) {
    return intToInteger(type.name.toLowerCase());
  }
  return 'object';
};

const intToInteger = (type: string) => {
  if (type === 'int' || type === 'bigint') {
    return 'integer';
  }
  return type;
};

const getParamType = (func) => {
  for (const p in parmMatchPattern) {
    if (func.toString().indexOf(p) >= 0) {
      return parmMatchPattern[p];
    }
  }
  return null;
};

const getRequestTypeDesc = (t: any) => {
  if (getType(t) !== 'object') {
    return { type: getType(t), description: '' };
  }

  const typeInc = new t();
  const typeDesc = {};
  for (const key of Reflect.getOwnMetadataKeys(t.prototype)) {
    const declareType = Reflect.getMetadata('DeclareType', typeInc, key);
    const designType = Reflect.getMetadata('design:type', typeInc, key);
    if (designType.name.toLowerCase() === 'object') {
      typeDesc[key] = {
        type: 'object',
        description: '',
        properties: getRequestTypeDesc(declareType)
      };
    } else if (designType.name.toLowerCase() === 'array') {
      typeDesc[key] = {
        type: 'array',
        description: '',
        items: getRequestTypeDesc(declareType)
      };
    } else {
      typeDesc[key] = {
        type: intToInteger(declareType.name.toLowerCase()),
        description: ''
      };
    }
  }
  return typeDesc;
};

let outSwaggerJson = null;

@Controller()
export class SummerSwaggerUIController {
  @Get('/swagger-docs.json')
  getSwaggerDocument() {
    if (outSwaggerJson) {
      return outSwaggerJson;
    }
    allTags.forEach((tag) => {
      swaggerJson.tags.push({ name: tag.name, description: tag.description });
    });
    allApis.forEach((api) => {
      const roteInfo = findRoute(api.controllerName, api.callMethod);
      if (roteInfo) {
        const { path, requestMethod, params } = roteInfo;
        let docPath = (path || '/').replace(/\/{2,}/g, '/');
        docPath = docPath.replace(/:([^/]+)/g, '{$1}');
        if (!swaggerJson.paths[docPath]) {
          swaggerJson.paths[docPath] = {};
        }
        const parameters = [];
        params.forEach((param) => {
          const paramType = getParamType(param.paramMethod.toString());
          if (paramType) {
            const ptype = getType(param.declareType);
            parameters.push({
              name: param.paramValues[0],
              in: paramType,
              description: '',
              // required: true,
              type: ptype,
              schema:
                ptype === 'object'
                  ? {
                      type: 'object',
                      example: api.requestBody,
                      required: [],
                      properties: getRequestTypeDesc(param.declareType)
                    }
                  : null
            });
          }
        });

        const errorResponse = {};
        for (const key in api.errorResponses) {
          const resExample = api.errorResponses[key] || '';
          errorResponse[key] = {
            description: '',
            schema: { type: typeof resExample === 'object' ? 'object' : 'string', properties: {}, example: resExample }
          };
        }

        const successResExample = api.response || '';

        swaggerJson.paths[docPath][requestMethod.toLowerCase()] = {
          tags: [findTag(api.controllerName)],
          summary: api.summery,
          description: api.description,
          operationId: api.callMethod,
          // consumes: ['application/json'],
          // produces: ['application/json'],
          parameters,
          responses: {
            200: {
              description: '',
              schema: {
                type: typeof successResExample === 'object' ? 'object' : 'string',
                properties: {},
                example: successResExample
              }
            },
            ...errorResponse
          }
        };
      }
    });
    outSwaggerJson = swaggerJson;
    return swaggerJson;
  }
}
