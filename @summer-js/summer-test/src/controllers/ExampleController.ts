import {
  AutoInject,
  Controller,
  createMethodDecorator,
  createParamDecorator,
  Get,
  PathParam,
  Service
} from '@summer-js/summer'
import md5 from 'md5'

const CACHE = {}
export const Cache = createMethodDecorator(async (ctx, invokeMethod) => {
  const callHash = md5(JSON.stringify(ctx.invocation))
  if (CACHE[callHash] === undefined) {
    CACHE[callHash] = await invokeMethod(ctx.invocation.params)
  }
  return CACHE[callHash]
})

export const AppVersion = createParamDecorator((ctx) => {
  return ctx.request.headers['AppVersion']
})

@Service
export class CacheService {
  @Cache()
  async cache(id) {
    return id + ':' + Date.now()
  }
}

@Controller('/example')
@AutoInject
export class ExampleController {
  cacheService: CacheService

  @Get('/cache/:id')
  @Cache()
  async api(@PathParam id, @AppVersion version) {
    return id + ':' + Date.now()
  }

  @Get('/cache2/:id')
  async api2(@PathParam id) {
    return this.cacheService.cache(id)
  }
}
