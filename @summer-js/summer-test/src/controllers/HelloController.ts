import { Body, Controller, EnvConfig, Get, Post } from '@summer-js/summer'
import { HelloService } from '../service'

export class A {
  a?: 'a' | 'b' | 'c'
}
@Controller('/v1')
export class HelloController {
  serverConfig: EnvConfig<'SERVER_CONFIG'>

  helloService: HelloService

  anyTypeProp: any[]
  neverTypeProp: never[]

  @Get
  hello() {
    return 'Hello Summer!'
  }

  @Get('/null')
  null() {
    return null
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

  @Post('/ttt')
  ttt(@Body a: A) {
    return a
  }
}
