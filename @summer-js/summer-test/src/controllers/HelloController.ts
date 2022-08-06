import { AutoInject, Controller, Body, Get, Post, ResponseError, Query } from '@summer-js/summer'
import { HelloService } from '../service'

@Controller
@AutoInject
export class HelloController {
  helloService: HelloService

  @Get
  hello(@Query q: string) {
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
