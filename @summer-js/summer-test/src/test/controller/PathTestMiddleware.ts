import { Middleware, Context } from '@summer-js/summer'

@Middleware({ order: 0 })
export class PathTestMiddleware {
  async process(ctx: Context, next: any) {
    if (ctx.request.path === '/middleware') {
      ctx.response.body = 'Middleware works'
    } else {
      await next()
    }
  }
}
