import { Middleware, Context } from '@summer-js/summer'

@Middleware({
  order: 0
})
export class ErrorMiddleware {
  async process(_ctx: Context, next: any) {
    try {
      await next()
    } catch (err) {
      // if (err instanceof ValidationError) {
      //   err.body = { code: 10000, message: 'Validation Errors', errors: err.body.errors }
      // }
      throw err
    }
  }
}
