import { Controller, Get, PathParam, Post } from '@summer-js/summer'

@Controller('/test')
export class TestController {
  @Get('/:id')
  test(@PathParam id: string) {
    return id
  }

  @Post('/:id')
  test2(@PathParam id: string) {
    return id
  }
}
