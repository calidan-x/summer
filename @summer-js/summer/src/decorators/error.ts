import { Logger } from '../logger'
import { errorHandle } from '../error'
import { locContainer } from '../loc'

interface ErrorHandlerType {
  (): ClassDecorator
  (target: Object): void
}

export const ErrorHandler: ErrorHandlerType = (...args) => {
  const instanceHandler = (target) => {
    if (!errorHandle.errorHandlerClass) {
      errorHandle.errorHandlerClass = target
      locContainer.paddingLocClass(target)
    } else {
      Logger.error('Duplicate ErrorHandler')
      process.exit()
    }
  }

  if (args.length == 0) {
    return (target: any) => {
      instanceHandler(target)
    }
  } else {
    instanceHandler(args[0])
    return null
  }
}

export const E = (err: any): MethodDecorator => {
  return (_target: any, method: string) => {
    errorHandle.errorMap.push({ type: err, method: method })
  }
}
