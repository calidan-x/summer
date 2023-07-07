import { Controller, EnvConfig, Get, PostConstruct } from '@summer-js/summer'
import { TestService2 } from '@/test/service'

@Controller('/ioc')
export class LocController {
  config: EnvConfig<'POST_CONSTRUCT_CONFIG'>

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
