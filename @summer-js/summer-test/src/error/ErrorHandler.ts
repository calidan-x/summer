import { AnyError, E, ErrorHandler, getContext, Logger, NotFoundError, ValidationError } from '@summer-js/summer'

@ErrorHandler
export class HandleError {
  @E(NotFoundError)
  notFound() {
    return { statusCode: 404, body: 'Page Not Found ~' }
  }

  @E(ValidationError)
  validateFail(err: ValidationError) {
    return { statusCode: 404, body: err.body.errors }
  }

  @E(AnyError)
  default(err) {
    Logger.error(err)
    return { statusCode: 500, body: 'Some Error Happen' }
  }
}
