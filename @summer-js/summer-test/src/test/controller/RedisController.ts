import { Controller, Get } from '@summer-js/summer'
import { RedisClient } from '@summer-js/redis'

@Controller('/redis')
export class RedisController {
  redisClient: RedisClient
  redisClient2: RedisClient<'client2'>

  @Get('/test')
  async test() {
    this.redisClient.set('key', 'value')
    this.redisClient2.set('key2', 'value2')
  }

  @Get('/set')
  async set() {
    await this.redisClient.set('id', 1)
    await this.redisClient.expire('id', 3)
  }

  @Get('/get')
  async get() {
    return (await this.redisClient2.get('id')) || ''
  }
}
