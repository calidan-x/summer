import { pathToRegexp } from 'path-to-regexp';
import { locContainer } from './loc';

export const requestMapping = [];
export const requestMappingAssembler = {
  params: [],
  controllerRequestMapping: {},
  addParam(paramType: string, name: string, type: string, paramIndex: number) {
    this.params[paramIndex] = {
      name,
      paramType,
      type
    };
  },
  addMethodRoute(path: string, httpMethod: string, callMethod: string) {
    this.controllerRequestMapping[path] = {
      ...this.controllerRequestMapping[path],
      [httpMethod]: {
        callMethod,
        params: this.params
      }
    };
    this.params = [];
  },
  addControllerRoute(controllerName: string, controllerPath: string) {
    Object.keys(this.controllerRequestMapping).forEach((path) => {
      const keys = [];
      const fullPath = controllerPath + path;
      const regexp = pathToRegexp(fullPath, keys);
      requestMapping[fullPath] = {
        ...this.controllerRequestMapping[path],
        controllerName,
        pathRegExp: regexp,
        pathKeys: keys
      };
    });
  },
  resolveControllers() {
    for (const k in requestMapping) {
      requestMapping[k].controller = locContainer.getInstance(requestMapping[k].controllerName);
    }
  }
};
