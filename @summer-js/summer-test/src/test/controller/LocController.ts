import { Controller, Get, PostConstruct } from '@summer-js/summer'

@Controller('/loc')
export class LocController {
  str = ''

  @PostConstruct()
  init() {
    this.str = 'init called'
  }

  @Get
  testStr() {
    return this.str
  }
}
