import { Middleware, Context, Inject } from '@summer-js/summer'
import { TestService2 } from '../service'

@Middleware({ order: 0 })
export class PathTestMiddleware {
  @Inject()
  testService2: TestService2

  async process(ctx: Context, next: any) {
    if (ctx.request.path === '/middleware') {
      ctx.response.body = 'middleware works'
    } else if (ctx.request.path === '/middleware-object') {
      ctx.response.body = { msg: 'middleware works' }
    } else if (ctx.request.path === '/middleware-injection') {
      ctx.response.body = this.testService2.hiFromTestService1()
    } else {
      await next()
    }
  }
}
