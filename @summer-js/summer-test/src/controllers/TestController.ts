import { Controller, Get, PathParam, createClassAndMethodDecorator } from '@summer-js/summer'

const A = createClassAndMethodDecorator(async (ctx, invokeMethod, _param1: string) => {
  return await invokeMethod(ctx.invocation.params)
})

@Controller('/test')
@A('param1')
export class TestController {
  @Get('/:id')
  @A('param1')
  test(@PathParam id: number[]) {
    console.log(id)
  }
}
