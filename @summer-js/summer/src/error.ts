export class ResponseError extends Error {
  constructor(public statusCode: number, public body: any = '') {
    super()
    this.name = 'ResponseError'
  }
}

export class ValidationError extends ResponseError {
  constructor(public statusCode: number, public body: any = '') {
    super(statusCode, body)
    this.name = 'ValidationError'
  }
}
