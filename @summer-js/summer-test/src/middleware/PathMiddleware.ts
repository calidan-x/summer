import { Middleware, Context } from '@summer-js/summer'
import { getApiDoc } from '@summer-js/swagger'

@Middleware({ order: 1 })
export class PathMiddleware {
  async process(ctx: Context, next: any) {
    const apiInfo = getApiDoc(ctx)
    if (apiInfo) {
      // console.log(apiInfo.apiGroup.name + ' => ' + apiInfo.api.summary)
    }
    await next()
  }
}
