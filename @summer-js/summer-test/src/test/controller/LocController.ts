import { Config, Controller, Get, PostConstruct } from '@summer-js/summer'

@Controller('/loc')
export class LocController {
  @Config('POST_CONSTRUCT_CONFIG')
  config

  str: string

  @PostConstruct
  init() {
    this.str = this.config.value
  }

  @Get
  testStr() {
    return this.str
  }
}
