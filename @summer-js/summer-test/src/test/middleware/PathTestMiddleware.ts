import { Middleware, Context } from '@summer-js/summer'

@Middleware({ order: 0 })
export class PathTestMiddleware {
  async process(ctx: Context, next: any) {
    if (ctx.request.path === '/middleware') {
      ctx.response.body = 'middleware works'
    } else if (ctx.request.path === '/middleware-object') {
      ctx.response.body = { msg: 'middleware works' }
    } else {
      await next()
    }
  }
}
