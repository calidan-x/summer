import { Config, Controller, Get, PostConstruct } from '@summer-js/summer'
import { TestService2 } from '../service'

@Controller('/loc')
export class LocController {
  @Config('POST_CONSTRUCT_CONFIG')
  config

  testService2: TestService2

  str: string

  @PostConstruct
  init() {
    this.str = this.config.value
  }

  @Get
  testStr() {
    return this.str
  }

  @Get('/service-injection')
  testServiceInjection() {
    return this.testService2.hiFromTestService1()
  }
}
