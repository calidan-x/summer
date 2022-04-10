import { locContainer } from '../loc'
import { requestMappingAssembler } from '../request-mapping'

interface ControllerDecoratorType {
  (path?: string): ClassDecorator
  (target: Object): void
}

export const Controller: ControllerDecoratorType = (...args) => {
  if (args.length == 0) {
    args[0] = ''
  }
  if (typeof args[0] === 'string') {
    return (controllerClass: any) => {
      locContainer.paddingLocClass(controllerClass)
      requestMappingAssembler.addControllerRoute(controllerClass.name, args[0])
      requestMappingAssembler.nextController()
    }
  } else {
    locContainer.paddingLocClass(args[0])
    requestMappingAssembler.addControllerRoute(args[0].name, '')
    requestMappingAssembler.nextController()
  }
}
