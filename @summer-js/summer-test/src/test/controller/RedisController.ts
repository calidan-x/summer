import { Controller, Get, Session } from '@summer-js/summer'
import { RedisClient } from '@summer-js/redis'

@Controller('/redis')
export class RedisController {
  redisClient: RedisClient

  @Get('/test')
  async test() {
    this.redisClient.set('key', 'value')
  }

  @Get('/set-session')
  async setSession() {
    await Session.set('id', 1)
  }

  @Get('/get-session')
  async getSession() {
    return await Session.get('id')
  }
}
