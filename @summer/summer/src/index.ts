import { ClassDeclaration, Decorator } from 'ts-morph';
import { Context, requestHandler } from './request-handler';
export { summerStart, summerDestroy } from './summer';
export * from './decorators';
export * from './utils';
export { requestHandler, Context } from './request-handler';
export { getLocInstance } from './loc';
export { Logger } from './logger';
export { SessionConfig } from './session';
export { ServerConfig } from './http-server';
export { loadConfig } from './config-handler';

export interface SummerPlugin {
  configKey: string;
  compile?: (classDecorator: Decorator, clazz: ClassDeclaration) => void;
  postCompile?: () => void;
  getAutoImportContent?: () => void;
  init: (config: any) => void;
  destroy?: () => void;
}
// AWS Lambda
export const handler = async (event) => {
  const context: Context = {
    request: {
      method: event.httpMethod,
      path: event.path,
      queries: event.queryStringParameters,
      headers: event.headers,
      body: event.body
    },
    response: { statusCode: 200, body: '' }
  };
  await requestHandler(context);
  return context.response;
};

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
