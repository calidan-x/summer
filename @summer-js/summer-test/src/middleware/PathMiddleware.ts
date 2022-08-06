import { Middleware, Context } from '@summer-js/summer'

@Middleware({ order: 1 })
export class PathMiddleware {
  async process(ctx: Context, next: any) {
    await next()
  }
}
