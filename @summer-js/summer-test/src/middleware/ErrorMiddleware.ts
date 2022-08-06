import { Middleware, Context, ValidationError } from '@summer-js/summer'

@Middleware({
  order: 0
})
export class ErrorMiddleware {
  async process(ctx: Context, next: any) {
    try {
      await next()
    } catch (err) {
      if (err instanceof ValidationError) {
        err.body = { code: 10000, message: 'Validation Errors', errors: err.body.errors }
      }
      throw err
    }
  }
}
