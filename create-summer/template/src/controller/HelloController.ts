import { Controller, createPropertyDecorator, Get } from '@summer-js/summer'

@Controller
export class HelloController {
  @Get
  hello() {
    return 'Hello Summer!'
  }
}
