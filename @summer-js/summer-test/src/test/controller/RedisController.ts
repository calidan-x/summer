import { Controller, Get } from '@summer-js/summer'
import { RedisClient } from '@summer-js/redis'

@Controller('/redis')
export class RedisController {
  redisClient: RedisClient

  @Get('/test')
  async test() {
    this.redisClient.set('key', 'value')
  }
}
