import { AutoInject, Controller, createPropertyDecorator, Get, Queries } from '@summer-js/summer'
import { HelloService } from './../service'

@Controller
@AutoInject
export class HelloController {
  helloService: HelloService

  @Get('/service-inject')
  helloFromService() {
    return this.helloService.sayHello()
  }

  @Get('/import-inject-test')
  testInjectFromHelloService() {
    return this.helloService.getInfo()
  }

  @Get
  hello() {
    return 'Hello Summer!'
  }
}
