import { requestMappingAssembler } from '../request-mapping';

const restfulMethodDecorator = (httpMehod: string) => (path: string = ''): MethodDecorator => {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    requestMappingAssembler.addMethodRoute(path, httpMehod, propertyKey);
  };
};

export const Get = restfulMethodDecorator('GET');
export const Post = restfulMethodDecorator('POST');
export const Put = restfulMethodDecorator('PUT');
export const Patch = restfulMethodDecorator('PATCH');
export const Delete = restfulMethodDecorator('DELETE');
