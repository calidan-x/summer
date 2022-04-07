import { Config, Controller, Get } from '@summer-js/summer'

@Controller
export class ConfigController {
  @Config('MY_CONFIG')
  myConfig

  @Get('/config')
  add() {
    console.log(this.myConfig)
  }
}
