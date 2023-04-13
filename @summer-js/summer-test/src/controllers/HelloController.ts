import { Controller, Ctx, EnvConfig, Get, Context } from '@summer-js/summer'
import { HelloService } from '../service'

@Controller('/v1')
export class HelloController {
  serverConfig: EnvConfig<'SERVER_CONFIG'>

  helloService: HelloService

  anyTypeProp: any[]
  neverTypeProp: never[]

  @Get
  hello(@Ctx ctx: Context) {
    console.log(ctx.request)
    console.log(ctx.request.headers)
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
