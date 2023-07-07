import { Logger, SummerPlugin, addPlugin, getInjectable, getEnvConfig } from '@summer-js/summer'
import { httpServer } from '@summer-js/summer/lib/http-server'
import { addInjectable, IocContainer } from '@summer-js/summer/lib/ioc'
import { validateAndConvertType, ValidateError } from '@summer-js/summer/lib/validate-types'
import { Server, ServerOptions } from 'socket.io'

interface ControllerDecoratorType {
  (): ClassDecorator
  (target: any): void
}

interface MethodDecoratorType {
  (name?: string): MethodDecorator
  (target: any, methodName: string): void
}

let socketIO: Server
class SocketIOPlugin extends SummerPlugin {
  configKey = 'SOCKET_IO_CONFIG'

  async init(config) {
    if (config) {
      const serverConfig = getEnvConfig('SERVER_CONFIG')
      const basePath = serverConfig.basePath
      config.path = config.path || '/socket.io/'
      if (basePath) {
        config.path = basePath + config.path
      }

      if (httpServer.server) {
        if (!socketIO) {
          socketIO = new Server(httpServer.server, config)
        }
      } else {
        socketIO = new Server(config)
      }

      addInjectable(IO, () => socketIO)
      if (SUMMER_ENV !== 'test') {
        Logger.info('Socket.io initialized path: http://127.0.0.1:' + serverConfig.port + config.path)
      }
    }
  }
  async postInit(config) {
    if (config) {
      for (const controllerClass of socketIOControllers) {
        const controller = getInjectable(controllerClass) as any
        for (const method in controllerClass._$Events) {
          if (typeof controller[method] === 'function' && method !== 'constructor') {
            if (method === 'connection') {
              socketIO.on(controllerClass._$Events[method], (socket) => {
                controller[method](socket)
              })
            }
          }
        }
        socketIO.on('connection', (socket) => {
          for (const method in controllerClass._$Events) {
            if (typeof controller[method] === 'function' && method !== 'constructor') {
              socket.on(controllerClass._$Events[method], async (data) => {
                const declareTypes = Reflect.getMetadata('DeclareTypes', controller, method)
                let dataDType = declareTypes[1]
                const errors: ValidateError[] = []
                let d = data
                if (dataDType) {
                  d = validateAndConvertType(dataDType, '', data, errors, method, 1, controller)
                }
                if (errors.length === 0) {
                  controller[method](socket, d)
                } else {
                  socket.emit('error', { errors: errors })
                }
              })
            }
          }
        })
      }
    }
  }
}

addPlugin(SocketIOPlugin)
export default SocketIOPlugin

export type SocketIOConfig = Partial<ServerOptions>

const socketIOControllers: any[] = []

export class IO extends Server {}

// @ts-ignore
export const SocketIOController: ControllerDecoratorType = (...args: any[]) => {
  if (args.length === 0) {
    return (clazz: any) => {
      IocContainer.pendingIocClass(clazz)
      socketIOControllers.push(clazz)
    }
  } else {
    IocContainer.pendingIocClass(args[0])
    socketIOControllers.push(args[0])
  }
}

// @ts-ignore
export const On: MethodDecoratorType = (...args: any[]) => {
  if (args.length <= 1) {
    return (clazz: any, methodName: string) => {
      clazz = clazz.constructor
      if (!clazz._$Events) {
        clazz._$Events = {}
      }
      clazz._$Events[methodName] = args[0] || methodName
    }
  } else {
    const clazz = args[0].constructor
    if (!clazz._$Events) {
      clazz._$Events = {}
    }
    clazz._$Events[args[1]] = args[1]
  }
}
