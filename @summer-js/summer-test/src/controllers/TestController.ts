import { Controller, Get } from '@summer-js/summer'

@Controller
export class TestController {
  @Get
  test() {
    return 'test'
  }
}
