import { AutoInject, Controller, createPropertyDecorator, Body, Get, Post, Queries } from '@summer-js/summer'
import { HelloService } from '../service'

class B {
  b: Date
}

@Controller
@AutoInject
export class HelloController {
  helloService: HelloService

  @Get
  hello() {
    return 'Hello Summer!'
  }

  @Post
  test(@Body body: B) {
    console.log(body)
    return body
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
