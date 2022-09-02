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
