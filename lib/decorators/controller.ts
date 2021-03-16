import { locContainer } from '../loc';
import { requestMappingAssembler } from '../request-mapping';

export const Controller = (controllerPath: string = ''): ClassDecorator => {
  return (controllerClass: any) => {
    locContainer.paddingLocClass(controllerClass);
    requestMappingAssembler.addControllerRoute(controllerClass.name, controllerPath);
  };
};
