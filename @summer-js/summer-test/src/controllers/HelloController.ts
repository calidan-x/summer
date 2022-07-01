import { AutoInject, Controller, Get } from '@summer-js/summer'
import { HelloService } from './../service'

@Controller
@AutoInject
export class HelloController {
  helloService: HelloService

  @Get
  hello() {
    return 'Hello Summer!'
  }

  @Get('/service-inject')
  helloFromService() {
    return this.helloService.sayHello()
  }

  @Get('/inject-test')
  testInjectFromHelloService() {
    return this.helloService.printInjection()
  }
}
