import { AutoInject, Controller, createPropertyDecorator, Get } from '@summer-js/summer'
import { HelloService } from './../service'

@Controller
@AutoInject
export class HelloController {
  helloService: HelloService

  @Get('/service-inject')
  helloFromService() {
    return this.helloService.sayHello()
  }

  @Get('/inject-test')
  testInjectFromHelloService() {
    return this.helloService.printInjection()
  }

  @Get
  hello() {
    return 'Hello Summer!'
  }
}
