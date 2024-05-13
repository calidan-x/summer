import { getInjectable } from './ioc'
import { Logger } from './logger'

export class ResponseError extends Error {
  constructor(public statusCode: number, public body: any = '') {
    super()
    this.name = 'ResponseError'
  }
}

export class ValidationError extends Error {
  constructor(
    public statusCode: number,
    public body: { message: string; errors: any[] } = { message: '', errors: [] }
  ) {
    super()
    this.name = 'ValidationError'
  }
}

export class NotFoundError extends Error {
  constructor(public statusCode: number, public body: { message: string } = { message: '' }) {
    super()
    this.name = 'NotFoundError'
  }
}

export class OtherErrors extends Error {}

export const errorHandle: { errorHandlerClass?: any; errorMap: { type: any; method: string }[] } = {
  errorHandlerClass: null,
  errorMap: []
}

const unhandledError = (err) => {
  let handled = false
  if (errorHandle.errorHandlerClass) {
    const errorHandler = getInjectable(errorHandle.errorHandlerClass)
    if (errorHandler) {
      const errType = errorHandle.errorMap.find((e) => err instanceof e.type)
      if (errType) {
        errorHandler[errType.method](err)
        handled = true
      } else {
        const otherErrorsType = errorHandle.errorMap.find((e) => e.type === OtherErrors)
        if (otherErrorsType) {
          errorHandler[otherErrorsType.method](err)
          handled = true
        }
      }
    }
  }
  return handled
}

process.on('unhandledRejection', (reason) => {
  if (!(reason instanceof Error && unhandledError(reason))) {
    Logger.error('Unhandled Rejection', reason)
  }
})

process.on('uncaughtException', (err) => {
  if (!(err instanceof Error && unhandledError(err))) {
    Logger.error('Uncaught Exception', err)
  }
})
