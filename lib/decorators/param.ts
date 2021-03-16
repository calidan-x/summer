import { requestMappingAssembler } from '../request-mapping';

const getArgName = (func, argIndex: number) => {
  var args = func.toString().match(/.*?\(([^)]*)\)/)[1];
  return args
    .split(',')
    .map(function (arg) {
      return arg.replace(/\/\*.*\*\//, '').trim();
    })
    .filter(function (arg) {
      return arg;
    })[argIndex];
};

const getArgType = (target: Object, propertyKey: string, parameterIndex: number) => {
  const types = Reflect.getMetadata('design:paramtypes', target, propertyKey);
  return types.map((a) => a)[parameterIndex];
};

const generateParamDecorator = (paramType: string, name: string = '') => {
  return (target: Object, propertyKey: string, parameterIndex: number) => {
    const type = getArgType(target, propertyKey, parameterIndex);
    const paramName = name || getArgName(target[propertyKey], parameterIndex);
    requestMappingAssembler.addParam(paramType, paramName, type, parameterIndex);
  };
};

export const QueryParamFrom = (name: string = ''): ParameterDecorator => {
  return generateParamDecorator('QueryParam', name);
};

export const PathParamFrom = (name: string = ''): ParameterDecorator => {
  return generateParamDecorator('PathParam', name);
};

export const RequestBodyFrom = (name: string = ''): ParameterDecorator => {
  return generateParamDecorator('RequestBody', name);
};

export const QueryParam = generateParamDecorator('QueryParam');

export const PathParam = generateParamDecorator('PathParam');

export const RequestBody = generateParamDecorator('RequestBody');
