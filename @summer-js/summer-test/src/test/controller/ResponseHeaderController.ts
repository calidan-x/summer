import { Controller, Get, Context } from '@summer-js/summer'

@Controller('/res-headers')
export class CorsTestController {
  @Get('/string-return')
  stringReturn() {
    return 'string'
  }

  @Get('/object-return')
  objectReturn() {
    return { a: 'a', b: 'b' }
  }

  @Get('/modify-return')
  headerModifyReturn(@Context context: Context) {
    context.response.headers['Content-Type'] = 'text/plain'
    return { a: 'a', b: 'b' }
  }
}
