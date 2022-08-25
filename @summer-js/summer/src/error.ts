export class ResponseError extends Error {
  constructor(public statusCode: number, public body: any = '') {
    super()
    this.name = 'ResponseError'
  }
}

export class ValidationError extends ResponseError {
  body: { message: string; errors: any[] }
  name = 'ValidationError'
}

export class NotFoundError extends ResponseError {
  body: { message: string }
  name = 'NotFoundError'
}
