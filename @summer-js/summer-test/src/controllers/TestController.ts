import { Controller, Get, Query } from '@summer-js/summer'

@Controller
export class TestController {
  @Get
  test(@Query date: Date) {
    // const a = 1
    return date
  }
}
