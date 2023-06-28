import { Controller, Get } from '@summer-js/summer'
import { HiService } from '@/service'

@Controller
export class AppController {
  hiService: HiService

  @Get
  hello() {
    return 'Hello Summer!'
  }

  @Get('/hi')
  hi() {
    return this.hiService.sayHi()
  }
}
