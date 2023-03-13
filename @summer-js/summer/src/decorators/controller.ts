import { iocContainer } from '../ioc'
import { requestMappingAssembler } from '../request-mapping'

interface ControllerDecoratorType {
  (path?: string): ClassDecorator
  (target: Object): void
}

// @ts-ignore
export const Controller: ControllerDecoratorType = (...args: any[]) => {
  if (args.length == 0) {
    args[0] = ''
  }
  if (typeof args[0] === 'string') {
    return (controllerClass: any) => {
      iocContainer.pendingIocClass(controllerClass)
      requestMappingAssembler.addControllerRoute(controllerClass.name, args[0])
      requestMappingAssembler.nextController()
    }
  } else {
    iocContainer.pendingIocClass(args[0])
    requestMappingAssembler.addControllerRoute(args[0].name, '')
    requestMappingAssembler.nextController()
  }
}
