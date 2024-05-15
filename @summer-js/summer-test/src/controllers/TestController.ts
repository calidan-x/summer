import { Controller, Get } from '@summer-js/summer'

@Controller('/test')
export class TestController {
  @Get('/dog')
  test() {
    return ''
  }
}
