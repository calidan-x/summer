import { Controller, EnvConfig, Get } from '@summer-js/summer'
import { HelloService } from '../service'

@Controller('/v1')
export class HelloController {
  serverConfig: EnvConfig<'SERVER_CONFIG'>

  helloService: HelloService

  anyTypeProp: any[]
  neverTypeProp: never[]

  @Get('/null')
  null() {
    return null
  }

  @Get
  hello() {
    return 'Hello Summer!'
  }

  @Get('^/v2/hello')
  hello2() {
    return 'Hello Summer!'
  }

  @Get('/service-inject')
  helloFromService() {
    return this.helloService.sayHello()
  }

  @Get('/service-inject2')
  helloFromService2() {
    return this.helloService.getInfo2()
  }

  @Get('/import-inject-test')
  testInjectFromHelloService() {
    return this.helloService.getInfo()
  }
}
