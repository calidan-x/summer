import { Middleware, Context } from '@summer-js/summer'

@Middleware({ order: 1 })
export class PathMiddleware {
  async process(_ctx: Context, next: any) {
    await next()
  }
}
