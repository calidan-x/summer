import { Controller, Get } from '@summer-js/summer'

@Controller
export class AppController {
  @Get
  hello() {
    return 'Hello Summer!'
  }
}
