import { AutoInject, Controller, createMethodDecorator, Get, PathParam, Service } from '@summer-js/summer'
import md5 from 'md5'

const CACHE = {}
export const Cache = createMethodDecorator(async (ctx, invokeMethod) => {
  const callParamHash = md5(JSON.stringify(ctx.invocation))
  if (CACHE[callParamHash] === undefined) {
    CACHE[callParamHash] = await invokeMethod(ctx.invocation.params)
  }
  return CACHE[callParamHash]
})

@Service
export class CacheService {
  @Cache()
  async cache(id) {
    return id + ':' + Date.now()
  }
}

@Controller
@AutoInject
export class CacheController {
  cacheService: CacheService

  @Get('/cache/:id')
  @Cache()
  async api(@PathParam id) {
    return id + ':' + Date.now()
  }

  @Get('/cache2/:id')
  async api2(@PathParam id) {
    return this.cacheService.cache(id)
  }
}
