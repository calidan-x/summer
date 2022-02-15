import { locContainer } from '../loc';
import { controllerMethodDescriptors, requestMappingAssembler } from '../request-mapping';

export const Controller = (controllerPath: string = ''): ClassDecorator => {
  return (controllerClass: any) => {
    locContainer.paddingLocClass(controllerClass);
    requestMappingAssembler.addControllerRoute(controllerClass.name, controllerPath);
    controllerMethodDescriptors.splice(0, controllerMethodDescriptors.length);
  };
};
