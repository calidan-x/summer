import { Context, Controller, Get } from '@summer-js/summer'

@Controller('/test')
export class TestController {
  @Get('/user')
  test(@Context ctx: Context) {
    ctx.request.headers['accept-Language'] = 'sss'
    return ''
  }
}
