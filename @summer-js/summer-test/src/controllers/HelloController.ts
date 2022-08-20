import { AutoInject, Controller, Body, Get, Post, ResponseError, Query } from '@summer-js/summer'
import { HelloService } from '../service'

@Controller('/v1')
@AutoInject
export class HelloController {
  helloService: HelloService

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

  @Get('/import-inject-test')
  testInjectFromHelloService() {
    return this.helloService.getInfo()
  }
}
