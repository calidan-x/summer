import { OtherErrors, E, Logger, NotFoundError, ValidationError } from '@summer-js/summer'

// @ErrorHandler
export class HandleError {
  @E(NotFoundError)
  notFound() {
    return { statusCode: 404, body: 'Page Not Found ~' }
  }

  @E(ValidationError)
  validateFail(err: ValidationError) {
    return { statusCode: 404, body: err.body.errors }
  }

  @E(OtherErrors)
  default(err) {
    Logger.error(err)
    return { statusCode: 500, body: 'Some Error Happen' }
  }
}
