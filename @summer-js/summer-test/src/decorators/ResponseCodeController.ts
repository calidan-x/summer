import { Controller, createMethodDecorator, Get } from '@summer-js/summer'

export const ResponseCode = createMethodDecorator(async (ctx, invokeMethod, code: number) => {
  ctx.response.statusCode = code
  return await invokeMethod(ctx.invocation!.params)
})

@Controller
export class ResponseCodeController {
  @ResponseCode(404)
  @Get('/dog')
  userInfo() {
    return 'dog not exist'
  }
}
