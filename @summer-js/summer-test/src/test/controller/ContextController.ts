import { AutoInject, Controller, createClassAndMethodDecorator, Get, Logger, Query, Service } from '@summer-js/summer'

const AccessLog = createClassAndMethodDecorator(async (ctx, invokeMethod) => {
  Logger.debug('call ' + ctx.invocation.className + '.' + ctx.invocation.methodName + '() with', ctx.invocation.params)
  return await invokeMethod(ctx.invocation.params)
})

@Service
@AccessLog
class InvokeService {
  getInfo(info: string) {
    return 'info: ' + info
  }
}

@Controller
@AccessLog
@AutoInject
export class ContextController {
  invokeService: InvokeService

  @Get('/invoke')
  info(@Query q: string) {
    return q
  }

  @Get('/invoke2')
  info2() {
    return this.invokeService.getInfo('summer works')
  }
}
